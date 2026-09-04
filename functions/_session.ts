/**
 * Signs and verifies the terminal game session. The token carries the whole
 * game state, so the server keeps nothing between requests.
 */
import type { GameState } from '../shared/game';

const TTL_MS = 6 * 60 * 60 * 1000;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

interface Envelope {
  readonly iat: number;
  readonly state: GameState;
}

const toBase64Url = (bytes: Uint8Array): string => {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (value: string): Uint8Array => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, '='));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const keyFor = (secret: string): Promise<CryptoKey> =>
  crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);

export async function encode(state: GameState, secret: string): Promise<string> {
  const envelope: Envelope = { iat: Date.now(), state };
  const payload = toBase64Url(encoder.encode(JSON.stringify(envelope)));
  const signature = await crypto.subtle.sign('HMAC', await keyFor(secret), encoder.encode(payload));
  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function decode(token: unknown, secret: string): Promise<GameState | null> {
  if (typeof token !== 'string' || token.length > 4096) return null;

  const split = token.lastIndexOf('.');
  if (split < 1) return null;

  const payload = token.slice(0, split);
  const signature = token.slice(split + 1);

  let valid = false;
  try {
    valid = await crypto.subtle.verify(
      'HMAC',
      await keyFor(secret),
      fromBase64Url(signature),
      encoder.encode(payload),
    );
  } catch {
    return null;
  }
  if (!valid) return null;

  try {
    const envelope = JSON.parse(decoder.decode(fromBase64Url(payload))) as Envelope;
    if (typeof envelope?.iat !== 'number' || Date.now() - envelope.iat > TTL_MS) return null;
    return envelope.state ?? null;
  } catch {
    return null;
  }
}

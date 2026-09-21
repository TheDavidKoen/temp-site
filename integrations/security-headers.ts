/**
 * Writes Cloudflare Pages' _headers file once the build is done. The Content
 * Security Policy allows each inline script by its hash, so it has to be derived
 * from the built HTML rather than written by hand.
 */
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';

// Inline scripts only: external ones are covered by 'self', and JSON-LD never executes.
const INLINE_SCRIPT =
  /<script(?![^>]*\ssrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g;

const sha256 = (source: string): string =>
  `'sha256-${createHash('sha256').update(source).digest('base64')}'`;

export default function securityHeaders(): AstroIntegration {
  return {
    name: 'security-headers',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const root = fileURLToPath(dir);
        const pages = (await readdir(root, { recursive: true })).filter((file) =>
          file.endsWith('.html'),
        );
        const html = await Promise.all(pages.map((page) => readFile(join(root, page), 'utf8')));
        const hashes = new Set(
          html.flatMap((page) => [...page.matchAll(INLINE_SCRIPT)].map(([, body]) => sha256(body))),
        );

        const policy = [
          "default-src 'self'",
          `script-src 'self' ${[...hashes].join(' ')}`,
          // Components pass custom properties through style attributes.
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self'",
          "font-src 'self'",
          "connect-src 'self'",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'",
          'upgrade-insecure-requests',
        ].join('; ');

        const headers = {
          'Content-Security-Policy': policy,
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy':
            'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
          'Cross-Origin-Opener-Policy': 'same-origin',
        };

        const lines = Object.entries(headers).map(([name, value]) => `  ${name}: ${value}`);
        await writeFile(join(root, '_headers'), `/*\n${lines.join('\n')}\n`);
      },
    },
  };
}

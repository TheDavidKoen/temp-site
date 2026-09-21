import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';
import securityHeaders from './integrations/security-headers';

export default defineConfig({
  site: 'https://davidkoen.is-a.dev',
  devToolbar: { enabled: false },
  integrations: [sitemap(), securityHeaders()],
  fonts: [
    {
      name: 'Space Grotesk',
      cssVariable: '--font-space-grotesk',
      provider: fontProviders.google(),
      weights: [500, 700],
      subsets: ['latin'],
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    {
      name: 'Inter',
      cssVariable: '--font-inter',
      provider: fontProviders.google(),
      weights: [400, 500, 600],
      subsets: ['latin'],
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    {
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
      provider: fontProviders.google(),
      weights: [400, 500],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssMinify: false,
      rollupOptions: {
        output: {
          /* Three.js in its own chunk, or Rollup folds it into figures.ts and the
             budget counts it as critical path. */
          manualChunks: (id: string) => (id.includes('/node_modules/three/') ? 'three' : undefined),
        },
      },
    },
  },
});

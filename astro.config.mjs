// @ts-check

import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  site: 'https://davidkoen.is-a.dev',
  devToolbar: { enabled: false },
  integrations: [sitemap()],
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
    /* Lightning CSS folds animation-timeline into the animation shorthand,
       which per spec resets it to auto — silently killing every scroll-driven
       animation in production while dev (unminified) looks fine. Costs 0.6KB
       gzip. See docs/adr/0009-disable-css-minification.md before removing. */
    build: { cssMinify: false },
  },
});

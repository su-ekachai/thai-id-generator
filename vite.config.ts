import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/thai-id-generator/',
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      strategies: 'generateSW',
      includeAssets: [
        'icons/apple-touch-icon-180x180.png',
        'icons/favicon.ico',
        'icons/pwa-64x64.png',
        'fonts/noto-sans-thai-looped-latin-wght-normal.woff2',
        'fonts/noto-sans-thai-looped-thai-wght-normal.woff2',
        'fonts/jetbrains-mono-latin-wght-normal.woff2',
      ],
      manifest: {
        name: 'Thai National ID Generator',
        short_name: 'Thai ID',
        description: 'Educational Thai national ID checksum demonstration.',
        start_url: '/thai-id-generator/',
        scope: '/thai-id-generator/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#fafaf9',
        theme_color: '#a51931',
        lang: 'en',
        icons: [
          { src: 'icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{html,js,css,woff2,png,svg,ico,webmanifest}'],
        cleanupOutdatedCaches: true,
        clientsClaim: false,
        skipWaiting: false,
      },
    }),
  ],
  build: {
    target: 'es2022',
    cssMinify: 'lightningcss',
  },
});

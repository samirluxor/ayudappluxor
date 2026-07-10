import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.webp', 'icon-512.webp'],
      manifest: {
        name: 'SOMOS LUXOR',
        short_name: 'SOMOS LUXOR',
        description: 'Censo y encuestas para la reconstrucción — Una iniciativa de Supermercados Luxor',
        theme_color: '#0f172a',
        background_color: '#f1f5f9',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/icon-192.webp', sizes: '192x192', type: 'image/webp' },
          { src: '/icon-512.webp', sizes: '512x512', type: 'image/webp' },
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,webp,png,svg,ico}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api/cedula': {
        target: 'https://api.cedula.com.ve/api/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cedula/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
  },
})

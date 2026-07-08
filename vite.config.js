import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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

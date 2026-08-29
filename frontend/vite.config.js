import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-404-for-gh-pages',
      closeBundle() {
        try {
          const distDir = path.resolve(__dirname, 'dist')
          const indexPath = path.resolve(distDir, 'index.html')
          const fourOhFourPath = path.resolve(distDir, '404.html')
          if (fs.existsSync(indexPath)) {
            fs.copyFileSync(indexPath, fourOhFourPath)
            console.log('[Vite Build] Created 404.html for GitHub Pages SPA routing.')
          }
        } catch (e) {
          console.warn('[Vite Build] 404.html copy failed:', e)
        }
      }
    }
  ],
  base: process.env.VITE_BASE_PATH || (process.env.NODE_ENV === 'production' ? '/medicine/' : '/'),
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { rmSync, existsSync } from 'fs'

// Custom plugin to remove media folders after build
function removeMediaFolders() {
  return {
    name: 'remove-media-folders',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist')
      const mediaFolders = ['media', 'media0', 'media2', 'medis']
      
      for (const folder of mediaFolders) {
        const folderPath = path.join(distDir, folder)
        if (existsSync(folderPath)) {
          rmSync(folderPath, { recursive: true, force: true })
        }
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), removeMediaFolders()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  publicDir: 'public', // Serve public folder (for dev mode)
  server: {
    port: 5173,
    strictPort: true,
  },
})


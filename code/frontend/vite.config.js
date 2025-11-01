import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Allow all ngrok hosts (*.ngrok-free.app) and localhost
    allowedHosts: ['.ngrok-free.app', 'localhost'],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
        ws: true
      }
    }
  }
})

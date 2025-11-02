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
        ws: true,
        timeout: 10000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            // Only log if it's not a connection refused error (backend not running)
            if (err.code !== 'ECONNREFUSED' && err.code !== 'ECONNRESET' && err.code !== 'EPIPE') {
              console.error('Proxy error:', err);
            }
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Suppress proxy request logging for cleaner console
          });
        }
      },
      '/waterfalls': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/dependency_plots': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/documents': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }

    }
  }
})

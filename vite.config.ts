import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    cors: true,
    proxy: {
      '/sse': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: false
      }
    }
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://habit-tracker-1-34tk.onrender.com',
        changeOrigin: true,
      }
    }
  }
})

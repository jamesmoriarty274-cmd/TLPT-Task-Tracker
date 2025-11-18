import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    headers: {
      // EXPLICITLY REMOVE CSP HEADERS
      'Content-Security-Policy': ''
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set base to repo name for GitHub Pages deployment
  base: '/Invincible-developers/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})

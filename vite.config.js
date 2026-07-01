import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' → build utilisable en ouvrant dist/index.html directement ou depuis n'importe quel sous-dossier
export default defineConfig({
  plugins: [react()],
  base: './',
})

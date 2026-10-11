import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // maplibre-gl and deck.gl are ~1 MB each minified; that's expected for a map app.
  build: { chunkSizeWarningLimit: 1200 },
})

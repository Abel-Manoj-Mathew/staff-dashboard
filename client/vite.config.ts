import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Picked to stay clear of the patient-registration app's dev servers (5173, 5174, 5180, 4000).
    port: 5190,
    strictPort: true,
    proxy: { '/api': 'http://localhost:4100' },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: { // <-- ADICIONE ESTE BLOCO
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js', // (opcional, mas recomendado)
  },
})
import { defineConfig } from "vitest/config" // 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true, 
    //environment: 'happy-dom',
    environment: 'jsdom',
    reporters: ['verbose'],
  }
})
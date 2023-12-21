import { defineConfig } from '@ownclouders/extension-sdk'
import vue from '@vitejs/plugin-vue'

/// <reference types="vitest" />

export default defineConfig({
  server: {
    port: 9999
  },
  plugins: [vue()],
  test: {
    globals:true, 
  }
})






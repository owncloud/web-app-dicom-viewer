import { defineConfig } from "vitest/config" // 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true, 
    //environment: 'happy-dom',
    environment: 'jsdom',
    reporters: ['verbose'],
    server: {
      deps: {
        inline: [
          "@kitware/vtk.js", 
          '@kitware\\+vtk.js',
          'd3-array',
          'd3-scale',
          'd3-time',
          'internmap'
        ]
      }
    },
    coverage: {
      provider: 'v8',
      reporter: 'lcov'
    }
    /*
    // solution suggested by CLI, might be related to this issue: https://github.com/koebel/web/pull/2/files
    
    Module /Users/k2/JankariTech/web-app-dicom-viewer/node_modules/.pnpm/@kitware+vtk.js@27.3.1_@babel+preset-env@7.23.5_autoprefixer@10.4.16_webpack@5.89.0_wslink@1.12.4/node_modules/@kitware/vtk.js/Rendering/Core/VolumeMapper/Constants.js:19 seems to be an ES Module but shipped in a CommonJS package. You might want to create an issue to the package "@kitware/vtk.js" asking them to ship the file in .mjs extension or add "type": "module" in their package.json.

    As a temporary workaround you can try to inline the package by updating your config:

    // vitest.config.js
    export default {
      test: {
        server: {
          deps: {
            inline: [
              "@kitware/vtk.js"
            ]
          }
        }
      }
    }*/
  }
})



    

import { defineConfig } from '@ownclouders/extension-sdk'
import { readFileSync } from 'fs'
import { join } from 'path'

const isProduction = process.env.PRODUCTION === 'true'

let server

if (!isProduction) {
  const certsDir = `${__dirname}/dev/docker/traefik/certificates`
  server = {
    port: 9999,
    host: 'host.docker.internal',
    https: {
      key: readFileSync(join(certsDir, 'server.key')),
      cert: readFileSync(join(certsDir, 'server.crt'))
    }
  }
} else {
  server = false
}

export default defineConfig({
  server,
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'js/web-app-dicom-viewer.js'
      }
    }
  }
})

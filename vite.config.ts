import { defineConfig } from '@ownclouders/extension-sdk'
import { readFileSync } from 'fs'
import {join} from "path";

const certsDir = `${__dirname}/dev/docker/traefik/certificates`

export default defineConfig({
  server: {
    port: 9999,
    host: "host.docker.internal",
    https:{
      key: readFileSync(join(certsDir, 'server.key')),
      cert: readFileSync(join(certsDir, 'server.crt'))
    }
  }
})

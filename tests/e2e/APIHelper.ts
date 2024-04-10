import { config } from './config'
import axios from 'axios'
import join from 'join-path'

export const sendRequest = function ({ method, path, header = null, data = null }): Promise<any> {
  const headers = {
    ...header,
    Authorization: `Basic ${Buffer.from(`${config.adminUser}:${config.adminPassword}`).toString(
      'base64'
    )}`
  }

  return axios({
    method,
    url: join(config.baseUrlOcis, path),
    headers,
    data
  })
}

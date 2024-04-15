import fs from 'fs'
import { config } from '../config.js'
import { sendRequest } from './APIHelper'

export const apiUpload = async function ({ filename }): Promise<void> {
  const response = await sendRequest({
    method: 'PUT',
    path: `remote.php/dav/files/${config.adminUser}/${filename}`,
    header: { 'Content-Type': 'application/octet-stream' },
    data: fs.readFileSync(`${config.assets}/${filename}`)
  })
  if (response.status !== 201) {
    throw new Error(`Failed to upload file ${filename}`)
  }
}

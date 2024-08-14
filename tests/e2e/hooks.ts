import { Before, BeforeAll, After, AfterAll, setDefaultTimeout } from '@cucumber/cucumber'
import { chromium } from '@playwright/test'
import { xml2js } from 'xml-js'
import { _ } from 'lodash'
import { config } from './config.js'
import { sendRequest } from './api/apiHelper'

setDefaultTimeout(config.timeout * 1000)

BeforeAll(async function (): Promise<void> {
  global.browser = await chromium.launch({
    slowMo: config.slowMo,
    headless: config.headless,
    channel: 'chrome'
  })
})

Before(async function (): Promise<void> {
  global.context = await global.browser.newContext({ ignoreHTTPSErrors: true })
  global.page = await global.context.newPage()
})

AfterAll(async function (): Promise<void> {
  await global.browser.close()
})

After(async function (): Promise<void> {
  await deleteDicomFile()
  await emptyTrashbin()
  await global.page.close()
})

const deleteDicomFile = async function (): Promise<void> {
  const response = await sendRequest({ method: 'PROPFIND', path: 'remote.php/dav/files/admin' })
  const xmlResponse = response.data
  const result = xml2js(xmlResponse, { compact: true })
  const resp = _.get(result, 'd:multistatus.d:response')
  const href = _.get(resp[1], 'd:href._text')

  await sendRequest({ method: 'DELETE', path: href })
}

const emptyTrashbin = async function (): Promise<void> {
  await sendRequest({ method: 'DELETE', path: 'remote.php/dav/trash-bin/admin' })
}

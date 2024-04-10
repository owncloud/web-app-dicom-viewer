import { Before, BeforeAll, After, AfterAll, setDefaultTimeout } from '@cucumber/cucumber'
import { Browser, chromium, Page } from '@playwright/test'
import { xml2js } from 'xml-js'
import { _ } from 'lodash'
import { config } from './config.js'
import { sendRequest } from './APIHelper'

export const state: {
  browser: Browser
  page: Page
} = {
  browser: undefined,
  page: undefined
}

setDefaultTimeout(config.timeout * 1000)

BeforeAll(async function (): Promise<void> {
  state.browser = await chromium.launch({
    slowMo: config.slowMo,
    headless: config.headless,
    channel: 'chrome'
  })
})

Before(async function (): Promise<void> {
  const context = await state.browser.newContext({ ignoreHTTPSErrors: true })
  state.page = await context.newPage()
})

AfterAll(async function (): Promise<void> {
  await state.browser.close()
})

After(async function (): Promise<void> {
  await deleteDicomFile()
  await emptyTrashbin()
  await state.page.close()
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

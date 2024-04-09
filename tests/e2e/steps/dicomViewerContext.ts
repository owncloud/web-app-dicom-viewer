import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import util from 'util'
import { config } from '../config.js'

import { DicomViewer } from '../pageObjects/DicomViewer'

const dicomViewer = new DicomViewer()
import { apiUpload } from '../api/apiUpload'

Given('the user {string} has logged in', async function (user: string): Promise<void> {
  await global.page.goto(config.baseUrlOcis)
  await dicomViewer.login(user)
})

Given(
  'the dicom file {string} has been uploaded',
  async function (filename: string): Promise<void> {
    await apiUpload({ filename })
  }
)

When('the user previews the dicom file {string}', async function (filename: string): Promise<void> {
  await dicomViewer.previewDicomFile({ filename })
})

Then(
  'the user should see the dicom file {string}',
  async function (filename: string): Promise<void> {
    await expect(global.page.locator(dicomViewer.elements.dicomCanvasSelector)).toBeVisible()
    await expect(
      global.page.locator(util.format(dicomViewer.elements.appbarResourceNameSelector, filename))
    ).toBeVisible()
    await expect(global.page.locator(dicomViewer.elements.dicomVIPMetadataSelector)).toBeVisible()
  }
)

When('the user checks the extended metadata for dicom file', async function (): Promise<void> {
  await global.page.locator(dicomViewer.elements.dicomExtendedMetadataBtnSelector).click()
  await expect(global.page.locator(dicomViewer.elements.dicomMetadataSidebarSelector)).toBeVisible()
})

Then(
  /^the user should see patient name "([^"]*)" in the (VIP metadata section|metadata sidebar)$/,
  async function (patientName: string, metadataLocation: string): Promise<void> {
    await expect(await dicomViewer.getPatientName(metadataLocation)).toBe(patientName)
  }
)

When('the user closes the metadata sidebar', async function () {
  await dicomViewer.closeMetadataSidebar()
})

Then('the metadata sidebar should not be displayed', async function (): Promise<void> {
  await expect(global.page.locator(dicomViewer.elements.dicomMetadataSidebarSelector)).toBeHidden()
})

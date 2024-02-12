import { Given, When, Then } from '@cucumber/cucumber'
import { state } from '../hooks'
import { config } from "../config.js"

import { DicomViewer } from "../pageObjects/DicomViewer"
import { getUser } from "../userStore";

Given('the user {string} has logged in', async function(user: string): Promise<void> {
    const page = state.page
    const dicomViewer = new DicomViewer()
    await page.goto(config.baseUrlOcis)
    const stepUser = await getUser({user})
    await dicomViewer.login({ username: stepUser.displayName, password: stepUser.password })
})

Given('the user has uploaded the dicom file {string}', async function (filename: string): Promise<void> {
    const dicomViewer = new DicomViewer()
    await dicomViewer.upload({ filename })
})

When('the user previews the dicom file {string}', async function (filename: string): Promise<void> {
    const dicomViewer = new DicomViewer()
    await dicomViewer.previewDicomFile({ filename })
})

When('the user checks VIP metadata for dicom file', async function(): Promise<void> {
    const dicomViewer = new DicomViewer()
    await dicomViewer.checkVIPMetadata()
})

When('the user checks the extended metadata for dicom file', async function(): Promise<void> {
    const dicomViewer = new DicomViewer()
    await dicomViewer.checkExtendedMetadata()
})

Then(/^the user should see patient name "([^"]*)" in (VIP metadata|metadata sidebar)$/, async function (patientName: string, metadataLocation: string): Promise<void> {
    const dicomViewer = new DicomViewer()
    await dicomViewer.checkPatientName({ patientName, metadataLocation })
})

Then('the user closes the DICOM file preview', async function () {
    const dicomViewer = new DicomViewer()
    await dicomViewer.closeDicomFilePreview()
})

Then('the user logs out', async function(): Promise<void> {
    const page = state.page
    const dicomViewer = new DicomViewer()
    await dicomViewer.logout()
    await page.locator(dicomViewer.elements.loginFormSelector).waitFor()
})

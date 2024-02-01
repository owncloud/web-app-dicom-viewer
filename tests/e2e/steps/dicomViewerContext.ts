import {Given, When, Then} from '@cucumber/cucumber'
import {state} from '../hooks'
import {config} from "../config.js"

import {DicomViewer} from "../pageObjects/DicomViewer"
import util from "util";

Given('{string} has logged in', async function(user: string): Promise<void> {
    const page = state.page
    const dicomViewer = new DicomViewer()

    await page.goto(config.baseUrlOcis)
    await dicomViewer.login({ username: 'admin', password: 'admin' })
    await page.locator(dicomViewer.webContentSelector).waitFor()
})

Given('{string} has uploaded the dicom file {string}', async function (user: string, filename: string): Promise<void> {
    const page = state.page
    const dicomViewer = new DicomViewer()

    await dicomViewer.upload({filename: `${config.assets}/${filename}`})
    await page.goto(config.baseUrlOcis)
    await page.locator(util.format(dicomViewer.resourceNameSelector, filename)).waitFor()
})

When('{string} previews the dicom file {string}', async function (user: string, filename: string): Promise<void> {
    const dicomViewer = new DicomViewer()
    await dicomViewer.openDicomFile({filename})
})

Then('{string} logs out', async function(user: string): Promise<void> {
    const page = state.page
    const dicomViewer = new DicomViewer()

    await dicomViewer.logout()
    await page.locator(dicomViewer.loginFormSelector).waitFor()
})

Then('{string} opens files app', async function (user: string) {
    const dicomViewer = new DicomViewer()
    await dicomViewer.openFilesApp()
})

Then('{string} deletes file {string}', async function (user: string, filename: string) {
    const dicomViewer = new DicomViewer()
    await dicomViewer.deleteFile()
})

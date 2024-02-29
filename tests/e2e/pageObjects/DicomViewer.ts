import { Page, expect } from '@playwright/test'
import { state } from '../hooks'
import { config } from '../config.js'
import util from "util";

export class DicomViewer {
    page: Page = state.page
    elements: Readonly<Record<string, string>> = {
        userNameSelector : '#oc-login-username',
        passwordSelector : '#oc-login-password',
        loginButtonSelector : 'button[type="submit"]',
        webContentSelector : '#web-content',
        userMenuButtonSelector : '#_userMenuButton',
        logoutSelector : '#oc-topbar-account-logout',
        loginFormSelector : '.oc-login-form',
        resourceUploadButton : '#upload-menu-btn',
        fileUploadInput : '#files-file-upload-input',
        resourceNameSelector : '#files-space-table [data-test-resource-name="%s"]',
        appbarResourceNameSelector : '#app-top-bar-resource [data-test-resource-name="%s"]',
        uploadInfoCloseButton : '#close-upload-info-btn',
        dicomCanvasSelector : '#dicom-canvas',
        dicomVIPMetadataSelector : '#dicom-viewer-vip-metadata',
        dicomExtendedMetadataBtnSelector : '.preview-controls .preview-controls-show-metadata',
        dicomMetadataSidebarSelector : '#dicom-metadata-sidebar-content',
        filePreviewCloseButtonSelector: '#app-top-bar-close',
        vipMetadataPatientNameSelector: '//*[@id="dicom-viewer-vip-metadata"]/div/span',
        sidebarMetadataPatientNameSelector: '//*[@id="dicom-metadata-sidebar-content"]/table/tr/th[contains(text(), "Patient Name")]/following-sibling::td'
    }

    async login({ username, password }): Promise<void> {
        await this.page.locator(this.elements.userNameSelector).fill(username)
        await this.page.locator(this.elements.passwordSelector).fill(password)
        await this.page.locator(this.elements.loginButtonSelector).click()
        await this.page.locator(this.elements.webContentSelector).waitFor()
    }

    async logout(): Promise<void> {
        await this.page.locator(this.elements.userMenuButtonSelector).click()
        await this.page.locator(this.elements.logoutSelector).click()
    }

    async upload({ filename }): Promise<void> {
        await this.page.locator(this.elements.resourceUploadButton).click()
        await this.page.locator(this.elements.fileUploadInput).setInputFiles(`${config.assets}/${filename}`)
        await this.page.locator(this.elements.uploadInfoCloseButton).click()
        await this.page.locator(util.format(this.elements.resourceNameSelector, filename)).waitFor()
    }

    async previewDicomFile({ filename }): Promise<void> {
        await this.page.locator(util.format(this.elements.resourceNameSelector, filename)).click()
        await expect(this.page.locator(this.elements.dicomCanvasSelector)).toBeVisible()
        await expect(this.page.locator(util.format(this.elements.appbarResourceNameSelector, filename))).toBeVisible()
    }

    async checkVIPMetadata(): Promise<void> {
        await expect(this.page.locator(this.elements.dicomVIPMetadataSelector)).toBeVisible()
    }

    async checkExtendedMetadata(): Promise<void> {
        await this.page.locator(this.elements.dicomExtendedMetadataBtnSelector).click()
        await expect(this.page.locator(this.elements.dicomMetadataSidebarSelector)).toBeVisible()
    }

    async checkPatientName({ patientName, metadataLocation }): Promise<void> {
        let actualPatientName
        if (metadataLocation === 'VIP metadata') {
            actualPatientName = await this.page.locator(this.elements.vipMetadataPatientNameSelector).first().innerText()
        } else {
            actualPatientName = await this.page.locator(this.elements.sidebarMetadataPatientNameSelector).innerText()
        }
        await expect(actualPatientName).toBe(patientName)
    }

    async closeDicomFilePreview(): Promise<void> {
        await this.page.locator(this.elements.filePreviewCloseButtonSelector).click()
    }
}

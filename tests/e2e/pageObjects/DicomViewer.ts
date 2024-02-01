import {Page} from '@playwright/test'
import {state} from '../hooks'
import util from "util";

export class DicomViewer {
    page: Page = state.page
    readonly userNameSelector = '#oc-login-username'
    readonly passwordSelector = '#oc-login-password'
    readonly loginButtonSelector = 'button[type="submit"]'
    readonly webContentSelector = '#web-content'
    readonly userMenuButtonSelector = '#_userMenuButton'
    readonly logoutSelector = '#oc-topbar-account-logout'
    readonly loginFormSelector = '.oc-login-form'
    readonly resourceUploadButton = '#upload-menu-btn'
    readonly fileUploadInput = '#files-file-upload-input'
    readonly resourceNameSelector = ':is(#files-files-table, .oc-tiles-item, #files-shared-with-me-accepted-section, .files-table) [data-test-resource-name="%s"]'
    readonly selectAllCheckbox = '#resource-table-select-all'
    readonly deleteButtonBatchAction = '.oc-files-actions-delete-trigger'
    readonly appSwitchButton = '#_appSwitcherButton'
    readonly filesAppSelector = '//ul[contains(@class, "applications-list")]//*[@data-test-id="files"]'
    readonly dicomCanvasSelector = '#dicom-canvas'

    async login({username, password}): Promise<void> {
        await this.page.locator(this.userNameSelector).fill(username)
        await this.page.locator(this.passwordSelector).fill(password)
        await this.page.locator(this.loginButtonSelector).click()
    }

    async logout(): Promise<void> {
        await this.page.locator(this.userMenuButtonSelector).click()
        await this.page.locator(this.logoutSelector).click()
    }

    async upload({filename}): Promise<void> {
        await this.page.locator(this.resourceUploadButton).click()
        await this.page.locator(this.fileUploadInput).setInputFiles(filename)
    }

    async openDicomFile({filename}): Promise<void> {
        await this.page.locator(util.format(this.resourceNameSelector, filename)).click()
    }

    async openFilesApp(): Promise<void> {
        await this.page.locator(this.appSwitchButton).click()
        await this.page.locator(this.filesAppSelector).click()
    }

    async deleteFile(): Promise<void> {
        await this.page.locator(this.selectAllCheckbox).click()
        await this.page.locator(this.deleteButtonBatchAction).click()
    }
}

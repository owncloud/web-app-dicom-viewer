import util from 'util'
import { getUser } from '../userStore'

export class dicomViewerPage {
  elements: Readonly<Record<string, string>> = {
    userNameSelector: '#oc-login-username',
    passwordSelector: '#oc-login-password',
    loginButtonSelector: 'button[type="submit"]',
    webContentSelector: '#web-content',
    userMenuButtonSelector: '#_userMenuButton',
    logoutSelector: '#oc-topbar-account-logout',
    loginFormSelector: '.oc-login-form',
    resourceUploadButton: '#upload-menu-btn',
    fileUploadInput: '#files-file-upload-input',
    resourceNameSelector: '#files-space-table [data-test-resource-name="%s"]',
    appbarResourceNameSelector: '#app-top-bar-resource [data-test-resource-name="%s"]',
    uploadInfoCloseButton: '#close-upload-info-btn',
    dicomCanvasSelector: '#dicom-canvas',
    dicomVIPMetadataSelector: '#dicom-viewer-vip-metadata',
    dicomExtendedMetadataBtnSelector: '.preview-controls .preview-controls-show-metadata',
    dicomMetadataSidebarSelector: '#dicom-metadata-sidebar-content',
    closeSidebarSelector: 'div[id="dicom-metadata-sidebar-header"] button.header__close',
    vipMetadataPatientNameSelector: '//*[@id="dicom-viewer-vip-metadata"]/div/span',
    sidebarMetadataPatientNameSelector:
      '//*[@id="dicom-metadata-sidebar-content"]/table/tr/th[contains(text(), "Patient Name")]/following-sibling::td'
  }

  async login(user): Promise<void> {
    const stepUser = await getUser({ user })
    await global.page.locator(this.elements.userNameSelector).fill(stepUser.displayName)
    await global.page.locator(this.elements.passwordSelector).fill(stepUser.password)
    await global.page.locator(this.elements.loginButtonSelector).click()
    await global.page.locator(this.elements.webContentSelector).waitFor()
  }

  async logout(): Promise<void> {
    await global.page.locator(this.elements.userMenuButtonSelector).click()
    await global.page.locator(this.elements.logoutSelector).click()
  }

  async previewDicomFile({ filename }): Promise<void> {
    await global.page.locator(util.format(this.elements.resourceNameSelector, filename)).click()
  }

  async getOverlayPatientName(): Promise<void> {
    return await global.page
      .locator(this.elements.vipMetadataPatientNameSelector)
      .first()
      .innerText()
  }
  async getPatientName(metadataLocation): Promise<void> {
    let patientName
    switch (metadataLocation) {
      case 'VIP metadata section':
        patientName = await global.page
          .locator(this.elements.vipMetadataPatientNameSelector)
          .first()
          .innerText()
        break
      case 'metadata sidebar':
        patientName = await global.page
          .locator(this.elements.sidebarMetadataPatientNameSelector)
          .first()
          .innerText()
    }
    return patientName
  }

  async closeMetadataSidebar(): Promise<void> {
    await global.page.locator(this.elements.closeSidebarSelector).click()
  }
}

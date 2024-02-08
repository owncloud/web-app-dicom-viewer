import { Before, BeforeAll, After, AfterAll, setDefaultTimeout } from "@cucumber/cucumber"
import { Browser, chromium } from "@playwright/test"
import { config } from "./config.js"
import { Page } from "@playwright/test"

export const state: {
    browser: Browser
    page?: Page
} = {
    browser: undefined,
    page: undefined
}

setDefaultTimeout(20000)

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
    await state.page.close()
})

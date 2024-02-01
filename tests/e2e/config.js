exports.config = {
    // environment
    baseUrlOcis: process.env.BASE_URL_OCIS ?? 'https://host.docker.internal:9200',
    assets: './tests/e2e/filesForUpload',
    // cucumber
    retry: process.env.RETRY || 0,
    //playwright
    slowMo: parseInt(process.env.SLOW_MO) || 0,
    timeout: parseInt(process.env.TIMEOUT) || 600,
    minTimeout: parseInt(process.env.MIN_TIMEOUT) || 50,
    headless: process.env.HEADLESS === 'true'
}

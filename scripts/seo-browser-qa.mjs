import { preview } from 'vite'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

// Set FTD_PLAYWRIGHT_MODULE to an installed Playwright ESM entry if Playwright
// is provided by the QA host rather than this project's runtime dependencies.
const { chromium, webkit } = await import(process.env.FTD_PLAYWRIGHT_MODULE || 'playwright')
const mode = process.argv[2]
if (!['staging', 'production'].includes(mode)) throw new Error('Usage: node scripts/seo-browser-qa.mjs staging|production')
const base = process.env.FTD_EXPECT_BASE || (mode === 'production' ? '/' : '')
const reportDir = process.env.FTD_SEO_REPORT_DIR || 'qa/seo'
if (!base.startsWith('/') || !base.endsWith('/')) throw new Error('FTD_EXPECT_BASE must be a root-relative slash-terminated path')
const server = await preview({
  build: { outDir: process.env.FTD_SEO_DIST || 'dist' },
  preview: { host: '127.0.0.1', port: 0, strictPort: false },
})
const address = server.httpServer.address()
if (!address || typeof address === 'string') throw new Error('Preview server did not bind')
const url = `http://127.0.0.1:${address.port}${base}`
const origin = new URL(url).origin
const results = []
await mkdir(reportDir, { recursive: true })
try {
  for (const [name, type] of [['Chrome', chromium], ['WebKit', webkit]]) {
    let browser
    try {
      browser = await type.launch(name === 'Chrome'
        ? { channel: 'chrome', headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader-webgl', '--enable-unsafe-swiftshader'] }
        : { headless: true })
    }
    catch (error) { results.push({ browser: name, skipped: String(error.message).split('\n')[0] }); continue }
    try {
      const first = await browser.newPage({ viewport: { width: 1440, height: 900 } })
      await first.route(/\/assets\/index-[^/]+\.js$/, async route => { await new Promise(resolve => setTimeout(resolve, 500)); await route.continue() })
      await first.goto(url, { waitUntil: 'commit', timeout: 30000 })
      await first.locator('#ftd-boot').waitFor({ state: 'visible', timeout: 10000 })
      const bootFirstFrame = await first.locator('#ftd-boot').evaluate(element => getComputedStyle(element).position === 'fixed' && getComputedStyle(element).display !== 'none')
      await first.close()
      const noJsContext = await browser.newContext({ javaScriptEnabled: false })
      const noJsPage = await noJsContext.newPage()
      await noJsPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
      const noJsFallback = await noJsPage.locator('noscript .no-js h1').isVisible() && await noJsPage.locator('noscript .no-js a[href^="mailto:"]').isVisible()
      await noJsContext.close()
      results.push({ browser: name, bootFirstFrame, noJsFallback, passed: bootFirstFrame && noJsFallback })
      for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
        const page = await browser.newPage({ viewport, deviceScaleFactor: 1 })
        const errors = []
        const failed = []
        page.on('pageerror', error => errors.push(error.message))
        page.on('requestfailed', request => {
          const error = request.failure()?.errorText || ''
          if (request.url().startsWith(`${origin}/`) && !/cancelled|aborted|interrupted/i.test(error)) failed.push(`${error} ${request.url()}`)
        })
        page.on('response', response => {
          const resource = new URL(response.url())
          if (resource.origin !== origin) return
          const contentType = response.headers()['content-type'] || ''
          const isAsset = ['script', 'stylesheet', 'image', 'font', 'media'].includes(response.request().resourceType())
          if (response.status() >= 400 || !resource.pathname.startsWith(base) || (isAsset && /text\/html/i.test(contentType))) {
            failed.push(`${response.status()} ${contentType} ${response.url()}`)
          }
        })
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
        await page.locator('#app h1').first().waitFor({ state: 'attached', timeout: 30000 })
        await page.locator('#ftd-boot').waitFor({ state: 'detached', timeout: 30000 })
        await page.locator('.ftd-prehero-loader').waitFor({ state: 'detached', timeout: 30000 })
        await page.locator('[data-phase1-state="idle"]').waitFor({ state: 'attached', timeout: 30000 })
        const state = await page.evaluate(() => ({
          lang: document.documentElement.lang,
          title: document.title,
          robots: document.querySelector('meta[name="robots"]')?.getAttribute('content'),
          canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
          headings: [...document.querySelectorAll('main h1, main h2')].map(element => element.textContent?.trim()).filter(Boolean),
          loaderInfo: [...document.querySelectorAll('#ftd-boot, .ftd-prehero-loader')].map(element => { const style = getComputedStyle(element); const rect = element.getBoundingClientRect(); return { className: element.className, display: style.display, visibility: style.visibility, opacity: style.opacity, position: style.position, clipPath: style.clipPath, rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height } } }),
          horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 2,
        }))
        const languageSwitch = await page.evaluate(() => {
          document.querySelector('button[lang="ru"]')?.click()
          const russian = document.documentElement.lang === 'ru' && document.title.includes('медиабаинг')
          document.querySelector('button[lang="en"]')?.click()
          return russian && document.documentElement.lang === 'en'
        })
        state.loaderVisible = state.loaderInfo.some(info => info.display !== 'none' && info.visibility !== 'hidden' && Number(info.opacity) > .01 && info.rect.width > 0 && info.rect.height > 0 && info.rect.x < viewport.width && info.rect.y < viewport.height && info.rect.x + info.rect.width > 0 && info.rect.y + info.rect.height > 0)
        const label = `${mode}-${name.toLowerCase()}-${viewport.width}`
        await page.screenshot({ path: join(reportDir, `${label}.png`) })
        await page.locator('#section-05').scrollIntoViewIfNeeded()
        await page.waitForFunction(() => {
          const mascots = [...document.querySelectorAll('img.s05__mascot-base')]
          return mascots.length === 2 && mascots.every(image => image.complete && image.naturalWidth > 0)
        })
        await page.locator('#section-06').scrollIntoViewIfNeeded()
        const globe = page.locator('.s06-globe')
        await globe.waitFor({ state: 'attached' })
        await globe.scrollIntoViewIfNeeded()
        await page.waitForFunction(() => {
          const resources = performance.getEntriesByType('resource')
          return ['three.module-', 'section06-coastlines-'].every(chunk => resources.some(resource => resource.name.includes(chunk)))
        })
        await page.waitForLoadState('networkidle')
        const globeReady = await globe.getAttribute('data-ready')
        const loadedFonts = await page.evaluate(async () => {
          await document.fonts.ready
          return [...document.fonts].filter(face => face.status === 'loaded').map(face => face.family)
        })
        const metadataCorrect = state.robots === (mode === 'production' ? 'index, follow' : 'noindex, follow')
          && state.canonical === (mode === 'production' ? 'https://ftdlab.net/' : '')
        const passed = response?.status() === 200 && errors.length === 0 && failed.length === 0
          && state.lang === 'en' && languageSwitch && state.headings.length >= 7 && !state.loaderVisible
          && !state.horizontalOverflow && metadataCorrect && loadedFonts.some(family => family.includes('FTD Section Druk'))
        results.push({ browser: name, viewport, response: response?.status(), state, languageSwitch, loadedFonts, globeReady, errors, failed, passed })
        await page.close()
      }
    } finally { await browser.close() }
  }
} finally { await server.close() }
const report = { mode, url, results, passed: results.length === 6 && results.every(result => result.passed) }
await writeFile(join(reportDir, `${mode}-browser.json`), JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
if (!report.passed) process.exitCode = 1

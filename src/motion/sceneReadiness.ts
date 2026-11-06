import { getHeroFontStatus, loadHeroFonts } from '../fontLoader'

export type SceneReadiness = 'ready' | 'failed' | 'aborted'
export interface HeroReadinessProgress { progress: number; stage: string; readyCount: number; requiredCount: number; failedCount: number }
export interface HeroReadinessResult { status: SceneReadiness; failedAssets: string[] }

// A stalled request offers recovery; it never releases an incomplete site.
const REQUEST_TIMEOUT_MS = 30000
function bounded<T>(work: Promise<T>, signal: AbortSignal): Promise<SceneReadiness> {
  return new Promise(resolve => {
    let settled = false
    const finish = (result: SceneReadiness) => {
      if (settled) return
      settled = true; clearTimeout(timer); signal.removeEventListener('abort', abort); resolve(result)
    }
    const abort = () => finish('aborted')
    const timer = window.setTimeout(() => finish('failed'), REQUEST_TIMEOUT_MS)
    signal.addEventListener('abort', abort, { once: true })
    if (signal.aborted) abort()
    void work.then(() => finish('ready'), () => finish('failed'))
  })
}
function decodeUrl(url: string, signal: AbortSignal): Promise<SceneReadiness> {
  const image = new Image()
  const loaded = new Promise<void>((resolve, reject) => {
    image.onload = () => {
      if (!image.naturalWidth) { reject(Error(url)); return }
      void image.decode().then(resolve, reject)
    }
    image.onerror = () => reject(Error(url))
    image.src = url
  })
  return bounded(loaded, signal).finally(() => { image.onload = null; image.onerror = null })
}
function heroImages(host: HTMLElement): Set<string> {
  const urls = new Set<string>()
  const composition = host.querySelector<HTMLElement>('.composition') ?? host
  const add = (value: string | null) => {
    if (!value || value.startsWith('#') || value.startsWith('data:')) return
    const url = new URL(value, document.baseURI)
    if (!url.hash || url.pathname !== location.pathname) urls.add(url.href.split('#')[0]!)
  }
  // Only artwork used by the current Hero composition may hold the first paint.
  composition.querySelectorAll<HTMLImageElement>('img:not(.reference-overlay)').forEach(image => add(image.currentSrc || image.src))
  composition.querySelectorAll<SVGImageElement>('svg image').forEach(image => add(image.getAttribute('href') || image.getAttribute('xlink:href')))
  composition.querySelectorAll<HTMLElement>('*').forEach(element => {
    for (const pseudo of [null, '::before', '::after']) {
      const css = getComputedStyle(element, pseudo)
      for (const value of [css.backgroundImage, css.maskImage]) {
        for (const match of value.matchAll(/url\(["']?([^"')]+)["']?\)/g)) add(match[1]!)
      }
    }
  })
  return urls
}
/** One gate for the mounted Hero composition only.
 * Progress counts completed resources, not elapsed time or estimated bytes. */
export async function prepareHeroReadiness(host: HTMLElement, signal: AbortSignal, publish: (value: HeroReadinessProgress) => void): Promise<HeroReadinessResult> {
  const urls = heroImages(host)
  const failedAssets: string[] = []
  let readyCount = 0
  const requiredCount = urls.size + 1
  const update = () => {
    if (signal.aborted) return
    publish({ progress: readyCount === requiredCount ? 100 : Math.min(99, Math.floor(100 * readyCount / requiredCount)),
      stage: failedAssets.length ? 'Asset unavailable' : readyCount === requiredCount ? 'Ready' : 'Loading assets',
      readyCount, requiredCount, failedCount: failedAssets.length })
  }
  const track = async (name: string, task: Promise<SceneReadiness>) => {
    const result = await task
    if (result === 'ready') readyCount++
    else if (result === 'failed') failedAssets.push(name)
    update(); return result
  }
  update()
  const fonts = (async () => {
    await loadHeroFonts()
    if (getHeroFontStatus() !== 'ready') throw Error('Configured typography unavailable')
    for (const spec of ['900 16px "FTD Section Druk"', '400 16px "FTD Section Helvetica"', '900 16px "FTD Loader Montserrat"', '400 12px "FTD Loader Inter"']) {
      const faces = await document.fonts.load(spec)
      if (!faces.length || faces.some(face => face.status !== 'loaded')) throw Error(spec)
    }
    await document.fonts.ready
  })()
  const results = await Promise.all([
    ...Array.from(urls, url => track(url, decodeUrl(url, signal))),
    track('Typography', bounded(fonts, signal)),
  ])
  return { status: signal.aborted || results.includes('aborted') ? 'aborted' : failedAssets.length ? 'failed' : 'ready', failedAssets }
}

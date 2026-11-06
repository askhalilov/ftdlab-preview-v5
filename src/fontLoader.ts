import { heroFontConfig } from './typography'

export type HeroFontStatus = 'pending' | 'ready' | 'fallback'
let preparation: Promise<void> | undefined
let status: HeroFontStatus = 'ready'
export const getHeroFontStatus = () => status

// Startup readiness owns recovery. A slow valid font must not be discarded
// after a short timer, or swap typography after the loader has disappeared.
export function loadHeroFonts(): Promise<void> {
  if (preparation) return preparation
  const configured = Object.entries(heroFontConfig).filter(([, url]) => !!url)
  if (!configured.length) return preparation = Promise.resolve()
  status = 'pending'
  preparation = Promise.all(configured.map(async ([name, url]) => {
    const face = new FontFace(name, `url("${url}")`, { weight: name === 'FTD Druk' ? '900' : '400', display: 'swap' })
    await face.load()
    document.fonts.add(face)
    document.documentElement.classList.add(name === 'FTD Druk' ? 'font-druk' : 'font-helvetica')
  })).then(() => { status = 'ready' }, () => { status = 'fallback' })
  return preparation
}

// Match the existing Section 02 and site-navigation mobile layout boundary.
export const MOBILE_SCROLL_QUERY = '(max-width: 900px)'
export const usesNativeScroll = () => matchMedia(MOBILE_SCROLL_QUERY).matches

export function initMobileViewport() {
  const query = matchMedia(MOBILE_SCROLL_QUERY)
  const root = document.documentElement
  let width = 0
  function update() {
    root.classList.toggle('ftd-native-scroll', query.matches)
    if (!query.matches) {
      width = 0
      root.classList.remove('ftd-mobile-short', 'ftd-mobile-compact', 'ftd-mobile-landscape')
      root.style.removeProperty('--mobile-viewport-height')
      return
    }
    // Browser chrome and the keyboard may resize only the visible height.
    // Keep cinematic frames stable until the layout width/orientation changes.
    if (width === innerWidth) return
    width = innerWidth
    const probe = document.createElement('div')
    probe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;height:100svh'
    root.appendChild(probe)
    const height = probe.getBoundingClientRect().height || innerHeight
    probe.remove()
    root.style.setProperty('--mobile-viewport-height', `${height}px`)
    root.classList.toggle('ftd-mobile-short', height <= 720)
    root.classList.toggle('ftd-mobile-compact', height <= 650)
    root.classList.toggle('ftd-mobile-landscape', width > 600 && height <= 610)
  }
  query.addEventListener('change', update)
  addEventListener('resize', update, { passive: true })
  update()
  return () => {
    query.removeEventListener('change', update)
    removeEventListener('resize', update)
    root.classList.remove('ftd-native-scroll', 'ftd-mobile-short', 'ftd-mobile-compact', 'ftd-mobile-landscape')
    root.style.removeProperty('--mobile-viewport-height')
  }
}

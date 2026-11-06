import { createApp } from 'vue'
import App from './App.vue'
import { fitText } from './fitText'
import './style.css'
import './mobile-scroll.css'
import './section-stitches.css'
import { loadHeroFonts } from './fontLoader'
import { initMobileViewport } from './mobileScroll'

// Mount the approved loader immediately; its resource gate also awaits fonts.
void loadHeroFonts()
const stopMobileViewport = initMobileViewport()
import.meta.hot?.dispose(stopMobileViewport)
createApp(App).directive('fit', fitText).mount('#app')
document.documentElement.dataset.ftdMounted = 'true'

// The critical-CSS first-paint shell gives way only after Vue has painted its
// approved loader. Every page load verifies the resources, including refreshes.
const boot = document.getElementById('ftd-boot')
if (boot) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const presentation = document.querySelector('.ftd-prehero-loader')
    if (presentation && getComputedStyle(presentation).position !== 'fixed') {
      // A failed main stylesheet must not expose unstyled Vue content.
      boot.classList.add('ftd-boot--failed')
      boot.setAttribute('aria-label', 'FTD.LAB could not load')
      return
    }
    // The Vue presentation already covers the viewport. Replace the shell in
    // this paint, so two differently positioned brands never cross-fade.
    boot.remove()
  }))
}

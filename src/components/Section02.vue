<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { copy } from '../i18n'
import '../section02.css'

const root = ref<HTMLElement>()
const track = ref<HTMLElement>()
const reel = ref<HTMLElement>()
const chartValues = [20, 28, 35, 44, 53, 65, 76, 91]
let context: gsap.Context | undefined
let geoCycle: gsap.core.Timeline | undefined
let trafficTimeline: gsap.core.Timeline | undefined
let chartTimeline: gsap.core.Timeline | undefined
let motionQuery: MediaQueryList | undefined
let motionHandler: (() => void) | undefined
let resizeTimer = 0
let sceneObserver: IntersectionObserver | undefined
let layoutWidth = innerWidth
const mobileVisible = new Set<Element>()
const mobileEntrances: gsap.core.Timeline[] = []
function drawLengths(selector: string) {
  root.value?.querySelectorAll<SVGPathElement>(selector).forEach(path => {
    // The SVG stretches to the layout box; a longer dash covers its rendered path at every aspect ratio.
    const length = path.getTotalLength() * 2
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
  })
}

function resetTraffic() {
  gsap.set('.s02-traffic', { clearProps: 'boxShadow,borderColor' })
  gsap.set('.s02-connection', { opacity: 1, clearProps: 'strokeDasharray,strokeDashoffset' })
  gsap.set('.s02-connection-flow', { opacity: 0, strokeDasharray: '22 900', strokeDashoffset: 0 })
  gsap.set('.s02-card', { opacity: .75, clearProps: 'borderColor' })
}
function resetChart() {
  gsap.set('.s02-chart-bar', { scaleY: .08, transformOrigin: 'bottom center' })
  drawLengths('.s02-chart-line')
  gsap.set('.s02-chart-line', { opacity: 1 })
  gsap.set('.s02-chart-point', { opacity: .18, scale: .55, transformOrigin: 'center center', clearProps: 'filter' })
}
function trimConnections() {
  const svg = root.value?.querySelector<SVGSVGElement>('.s02-system-lines')
  if (!svg) return
  const bounds = svg.getBoundingClientRect()
  if (!bounds.width || !bounds.height) return
  const targets = ['.s02-traffic', '.s02-card-geo', '.s02-card-brand', '.s02-card-conditions', '.s02-card-execution']
  const holes = svg.querySelectorAll<SVGRectElement>('.s02-connector-cutout')
  const clearance = innerWidth <= 900 ? 6 : 12
  targets.forEach((selector, index) => {
    const card = root.value?.querySelector<HTMLElement>(selector)
    const hole = holes[index]
    if (!card || !hole) return
    const rect = card.getBoundingClientRect()
    hole.setAttribute('x', String((rect.left - bounds.left - clearance) / bounds.width * 640))
    hole.setAttribute('y', String((rect.top - bounds.top - clearance) / bounds.height * 470))
    hole.setAttribute('width', String((rect.width + clearance * 2) / bounds.width * 640))
    hole.setAttribute('height', String((rect.height + clearance * 2) / bounds.height * 470))
  })
}
function createTrafficLoop() {
  resetTraffic()
  return gsap.timeline({ repeat: -1, repeatDelay: .35 })
      .to('.s02-traffic', { boxShadow: '0 0 24px rgba(0,239,252,.2)', borderColor: '#00effc', duration: .25 }, 0)
      .to('.s02-card', { opacity: 1, borderColor: '#00dce9', duration: .28, stagger: .06 }, .34)
      .to('.s02-connection-flow', { opacity: .95, duration: .15, stagger: .16 }, .5)
      .to('.s02-connection-flow', { strokeDashoffset: (_index, path: SVGPathElement) => -path.getTotalLength() - 22, duration: 2, stagger: .16, ease: 'none' }, .5)
      .to('.s02-traffic', { boxShadow: '0 0 12px rgba(0,239,252,.09)', duration: 1.1, ease: 'sine.inOut' }, 1.1)
      .set('.s02-connection-flow', { opacity: 0, strokeDashoffset: 0 }, '>-0.05')
}
function createChartLoop() {
  resetChart()
  return gsap.timeline({ repeat: -1, repeatDelay: .55 })
      .to('.s02-chart-bar', { scaleY: 1, duration: .9, ease: 'power2.out' })
      .to('.s02-chart-line', { strokeDashoffset: 0, opacity: 1, duration: .85, ease: 'power2.out' }, .2)
      .to('.s02-chart-point', { opacity: 1, scale: 1, duration: .23, stagger: .1 }, .4)
      .to('.s02-chart-point:last-child', { filter: 'drop-shadow(0 0 9px #00effc)', duration: .25 }, 1.15)
      .to({}, { duration: 1.15 })
      .to('.s02-chart-bar', { scaleY: .82, duration: .9, ease: 'sine.inOut' })
      .to('.s02-chart-line', { opacity: .58, duration: .65 }, '<')
      .to('.s02-chart-point', { opacity: .62, duration: .55 }, '<')
}
function syncMobileScenes() {
  const loops = [geoCycle, trafficTimeline, chartTimeline]
  root.value?.querySelectorAll('.s02-scene').forEach((scene, index) => {
    const running = mobileVisible.has(scene) && !document.hidden && !motionQuery?.matches
    scene.setAttribute('data-loop-active', String(running))
    if (running) loops[index]?.play()
    else loops[index]?.pause()
  })
}
function observeMobileScenes() {
  const revealed = new Set<Element>()
  sceneObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        mobileVisible.add(entry.target)
        if (!revealed.has(entry.target)) {
          revealed.add(entry.target)
          const travel = innerWidth <= 900 ? 15 : 30
          mobileEntrances.push(gsap.timeline()
            .fromTo(entry.target.querySelector('.s02-copy'),
              { opacity: .08, x: -travel }, { opacity: 1, x: 0, duration: .7, ease: 'power2.out', clearProps: 'opacity,transform' }, 0)
            .fromTo(entry.target.querySelector('.s02-visual'),
              { opacity: .08, x: travel }, { opacity: 1, x: 0, duration: .82, ease: 'power2.out', clearProps: 'opacity,transform' }, .07))
        }
      } else mobileVisible.delete(entry.target)
    }
    syncMobileScenes()
  }, { threshold: .05 })
  root.value?.querySelectorAll('.s02-scene').forEach(scene => sceneObserver!.observe(scene))
}
function resize() {
  if (layoutWidth === innerWidth) return
  layoutWidth = innerWidth
  clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(trimConnections, 120)
}

function setup() {
  sceneObserver?.disconnect(); sceneObserver = undefined
  mobileVisible.clear()
  mobileEntrances.splice(0).forEach(tween => tween.revert())
  trafficTimeline?.kill()
  chartTimeline?.kill()
  context?.revert()
  geoCycle?.kill()
  context = undefined
  geoCycle = undefined
  if (!root.value || !track.value) return
  const section = root.value
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  layoutWidth = innerWidth
  section.classList.add('s02-native')
  section.dataset.scrollMode = 'native'
  section.querySelectorAll('.s02-scene').forEach(scene => scene.removeAttribute('data-loop-active'))
  section.classList.toggle('s02-reduced', reduced)
  if (reduced) {
    trimConnections()
    return
  }
  context = gsap.context(() => {
    const travel = innerWidth <= 900 ? 15 : 30
    section.querySelectorAll('.s02-scene').forEach(scene => {
      gsap.set(scene.querySelector('.s02-copy'), { opacity: .08, x: -travel })
      gsap.set(scene.querySelector('.s02-visual'), { opacity: .08, x: travel })
    })
    resetTraffic()
    resetChart()

    geoCycle = gsap.timeline({ paused: true, repeat: -1 })
    copy.value.s02.countries.forEach((_, index) => {
      geoCycle!.call(() => {
        if (reel.value) reel.value.style.setProperty('--geo-index', String(index))
      }, [], index * 1.25)
    })
    geoCycle.to({}, { duration: copy.value.s02.countries.length * 1.25 }, 0)

    // Each scene's visual loop follows viewport visibility; none owns scrolling.
    trafficTimeline = createTrafficLoop().pause(0)
    chartTimeline = createChartLoop().pause(0)
  }, section)
  observeMobileScenes()
  trimConnections()
}

onMounted(() => {
  motionQuery = matchMedia('(prefers-reduced-motion: reduce)')
  motionHandler = () => setup()
  motionQuery.addEventListener('change', motionHandler)
  window.addEventListener('resize', resize)
  setup()
  void document.fonts.ready.then(trimConnections)
  document.addEventListener('visibilitychange', visibility)
})
function visibility() {
  syncMobileScenes()
}
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', visibility)
  motionQuery?.removeEventListener('change', motionHandler!)
  sceneObserver?.disconnect()
  mobileEntrances.splice(0).forEach(tween => tween.revert())
  window.removeEventListener('resize', resize)
  clearTimeout(resizeTimer)
  geoCycle?.kill()
  trafficTimeline?.kill()
  chartTimeline?.kill()
  context?.revert()
})
</script>

<template>
  <section id="section-02" ref="root" class="s02" :aria-label="copy.s02.aria">
    <div class="s02-frame">
      <div ref="track" class="s02-track">
        <article class="s02-scene s02-scene-one" aria-labelledby="s02-title-one">
          <div class="s02-copy">
            <span class="s02-eyebrow"><b>01</b><i></i>{{ copy.s02.who }}</span>
            <h2 id="s02-title-one">BUILT<br>AROUND<br><em>PERFORMANCE.</em></h2>
            <p>{{ copy.s02.description1 }}</p>
          </div>
          <div class="s02-visual s02-geo s02-phone" :aria-label="copy.s02.geoAria">
            <div class="s02-phone-top"><span>FTD.LAB</span><i></i><small>01 / 05</small></div>
            <div class="s02-geo-header"><span>GEO</span><small>{{ copy.s02.geoNote }}</small></div>
            <div ref="reel" class="s02-reel" aria-hidden="true">
              <div v-for="(country, index) in copy.s02.countries" :key="index" class="s02-country" :style="{ '--country-index': index }">{{ country }}</div>
            </div>
            <div class="s02-geo-footer"><span>{{ copy.s02.reach }}</span><span>01 — 05</span></div>
          </div>
          <span class="s02-scene-index">01 / 03</span>
        </article>
        <div class="s02-scene-bridge" aria-hidden="true"></div>

        <article class="s02-scene s02-scene-two" aria-labelledby="s02-title-two">
          <div class="s02-copy">
            <span class="s02-eyebrow"><b>02</b><i></i>{{ copy.s02.think }}</span>
            <h2 id="s02-title-two">THE RIGHT<br><em>COMBINATION</em><br>CREATES<br>RESULTS.</h2>
            <p>{{ copy.s02.description2 }}</p>
          </div>
          <div class="s02-visual s02-system" :aria-label="copy.s02.systemAria">
            <svg class="s02-system-lines" viewBox="0 0 640 470" preserveAspectRatio="none" aria-hidden="true">
              <defs><mask id="s02-card-line-mask" x="0" y="0" width="640" height="470" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse"><rect width="640" height="470" fill="white" /><rect v-for="index in 5" :key="index" class="s02-connector-cutout" fill="black" /></mask></defs>
              <g mask="url(#s02-card-line-mask)">
              <path class="s02-connection" d="M320 235 C230 235 210 105 140 105" />
              <path class="s02-connection" d="M320 235 C410 235 430 105 500 105" />
              <path class="s02-connection" d="M320 235 C230 235 210 365 140 365" />
              <path class="s02-connection" d="M320 235 C410 235 430 365 525 374" />
              <path class="s02-connection-flow" d="M320 235 C230 235 210 105 140 105" />
              <path class="s02-connection-flow" d="M320 235 C410 235 430 105 500 105" />
              <path class="s02-connection-flow" d="M320 235 C230 235 210 365 140 365" />
              <path class="s02-connection-flow" d="M320 235 C410 235 430 365 525 374" />
              </g>
            </svg>
            <div class="s02-traffic">{{ copy.s02.traffic }}<span>{{ copy.s02.central }}</span></div>
            <div class="s02-card s02-card-geo">GEO <small>01</small></div>
            <div class="s02-card s02-card-brand">{{ copy.s02.brand }} <small>02</small></div>
            <div class="s02-card s02-card-conditions">{{ copy.s02.conditions }} <small>03</small></div>
            <div class="s02-card s02-card-execution">{{ copy.s02.execution }} <small>04</small></div>
          </div>
          <span class="s02-scene-index">02 / 03</span>
        </article>
        <div class="s02-scene-bridge" aria-hidden="true"></div>

        <article class="s02-scene s02-scene-three" aria-labelledby="s02-title-three">
          <div class="s02-copy">
            <span class="s02-eyebrow"><b>03</b><i></i>{{ copy.s02.scale }}</span>
            <h2 id="s02-title-three">SCALING<br><em>IS A RESULT</em><br>OF <br class="s02-mobile-break">PERFORMANCE.</h2>
            <p>{{ copy.s02.description3 }}</p>
          </div>
          <div class="s02-visual s02-chart" role="img" :aria-label="copy.s02.chartAria">
            <div class="s02-chart-grid"></div>
            <div class="s02-bars"><div v-for="(value, index) in chartValues" :key="index" class="s02-chart-bar" :style="{ height: `${value}%` }"></div></div>
            <svg viewBox="0 0 640 400" preserveAspectRatio="none" aria-hidden="true">
              <path class="s02-chart-line" d="M38 320 L120 294 L202 274 L284 236 L366 199 L448 151 L530 111 L606 38" />
              <circle v-for="(point, index) in [[38,320],[120,294],[202,274],[284,236],[366,199],[448,151],[530,111],[606,38]]" :key="index" class="s02-chart-point" :cx="point[0]" :cy="point[1]" r="5" />
            </svg>
            <span class="s02-chart-caption">{{ copy.s02.scale }} ↗</span>
          </div>
          <span class="s02-scene-index">03 / 03</span>
        </article>
      </div>
    </div>
  </section>
</template>

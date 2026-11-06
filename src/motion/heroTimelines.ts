import gsap from 'gsap'
import { heroMotionConfig } from './heroMotionConfig'

export type HeroView = 'desktop' | 'mobile'

const targets = (host: HTMLElement, name: string) =>
  Array.from(host.querySelectorAll<HTMLElement>(`[data-intro="${name}"]`))

/** Restore only the presentation owned by these timelines. Inner fit-copy
 * transforms belong to the typography fitter and must never be changed. */
export function resetHeroTargets(host: HTMLElement) {
  gsap.set(host.querySelectorAll('[data-intro]'), {
    clearProps: 'opacity,visibility,transform,clipPath,filter',
  })
}

/** Two independent live-HTML intros. Scene scale/blur reveal the combined
 * image; they do not imply a capsule opening or character exit. */
export function createHeroTimeline(host: HTMLElement, view: HeroView, onComplete: () => void) {
  const headline = targets(host, 'headline')
  const scene = targets(host, 'scene')
  const logo = targets(host, 'logo')
  const copy = targets(host, 'copy')
  const cta = targets(host, 'cta')
  const cards = targets(host, 'card')
  const scale = host.clientWidth / (view === 'desktop' ? 1672 : 941)
  const c = heroMotionConfig[view].intro
  const timeline = gsap.timeline({ paused: true, defaults: { ease: c.ease }, onComplete })

  gsap.set(headline, { clipPath: 'inset(0% 0% 100% 0%)' })
  gsap.set([...logo, ...scene, ...copy, ...cta, ...cards], { opacity: 0 })
  gsap.set(scene, { scale: c.sceneScale, filter: `blur(${c.blurPx * scale}px)`, force3D: false })
  // Opacity leaves real HTML and links in the accessibility tree. Any keyboard
  // focus in the hero advances the lifecycle to its complete visible state.
  if (view === 'desktop') {
    gsap.set([...copy, ...cta], { y: 6 * scale })
    gsap.set(cards, { x: 12 * scale })
    timeline
      .to(logo, { opacity: 1, duration: .25 }, 0)
      .to(headline, { clipPath: 'inset(0% 0% 0% 0%)', stagger: c.headlineStagger, duration: c.headlineDuration }, c.headlineAt)
      .to(scene, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: c.sceneDuration, force3D: false }, c.sceneAt)
      .to(copy, { opacity: 1, y: 0, duration: c.copyDuration }, c.copyAt)
      .to(cta, { opacity: 1, y: 0, duration: c.ctaDuration }, c.ctaAt)
      .to(cards, { opacity: 1, x: 0, stagger: c.cardsStagger, duration: c.cardsDuration }, c.cardsAt)
      .to({}, { duration: .1 }, c.duration - .1)
  } else {
    gsap.set(cta, { y: 4 * scale })
    timeline
      .to(logo, { opacity: 1, duration: .25 }, 0)
      .to(scene, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: c.sceneDuration, force3D: false }, c.sceneAt)
      .to(headline, { clipPath: 'inset(0% 0% 0% 0%)', stagger: c.headlineStagger, duration: c.headlineDuration }, c.headlineAt)
      .to(cta, { opacity: 1, y: 0, duration: c.ctaDuration }, c.ctaAt)
      .to(copy, { opacity: 1, duration: c.copyDuration }, c.copyAt)
      .to(cards, { opacity: 1, stagger: c.cardsStagger, duration: c.cardsDuration }, c.cardsAt)
  }
  return timeline
}

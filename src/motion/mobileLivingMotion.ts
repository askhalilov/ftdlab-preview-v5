import gsap from 'gsap'
import { mobileLivingConfig as c, mobileLivingAsset } from './mobileLivingConfig'
import { createMobileArmRenderer } from './mobileArmRenderer'

export interface MobileLivingController {
  attachIntro(timeline: gsap.core.Timeline): void
  setProgress(value: number): void
  finishOpen(): void
  startIdle(): void
  setPaused(value: boolean): void
  dispose(): void
}

/** Registered mobile doors reveal original pixels through their moving alpha.
 * The frame never moves. A continuous field moves the original forearm/glove
 * together, blending through the sleeve attachment without a cutout seam. */
export function createMobileLivingMotion(host: HTMLElement, publish: (percent: number) => void): MobileLivingController | undefined {
  const scene=host.querySelector<HTMLElement>('[data-mobile-capsule]')
  const upper=scene?.querySelector<HTMLElement>('[data-mobile-door="upper"]')
  const lower=scene?.querySelector<HTMLElement>('[data-mobile-door="lower"]')
  const arm=host.querySelector<HTMLCanvasElement>('[data-mobile-arm]')
  const map=host.querySelector<HTMLImageElement>('[data-mobile-arm-map]')
  const original=host.querySelector<HTMLImageElement>('img.approved-scene')
  const foreground=host.querySelector<HTMLElement>('[data-phase1="float"]')
  if(!scene||!upper||!lower||!arm||!map||!original||!foreground)return
  let disposed=false, paused=true, idle=false, opening=1, count=0
  let wait: gsap.core.Tween|undefined, gesture: gsap.core.Timeline|undefined
  let renderer: ReturnType<typeof createMobileArmRenderer>
  const scale=scene.clientWidth/c.canvas.width
  const originalStyles=[scene,upper,lower,arm,original,foreground].map(e=>[e,e.getAttribute('style')] as const)
  const state={value:1}
  const paint=()=>{
    const p=Math.min(1,Math.max(0,state.value));opening=p
    upper.style.transform=`translate(${-c.doors.x*p*scale}px, ${-c.doors.y*p*scale}px)`
    lower.style.transform=`translate(${c.doors.x*p*scale}px, ${c.doors.y*p*scale}px)`
    // The source foreground follows the complementary opaque door footprints.
    // It passes in front of the stationary rim only as the doors uncover it.
    // This also restores the original sleeve crossing the left rail naturally.
    foreground.style.maskImage=p===1?'none':`linear-gradient(white,white), url('${mobileLivingAsset('door-upper-registered.png')}'), url('${mobileLivingAsset('door-lower-registered.png')}')`
    foreground.style.maskComposite='subtract, add'
    foreground.style.maskSize='100% 100%'
    foreground.style.maskRepeat='no-repeat'
    foreground.style.maskPosition=`0px 0px, ${-c.doors.x*p*scale}px ${-c.doors.y*p*scale}px, ${c.doors.x*p*scale}px ${c.doors.y*p*scale}px`
    scene.dataset.opening=p.toFixed(4)
    scene.dataset.capsuleState=p===0?'closed':p===1?'open':'opening'
    // No opacity animation: at the endpoint both panels have cleared the mask.
    scene.style.visibility=p===1?'hidden':'visible'
    publish(p*100)
  }
  function rest(){
    arm!.style.visibility='hidden'
    arm!.dataset.pointingState='rest'
  }
  function schedule(first=false){
    if(disposed||paused||!idle||opening<1||wait||gesture)return
    const delay=first?c.arm.firstDelay:c.arm.intervalMin+Math.random()*(c.arm.intervalMax-c.arm.intervalMin)-c.arm.out-c.arm.hold-c.arm.back
    wait=gsap.delayedCall(delay,()=>{wait=undefined;point()})
  }
  function point(){
    if(disposed||paused||!idle||opening<1)return
    renderer??=createMobileArmRenderer(arm!,original!,map!,()=>{idle=false;wait?.kill();gesture?.kill();gesture=undefined;rest();arm!.dataset.pointingState='graphics-fallback'})
    if(!renderer){idle=false;arm!.dataset.pointingState='graphics-fallback';return}
    renderer.render(0)
    arm!.style.visibility='visible'
    arm!.dataset.pointingState='gesture';arm!.dataset.pointingCount=String(++count)
    const pose={value:0}
    gesture=gsap.timeline({onUpdate:()=>renderer?.render(pose.value*c.arm.strength),onComplete:()=>{gesture=undefined;rest();schedule()}})
      .to(pose,{value:1,duration:c.arm.out,ease:'sine.inOut'})
      .to(pose,{value:0,duration:c.arm.back,ease:'sine.inOut'},`+=${c.arm.hold}`)
  }
  arm.dataset.pointingCount='0';rest()
  return {
    attachIntro(timeline){
      state.value=0;paint()
      timeline.to(state,{value:1,duration:c.intro.duration,ease:c.intro.ease,onUpdate:paint},c.intro.openingAt)
    },
    setProgress(value){if(!disposed){state.value=value;paint()}},
    finishOpen(){if(!disposed){state.value=1;paint()}},
    startIdle(){if(disposed||idle)return;idle=true;schedule(true)},
    setPaused(value){
      if(disposed||paused===value)return;paused=value
      if(value){wait?.pause();gesture?.pause()}
      else {wait?.resume();gesture?.resume();schedule(count===0)}
    },
    dispose(){
      if(disposed)return;disposed=true;wait?.kill();gesture?.kill();rest()
      renderer?.dispose();renderer=undefined
      for(const[e,style]of originalStyles)style===null?e.removeAttribute('style'):e.setAttribute('style',style)
      delete arm.dataset.pointingCount;delete arm.dataset.pointingState
    },
  }
}

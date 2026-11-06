<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { BufferGeometry, Group, Material, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three'
let coastlines: { rings: number[][][] } = { rings: [] }

type ThreeModule = typeof import('three')
type Region = { name: string; lat: number; lon: number; point?: Vector3; element?: HTMLElement }
const regions: Region[] = [
  { name: 'NA', lat: 39, lon: -48 },
  { name: 'EU', lat: 50, lon: 16 },
  { name: 'LATAM', lat: -20, lon: -42 },
  { name: 'APAC', lat: -14, lon: 77 },
]
const host = ref<HTMLElement>()
const canvasHost = ref<HTMLElement>()
const ready = ref(false)
let three: ThreeModule | undefined
let renderer: WebGLRenderer | undefined
let scene: Scene | undefined
let camera: PerspectiveCamera | undefined
let globe: Group | undefined
let observer: IntersectionObserver | undefined
let resizeObserver: ResizeObserver | undefined
let motionQuery: MediaQueryList | undefined
let visible = false
let failed = false
let disposed = false
let loading = false
let frame = 0
let lastTime = 0
const geometries: BufferGeometry[] = []
const materials: Material[] = []

function point(lat: number, lon: number, radius: number): Vector3 {
  const phi = lat * Math.PI / 180
  const theta = lon * Math.PI / 180
  return new three!.Vector3(radius * Math.cos(phi) * Math.sin(theta), radius * Math.sin(phi), radius * Math.cos(phi) * Math.cos(theta))
}
function lineSegments(segments: number[], color: number, opacity: number, parent: Group) {
  const geometry = new three!.BufferGeometry()
  geometry.setAttribute('position', new three!.Float32BufferAttribute(segments, 3))
  const material = new three!.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false })
  geometries.push(geometry); materials.push(material)
  parent.add(new three!.LineSegments(geometry, material))
}
function buildGrid(parent: Group) {
  const positions: number[] = []
  function join(a: Vector3, b: Vector3) { positions.push(a.x,a.y,a.z,b.x,b.y,b.z) }
  for (let lon = -180; lon < 180; lon += 20) {
    for (let lat = -85; lat < 85; lat += 3) join(point(lat,lon,1.009),point(lat+3,lon,1.009))
  }
  for (let lat = -80; lat <= 80; lat += 20) {
    for (let lon = -180; lon < 180; lon += 3) join(point(lat,lon,1.009),point(lat,lon+3,1.009))
  }
  lineSegments(positions, 0x098aa3, .33, parent)
}
function buildCoasts(parent: Group) {
  const positions: number[] = []
  for (const ring of coastlines.rings) {
    for (let i = 1; i < ring.length; i++) {
      const [lonA,latA] = ring[i-1]!
      const [lonB,latB] = ring[i]!
      if (Math.abs(lonA-lonB) > 180) continue
      const count = Math.max(1,Math.ceil(Math.max(Math.abs(lonA-lonB),Math.abs(latA-latB))/3))
      for (let step = 0; step < count; step++) {
        const a = step/count, b = (step+1)/count
        const p = point(latA+(latB-latA)*a,lonA+(lonB-lonA)*a,1.017)
        const q = point(latA+(latB-latA)*b,lonA+(lonB-lonA)*b,1.017)
        positions.push(p.x,p.y,p.z,q.x,q.y,q.z)
      }
    }
  }
  lineSegments(positions, 0x00dff2, .94, parent)
}
function buildDots(parent: Group) {
  const positions: number[] = []
  for (let lat = -75; lat <= 75; lat += 7.5) for (let lon = -180; lon < 180; lon += 7.5) {
    const p = point(lat,lon,1.012)
    positions.push(p.x,p.y,p.z)
  }
  const geometry = new three!.BufferGeometry()
  geometry.setAttribute('position',new three!.Float32BufferAttribute(positions,3))
  const material = new three!.PointsMaterial({ color:0x05a7c5,size:.008,transparent:true,opacity:.49,depthWrite:false,sizeAttenuation:true })
  geometries.push(geometry); materials.push(material)
  parent.add(new three!.Points(geometry,material))
}
function buildOrbits() {
  const orbits = new three!.Group()
  for (const [radius,rise,tilt] of [[1.35,.24,.12],[1.25,-.21,-.18],[1.39,.08,.34]]) {
    const positions: number[] = []
    for (let i=0;i<180;i++) {
      const a=2*Math.PI*i/180, b=2*Math.PI*(i+1)/180
      const make=(v:number)=>new three!.Vector3(radius*Math.cos(v),rise*Math.sin(v)+tilt*Math.cos(v),.58*Math.sin(v))
      const p=make(a),q=make(b)
      positions.push(p.x,p.y,p.z,q.x,q.y,q.z)
    }
    lineSegments(positions,0x00c9df,.31,orbits)
  }
  scene!.add(orbits)
}
function updateLabels() {
  if (!camera || !globe || !host.value) return
  const width=host.value.clientWidth,height=host.value.clientHeight
  globe.updateMatrixWorld(true)
  for (const region of regions) {
    const element=region.element
    if (!element || !region.point) continue
    const world=region.point.clone().applyMatrix4(globe.matrixWorld)
    const front=world.z > .1
    const screen=world.project(camera)
    element.style.opacity=front && Math.abs(screen.x)<1.1 && Math.abs(screen.y)<1.1?'1':'0'
    element.style.left=`${(screen.x*.5+.5)*width}px`
    element.style.top=`${(-screen.y*.5+.5)*height}px`
  }
}
function render() {
  if (!renderer || !scene || !camera) return
  updateLabels()
  renderer.render(scene,camera)
  if (host.value && globe) host.value.dataset.angle=globe.rotation.y.toFixed(3)
}
function tick(time: number) {
  frame=0
  if (!renderer || !globe || !visible || document.hidden || motionQuery?.matches || disposed) return
  const delta=lastTime?Math.min((time-lastTime)/1000,.05):0
  lastTime=time
  globe.rotation.y += delta * Math.PI*2/44
  render()
  frame=requestAnimationFrame(tick)
}
function sync() {
  if (!host.value) return
  const shouldRun=!!renderer && visible && !document.hidden && !motionQuery?.matches && !disposed
  host.value.dataset.rendering=shouldRun?'true':'false'
  if (shouldRun && !frame) { lastTime=0; frame=requestAnimationFrame(tick) }
  if (!shouldRun && frame) { cancelAnimationFrame(frame); frame=0; lastTime=0 }
  if (!shouldRun) render()
}
function resize() {
  if (!renderer || !camera || !host.value) return
  const width=Math.max(1,host.value.clientWidth),height=Math.max(1,host.value.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75))
  renderer.setSize(width,height,false)
  camera.aspect=width/height
  camera.updateProjectionMatrix()
  render()
}
async function init() {
  if (loading || renderer || failed || disposed || !canvasHost.value || !host.value) return
  loading=true
  try {
    const [threeModule, coastModule] = await Promise.all([import('three'), import('../data/section06-coastlines.json')])
    three=threeModule
    coastlines=coastModule.default
    if (disposed || !canvasHost.value || !host.value) return
    const canvas=document.createElement('canvas')
    const context=canvas.getContext('webgl2',{alpha:true,antialias:true}) || canvas.getContext('webgl',{alpha:true,antialias:true})
    if (!context) { failed=true; return }
    renderer=new three.WebGLRenderer({canvas,context,alpha:true,antialias:true,powerPreference:'low-power'})
    renderer.setClearColor(0x000000,0)
    renderer.outputColorSpace=three.SRGBColorSpace
    canvasHost.value.appendChild(renderer.domElement)
    scene=new three.Scene()
    camera=new three.PerspectiveCamera(37,1,.1,20)
    camera.position.set(0,0,3.9)
    scene.add(new three.AmbientLight(0x1488a3,1.1))
    const light=new three.DirectionalLight(0x06bcd5,1.5)
    light.position.set(-2,2.5,3)
    scene.add(light)
    globe=new three.Group()
    globe.rotation.z=-.035
    globe.rotation.y=.7
    scene.add(globe)
    const sphereGeometry=new three.SphereGeometry(1,48,32)
    const sphereMaterial=new three.MeshPhongMaterial({color:0x02141d,emissive:0x001b28,shininess:80,specular:0x075368})
    geometries.push(sphereGeometry); materials.push(sphereMaterial)
    globe.add(new three.Mesh(sphereGeometry,sphereMaterial))
    const rimGeometry=new three.SphereGeometry(1.027,48,32)
    const rimMaterial=new three.ShaderMaterial({
      transparent:true,depthWrite:false,blending:three.AdditiveBlending,
      vertexShader:'varying vec3 n; varying vec3 v; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); n=normalize(normalMatrix*normal); v=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }',
      fragmentShader:'varying vec3 n; varying vec3 v; void main(){ float f=pow(1.0-max(dot(normalize(n),normalize(v)),0.0),2.8); gl_FragColor=vec4(0.0,0.75,0.95,f*0.68); }',
    })
    geometries.push(rimGeometry); materials.push(rimMaterial)
    globe.add(new three.Mesh(rimGeometry,rimMaterial))
    buildGrid(globe)
    buildCoasts(globe)
    buildDots(globe)
    buildOrbits()
    regions.forEach(region => { region.point=point(region.lat,region.lon,1.055); region.element=host.value!.querySelector<HTMLElement>(`[data-region="${region.name}"]`) ?? undefined })
    ready.value=true
    resize()
    sync()
  } catch (error) {
    failed=true
    host.value?.setAttribute('data-webgl-fallback','true')
    console.warn('Section 06 globe fallback:',error)
  } finally { loading=false }
}
function visibility() { sync() }
function motionChange() { sync() }
onMounted(() => {
  motionQuery=matchMedia('(prefers-reduced-motion: reduce)')
  motionQuery.addEventListener('change',motionChange)
  document.addEventListener('visibilitychange',visibility)
  observer=new IntersectionObserver(entries => {
    visible=!!entries[0]?.isIntersecting
    if (visible) void init()
    sync()
  },{threshold:.08})
  observer.observe(host.value!)
  resizeObserver=new ResizeObserver(resize)
  resizeObserver.observe(host.value!)
})
onBeforeUnmount(() => {
  disposed=true
  observer?.disconnect();resizeObserver?.disconnect()
  motionQuery?.removeEventListener('change',motionChange)
  document.removeEventListener('visibilitychange',visibility)
  if (frame) cancelAnimationFrame(frame)
  geometries.forEach(geometry=>geometry.dispose())
  materials.forEach(material=>material.dispose())
  renderer?.dispose()
  renderer?.forceContextLoss()
  renderer?.domElement.remove()
})
</script>

<template>
  <div ref="host" class="s06-globe" :data-ready="ready">
    <div class="s06-globe__fallback" aria-hidden="true">
      <svg viewBox="0 0 520 520" fill="none"><circle cx="260" cy="260" r="220"/><ellipse cx="260" cy="260" rx="90" ry="220"/><ellipse cx="260" cy="260" rx="170" ry="220"/><path d="M40 260h440M65 160h390M65 360h390"/></svg>
    </div>
    <div ref="canvasHost" class="s06-globe__canvas"></div>
    <span v-for="region in regions" :key="region.name" class="s06-globe__label" :data-region="region.name"><i></i>{{ region.name }}</span>
  </div>
</template>

<style scoped>
.s06-globe{position:relative;width:100%;height:100%;filter:drop-shadow(0 0 13px rgba(0,203,231,.26))}
.s06-globe__canvas{position:absolute;inset:0}.s06-globe__canvas :deep(canvas){display:block;width:100%;height:100%}
.s06-globe__fallback{position:absolute;inset:0;display:grid;place-items:center;opacity:1;transition:opacity .4s}.s06-globe[data-ready="true"] .s06-globe__fallback{opacity:0}
.s06-globe__fallback svg{width:100%;height:100%;stroke:#08bed3;stroke-width:1;opacity:.7;filter:drop-shadow(0 0 10px #009eb7)}
.s06-globe__label{position:absolute;left:0;top:0;display:flex;align-items:center;gap:5px;opacity:0;white-space:nowrap;color:#00ecf7;font:700 clamp(10px,.9vw,15px)/1 'FTD Section Helvetica',Arial,sans-serif;transform:translate(-50%,-50%);text-shadow:0 0 6px #008aa3;transition:opacity .2s;pointer-events:none}
.s06-globe__label i{display:block;width:8px;height:8px;border-radius:50%;background:#00eaff;box-shadow:0 0 8px 3px rgba(0,229,250,.72)}
@media(max-width:900px){.s06-globe__label{font-size:10px}.s06-globe__label i{width:5px;height:5px}}
@media(prefers-reduced-motion:reduce){.s06-globe__fallback,.s06-globe__label{transition:none}}
</style>

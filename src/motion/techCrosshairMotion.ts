/** A single fixed layer follows the pointer; only the four corners animate on hover. */
export function createTechCrosshairMotion(crosshair: HTMLElement) {
  let frame = 0
  let x = 0
  let y = 0
  let disposed = false

  function render() {
    frame = 0
    if (disposed) return
    crosshair.style.transform = `translate3d(${x - 12}px, ${y - 12}px, 0)`
  }

  return {
    update(nextX: number, nextY: number) {
      if (disposed) return
      x = nextX
      y = nextY
      if (!frame) frame = requestAnimationFrame(render)
    },
    stop() {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
    },
    destroy() {
      this.stop()
      disposed = true
    },
  }
}

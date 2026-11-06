import assert from 'node:assert/strict'
import { openingDuration, validateFrameSet, validateNaturalSize, type FrameSet } from '../shared/registry.ts'

const approved: FrameSet = {
  canvas: { width: 600, height: 900 }, alignmentKey: 'reviewed-desktop-v1',
  frames: ['open', 'half', 'closed'].map((name) => ({ src: `${name}.png`, width: 600, height: 900, approved: true, alignmentKey: 'reviewed-desktop-v1' })),
}
assert.doesNotThrow(() => validateFrameSet(approved, 'blink', 3, 3))

// Fail every individual approval/dimension violation, including off-by-one sizes.
for (let index = 0; index < approved.frames.length; index += 1) {
  for (const patch of [{ approved: false }, { width: 599 }, { height: 901 }, { alignmentKey: 'other-shot' }, { src: '' }]) {
    const candidate = { ...approved, frames: approved.frames.map((frame, i) => ({ ...frame, ...(i === index ? patch : {}) })) }
    assert.throws(() => validateFrameSet(candidate, 'blink', 3, 3))
  }
}
assert.throws(() => validateFrameSet({ ...approved, frames: approved.frames.slice(0, 2) }, 'blink', 3, 3))
assert.throws(() => validateFrameSet({ ...approved, canvas: { width: 0, height: 900 } }, 'blink', 3, 3))
assert.doesNotThrow(() => validateNaturalSize(approved.frames[0], { width: 600, height: 900 }, 'decoded'))
assert.throws(() => validateNaturalSize(approved.frames[0], { width: 601, height: 900 }, 'decoded'))
assert.throws(() => validateNaturalSize(approved.frames[0], { width: 600, height: 899 }, 'decoded'))
for (let count = 2; count <= 25; count += 1) assert.ok(openingDuration(count) <= 1)
for (const count of [0, 1, 26, 2.5, NaN]) assert.throws(() => openingDuration(count))
assert.equal(openingDuration(25), 1)
console.log('PASS: approval, continuity key, frame count, canvas, natural size and 24fps intro-window gates')

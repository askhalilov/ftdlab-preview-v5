import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const vite = resolve('node_modules/vite/bin/vite.js')
const cases = [
  { label: 'missing origin', origin: '', base: '/' },
  { label: 'wrong origin', origin: 'https://example.github.io/preview', base: '/' },
  { label: 'legacy origin', origin: 'https://ftdlab.si', base: '/' },
  { label: 'wrong base', origin: 'https://ftdlab.net', base: '/preview/' },
]
let failed = false
for (const item of cases) {
  const run = spawnSync(process.execPath, [vite, 'build'], {
    env: { ...process.env, VITE_SITE_ENV: 'production', VITE_PUBLIC_ORIGIN: item.origin, VITE_BASE_PATH: item.base },
    encoding: 'utf8', timeout: 15000,
  })
  const guarded = run.status !== 0 && /VITE_PUBLIC_ORIGIN|Production requires/.test(`${run.stdout}${run.stderr}`)
  console.log(`${guarded ? 'PASS' : 'FAIL'} production guard: ${item.label}`)
  if (!guarded) failed = true
}
if (failed) process.exitCode = 1

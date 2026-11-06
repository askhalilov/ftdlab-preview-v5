const root = import.meta.env.BASE_URL
export const asset = (path: string) => `${root}assets/${path}`
export const reference = (view: 'desktop' | 'mobile') => `${root}references/hero-${view}.png`


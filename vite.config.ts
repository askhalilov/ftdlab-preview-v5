import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { cpSync, existsSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_BASE_PATH || './'
  const siteEnv = env.VITE_SITE_ENV || 'preview'
  const configuredOrigin = env.VITE_PUBLIC_ORIGIN?.trim() || ''
  if (siteEnv === 'production' && !configuredOrigin) throw new Error('VITE_PUBLIC_ORIGIN is required for production builds')
  let publicOrigin = ''
  if (configuredOrigin) {
    const url = new URL(configuredOrigin)
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('VITE_PUBLIC_ORIGIN must be a clean HTTPS site URL')
    publicOrigin = url.toString().replace(/\/+$/, '')
  }
  const canonical = publicOrigin ? `${publicOrigin}/` : ''
  const staging = siteEnv !== 'production'
  return {
  base,
  plugins: [vue(), {
    name: 'ftdlab-metadata',
    transformIndexHtml(html) {
      const meta = [
        `<meta name="robots" content="${staging ? 'noindex, follow' : 'index, follow'}" />`,
        '<meta property="og:type" content="website" />',
        '<meta property="og:locale" content="en_US" />',
        '<meta property="og:site_name" content="FTD.LAB" />',
        '<meta property="og:title" content="FTD.LAB — Performance Media Buying & Partnerships" />',
        '<meta property="og:description" content="FTD.LAB is an iGaming media buying team focused on performance, strategic partnerships, and sustainable growth." />',
        '<meta name="twitter:card" content="summary_large_image" />',
        '<meta name="twitter:title" content="FTD.LAB — Performance Media Buying & Partnerships" />',
        '<meta name="twitter:description" content="Performance media buying and strategic partnerships in iGaming." />',
      ]
      if (publicOrigin) meta.push(
        `<meta property="og:url" content="${canonical}" />`,
        `<meta property="og:image" content="${canonical}og-ftdlab.png" />`,
        '<meta property="og:image:type" content="image/png" />',
        '<meta property="og:image:width" content="1200" />',
        '<meta property="og:image:height" content="630" />',
        '<meta property="og:image:alt" content="FTD.LAB brand artwork" />',
        `<meta name="twitter:image" content="${canonical}og-ftdlab.png" />`,
        '<meta name="twitter:image:alt" content="FTD.LAB brand artwork" />',
      )
      if (!staging) {
        meta.push(`<link rel="canonical" href="${canonical}" />`)
        meta.push(`<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: 'FTD.LAB', url: canonical, email: 'ftd.lab.traffic@gmail.com', sameAs: ['https://t.me/ftdlabofficial'] })}</script>`)
      }
      return html.replace('</head>', `${meta.join('\n    ')}\n  </head>`)
    },
  }, {
    name: 'copy-hero-assets',
    closeBundle() {
      for (const folder of ['assets', 'references', 'docs']) {
        const source = resolve(folder)
        if (existsSync(source)) cpSync(source, resolve('dist', folder), { recursive: true })
      }
      writeFileSync(resolve('dist', 'robots.txt'), `User-agent: *\nAllow: /\n${staging ? '' : `Sitemap: ${canonical}sitemap.xml\n`}`)
      if (!staging) writeFileSync(resolve('dist', 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${canonical}</loc></url></urlset>\n`)
    },
  }],
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  }
})


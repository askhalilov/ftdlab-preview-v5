import { readFile, access, mkdir, writeFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const mode = process.argv[2]
if (!['staging', 'production'].includes(mode)) throw new Error('Usage: node scripts/seo-qa.mjs staging|production')
const root = path.resolve(process.env.FTD_SEO_DIST || 'dist')
const html = await readFile(path.join(root, 'index.html'), 'utf8')
const robots = await readFile(path.join(root, 'robots.txt'), 'utf8')
const base = process.env.FTD_EXPECT_BASE || (mode === 'production' ? '/' : '')
const canonical = 'https://ftdlab.net/'
const reportDir = process.env.FTD_SEO_REPORT_DIR || 'qa/seo'
const expectedPreview = process.env.FTD_EXPECT_PREVIEW || ''
const tags = name => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(match => match[0])
const attribute = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'))?.[1] || ''
const meta = (key, value) => tags('meta').filter(tag => attribute(tag, key) === value)
const link = rel => tags('link').filter(tag => attribute(tag, 'rel') === rel)
const one = values => values.length === 1 ? values[0] : ''
const has = async file => { try { await access(path.join(root, file)); return true } catch { return false } }
const image = await sharp(path.join(root, 'og-ftdlab.png')).metadata()
const htmlFiles = (await readdir(root, { recursive: true })).filter(file => /\.html?$/i.test(file)).map(file => file.replaceAll('\\', '/'))
const robotsTag = one(meta('name', 'robots'))
const canonicalTag = one(link('canonical'))
const ogUrl = one(meta('property', 'og:url'))
const ogImage = one(meta('property', 'og:image'))
const twitterImage = one(meta('name', 'twitter:image'))
const jsonTags = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
let organization
try { organization = jsonTags.length === 1 ? JSON.parse(jsonTags[0][1]) : null } catch { organization = null }
const sitemapExists = await has('sitemap.xml')
const sitemap = sitemapExists ? await readFile(path.join(root, 'sitemap.xml'), 'utf8') : ''
const compactSitemap = sitemap.replace(/\s+</g, '<').replace(/>\s+/g, '>').trim()
const checks = {
  htmlLanguage: /^<!doctype html>/i.test(html) && /<html lang="en">/.test(html),
  title: /<title>FTD\.LAB — Performance Media Buying &amp; Partnerships<\/title>/.test(html),
  description: attribute(one(meta('name', 'description')), 'content') === 'FTD.LAB is an iGaming media buying team focused on performance, strategic partnerships, and sustainable growth.',
  oneRobotsDirective: !!robotsTag,
  onlyOneHtmlPage: htmlFiles.length === 1 && htmlFiles[0] === 'index.html',
  appAndAccessibleFallback: /<div id="app"><\/div>/.test(html) && /id="ftd-boot"/.test(html) && /<noscript>[\s\S]*<main class="no-js">[\s\S]*<h1>[\s\S]*mailto:ftd\.lab\.traffic@gmail\.com/.test(html),
  socialText: attribute(one(meta('property', 'og:type')), 'content') === 'website' && !!one(meta('property', 'og:title')) && !!one(meta('property', 'og:description')) && attribute(one(meta('name', 'twitter:card')), 'content') === 'summary_large_image',
  socialImageSize: image.width === 1200 && image.height === 630,
  favicons: await has('favicon.svg') && await has('favicon.ico') && await has('apple-touch-icon.png'),
  privateReviewFilesExcluded: !await has('docs') && !await has('references'),
  base: !!base && tags('script').some(tag => attribute(tag, 'type') === 'module' && attribute(tag, 'src').startsWith(`${base}assets/`)) && tags('link').some(tag => attribute(tag, 'rel') === 'stylesheet' && attribute(tag, 'href').startsWith(`${base}assets/`)),
  robotsAllowsRendering: /^User-agent: \*\nAllow: \/\n/m.test(robots) && !/^Disallow:/m.test(robots),
}
if (mode === 'staging') {
  checks.noindex = attribute(robotsTag, 'content') === 'noindex, follow'
  checks.noCanonical = link('canonical').length === 0
  checks.noSitemap = !sitemapExists && !/Sitemap:/i.test(robots)
  checks.previewSocialUrl = !expectedPreview || attribute(ogUrl, 'content') === `${expectedPreview}/`
  checks.noProductionUrl = !html.includes(canonical) && !robots.includes(canonical)
  checks.noProductionSchema = jsonTags.length === 0
} else {
  checks.indexable = attribute(robotsTag, 'content') === 'index, follow' && !/noindex/i.test(html)
  checks.canonical = attribute(canonicalTag, 'href') === canonical
  checks.socialUrls = attribute(ogUrl, 'content') === canonical && attribute(ogImage, 'content') === `${canonical}og-ftdlab.png` && attribute(twitterImage, 'content') === `${canonical}og-ftdlab.png`
  checks.socialImageAlt = !!one(meta('property', 'og:image:alt')) && !!one(meta('name', 'twitter:image:alt'))
  checks.structuredData = organization?.['@context'] === 'https://schema.org' && organization?.['@type'] === 'Organization' && organization?.name === 'FTD.LAB' && organization?.url === canonical && organization?.email === 'ftd.lab.traffic@gmail.com' && Array.isArray(organization?.sameAs) && organization.sameAs.every(url => /^https:\/\//.test(url)) && !('aggregateRating' in organization)
  checks.sitemap = compactSitemap === `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${canonical}</loc></url></urlset>`
  checks.robotsSitemap = robots.includes(`Sitemap: ${canonical}sitemap.xml`) && !/github\.io|localhost|127\.0\.0\.1/i.test(robots)
  checks.noPreviewHost = !/github\.io|localhost|127\.0\.0\.1/i.test(html)
  checks.noLegacySeoHost = !/ftdlab\.si/i.test(`${html}\n${robots}\n${sitemap}`)
}
const result = { mode, base, checks, passed: Object.values(checks).every(Boolean) }
await mkdir(reportDir, { recursive: true })
await writeFile(path.join(reportDir, `${mode}.json`), JSON.stringify(result, null, 2))
console.log(JSON.stringify(result, null, 2))
if (!result.passed) process.exitCode = 1

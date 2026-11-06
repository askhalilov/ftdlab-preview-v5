<script setup lang="ts">
import { copy } from '../i18n'
import '../site-footer.css'

const links = [
  { key: 'home', id: 'home' },
  { key: 'performance', id: 'section-02' },
  { key: 'what', id: 'section-03' },
  { key: 'connect', id: 'section-04' },
  { key: 'partnerships', id: 'section-05' },
  { key: 'faq', id: 'section-06' },
  { key: 'contact', id: 'section-07' },
] as const
function navigate(event: MouseEvent, id: string) {
  if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  window.dispatchEvent(new CustomEvent('ftdlab:navigate', { detail: id }))
}
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <div class="site-footer__columns">
        <div class="site-footer__brand">
          <a href="#home" class="site-footer__logo" :aria-label="`FTD.LAB — ${copy.nav.home}`" @click="navigate($event, 'home')">FTD.<span>LAB</span></a>
          <p>{{ copy.footer.tagline }}</p>
        </div>
        <nav class="site-footer__nav" :aria-label="copy.footer.navigation">
          <h2>{{ copy.footer.navigation }}</h2>
          <ul><li v-for="link in links" :key="link.id"><a :href="`#${link.id}`" @click="navigate($event, link.id)">{{ copy.nav[link.key] }}</a></li></ul>
        </nav>
        <div class="site-footer__connect">
          <h2>{{ copy.footer.connect }}</h2>
          <a href="https://t.me/ftdlabofficial" target="_blank" rel="noopener noreferrer" :aria-label="copy.footer.officialAria">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.1 3.5 2.7 10.6c-1.1.4-1.1 1.1-.2 1.4l4.8 1.5 1.9 5.7c.3.7.6.7 1 .3l2.3-2.2 4.8 3.6c.9.5 1.5.2 1.8-.9l3.1-14.8c.3-1.3-.4-1.9-1.1-1.7ZM8 13.2 18.7 6.4c.5-.3.9-.1.6.2l-8.9 8.1-.4 3.9L8 13.2Z" fill="currentColor"/></svg>
            <span>Telegram<small>t.me/ftdlabofficial</small></span>
          </a>
          <a href="mailto:ftd.lab.traffic@gmail.com" :aria-label="copy.footer.emailAria">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="1.5" stroke="currentColor" stroke-width="2"/><path d="m3 6 9 8 9-8" stroke="currentColor" stroke-width="2"/></svg>
            <span>{{ copy.footer.email }}<small>ftd.lab.traffic@gmail.com</small></span>
          </a>
        </div>
        <p class="site-footer__slogan"><i></i>TURN<br />TRAFFIC<br />INTO RESULTS.</p>
      </div>
      <div class="site-footer__bottom">
        <span>{{ copy.footer.rights }}</span>
        <div class="site-footer__legal" :aria-label="copy.footer.legalAria"><span>{{ copy.footer.privacy }}</span><span>{{ copy.footer.terms }}</span></div>
      </div>
    </div>
  </footer>
</template>

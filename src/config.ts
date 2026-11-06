// Set values in .env.local (see .env.example), or pass props to HeroAnimation.
// Empty destinations keep the preview on-page and emit ftdlab:cta.
export const heroConfig = {
  affiliateHref: import.meta.env.VITE_AFFILIATE_URL || '',
  advertiserHref: import.meta.env.VITE_ADVERTISER_URL || '',
  // Keep the approved original whole-body art available as a build setting.
  desktopMascot: import.meta.env.VITE_DESKTOP_MASCOT === 'whole-body' ? 'whole-body' : 'living',
}


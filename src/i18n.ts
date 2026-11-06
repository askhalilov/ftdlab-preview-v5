import { computed, ref } from 'vue'

export type Locale = 'en' | 'ru'
function savedLocale(): Locale {
  try { return localStorage.getItem('ftdlab-language') === 'ru' ? 'ru' : 'en' }
  catch { return 'en' }
}
export const locale = ref<Locale>(savedLocale())
const pageMetadata: Record<Locale, { title: string; description: string; socialLocale: string }> = {
  en: { title: 'FTD.LAB — Performance Media Buying & Partnerships', description: 'FTD.LAB is an iGaming media buying team focused on performance, strategic partnerships, and sustainable growth.', socialLocale: 'en_US' },
  ru: { title: 'FTD.LAB — медиабаинг и партнёрства в iGaming', description: 'FTD.LAB — команда по медиабаингу в iGaming, ориентированная на эффективность, стратегические партнёрства и устойчивый рост.', socialLocale: 'ru_RU' },
}
function syncPageMetadata(next: Locale) {
  const data = pageMetadata[next]
  document.documentElement.lang = next
  document.title = data.title
  for (const [selector, content] of [
    ['meta[name="description"]', data.description],
    ['meta[property="og:title"]', data.title],
    ['meta[property="og:description"]', data.description],
    ['meta[property="og:locale"]', data.socialLocale],
    ['meta[name="twitter:title"]', data.title],
    ['meta[name="twitter:description"]', data.description],
  ]) document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', content)
}
export function setLocale(next: Locale) {
  if (locale.value === next) return
  locale.value = next
  syncPageMetadata(next)
  try { localStorage.setItem('ftdlab-language', next) } catch { /* storage may be unavailable */ }
}
syncPageMetadata(locale.value)

const dictionaries = {
  en: {
    nav: { home: 'Home', performance: 'Performance', what: 'What We Do', connect: "Let's Connect", partnerships: 'Partnerships', faq: 'FAQ', contact: 'Contact', main: 'Main navigation', toggle: 'Toggle navigation', progress: 'Site progress', current: 'Current section', go: 'Go to', language: 'Language' },
    hero: { ariaDesktop: 'FTD.LAB desktop hero', ariaMobile: 'FTD.LAB mobile hero', headline: 'Turn traffic into results. We handle the rest.', description: 'Performance network for affiliates and advertisers.', getStarted: 'Get Started', advertisers: 'For Advertisers', scroll: 'SCROLL TO EXPLORE', unavailable: 'Hero artwork unavailable', metrics: ['Payouts', 'Offers', 'Worldwide'], metricsAria: 'Network highlights', mobileNote1: 'FTD.LAB IS A CPA NETWORK BUILT FOR MEDIA BUYERS', mobileNote2: 'WHO WANT DIRECT ADVERTISERS, FAST PAYOUTS, AND ZERO EXCUSES' },
    loader: { aria: 'Loading FTD.LAB experience', readiness: 'Readiness stages', label: 'initializing experience' },
    s02: { aria: 'About FTD.LAB', who: 'WHO WE ARE', think: 'HOW WE THINK', scale: 'BUILT TO SCALE', description1: 'FTD.LAB is an iGaming media buying team focused on performance, strategic partnerships, and sustainable growth.', description2: 'We focus on how each element works together to produce measurable performance.', description3: 'We test, measure and optimize before scaling. Our focus is long-term growth, not short-term volume.', geoAria: 'Illustrative Tier-1 GEO list', geoNote: 'Tier 1 markets worldwide.', countries: ['USA', 'United Kingdom', 'Canada', 'Australia', 'Germany'], reach: 'GLOBAL REACH', systemAria: 'Traffic connects GEO, brand, conditions and execution', traffic: 'TRAFFIC', central: 'THE CENTRAL SOURCE', brand: 'BRAND', conditions: 'CONDITIONS', execution: 'EXECUTION', chartAria: 'Illustrative rising performance chart without numerical claims', scroll: 'SCROLL TO EXPLORE' },
    s03: { eyebrow: 'WHAT WE DO', description: 'We focus on execution across the full flow — from launch to optimization and scale.', mascotAria: 'Seated FTD.LAB mascot working at a laptop', services: 'Laptop services: media buying, test and optimize, scale and partner.', laptop: [['MEDIA', 'BUYING'], ['TEST &', 'OPTIMIZE'], ['SCALE &', 'PARTNER']] },
    s05: { eyebrow: 'PARTNERSHIPS', description: 'Open to working with partners who share our performance-driven approach.', principles: 'Our principles', directions: 'Partnership opportunities', for: 'FOR', discuss: 'Discuss', more: 'DETAILS', less: 'CLOSE', cards: [
      { title: 'ADVERTISERS & OPERATORS', description: 'Looking for strong brands and products ready to scale performance together.', detail: 'Share your product, target GEOs and growth goals so we can shape a focused launch.', tags: ['BRANDS', 'GEO EXPANSION', 'QUALITY TRAFFIC'] },
      { title: 'CPA NETWORKS & DIRECT PARTNERS', description: 'Building transparent, long-term partnerships on mutually beneficial terms.', detail: 'Align tracking, terms and launch milestones with our team before activation.', tags: ['TRANSPARENT TRACKING', 'COMPETITIVE TERMS', 'FAST START'] },
      { title: 'MEDIA BUYING TEAMS & WEBMASTERS', description: 'Working with teams experienced in traffic buying and focused on results.', detail: 'Discuss GEO fit, testing plans and support with a team focused on performance.', tags: ['CURRENT GEOs', 'TESTING SUPPORT', 'SUPPORT'] },
    ] },
    s06: { aria: 'Frequently asked questions', items: [
      { question: 'What GEOs do you work with?', answer: 'GEO availability is discussed for each potential partnership. Please contact the team with your product and target markets.' },
      { question: 'How do you start cooperation?', answer: 'Share your product and goals through the contact option. The team can discuss a possible workflow and next steps.' },
      { question: 'What traffic sources do you accept?', answer: 'Traffic sources are reviewed case by case against the product and agreed campaign conditions.' },
      { question: 'How do payouts work?', answer: 'Payment models and settlement details are discussed and agreed with each partner before work begins.' },
      { question: 'How can we contact you?', answer: 'Use the contact option on this site to send a partnership inquiry.' },
    ] },
    s07: { eyebrow: 'CONTACT', intro: 'Real partnerships start with a conversation. Ready to connect? Reach out to our team.', telegram: 'CONTACT ON TELEGRAM', telegramNote: 'Direct contact in Telegram', telegramAria: 'Contact on Telegram — direct contact in Telegram', email: 'CONTACT VIA EMAIL', emailAria: 'Contact via email — ftd.lab.traffic@gmail.com', side: ['DIRECT', 'COMMUNICATION', 'REAL PARTNERSHIPS', 'GROWTH TOGETHER'] },
    footer: { tagline: 'IGAMING MEDIA BUYING TEAM', navigation: 'NAVIGATION', connect: 'CONNECT', officialAria: 'FTD.LAB official Telegram channel', email: 'Email', emailAria: 'Email ftd.lab.traffic@gmail.com', rights: '© 2026 FTD.LAB. All rights reserved.', legalAria: 'Legal documents pending publication', privacy: 'Privacy Policy', terms: 'Terms of Service' },
  },
  ru: {
    nav: { home: 'Главная', performance: 'Performance', what: 'Что мы делаем', connect: 'Связаться', partnerships: 'Партнёрства', faq: 'FAQ', contact: 'Контакты', main: 'Основная навигация', toggle: 'Открыть или закрыть меню', progress: 'Разделы сайта', current: 'Текущий раздел', go: 'Перейти к разделу', language: 'Язык' },
    hero: { ariaDesktop: 'Главный экран FTD.LAB для компьютера', ariaMobile: 'Главный экран FTD.LAB для телефона', headline: 'Превращаем трафик в результат. Остальное берём на себя.', description: 'Performance-сеть для партнёров и рекламодателей.', getStarted: 'Связаться', advertisers: 'Для рекламодателей', scroll: 'ЛИСТАЙТЕ ДАЛЬШЕ', unavailable: 'Иллюстрация главного экрана недоступна', metrics: ['Выплаты', 'Офферы', 'По всему миру'], metricsAria: 'Преимущества сети', mobileNote1: 'FTD.LAB — CPA-СЕТЬ ДЛЯ КОМАНД ПО ЗАКУПКЕ ТРАФИКА', mobileNote2: 'ПРЯМЫЕ РЕКЛАМОДАТЕЛИ, БЫСТРЫЕ ВЫПЛАТЫ И НИКАКИХ ОТГОВОРОК' },
    loader: { aria: 'Загрузка FTD.LAB', readiness: 'Готовность', label: 'подготовка сайта' },
    s02: { aria: 'О FTD.LAB', who: 'КТО МЫ', think: 'НАШ ПОДХОД', scale: 'МАСШТАБИРОВАНИЕ', description1: 'FTD.LAB — команда по медиабаингу в iGaming. Мы уделяем внимание результативности, стратегическим партнёрствам и устойчивому росту.', description2: 'Мы учитываем, как каждый элемент работает вместе с другими и влияет на измеримый результат.', description3: 'Перед масштабированием мы тестируем, измеряем и оптимизируем. Наша цель — долгосрочный рост, а не краткосрочный объём.', geoAria: 'Иллюстративный список стран первого уровня', geoNote: 'Рынки Tier 1 по всему миру.', countries: ['США', 'Великобритания', 'Канада', 'Австралия', 'Германия'], reach: 'ГЛОБАЛЬНЫЙ ОХВАТ', systemAria: 'Трафик объединяет GEO, бренд, условия и реализацию', traffic: 'ТРАФИК', central: 'ЦЕНТРАЛЬНЫЙ ЭЛЕМЕНТ', brand: 'БРЕНД', conditions: 'УСЛОВИЯ', execution: 'РЕАЛИЗАЦИЯ', chartAria: 'Иллюстративный график роста без числовых утверждений', scroll: 'ЛИСТАЙТЕ ДАЛЬШЕ' },
    s03: { eyebrow: 'ЧТО МЫ ДЕЛАЕМ', description: 'Работаем на каждом этапе — от запуска до оптимизации и масштабирования.', mascotAria: 'Маскот FTD.LAB работает за ноутбуком', services: 'На экране ноутбука: закупка трафика, тестирование и оптимизация, масштабирование и партнёрства.', laptop: [['ТРАФИК', 'ЗАКУПКА'], ['ТЕСТЫ', 'ОПТИМИЗАЦИЯ'], ['МАСШТАБ', 'ПАРТНЁРЫ']] },
    s05: { eyebrow: 'ПАРТНЁРСТВО', description: 'Открыты к сотрудничеству с партнёрами, которые разделяют наш подход к performance.', principles: 'Наши принципы', directions: 'Направления сотрудничества', for: 'ДЛЯ', discuss: 'Обсудить', more: 'ПОДРОБНЕЕ', less: 'СВЕРНУТЬ', cards: [
      { title: 'ADVERTISERS & OPERATORS', description: 'Ищем сильные бренды и продукты, которые готовы масштабировать performance вместе с нами.', detail: 'Расскажите о продукте, целевых GEO и целях роста — обсудим подход к запуску.', tags: ['БРЕНДЫ', 'GEO-РАСШИРЕНИЕ', 'КАЧЕСТВЕННЫЙ ТРАФИК'] },
      { title: 'CPA NETWORKS & DIRECT PARTNERS', description: 'Строим прозрачные и долгосрочные партнёрства на взаимовыгодных условиях.', detail: 'Согласуем трекинг, условия и этапы запуска до начала работы.', tags: ['ПРОЗРАЧНЫЙ ТРЕКИНГ', 'КОНКУРЕНТНЫЕ УСЛОВИЯ', 'БЫСТРЫЙ СТАРТ'] },
      { title: 'MEDIA BUYING TEAMS & WEBMASTERS', description: 'Работаем с командами, которые умеют закупать трафик и нацелены на результат.', detail: 'Обсудим GEO, план тестов и поддержку для работы на результат.', tags: ['АКТУАЛЬНЫЕ GEO', 'ПОМОЩЬ С ТЕСТАМИ', 'ПОДДЕРЖКА'] },
    ] },
    s06: { aria: 'Частые вопросы', items: [
      { question: 'С какими GEO вы работаете?', answer: 'Доступность GEO обсуждается для каждого партнёрства. Напишите команде о продукте и целевых рынках.' },
      { question: 'Как начать сотрудничество?', answer: 'Расскажите о продукте и целях через контактные каналы. Команда обсудит возможный формат работы и следующие шаги.' },
      { question: 'Какие источники трафика вы принимаете?', answer: 'Источники трафика рассматриваются отдельно для каждого продукта и согласованных условий кампании.' },
      { question: 'Как устроены выплаты?', answer: 'Модели оплаты и условия расчётов обсуждаются и согласуются с каждым партнёром до начала работы.' },
      { question: 'Как с вами связаться?', answer: 'Используйте контакты на сайте, чтобы отправить запрос о сотрудничестве.' },
    ] },
    s07: { eyebrow: 'КОНТАКТЫ', intro: 'Настоящее партнёрство начинается с разговора. Готовы обсудить сотрудничество? Свяжитесь с нашей командой.', telegram: 'НАПИСАТЬ В TELEGRAM', telegramNote: 'Прямая связь в Telegram', telegramAria: 'Написать напрямую в Telegram', email: 'НАПИСАТЬ ПО ПОЧТЕ', emailAria: 'Написать на ftd.lab.traffic@gmail.com', side: ['ПРЯМАЯ', 'СВЯЗЬ', 'ПАРТНЁРСТВО', 'РОСТ ВМЕСТЕ'] },
    footer: { tagline: 'КОМАНДА ПО МЕДИАБАИНГУ В IGAMING', navigation: 'НАВИГАЦИЯ', connect: 'СВЯЗЬ', officialAria: 'Официальный Telegram-канал FTD.LAB', email: 'Почта', emailAria: 'Написать на ftd.lab.traffic@gmail.com', rights: '© 2026 FTD.LAB. Все права защищены.', legalAria: 'Юридические документы готовятся к публикации', privacy: 'Политика конфиденциальности', terms: 'Условия использования' },
  },
} as const

export const copy = computed(() => dictionaries[locale.value])

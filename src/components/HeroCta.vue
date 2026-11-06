<script setup lang="ts">
const props = withDefaults(defineProps<{ affiliateHref?: string; advertiserHref?: string; uppercase?: boolean }>(), { affiliateHref: '', advertiserHref: '', uppercase: false })
const emit = defineEmits<{ cta: [audience: 'affiliate' | 'advertiser'] }>()
function activate(event: MouseEvent, audience: 'affiliate' | 'advertiser') {
  if (!(audience === 'affiliate' ? props.affiliateHref : props.advertiserHref)) {
    event.preventDefault()
    emit('cta', audience)
  }
}
</script>
<template>
  <div class="cta-group" data-intro="cta">
    <a class="cta cta-primary" :href="affiliateHref || '#get-started'" @click="activate($event, 'affiliate')"><span>{{ uppercase ? 'GET STARTED' : 'Get Started' }}</span></a>
    <a class="cta cta-secondary" :href="advertiserHref || '#advertisers'" @click="activate($event, 'advertiser')"><span>{{ uppercase ? 'FOR ADVERTISERS' : 'For Advertisers' }}</span></a>
  </div>
</template>


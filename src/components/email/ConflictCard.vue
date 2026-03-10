<template>
  <div class="card-float p-5">
    <div style="display: flex; align-items: center; gap: 0.625rem; margin-bottom: 1rem;">
      <div :style="iconBgStyle" style="width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="white">
          <path v-if="conflict.status === 'NO_CONFLICT'" d="M13.7 4.3l-7.7 7.7-3.7-3.7 1.4-1.4 2.3 2.3 6.3-6.3z"/>
          <path v-else d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm.75 12h-1.5V7h1.5v5zm0-6h-1.5V4.5h1.5V6z"/>
        </svg>
      </div>
      <h3 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1rem; font-weight: 600; color: #1A1A1A; letter-spacing: 0.02em;">Preverjanje konflikta</h3>
    </div>

    <div :style="statusBadgeStyle" style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.75rem;">
      <span :style="dotStyle" style="width: 6px; height: 6px; border-radius: 50%; display: inline-block;"></span>
      {{ statusLabel }}
    </div>

    <div v-if="conflict.matches && conflict.matches.length > 0" style="display: flex; flex-direction: column; gap: 0.5rem;">
      <div
        v-for="(match, i) in conflict.matches"
        :key="i"
        style="background: #FFF5F5; border: 1px solid #F0C0BC; border-radius: 10px; padding: 0.625rem 0.75rem;"
      >
        <div style="font-size: 0.8rem; font-weight: 600; color: #A04040; margin-bottom: 0.2rem;">{{ match.extractedEntity }}</div>
        <div style="font-size: 0.75rem; color: #6B6460;">{{ match.details }}</div>
        <div style="font-size: 0.7rem; color: #B8B0A4; margin-top: 0.2rem; text-transform: uppercase; letter-spacing: 0.04em;">{{ match.matchType }} match — {{ match.clientStatus }}</div>
      </div>
    </div>
    <p v-else style="font-size: 0.85rem; color: #5A9E72;">Nobenih konfliktov z obstoječimi strankami.</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  conflict: { type: Object, required: true }
})

const iconBgStyle = computed(() => {
  if (props.conflict.status === 'CONFLICT_DETECTED') return 'background-color: #A85040;'
  if (props.conflict.status === 'POTENTIAL_CONFLICT') return 'background-color: #C8896A;'
  return 'background-color: #4A8A61;'
})

const statusBadgeStyle = computed(() => {
  if (props.conflict.status === 'CONFLICT_DETECTED') return 'background-color: #FFF0EE; color: #A04040; border: 1px solid #F0C0BC;'
  if (props.conflict.status === 'POTENTIAL_CONFLICT') return 'background-color: #FEF3EC; color: #8B5E2A; border: 1px solid #E8C090;'
  return 'background-color: #F0F9F4; color: #3B7050; border: 1px solid #A8D8BC;'
})

const dotStyle = computed(() => {
  if (props.conflict.status === 'CONFLICT_DETECTED') return 'background-color: #A04040;'
  if (props.conflict.status === 'POTENTIAL_CONFLICT') return 'background-color: #C8896A;'
  return 'background-color: #4A8A61;'
})

const statusLabel = computed(() => {
  if (props.conflict.status === 'CONFLICT_DETECTED') return 'Konflikt zaznan'
  if (props.conflict.status === 'POTENTIAL_CONFLICT') return 'Možen konflikt'
  return 'Brez konflikta'
})
</script>

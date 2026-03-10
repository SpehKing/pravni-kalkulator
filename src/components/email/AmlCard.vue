<template>
  <div class="card-float p-5">
    <div style="display: flex; align-items: center; gap: 0.625rem; margin-bottom: 1rem;">
      <div :style="iconBgStyle" style="width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="white">
          <path d="M8 1L1 14h14L8 1zm0 2.5l5.5 9.5H2.5L8 3.5zM7.25 7v3h1.5V7h-1.5zm0 4v1.5h1.5V11h-1.5z"/>
        </svg>
      </div>
      <h3 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1rem; font-weight: 600; color: #1A1A1A; letter-spacing: 0.02em;">AML/KYC Ocena</h3>
    </div>

    <div :style="riskBadgeStyle" style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 1rem;">
      <span :style="dotStyle" style="width: 6px; height: 6px; border-radius: 50%; display: inline-block;"></span>
      {{ riskLabel }}
    </div>

    <p style="font-size: 0.8rem; color: #6B6460; line-height: 1.5; margin-bottom: 1rem;">{{ aml.reasoning }}</p>

    <div v-if="aml.redFlags && aml.redFlags.length > 0" style="margin-bottom: 1rem;">
      <div style="font-size: 0.7rem; font-weight: 600; color: #4A4540; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.5rem;">Rdeče zastavice</div>
      <ul style="display: flex; flex-direction: column; gap: 0.35rem;">
        <li
          v-for="(flag, i) in aml.redFlags"
          :key="i"
          style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.78rem;"
        >
          <span :style="flagDotStyle(flag.severity)" style="width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; display: inline-block;"></span>
          <span style="color: #2E2A26;">{{ flag.flag }}</span>
        </li>
      </ul>
    </div>

    <div v-if="aml.kycDocuments && aml.kycDocuments.length > 0">
      <div style="font-size: 0.7rem; font-weight: 600; color: #4A4540; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.5rem;">Zahtevana KYC dokumentacija</div>
      <ul style="display: flex; flex-direction: column; gap: 0.3rem;">
        <li
          v-for="(doc, i) in aml.kycDocuments"
          :key="i"
          style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.78rem; color: #2E2A26;"
        >
          <svg style="flex-shrink: 0; margin-top: 2px;" width="12" height="12" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="14" height="14" rx="2" stroke="#B8B0A4" stroke-width="1.5"/>
          </svg>
          {{ doc }}
        </li>
      </ul>
    </div>

    <div v-if="aml.zppdft2Applicable" style="margin-top: 0.75rem; padding: 0.5rem 0.625rem; background: #F5F2ED; border-radius: 8px; font-size: 0.72rem; color: #6B6460;">
      Velja ZPPDFT-2 — obvezno skrbno preverjanje strank
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  aml: { type: Object, required: true }
})

const riskBadgeStyle = computed(() => {
  if (props.aml.riskLevel === 'REFUSE') return 'background-color: #FFF0EE; color: #A04040; border: 1px solid #F0C0BC;'
  if (props.aml.riskLevel === 'ENHANCED') return 'background-color: #FEF3EC; color: #8B5E2A; border: 1px solid #E8C090;'
  return 'background-color: #F0F9F4; color: #3B7050; border: 1px solid #A8D8BC;'
})

const iconBgStyle = computed(() => {
  if (props.aml.riskLevel === 'REFUSE') return 'background-color: #A85040;'
  if (props.aml.riskLevel === 'ENHANCED') return 'background-color: #C8896A;'
  return 'background-color: #4A8A61;'
})

const dotStyle = computed(() => {
  if (props.aml.riskLevel === 'REFUSE') return 'background-color: #A04040;'
  if (props.aml.riskLevel === 'ENHANCED') return 'background-color: #C8896A;'
  return 'background-color: #4A8A61;'
})

const riskLabel = computed(() => {
  if (props.aml.riskLevel === 'REFUSE') return 'Zavrniti — preveliko tveganje'
  if (props.aml.riskLevel === 'ENHANCED') return 'Povečana skrbnost'
  return 'Standardno tveganje'
})

function flagDotStyle(severity) {
  if (severity === 'high') return 'background-color: #A85040;'
  if (severity === 'medium') return 'background-color: #C8896A;'
  return 'background-color: #B8B0A4;'
}
</script>

<template>
  <div>
    <!-- Conflict banner -->
    <div
      v-if="compliance.conflict && compliance.conflict.blockEmail"
      style="background: #A85040; color: white; padding: 0.75rem 1.5rem; border-radius: 12px; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; font-weight: 500;"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
        <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm.75 12h-1.5V7h1.5v5zm0-6h-1.5V4.5h1.5V6z"/>
      </svg>
      <span>KONFLIKT INTERESOM — pošiljanje e-pošte je blokirano. Zadevo pregleda odvetnik pred nadaljevanjem.</span>
    </div>

    <!-- AML refuse banner -->
    <div
      v-else-if="compliance.aml && compliance.aml.riskLevel === 'REFUSE'"
      style="background: #C8896A; color: white; padding: 0.75rem 1.5rem; border-radius: 12px; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; font-weight: 500;"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
        <path d="M8 1L1 14h14L8 1zm0 2.5l5.5 9.5H2.5L8 3.5zM7.25 7v3h1.5V7h-1.5zm0 4v1.5h1.5V11h-1.5z"/>
      </svg>
      <span>VISOKO AML TVEGANJE — priporočena zavrnitev zadeve. Obvezno posvetovanje s pooblaščencem za AML.</span>
    </div>

    <!-- Split layout -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; align-items: start;">
      <!-- Left: Draft email -->
      <div style="position: sticky; top: 1rem;">
        <DraftEmail
          :draft="analysis.draftEmail"
          :conflict-blocked="compliance.conflict && compliance.conflict.blockEmail"
        />
      </div>

      <!-- Right: Compliance dashboard -->
      <div>
        <ComplianceDashboard :analysis="analysis" :compliance="compliance" />
      </div>
    </div>
  </div>
</template>

<script setup>
import DraftEmail from './DraftEmail.vue'
import ComplianceDashboard from './ComplianceDashboard.vue'

defineProps({
  analysis: { type: Object, required: true },
  compliance: { type: Object, required: true }
})
</script>

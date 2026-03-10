<template>
  <div class="card-float p-5">
    <div style="display: flex; align-items: center; gap: 0.625rem; margin-bottom: 1rem;">
      <div style="width: 28px; height: 28px; border-radius: 50%; background: #1A1A1A; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="white">
          <rect x="2" y="2" width="12" height="1.5" rx="0.75"/>
          <rect x="2" y="6" width="9" height="1.5" rx="0.75"/>
          <rect x="2" y="10" width="11" height="1.5" rx="0.75"/>
        </svg>
      </div>
      <h3 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1rem; font-weight: 600; color: #1A1A1A; letter-spacing: 0.02em;">Povzetek zadeve</h3>
    </div>

    <!-- Domain badges -->
    <div style="display: flex; flex-wrap: wrap; gap: 0.375rem; margin-bottom: 0.875rem;">
      <span
        v-for="domain in legalDomains"
        :key="domain"
        style="font-size: 0.7rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; padding: 0.2rem 0.6rem; border-radius: 9999px; background: #F2E8E2; color: #7A4030; border: 1px solid #DFC8BC;"
      >{{ domain }}</span>
    </div>

    <p style="font-size: 0.875rem; color: #2E2A26; line-height: 1.6; margin-bottom: 1rem;">{{ summary }}</p>

    <div v-if="keyFacts && keyFacts.length > 0">
      <div style="font-size: 0.7rem; font-weight: 600; color: #4A4540; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.5rem;">Ključna dejstva</div>
      <ul style="display: flex; flex-direction: column; gap: 0.3rem;">
        <li
          v-for="(fact, i) in keyFacts"
          :key="i"
          style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.8rem; color: #4A4540;"
        >
          <span style="color: #A0694B; flex-shrink: 0; margin-top: 2px;">›</span>
          {{ fact }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
defineProps({
  summary: { type: String, default: '' },
  keyFacts: { type: Array, default: () => [] },
  legalDomains: { type: Array, default: () => [] }
})
</script>

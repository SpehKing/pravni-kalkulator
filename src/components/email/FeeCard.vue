<template>
  <div class="card-float p-5">
    <div style="display: flex; align-items: center; gap: 0.625rem; margin-bottom: 1rem;">
      <div style="width: 28px; height: 28px; border-radius: 50%; background: #1A1A1A; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="white">
          <circle cx="8" cy="8" r="6.5" stroke="white" stroke-width="1.5" fill="none"/>
          <text x="8" y="11.5" text-anchor="middle" font-size="8" font-weight="bold" fill="white">€</text>
        </svg>
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <h3 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1rem; font-weight: 600; color: #1A1A1A; letter-spacing: 0.02em;">Interni ocena honorarja</h3>
        <span style="font-size: 0.65rem; background: #F5F2ED; color: #8A8279; padding: 0.15rem 0.4rem; border-radius: 4px; border: 1px solid #E0DAD0; text-transform: uppercase; letter-spacing: 0.06em;">Interno</span>
      </div>
    </div>

    <div style="background: #FDFCF9; border: 1px solid #E0DAD0; border-radius: 10px; padding: 1rem; margin-bottom: 0.75rem;">
      <div style="font-size: 0.7rem; font-weight: 600; color: #4A4540; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.3rem;">Vrsta zadeve</div>
      <div style="font-size: 0.875rem; font-weight: 600; color: #1A1A1A;">{{ feeEstimate.matterType }}</div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
      <div style="background: #FDFCF9; border: 1px solid #E0DAD0; border-radius: 10px; padding: 0.75rem;">
        <div style="font-size: 0.7rem; font-weight: 600; color: #4A4540; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.3rem;">Obseg ur</div>
        <div style="font-size: 1rem; font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 600; color: #1A1A1A;">{{ feeEstimate.hoursRange }}</div>
      </div>
      <div style="background: #F2E8E2; border: 1px solid #DFC8BC; border-radius: 10px; padding: 0.75rem;">
        <div style="font-size: 0.7rem; font-weight: 600; color: #7A4030; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.3rem;">Ocena honorarja</div>
        <div style="font-size: 1rem; font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 600; color: #7A4030;">{{ feeEstimate.feeRange }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  feeEstimate: { type: Object, required: true }
})
</script>

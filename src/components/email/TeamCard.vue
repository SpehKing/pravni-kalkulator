<template>
  <div class="card-float p-5">
    <div style="display: flex; align-items: center; gap: 0.625rem; margin-bottom: 1rem;">
      <div style="width: 28px; height: 28px; border-radius: 50%; background: #1A1A1A; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="white">
          <circle cx="6" cy="5" r="2.5"/>
          <path d="M1 13c0-2.8 2.2-5 5-5s5 2.2 5 5"/>
          <circle cx="12" cy="5" r="2"/>
          <path d="M14 13c0-2.2-1.6-4-3.5-4"/>
        </svg>
      </div>
      <h3 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1rem; font-weight: 600; color: #1A1A1A; letter-spacing: 0.02em;">Predlagana ekipa</h3>
    </div>

    <div v-if="team && team.length > 0" style="display: flex; flex-direction: column; gap: 0.625rem;">
      <div
        v-for="(lawyer, i) in team"
        :key="i"
        style="background: #FDFCF9; border: 1px solid #E0DAD0; border-radius: 10px; padding: 0.75rem;"
      >
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.4rem;">
          <div>
            <div style="font-size: 0.875rem; font-weight: 600; color: #1A1A1A;">{{ lawyer.name }}</div>
            <div style="font-size: 0.72rem; color: #8A8279; text-transform: uppercase; letter-spacing: 0.04em;">{{ lawyer.title }}</div>
          </div>
          <div style="font-size: 0.72rem; font-weight: 600; color: #A0694B; background: #F2E8E2; padding: 0.2rem 0.5rem; border-radius: 9999px; flex-shrink: 0;">
            {{ lawyer.relevanceScore }}%
          </div>
        </div>
        <div style="font-size: 0.78rem; color: #6B6460; line-height: 1.4;">{{ lawyer.matchReason }}</div>
      </div>
    </div>
    <p v-else style="font-size: 0.85rem; color: #8A8279;">Ni predlaganih odvetnikov.</p>
  </div>
</template>

<script setup>
defineProps({
  team: { type: Array, default: () => [] }
})
</script>

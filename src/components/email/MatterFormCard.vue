<template>
  <div class="card-float p-5">
    <div style="display: flex; align-items: center; gap: 0.625rem; margin-bottom: 1rem;">
      <div style="width: 28px; height: 28px; border-radius: 50%; background: #1A1A1A; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="white">
          <rect x="2" y="1" width="12" height="14" rx="2" stroke="white" stroke-width="1.5" fill="none"/>
          <line x1="5" y1="5" x2="11" y2="5" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
          <line x1="5" y1="8" x2="11" y2="8" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
          <line x1="5" y1="11" x2="8" y2="11" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <h3 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1rem; font-weight: 600; color: #1A1A1A; letter-spacing: 0.02em;">Odprtje zadeve</h3>
        <span style="font-size: 0.65rem; background: #F0F9F4; color: #3B7050; padding: 0.15rem 0.4rem; border-radius: 4px; border: 1px solid #A8D8BC; text-transform: uppercase; letter-spacing: 0.06em;">Pred-izpolnjeno</span>
      </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
      <div v-for="(item, i) in formFields" :key="i" style="display: grid; grid-template-columns: 120px 1fr; gap: 0.5rem; align-items: baseline;">
        <span style="font-size: 0.72rem; font-weight: 600; color: #8A8279; text-transform: uppercase; letter-spacing: 0.06em;">{{ item.label }}</span>
        <span style="font-size: 0.82rem; color: #1A1A1A; font-weight: 500;">{{ item.value || '—' }}</span>
      </div>
    </div>

    <button
      @click="approve"
      :disabled="approved"
      class="btn-pill btn-pill-primary"
      style="margin-top: 1rem; width: 100%; font-size: 0.8rem; padding: 0.5rem 1rem;"
      :style="approved ? 'background: #4A8A61; cursor: default;' : ''"
    >
      {{ approved ? '✓ Zadeva odprta' : 'Odobri in odpri zadevo' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  matterForm: { type: Object, required: true }
})

const approved = ref(false)

const formFields = computed(() => [
  { label: 'Stranka', value: props.matterForm.clientName },
  { label: 'Opis zadeve', value: props.matterForm.matterDescription },
  { label: 'Področje', value: props.matterForm.practiceArea },
  { label: 'Odvetnik', value: props.matterForm.responsibleLawyer },
  { label: 'Ocenjena vrednost', value: props.matterForm.estimatedValue }
])

function approve() {
  approved.value = true
}
</script>

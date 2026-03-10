<template>
  <div class="card-float p-5">
    <div style="display: flex; align-items: center; gap: 0.625rem; margin-bottom: 1rem;">
      <div style="width: 28px; height: 28px; border-radius: 50%; background: #1A1A1A; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="white">
          <circle cx="8" cy="6" r="2.5" stroke="white" stroke-width="1.5" fill="none"/>
          <path d="M8 9v1.5M8 12v.5" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <h3 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1rem; font-weight: 600; color: #1A1A1A; letter-spacing: 0.02em;">Ciljana vprašanja</h3>
    </div>

    <ol style="display: flex; flex-direction: column; gap: 0.625rem; padding-left: 0; margin: 0; list-style: none;">
      <li
        v-for="(question, i) in questions"
        :key="i"
        style="display: flex; align-items: flex-start; gap: 0.625rem;"
      >
        <span style="width: 20px; height: 20px; border-radius: 50%; background: #F2E8E2; color: #A0694B; font-size: 0.72rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;">{{ i + 1 }}</span>
        <span style="font-size: 0.82rem; color: #2E2A26; line-height: 1.5;">{{ question }}</span>
      </li>
    </ol>
  </div>
</template>

<script setup>
defineProps({
  questions: { type: Array, default: () => [] }
})
</script>

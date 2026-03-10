<template>
  <div>
    <!-- Gauge card -->
    <div class="card-float p-8 sm:p-10 text-center mb-5">
      <h1 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 2rem; font-weight: 600; color: #1A1A1A; margin-bottom: 0.375rem; line-height: 1.2;">
        Rezultat analize
      </h1>
      <p style="font-size: 0.875rem; color: #8A8279; margin-bottom: 2rem;">Na podlagi vaših navedb in sodne prakse.</p>

      <!-- SVG circular gauge -->
      <div style="display: flex; justify-content: center; margin-bottom: 0.5rem;">
        <div style="position: relative; width: 180px; height: 180px;">
          <svg style="width: 100%; height: 100%; transform: rotate(-90deg);" viewBox="0 0 120 120">
            <!-- Track -->
            <circle cx="60" cy="60" r="50" fill="none" stroke-width="8" stroke="#EDE9E2"/>
            <!-- Progress arc -->
            <circle
              cx="60" cy="60" r="50" fill="none" stroke-width="8"
              :stroke="gaugeColor"
              stroke-linecap="round"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="dashOffset"
              style="transition: stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1);"
            />
          </svg>
          <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <span style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 2.75rem; font-weight: 700; line-height: 1;" :style="{ color: gaugeColor }">
              {{ displayPercent }}%
            </span>
            <span style="font-size: 0.7rem; color: #8A8279; margin-top: 0.25rem; letter-spacing: 0.04em; text-transform: uppercase;">verjetnost uspeha</span>
          </div>
        </div>
      </div>

      <!-- Verdict label -->
      <div style="margin-top: 0.5rem;">
        <span
          style="display: inline-block; padding: 0.3rem 1rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 500; letter-spacing: 0.04em;"
          :style="verdictStyle"
        >
          {{ verdictLabel }}
        </span>
      </div>
    </div>

    <!-- Explanation -->
    <div class="card-float p-7 mb-5">
      <h3 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.2rem; font-weight: 600; color: #1A1A1A; margin-bottom: 0.75rem;">
        Razlaga
      </h3>
      <p style="font-size: 0.9rem; color: #4A4540; line-height: 1.7;">{{ result.explanation }}</p>
    </div>

    <!-- Factors -->
    <div v-if="result.factors && result.factors.length" class="card-float p-7 mb-8">
      <h3 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.2rem; font-weight: 600; color: #1A1A1A; margin-bottom: 1rem;">
        Ključni dejavniki
      </h3>
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <div
          v-for="(f, i) in result.factors"
          :key="i"
          style="display: flex; align-items: flex-start; gap: 0.875rem; padding: 0.875rem 1rem; border-radius: 10px; background: #FDFCF9;"
          :style="f.impact === 'positive'
            ? 'border-left: 3px solid #4A8A61;'
            : 'border-left: 3px solid #A0694B;'"
        >
          <svg
            style="flex-shrink: 0; margin-top: 2px;"
            width="14" height="14" viewBox="0 0 16 16"
            :fill="f.impact === 'positive' ? '#4A8A61' : '#A0694B'"
          >
            <path v-if="f.impact === 'positive'" d="M13.7 4.3l-7.7 7.7-3.7-3.7 1.4-1.4 2.3 2.3 6.3-6.3z"/>
            <path v-else d="M12.7 4.7L11.3 3.3 8 6.6 4.7 3.3 3.3 4.7 6.6 8l-3.3 3.3 1.4 1.4L8 9.4l3.3 3.3 1.4-1.4L9.4 8z"/>
          </svg>
          <p style="font-size: 0.875rem; color: #2E2A26; line-height: 1.55;">{{ f.factor }}</p>
        </div>
      </div>
    </div>

    <!-- Reset button -->
    <div style="display: flex; justify-content: center;">
      <button
        @click="emit('reset')"
        class="btn-pill btn-pill-primary"
        style="padding: 0.7rem 2.5rem;"
      >
        Nova analiza
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  result: Object,
})

const emit = defineEmits(['reset'])

const circumference = 2 * Math.PI * 50
const displayPercent = ref(0)

onMounted(() => {
  const target = Math.min(100, Math.max(0, props.result?.percentage ?? 0))
  // Count up animation
  const duration = 1200
  const startTime = Date.now()
  function tick() {
    const elapsed = Date.now() - startTime
    const t = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - t, 3)
    displayPercent.value = Math.round(eased * target)
    if (t < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
})

const dashOffset = computed(() => {
  const pct = Math.min(100, Math.max(0, props.result?.percentage ?? 0))
  return circumference * (1 - pct / 100)
})

const gaugeColor = computed(() => {
  const pct = props.result?.percentage ?? 0
  if (pct >= 60) return '#4A8A61'
  if (pct >= 30) return '#8A7040'
  return '#A0694B'
})

const verdictLabel = computed(() => {
  const pct = props.result?.percentage ?? 0
  if (pct >= 60) return 'Ugodna napoved'
  if (pct >= 30) return 'Zmerna napoved'
  return 'Neugodna napoved'
})

const verdictStyle = computed(() => {
  const pct = props.result?.percentage ?? 0
  if (pct >= 60) return 'background: #E8F4ED; color: #2E6B42;'
  if (pct >= 30) return 'background: #F4EFE0; color: #6B5020;'
  return 'background: #F2E8E2; color: #7A3020;'
})
</script>

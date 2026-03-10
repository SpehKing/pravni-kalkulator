<template>
  <div class="card-float p-8 sm:p-12 text-center">
    <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 2rem; font-weight: 600; color: #1A1A1A; margin-bottom: 0.5rem; line-height: 1.2;">
      Analiziram vaš primer
    </h2>
    <p style="font-size: 0.875rem; color: #8A8279; margin-bottom: 3rem;">
      Umetna inteligenca preučuje sodno prakso in pravne argumente.
    </p>

    <!-- Percentage display -->
    <div style="margin-bottom: 1.25rem;">
      <span style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 3.5rem; font-weight: 600; color: #1A1A1A; line-height: 1;">
        {{ fakePercent }}
      </span>
      <span style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.75rem; color: #A0694B; font-weight: 500;">%</span>
    </div>

    <!-- Progress bar -->
    <div style="width: 100%; height: 5px; background: #EDE9E2; border-radius: 9999px; overflow: hidden; margin-bottom: 1.75rem;">
      <div
        style="height: 100%; border-radius: 9999px; transition: width 0.5s ease-out;"
        :style="{ width: fakePercent + '%', background: progressColor }"
      ></div>
    </div>

    <!-- Status message -->
    <p style="font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-size: 1.05rem; color: #6B6460; min-height: 1.6em; transition: opacity 0.4s ease;" :key="currentMessage">
      {{ currentMessage }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  description: String,
  files: Array,
  answers: Array,
})

const emit = defineEmits(['done', 'error'])

const messages = [
  'Analiziram vsebino primera...',
  'Preverjam sodno prakso...',
  'Ocenjujem pravne argumente...',
  'Primerjam podobne primere...',
  'Pripravljam oceno uspeha...',
  'Zaključujem analizo...',
]

const fakePercent = ref(0)
const currentMessage = ref(messages[0])
let msgIdx = 0
let msgInterval = null

const progressColor = computed(() => {
  if (fakePercent.value >= 70) return '#A0694B'
  if (fakePercent.value >= 40) return '#8A7060'
  return '#B8B0A4'
})

function startFakeProgress() {
  // Slow ease-out curve toward ~85% over ~15s
  const steps = [
    { target: 12, duration: 1000 },
    { target: 28, duration: 1500 },
    { target: 42, duration: 1800 },
    { target: 55, duration: 2000 },
    { target: 65, duration: 2200 },
    { target: 73, duration: 2500 },
    { target: 80, duration: 2500 },
    { target: 85, duration: 2000 },
  ]
  let stepIdx = 0
  function runStep() {
    if (stepIdx >= steps.length || fakePercent.value >= 100) return
    const { target, duration } = steps[stepIdx]
    const start = fakePercent.value
    const diff = target - start
    const startTime = Date.now()
    function tick() {
      const elapsed = Date.now() - startTime
      const t = Math.min(elapsed / duration, 1)
      // ease-out
      const eased = 1 - Math.pow(1 - t, 2)
      fakePercent.value = Math.round(start + diff * eased)
      if (t < 1 && fakePercent.value < 100) requestAnimationFrame(tick)
      else {
        stepIdx++
        setTimeout(runStep, 300)
      }
    }
    requestAnimationFrame(tick)
  }
  runStep()

  msgInterval = setInterval(() => {
    msgIdx = (msgIdx + 1) % messages.length
    currentMessage.value = messages[msgIdx]
  }, 2200)
}

onMounted(async () => {
  startFakeProgress()

  try {
    const res = await fetch('/api/analyze-case', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: props.description,
        files: props.files,
        answers: props.answers,
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    // Snap to 100%
    clearInterval(msgInterval)
    currentMessage.value = 'Analiza zaključena.'
    fakePercent.value = 100
    await new Promise(r => setTimeout(r, 600))
    emit('done', data)
  } catch (e) {
    clearInterval(msgInterval)
    emit('error', 'Napaka pri analizi primera. Preverite internetno povezavo in poskusite znova.')
  }
})

onUnmounted(() => {
  clearInterval(msgInterval)
})
</script>

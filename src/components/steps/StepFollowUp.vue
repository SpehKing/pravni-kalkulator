<template>
  <div>
    <!-- Loading: Fake progress bar -->
    <div v-if="loading" class="card-float p-8 sm:p-12 text-center">
      <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.75rem; font-weight: 600; color: #1A1A1A; margin-bottom: 0.5rem;">
        Pripravljam vprašanja
      </h2>
      <p style="font-size: 0.875rem; color: #8A8279; margin-bottom: 2.5rem;">Umetna inteligenca analizira vaš primer.</p>

      <!-- Progress bar -->
      <div style="margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem;">
          <span style="font-size: 0.78rem; color: #8A8279; letter-spacing: 0.04em; text-transform: uppercase;">Napredek</span>
          <span style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.1rem; font-weight: 600; color: #A0694B;">{{ fakePercent }}%</span>
        </div>
        <div style="width: 100%; height: 4px; background: #EDE9E2; border-radius: 9999px; overflow: hidden;">
          <div
            style="height: 100%; background: #A0694B; border-radius: 9999px; transition: width 0.4s ease-out;"
            :style="{ width: fakePercent + '%' }"
          ></div>
        </div>
      </div>

      <p style="font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-size: 1rem; color: #6B6460; min-height: 1.5em; transition: opacity 0.4s ease;" :key="currentLoadMsg">
        {{ currentLoadMsg }}
      </p>
    </div>

    <!-- Questions -->
    <div v-else>
      <div class="card-float p-8 sm:p-10 mb-5">
        <h1 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 2rem; font-weight: 600; color: #1A1A1A; margin-bottom: 0.5rem; line-height: 1.2;">
          Dodatna vprašanja
        </h1>
        <p style="font-size: 0.9rem; color: #8A8279; line-height: 1.6;">
          Odgovorite na naslednja vprašanja za natančnejšo analizo.
        </p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;">
        <div
          v-for="(q, i) in questions"
          :key="q.id"
          class="card-float"
          style="padding: 1.5rem;"
        >
          <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #2E2A26; margin-bottom: 1rem; line-height: 1.5;">
            <span style="color: #A0694B; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1rem; font-weight: 600; margin-right: 0.4rem;">{{ i + 1 }}.</span>
            {{ q.question }}
          </label>

          <template v-if="q.type === 'select' && q.options">
            <select
              v-model="answers[i]"
              style="width: 100%; border-radius: 10px; border: 1px solid #DDD8CF; background: #FDFCF9; color: #1A1A1A; font-size: 0.875rem; padding: 0.625rem 0.875rem; outline: none; font-family: 'DM Sans', sans-serif; transition: border-color 0.2s ease;"
              @focus="e => e.target.style.borderColor = '#A0694B'"
              @blur="e => e.target.style.borderColor = '#DDD8CF'"
            >
              <option value="" disabled>Izberite odgovor...</option>
              <option v-for="opt in q.options" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </template>

          <template v-else-if="q.type === 'yesno'">
            <div style="display: flex; gap: 0.625rem; flex-wrap: wrap;">
              <label
                v-for="opt in ['Da', 'Ne', 'Ne vem']"
                :key="opt"
                style="cursor: pointer;"
              >
                <input type="radio" :name="'q' + i" :value="opt" v-model="answers[i]" style="display: none;" />
                <span
                  style="display: inline-block; padding: 0.4rem 1.1rem; border-radius: 9999px; border: 1px solid; font-size: 0.85rem; font-weight: 500; transition: all 0.2s ease; cursor: pointer;"
                  :style="answers[i] === opt
                    ? 'background: #1A1A1A; border-color: #1A1A1A; color: white;'
                    : 'background: #FDFCF9; border-color: #DDD8CF; color: #4A4540;'"
                >
                  {{ opt }}
                </span>
              </label>
            </div>
          </template>

          <template v-else>
            <textarea
              v-model="answers[i]"
              rows="3"
              placeholder="Vaš odgovor..."
              style="width: 100%; border-radius: 10px; border: 1px solid #DDD8CF; background: #FDFCF9; color: #1A1A1A; font-size: 0.875rem; padding: 0.75rem 0.875rem; outline: none; resize: none; font-family: 'DM Sans', sans-serif; line-height: 1.6; transition: border-color 0.2s ease;"
              @focus="e => e.target.style.borderColor = '#A0694B'"
              @blur="e => e.target.style.borderColor = '#DDD8CF'"
            ></textarea>
          </template>
        </div>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between;">
        <button
          @click="emit('back')"
          class="btn-pill btn-pill-ghost"
          style="padding: 0.5rem 1.25rem;"
        >
          &larr; Nazaj
        </button>
        <button
          @click="handleNext"
          class="btn-pill btn-pill-primary"
          style="padding: 0.625rem 2rem;"
        >
          Pošlji v analizo &rarr;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  description: String,
  files: Array,
})

const emit = defineEmits(['back', 'next', 'error'])

const loading = ref(true)
const questions = ref([])
const answers = ref([])

// Fake progress bar
const fakePercent = ref(0)
const loadMessages = [
  'Analiziram vsebino primera...',
  'Identificiram ključna pravna vprašanja...',
  'Pripravljam relevantna vprašanja...',
  'Optimiziram za vašo situacijo...',
]
const currentLoadMsg = ref(loadMessages[0])
let msgIdx = 0
let progressInterval = null
let msgInterval = null

function startFakeProgress() {
  // Increment toward ~90% over ~35 seconds
  const steps = [
    { target: 12, duration: 3000 },
    { target: 28, duration: 5000 },
    { target: 44, duration: 6000 },
    { target: 58, duration: 6000 },
    { target: 70, duration: 6000 },
    { target: 80, duration: 5000 },
    { target: 88, duration: 5000 },
    { target: 90, duration: 3000 },
  ]
  let stepIdx = 0
  function runStep() {
    if (stepIdx >= steps.length || !loading.value) return
    const { target, duration } = steps[stepIdx]
    const start = fakePercent.value
    const diff = target - start
    const startTime = Date.now()
    function tick() {
      const elapsed = Date.now() - startTime
      const t = Math.min(elapsed / duration, 1)
      fakePercent.value = Math.round(start + diff * t)
      if (t < 1 && loading.value) requestAnimationFrame(tick)
      else {
        stepIdx++
        if (loading.value) setTimeout(runStep, 200)
      }
    }
    requestAnimationFrame(tick)
  }
  runStep()

  msgInterval = setInterval(() => {
    msgIdx = (msgIdx + 1) % loadMessages.length
    currentLoadMsg.value = loadMessages[msgIdx]
  }, 5000)
}

function stopFakeProgress() {
  clearInterval(msgInterval)
}

onMounted(async () => {
  startFakeProgress()
  try {
    const res = await fetch('/api/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: props.description,
        fileNames: (props.files || []).map(f => f.name),
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    // Snap to 100% briefly
    fakePercent.value = 100
    await new Promise(r => setTimeout(r, 400))
    questions.value = data
    answers.value = Array(data.length).fill('')
  } catch (e) {
    emit('error', 'Napaka pri generiranju vprašanj. Preverite internetno povezavo in poskusite znova.')
  } finally {
    stopFakeProgress()
    loading.value = false
  }
})

onUnmounted(() => {
  stopFakeProgress()
})

function handleNext() {
  const payload = questions.value.map((q, i) => ({
    question: q.question,
    answer: answers.value[i] || '',
  }))
  emit('next', payload)
}
</script>

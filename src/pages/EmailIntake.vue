<template>
  <main class="min-h-screen flex flex-col" style="background-color: #f5f2ed">
    <!-- Header -->
    <header
      class="flex items-center h-16 px-6 sm:px-8 shrink-0"
      style="background-color: #fffdf9; border-bottom: 1px solid #e0dad0"
    >
      <div class="flex items-center gap-3 flex-1">
        <!-- Envelope icon -->
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="4" width="20" height="16" rx="2" stroke="#A0694B" stroke-width="1.5"/>
          <polyline points="2,4 12,14 22,4" stroke="#A0694B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.125rem; font-weight: 600; letter-spacing: 0.12em; color: #1a1a1a; text-transform: uppercase;">
          E-poštni sprejem
        </span>
        <span style="font-size: 0.7rem; background: #F2E8E2; color: #7A4030; padding: 0.2rem 0.6rem; border-radius: 9999px; border: 1px solid #DFC8BC; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600;">
          Jadek &amp; Pensa
        </span>
      </div>
    </header>

    <!-- Error banner -->
    <div v-if="error" class="px-4 pt-5 max-w-screen-xl mx-auto w-full">
      <div
        class="flex items-center justify-between text-sm px-4 py-3 rounded-xl"
        style="background-color: #f2e8e2; border: 1px solid #c8896a; color: #7a4030;"
      >
        <div class="flex items-center gap-2">
          <svg class="shrink-0" width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm.75 12h-1.5V7h1.5v5zm0-6h-1.5V4.5h1.5V6z"/>
          </svg>
          <span>{{ error }}</span>
        </div>
        <button @click="error = null" class="ml-3 opacity-60 hover:opacity-100 transition-opacity">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
            <path d="M7.95 6.536l4.242-4.243a1 1 0 111.415 1.414L9.364 7.95l4.243 4.242a1 1 0 11-1.415 1.415L7.95 9.364l-4.243 4.243a1 1 0 01-1.414-1.415L6.536 7.95 2.293 3.707a1 1 0 011.414-1.414L7.95 6.536z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Phase: Input -->
    <div v-if="phase === 'input'" class="flex-1 px-4 py-10 max-w-3xl mx-auto w-full">
      <EmailInput @submit="onEmailSubmit" />
    </div>

    <!-- Phase: Processing -->
    <div v-else-if="phase === 'processing'" class="flex-1 flex items-center justify-center px-4 py-12">
      <div class="card-float p-10 max-w-md w-full text-center">
        <!-- Spinner -->
        <div style="width: 56px; height: 56px; border: 3px solid #E0DAD0; border-top-color: #A0694B; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1.5rem;"></div>

        <div style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.375rem; font-weight: 600; color: #1A1A1A; margin-bottom: 0.5rem;">Analiziram e-pošto</div>
        <div style="font-size: 0.85rem; color: #8A8279; line-height: 1.5; margin-bottom: 1.75rem;">{{ statusMessages[statusIndex] }}</div>

        <!-- Progress bar -->
        <div style="height: 4px; background: #E0DAD0; border-radius: 9999px; overflow: hidden;">
          <div
            style="height: 100%; background: #A0694B; border-radius: 9999px; animation: fake-progress-slow 18s ease-out forwards;"
          ></div>
        </div>
      </div>
    </div>

    <!-- Phase: Results -->
    <div v-else-if="phase === 'results'" class="flex-1 px-4 py-8 max-w-screen-xl mx-auto w-full">
      <!-- Results header -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
        <div>
          <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.5rem; font-weight: 600; color: #1A1A1A;">Rezultati analize</h2>
          <p style="font-size: 0.82rem; color: #8A8279; margin-top: 0.2rem;">Osnutek odgovora + interna ocena skladnosti</p>
        </div>
        <button
          @click="reset"
          class="btn-pill btn-pill-ghost"
          style="font-size: 0.78rem; padding: 0.4rem 1rem;"
        >
          ← Nova analiza
        </button>
      </div>

      <SplitResults :analysis="results.analysis" :compliance="results.compliance" />
    </div>

  </main>
</template>

<style>
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

<script setup>
import { ref } from 'vue'
import EmailInput from '../components/email/EmailInput.vue'
import SplitResults from '../components/email/SplitResults.vue'

const phase = ref('input')
const error = ref(null)
const results = ref(null)

const statusMessages = [
  'Razčlenjujem vsebino e-pošte...',
  'Identificiram pravna področja in subjekte...',
  'Pripravljam osnutek odgovora...',
  'Preverjam konflikt interesom...',
  'Ocenjujem AML/KYC tveganja...',
  'Zbiranje rezultatov...'
]
const statusIndex = ref(0)
let statusInterval = null

function startStatusCycle() {
  statusIndex.value = 0
  statusInterval = setInterval(() => {
    if (statusIndex.value < statusMessages.length - 1) {
      statusIndex.value++
    }
  }, 2200)
}

function stopStatusCycle() {
  if (statusInterval) {
    clearInterval(statusInterval)
    statusInterval = null
  }
}

async function onEmailSubmit(emailText) {
  phase.value = 'processing'
  error.value = null
  startStatusCycle()

  try {
    // Step 1: Parse email (fast, no external data)
    const parseRes = await fetch('/api/parse-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailText })
    })
    if (!parseRes.ok) {
      const data = await parseRes.json().catch(() => ({}))
      throw new Error(data.error || 'Napaka pri razčlenjevanju e-pošte.')
    }
    const parsed = await parseRes.json()

    // Step 2: Draft generation + compliance check in parallel
    const [draftRes, complianceRes] = await Promise.all([
      fetch('/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailText,
          language: parsed.language,
          legalDomains: parsed.legalDomains,
          urgency: parsed.urgency,
          deadlines: parsed.deadlines,
          summary: parsed.summary
        })
      }),
      fetch('/api/check-compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailText, entities: parsed.entities })
      })
    ])

    if (!draftRes.ok) {
      const data = await draftRes.json().catch(() => ({}))
      throw new Error(data.error || 'Napaka pri generiranju osnutka.')
    }
    if (!complianceRes.ok) {
      const data = await complianceRes.json().catch(() => ({}))
      throw new Error(data.error || 'Napaka pri preverjanju skladnosti.')
    }

    const draft = await draftRes.json()
    const compliance = await complianceRes.json()

    results.value = {
      analysis: { ...parsed, ...draft },
      compliance
    }
    stopStatusCycle()
    phase.value = 'results'
  } catch (e) {
    stopStatusCycle()
    error.value = e.message || 'Prišlo je do napake. Poskusite znova.'
    phase.value = 'input'
  }
}

function reset() {
  phase.value = 'input'
  results.value = null
  error.value = null
}
</script>

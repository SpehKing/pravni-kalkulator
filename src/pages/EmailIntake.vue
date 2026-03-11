<template>
  <main class="min-h-screen flex flex-col" style="background-color: #f5f2ed">
    <!-- Header -->
    <header
      class="flex items-center h-16 px-6 sm:px-8 shrink-0"
      style="background-color: #fffdf9; border-bottom: 1px solid #e0dad0"
    >
      <div class="flex items-center gap-3 flex-1">
        <!-- Envelope icon -->
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="2"
            y="4"
            width="20"
            height="16"
            rx="2"
            stroke="#A0694B"
            stroke-width="1.5"
          />
          <polyline
            points="2,4 12,14 22,4"
            stroke="#A0694B"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span
          style="
            font-family: &quot;Cormorant Garamond&quot;, Georgia, serif;
            font-size: 1.125rem;
            font-weight: 600;
            letter-spacing: 0.12em;
            color: #1a1a1a;
            text-transform: uppercase;
          "
        >
          E-poštni sprejem
        </span>
        <span
          style="
            font-size: 0.7rem;
            background: #f2e8e2;
            color: #7a4030;
            padding: 0.2rem 0.6rem;
            border-radius: 9999px;
            border: 1px solid #dfc8bc;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            font-weight: 600;
          "
        >
          Jadek &amp; Pensa
        </span>
      </div>
      <!-- Nav + Demo/API toggle -->
      <div style="display: flex; align-items: center; gap: 1rem">
        <button
          @click="showOdvetniki = true"
          style="
            font-size: 0.75rem;
            font-weight: 600;
            color: #8a8279;
            background: none;
            border: none;
            cursor: pointer;
            letter-spacing: 0.04em;
            display: flex;
            align-items: center;
            gap: 0.3rem;
            padding: 0;
          "
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <circle cx="6" cy="5" r="2.5" />
            <path d="M1 13c0-2.8 2.2-5 5-5s5 2.2 5 5" />
            <circle cx="12" cy="5" r="2" />
            <path d="M14 13c0-2.2-1.6-4-3.5-4" />
          </svg>
          Odvetniki
        </button>
        <div
          style="
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.04em;
          "
        >
          <span :style="{ color: useCache ? '#A0694B' : '#8A8279' }">Demo</span>
          <button
            @click="useCache = !useCache"
            style="
              position: relative;
              width: 36px;
              height: 20px;
              border-radius: 9999px;
              border: none;
              cursor: pointer;
              transition: background-color 0.2s ease;
            "
            :style="{ backgroundColor: useCache ? '#A0694B' : '#B8B0A4' }"
          >
            <span
              style="
                position: absolute;
                top: 2px;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: white;
                transition: left 0.2s ease;
              "
              :style="{ left: useCache ? '2px' : '18px' }"
            ></span>
          </button>
          <span :style="{ color: !useCache ? '#A0694B' : '#8A8279' }">API</span>
        </div>
      </div>
    </header>

    <!-- Error banner -->
    <div v-if="error" class="px-4 pt-5 max-w-screen-xl mx-auto w-full">
      <div
        class="flex items-center justify-between text-sm px-4 py-3 rounded-xl"
        style="
          background-color: #f2e8e2;
          border: 1px solid #c8896a;
          color: #7a4030;
        "
      >
        <div class="flex items-center gap-2">
          <svg
            class="shrink-0"
            width="15"
            height="15"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path
              d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm.75 12h-1.5V7h1.5v5zm0-6h-1.5V4.5h1.5V6z"
            />
          </svg>
          <span>{{ error }}</span>
        </div>
        <button
          @click="error = null"
          class="ml-3 opacity-60 hover:opacity-100 transition-opacity"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
            <path
              d="M7.95 6.536l4.242-4.243a1 1 0 111.415 1.414L9.364 7.95l4.243 4.242a1 1 0 11-1.415 1.415L7.95 9.364l-4.243 4.243a1 1 0 01-1.414-1.415L6.536 7.95 2.293 3.707a1 1 0 011.414-1.414L7.95 6.536z"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Phase: Input -->
    <div
      v-if="phase === 'input'"
      class="flex-1 px-4 py-10 max-w-3xl mx-auto w-full"
    >
      <EmailInput @submit="onEmailSubmit" />
    </div>

    <!-- Phase: Processing -->
    <div
      v-else-if="phase === 'processing'"
      class="flex-1 flex items-center justify-center px-4 py-12"
    >
      <div class="card-float p-10 max-w-md w-full text-center">
        <!-- Spinner -->
        <div
          style="
            width: 56px;
            height: 56px;
            border: 3px solid #e0dad0;
            border-top-color: #a0694b;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1.5rem;
          "
        ></div>

        <div
          style="
            font-family: &quot;Cormorant Garamond&quot;, Georgia, serif;
            font-size: 1.375rem;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 0.5rem;
          "
        >
          Analiziram e-pošto
        </div>
        <div
          style="
            font-size: 0.85rem;
            color: #8a8279;
            line-height: 1.5;
            margin-bottom: 1.75rem;
          "
        >
          {{ statusMessages[statusIndex] }}
        </div>

        <!-- Progress bar -->
        <div
          style="
            height: 4px;
            background: #e0dad0;
            border-radius: 9999px;
            overflow: hidden;
          "
        >
          <div
            style="height: 100%; background: #a0694b; border-radius: 9999px"
            :style="{
              animation: isCachedRun
                ? 'fake-progress-fast 10s ease-out forwards'
                : 'fake-progress-slow 18s ease-out forwards',
            }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Phase: Results -->
    <div
      v-else-if="phase === 'results'"
      class="flex-1 px-4 py-8 max-w-screen-xl mx-auto w-full"
    >
      <!-- Results header -->
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        "
      >
        <div>
          <h2
            style="
              font-family: &quot;Cormorant Garamond&quot;, Georgia, serif;
              font-size: 1.5rem;
              font-weight: 600;
              color: #1a1a1a;
            "
          >
            Rezultati analize
          </h2>
          <p style="font-size: 0.82rem; color: #8a8279; margin-top: 0.2rem">
            Osnutek odgovora + interna ocena skladnosti
          </p>
        </div>
        <button
          @click="reset"
          class="btn-pill btn-pill-ghost"
          style="font-size: 0.78rem; padding: 0.4rem 1rem"
        >
          ← Nova analiza
        </button>
      </div>

      <SplitResults
        :analysis="results.analysis"
        :compliance="results.compliance"
      />
    </div>
  </main>

  <!-- Odvetniki Modal -->
  <Teleport to="body">
    <div
      v-if="showOdvetniki"
      style="
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: flex;
        align-items: stretch;
        justify-content: center;
      "
    >
      <!-- Backdrop -->
      <div
        style="
          position: absolute;
          inset: 0;
          background: rgba(26, 26, 26, 0.45);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        "
        @click="showOdvetniki = false"
      />

      <!-- Panel -->
      <div
        style="
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1240px;
          margin: 1.5rem;
          background: #f5f2ed;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
        "
      >
        <!-- Modal header -->
        <div
          style="
            display: flex;
            align-items: center;
            height: 56px;
            padding: 0 1.5rem;
            background: #fffdf9;
            border-bottom: 1px solid #e0dad0;
            flex-shrink: 0;
          "
        >
          <div
            style="display: flex; align-items: center; gap: 0.625rem; flex: 1"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="7" r="3" stroke="#A0694B" stroke-width="1.5" />
              <path
                d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"
                stroke="#A0694B"
                stroke-width="1.5"
                stroke-linecap="round"
              />
              <circle
                cx="17"
                cy="8"
                r="2.5"
                stroke="#A0694B"
                stroke-width="1.5"
              />
              <path
                d="M21 19c0-2.8-1.8-5-4-5"
                stroke="#A0694B"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
            <span
              style="
                font-family: &quot;Cormorant Garamond&quot;, Georgia, serif;
                font-size: 1rem;
                font-weight: 600;
                letter-spacing: 0.12em;
                color: #1a1a1a;
                text-transform: uppercase;
              "
              >Odvetniki</span
            >
            <span
              style="
                font-size: 0.7rem;
                background: #f2e8e2;
                color: #7a4030;
                padding: 0.2rem 0.6rem;
                border-radius: 9999px;
                border: 1px solid #dfc8bc;
                text-transform: uppercase;
                letter-spacing: 0.06em;
                font-weight: 600;
              "
              >Jadek &amp; Pensa</span
            >
          </div>
          <button
            @click="showOdvetniki = false"
            style="
              background: none;
              border: none;
              cursor: pointer;
              color: #8a8279;
              padding: 0.25rem;
              display: flex;
              align-items: center;
            "
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <!-- Filter bar -->
        <div
          style="
            padding: 0.75rem 1.5rem;
            background: #fffdf9;
            border-bottom: 1px solid #e0dad0;
            flex-shrink: 0;
          "
        >
          <div
            style="
              display: flex;
              flex-wrap: wrap;
              gap: 0.375rem;
              align-items: center;
            "
          >
            <span
              style="
                font-size: 0.72rem;
                font-weight: 600;
                color: #6b6460;
                text-transform: uppercase;
                letter-spacing: 0.06em;
                margin-right: 0.25rem;
              "
              >Filtriraj:</span
            >
            <button
              class="btn-pill"
              :class="
                odvetnikiFilter === null ? 'btn-pill-active' : 'btn-pill-ghost'
              "
              @click="odvetnikiFilter = null"
              style="font-size: 0.7rem; padding: 0.2rem 0.7rem"
            >
              Vsi
            </button>
            <button
              v-for="domain in odvetnikiDomains"
              :key="domain"
              class="btn-pill"
              :class="
                odvetnikiFilter === domain
                  ? 'btn-pill-active'
                  : 'btn-pill-ghost'
              "
              @click="
                odvetnikiFilter = odvetnikiFilter === domain ? null : domain
              "
              style="font-size: 0.7rem; padding: 0.2rem 0.7rem"
            >
              {{ domain }}
            </button>
          </div>
        </div>

        <!-- Scrollable cards -->
        <div style="flex: 1; overflow-y: auto; padding: 1.5rem">
          <!-- Legend -->
          <div
            style="
              display: flex;
              gap: 1.25rem;
              margin-bottom: 1.25rem;
              flex-wrap: wrap;
            "
          >
            <div
              v-for="s in odvetnikiLegend"
              :key="s.label"
              style="
                display: flex;
                align-items: center;
                gap: 0.375rem;
                font-size: 0.72rem;
                color: #6b6460;
              "
            >
              <span
                :style="{ background: s.color }"
                style="
                  width: 8px;
                  height: 8px;
                  border-radius: 50%;
                  display: inline-block;
                "
              ></span>
              {{ s.label }}
            </div>
          </div>

          <!-- Grid -->
          <div
            style="
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
              gap: 1rem;
            "
          >
            <div
              v-for="lawyer in filteredOdvetniki"
              :key="lawyer.id"
              class="card-float"
              style="
                padding: 1.125rem;
                display: flex;
                flex-direction: column;
                gap: 0.625rem;
              "
            >
              <div
                style="
                  display: flex;
                  align-items: flex-start;
                  justify-content: space-between;
                  gap: 0.5rem;
                "
              >
                <div>
                  <div
                    style="font-size: 0.9rem; font-weight: 700; color: #1a1a1a"
                  >
                    {{ lawyer.name }}
                  </div>
                  <div
                    style="
                      font-size: 0.7rem;
                      color: #8a8279;
                      text-transform: uppercase;
                      letter-spacing: 0.04em;
                      margin-top: 0.1rem;
                    "
                  >
                    {{ lawyer.title }}
                  </div>
                </div>
                <div
                  :style="odvetnikiDotStyle(lawyer.capacity_status)"
                  style="
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    flex-shrink: 0;
                    margin-top: 4px;
                  "
                ></div>
              </div>
              <p style="font-size: 0.775rem; color: #6b6460; line-height: 1.45">
                {{ lawyer.experience_description }}
              </p>
              <div style="display: flex; flex-wrap: wrap; gap: 0.3rem">
                <span
                  v-for="spec in lawyer.specializations"
                  :key="spec"
                  style="
                    font-size: 0.65rem;
                    padding: 0.15rem 0.5rem;
                    border-radius: 9999px;
                    border: 1px solid #dfc8bc;
                    background: #f2e8e2;
                    color: #7a4030;
                    font-weight: 600;
                  "
                  >{{ spec }}</span
                >
              </div>
              <div
                style="
                  display: flex;
                  align-items: center;
                  gap: 0.375rem;
                  margin-top: auto;
                  padding-top: 0.25rem;
                "
              >
                <span
                  :style="odvetnikiiBadgeStyle(lawyer.capacity_status)"
                  style="
                    font-size: 0.68rem;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    padding: 0.15rem 0.55rem;
                    border-radius: 9999px;
                  "
                  >{{ odvetnikiCapacityLabel(lawyer.capacity_status) }}</span
                >
              </div>
            </div>
          </div>

          <p
            v-if="filteredOdvetniki.length === 0"
            style="
              text-align: center;
              color: #8a8279;
              padding: 3rem 0;
              font-size: 0.875rem;
            "
          >
            Ni odvetnikov za izbrano področje.
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

<script setup>
import { ref, computed } from "vue";
import EmailInput from "../components/email/EmailInput.vue";
import SplitResults from "../components/email/SplitResults.vue";
import { testEmailCache } from "../data/testEmailCache.js";

const phase = ref("input");
const error = ref(null);
const results = ref(null);
const useCache = ref(true);
const isCachedRun = ref(false);

const statusMessages = [
  "Razčlenjujem vsebino e-pošte...",
  "Identificiram pravna področja in subjekte...",
  "Pripravljam osnutek odgovora...",
  "Preverjam konflikt interesom...",
  "Ocenjujem AML/KYC tveganja...",
  "Zbiranje rezultatov...",
];
const statusIndex = ref(0);
let statusInterval = null;

function startStatusCycle() {
  statusIndex.value = 0;
  statusInterval = setInterval(() => {
    if (statusIndex.value < statusMessages.length - 1) {
      statusIndex.value++;
    }
  }, 2200);
}

function stopStatusCycle() {
  if (statusInterval) {
    clearInterval(statusInterval);
    statusInterval = null;
  }
}

async function onEmailSubmit({ text, testId }) {
  error.value = null;

  // Check if we can use cached response
  if (testId && useCache.value && testEmailCache[testId]) {
    isCachedRun.value = true;
    phase.value = "processing";
    startStatusCycle();

    setTimeout(() => {
      results.value = testEmailCache[testId];
      stopStatusCycle();
      phase.value = "results";
    }, 10000);
    return;
  }

  // Real API flow
  isCachedRun.value = false;
  phase.value = "processing";
  startStatusCycle();
  const emailText = text;

  try {
    // Step 1: Parse email (fast, no external data)
    const parseRes = await fetch("/api/parse-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailText }),
    });
    if (!parseRes.ok) {
      const data = await parseRes.json().catch(() => ({}));
      throw new Error(data.error || "Napaka pri razčlenjevanju e-pošte.");
    }
    const parsed = await parseRes.json();

    // Step 2: Draft generation + compliance check in parallel
    const [draftRes, complianceRes] = await Promise.all([
      fetch("/api/generate-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailText,
          language: parsed.language,
          legalDomains: parsed.legalDomains,
          urgency: parsed.urgency,
          deadlines: parsed.deadlines,
          summary: parsed.summary,
        }),
      }),
      fetch("/api/check-compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailText, entities: parsed.entities }),
      }),
    ]);

    if (!draftRes.ok) {
      const data = await draftRes.json().catch(() => ({}));
      throw new Error(data.error || "Napaka pri generiranju osnutka.");
    }
    if (!complianceRes.ok) {
      const data = await complianceRes.json().catch(() => ({}));
      throw new Error(data.error || "Napaka pri preverjanju skladnosti.");
    }

    const draft = await draftRes.json();
    const compliance = await complianceRes.json();

    results.value = {
      analysis: { ...parsed, ...draft },
      compliance,
    };
    stopStatusCycle();
    phase.value = "results";
  } catch (e) {
    stopStatusCycle();
    error.value = e.message || "Prišlo je do napake. Poskusite znova.";
    phase.value = "input";
  }
}

function reset() {
  phase.value = "input";
  results.value = null;
  error.value = null;
}

// ── Odvetniki modal ──────────────────────────────────────────
const showOdvetniki = ref(false);
const odvetnikiFilter = ref(null);

const odvetnikiDomains = [
  "Davčno pravo",
  "Delovno pravo",
  "Insolvenčno pravo in prestrukturiranja",
  "Intelektualna lastnina",
  "Javno naročanje",
  "Komercialne pogodbe",
  "Konkurenčno pravo",
  "Korporacijsko pravo",
  "Migracijsko pravo",
  "Preprečevanje in reševanje sporov",
  "Prevzemi in združitve",
  "Varstvo osebnih podatkov",
];

const odvetnikiLegend = [
  { label: "Razpoložljiv", color: "#4A8A61" },
  { label: "Delno zaseden", color: "#C8896A" },
  { label: "Polno zaseden", color: "#A85040" },
];

const lawyersData = [
  {
    id: "IRPE",
    name: "Iris Pensa",
    title: "Partnerka",
    specializations: ["Delovno pravo", "Migracijsko pravo"],
    experience_description:
      "Vodi delovnopravni in imigracijski oddelek ter ESG svetovanje. Akreditirana mediatorka CEDR (2021), vodja Mediacijskega centra OZS od 2023.",
    capacity_status: "AMBER",
  },
  {
    id: "ANJA",
    name: "Andraž Jadek",
    title: "Partner",
    specializations: [
      "Prevzemi in združitve",
      "Korporacijsko pravo",
      "Insolvenčno pravo in prestrukturiranja",
    ],
    experience_description:
      "Specializiran za M&A, finančna prestrukturiranja in bančne posle. Magister korporacijskega prava (NYU), priznan v mednarodnih pravnih direktorijih.",
    capacity_status: "GREEN",
  },
  {
    id: "DORO",
    name: "Domen Romih",
    title: "Partner",
    specializations: ["Davčno pravo"],
    experience_description:
      "Vodi davčno enoto pisarne. Specializiran za davčno svetovanje pri transakcijah, davčni nadzor in digitalno ekonomijo.",
    capacity_status: "AMBER",
  },
  {
    id: "MIPO",
    name: "Mitja Podpečan",
    title: "Partner",
    specializations: [
      "Preprečevanje in reševanje sporov",
      "Varstvo osebnih podatkov",
    ],
    experience_description:
      "Vodja enote za reševanje sporov. Poglobljeno znanje prava IT, varstva osebnih podatkov in novih tehnologij, vključno z umetno inteligenco.",
    capacity_status: "GREEN",
  },
  {
    id: "OŽME",
    name: "Ožbej Merc",
    title: "Starejši partner",
    specializations: [
      "Prevzemi in združitve",
      "Insolvenčno pravo in prestrukturiranja",
    ],
    experience_description:
      "Vodja transakcijske enote. Sodeloval pri večini prestrukturiranj velikih sistemov v Sloveniji, LL.M. Columbia University (2005).",
    capacity_status: "AMBER",
  },
  {
    id: "SAJE",
    name: "Aleksandra Merc",
    title: "Starejša partnerka",
    specializations: [
      "Korporacijsko pravo",
      "Intelektualna lastnina",
      "Komercialne pogodbe",
    ],
    experience_description:
      "Poslovodni partner pisarne. Pokriva korporacijsko pravo, patentne spore in farmacevtsko regulativo.",
    capacity_status: "RED",
  },
  {
    id: "GRKO",
    name: "Gregor Kovačič",
    title: "Starejši odvetnik",
    specializations: [
      "Javno naročanje",
      "Delovno pravo",
      "Preprečevanje in reševanje sporov",
    ],
    experience_description:
      "Specialist za gradbeno pravo, javna naročila in delovno pravo. Izkušnje z FIDIC pogodbami in zastopanjem v gradbenih sporih.",
    capacity_status: "GREEN",
  },
  {
    id: "PAPE",
    name: "Pavle Pensa",
    title: "Ustanovni partner",
    specializations: [
      "Prevzemi in združitve",
      "Konkurenčno pravo",
      "Preprečevanje in reševanje sporov",
    ],
    experience_description:
      "Ustanovni partner in vodilni slovenski odvetnik. Obsežne izkušnje z M&A, mednarodno arbitražo in konkurenčnopravnimi zadevami.",
    capacity_status: "RED",
  },
  {
    id: "NIBA",
    name: "Nina Bakovnik",
    title: "Pravnica",
    specializations: ["Delovno pravo", "Migracijsko pravo"],
    experience_description:
      "Specializirana za evropsko in mednarodno delovno pravo, protidiskriminacijsko pravo in zaposlovanje tujcev.",
    capacity_status: "GREEN",
  },
  {
    id: "NAME",
    name: "Nastja Merlak",
    title: "Partnerka",
    specializations: [
      "Prevzemi in združitve",
      "Korporacijsko pravo",
      "Insolvenčno pravo in prestrukturiranja",
    ],
    experience_description:
      "Specializirana za M&A, insolvenčno pravo in statusnopravna preoblikovanja podjetij. Magistrica prava (LSE).",
    capacity_status: "AMBER",
  },
  {
    id: "VEKN",
    name: "Veronika Bratož",
    title: "Višja davčna svetovalka",
    specializations: ["Davčno pravo"],
    experience_description:
      "Izkušena davčna svetovalka (prej Big 4). Specialistka za DDV, transferne cene in obdavčitev virtualnih valut.",
    capacity_status: "GREEN",
  },
  {
    id: "JULE",
    name: "Jure Levovnik",
    title: "Starejši partner",
    specializations: [
      "Preprečevanje in reševanje sporov",
      "Intelektualna lastnina",
    ],
    experience_description:
      "Vodilni strokovnjak za reševanje sporov v Sloveniji. Mednarodne arbitraže, energetika, IP in športno pravo. Član AEEC od 2019.",
    capacity_status: "AMBER",
  },
  {
    id: "NESE",
    name: "Nejc Setnikar",
    title: "Pravnik",
    specializations: [
      "Intelektualna lastnina",
      "Varstvo osebnih podatkov",
      "Komercialne pogodbe",
    ],
    experience_description:
      "Svetuje na področju pogodbenega prava, varstva podatkov in IP. Specializiran za pravne vidike umetne inteligence, robotike in digitalnih trgov.",
    capacity_status: "GREEN",
  },
  {
    id: "JAZA",
    name: "Janja Zaplotnik",
    title: "Partnerica",
    specializations: ["Konkurenčno pravo", "Komercialne pogodbe"],
    experience_description:
      "Vodja svetovalne enote. Specialistka za konkurenčno pravo, državno pomoč in konkurenčnopravne vidike M&A.",
    capacity_status: "AMBER",
  },
  {
    id: "EVGO",
    name: "Eva Gostiša",
    title: "Partnerka",
    specializations: ["Intelektualna lastnina"],
    experience_description:
      "Osredotočena na IP: blagovne znamke, modeli, patenti in avtorsko pravo. Pokriva tudi regulativo zdravil in nepremičninske transakcije.",
    capacity_status: "GREEN",
  },
  {
    id: "BOLE",
    name: "Borut Leskovec",
    title: "Partner",
    specializations: [
      "Javno naročanje",
      "Preprečevanje in reševanje sporov",
      "Insolvenčno pravo in prestrukturiranja",
    ],
    experience_description:
      "Specialist za javna naročila in kompleksne gospodarske spore. Izkušnje z velikimi infrastrukturnimi projekti in insolvenčnim pravom.",
    capacity_status: "GREEN",
  },
  {
    id: "ANOŠ",
    name: "Ana Oštir",
    title: "Odvetnica",
    specializations: ["Delovno pravo", "Migracijsko pravo"],
    experience_description:
      "Svetuje na področju delovnih razmerij, zaposlovanja tujcev, protidiskriminacije in trajnostnega poročanja (ESG).",
    capacity_status: "GREEN",
  },
];

const filteredOdvetniki = computed(() => {
  if (!odvetnikiFilter.value) return lawyersData;
  return lawyersData.filter((l) =>
    l.specializations.includes(odvetnikiFilter.value),
  );
});

function odvetnikiDotStyle(status) {
  if (status === "GREEN") return "background: #4A8A61;";
  if (status === "AMBER") return "background: #C8896A;";
  return "background: #A85040;";
}

function odvetnikiiBadgeStyle(status) {
  if (status === "GREEN")
    return "background: #F0F9F4; color: #3B7050; border: 1px solid #A8D8BC;";
  if (status === "AMBER")
    return "background: #FEF3EC; color: #8B5E2A; border: 1px solid #E8C090;";
  return "background: #FFF0EE; color: #A04040; border: 1px solid #F0C0BC;";
}

function odvetnikiCapacityLabel(status) {
  if (status === "GREEN") return "Razpoložljiv";
  if (status === "AMBER") return "Delno zaseden";
  return "Polno zaseden";
}
</script>

<template>
  <main class="min-h-screen flex flex-col" style="background-color: #f5f2ed">
    <!-- Header -->
    <header
      class="flex items-center h-16 px-6 sm:px-8 shrink-0"
      style="background-color: #fffdf9; border-bottom: 1px solid #e0dad0"
    >
      <div class="flex items-center gap-3 flex-1">
        <!-- Scales of justice SVG -->
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            x1="12"
            y1="3"
            x2="12"
            y2="21"
            stroke="#A0694B"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <line
            x1="5"
            y1="3"
            x2="19"
            y2="3"
            stroke="#A0694B"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <line
            x1="12"
            y1="3"
            x2="6"
            y2="10"
            stroke="#A0694B"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <line
            x1="12"
            y1="3"
            x2="18"
            y2="10"
            stroke="#A0694B"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <path
            d="M3 10 C3 10 3 13 6 13 C9 13 9 10 9 10 Z"
            fill="#A0694B"
            opacity="0.8"
          />
          <path
            d="M15 10 C15 10 15 13 18 13 C21 13 21 10 21 10 Z"
            fill="#A0694B"
            opacity="0.8"
          />
          <line
            x1="8"
            y1="21"
            x2="16"
            y2="21"
            stroke="#A0694B"
            stroke-width="1.5"
            stroke-linecap="round"
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
          Pravni Kalkulator
        </span>
      </div>
      <!-- Nav links -->
      <nav style="display: flex; align-items: center; gap: 0.25rem;">
        <a
          href="/"
          style="font-size: 0.8rem; font-weight: 600; padding: 0.35rem 0.85rem; border-radius: 9999px; text-decoration: none; background: #1A1A1A; color: #FFFDF9;"
        >Pravni kalkulator</a>
        <a
          href="/email-intake"
          style="font-size: 0.8rem; padding: 0.35rem 0.85rem; border-radius: 9999px; text-decoration: none; color: #8A8279; transition: color 0.2s;"
          @mouseenter="e => e.currentTarget.style.color = '#1A1A1A'"
          @mouseleave="e => e.currentTarget.style.color = '#8A8279'"
        >E-poštni sprejem</a>
      </nav>
    </header>

    <!-- Error banner -->
    <div v-if="error" class="px-4 pt-5 max-w-3xl mx-auto w-full">
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

    <!-- Progress indicator -->
    <div class="px-4 pt-10 pb-8 max-w-3xl mx-auto w-full">
      <div class="relative flex items-start justify-between">
        <!-- connecting line sits ~16px below the top (half of 32px circle) -->
        <div
          class="absolute left-0 right-0 h-px"
          style="top: 36px; background-color: #ddd8cf"
          aria-hidden="true"
        ></div>
        <!-- active line overlay -->
        <div
          class="absolute left-0 h-px transition-all duration-700 ease-in-out"
          style="top: 36px; background-color: #a0694b"
          :style="{ width: progressLineWidth }"
          aria-hidden="true"
        ></div>

        <div
          v-for="(label, i) in steps"
          :key="i"
          class="relative flex flex-col items-center gap-2.5 z-10"
        >
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-500 ease-in-out"
            :style="stepDotStyle(i)"
          >
            <svg
              v-if="i < currentMainStep"
              width="11"
              height="11"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M13.7 4.3l-7.7 7.7-3.7-3.7 1.4-1.4 2.3 2.3 6.3-6.3z" />
            </svg>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span
            class="text-xs font-medium transition-colors duration-300"
            :style="
              i <= currentMainStep ? 'color: #A0694B;' : 'color: #B8B0A4;'
            "
            >{{ label }}</span
          >
        </div>
      </div>
    </div>

    <!-- Step content -->
    <div class="flex-1 px-4 pb-12 max-w-3xl mx-auto w-full">
      <StepDescribe
        v-if="currentSubStep === 'describe'"
        @next="onDescribeNext"
      />
      <StepFollowUp
        v-else-if="currentSubStep === 'followup'"
        :description="state.description"
        :files="state.files"
        @back="currentSubStep = 'describe'"
        @next="onFollowUpNext"
        @error="error = $event"
      />
      <StepProcessing
        v-else-if="currentSubStep === 'processing'"
        :description="state.description"
        :files="state.files"
        :answers="state.answers"
        @done="onAnalysisDone"
        @error="onAnalysisError"
      />
      <StepResults
        v-else-if="currentSubStep === 'results'"
        :result="state.result"
        @reset="resetWizard"
      />
    </div>
  </main>
</template>

<script setup>
import { ref, computed } from "vue";
import StepDescribe from "../components/steps/StepDescribe.vue";
import StepFollowUp from "../components/steps/StepFollowUp.vue";
import StepProcessing from "../components/steps/StepProcessing.vue";
import StepResults from "../components/steps/StepResults.vue";

const steps = ["Opis problema", "Analiza", "Rezultat"];
const currentSubStep = ref("describe");
const error = ref(null);

const state = ref({
  description: "",
  files: [],
  answers: [],
  result: null,
});

const currentMainStep = computed(() => {
  if (
    currentSubStep.value === "describe" ||
    currentSubStep.value === "followup"
  )
    return 0;
  if (currentSubStep.value === "processing") return 1;
  return 2;
});

const progressLineWidth = computed(() => {
  if (currentMainStep.value === 0) return "0%";
  if (currentMainStep.value === 1) return "50%";
  return "100%";
});

function stepDotStyle(i) {
  if (i < currentMainStep.value)
    return "background-color: #A0694B; color: white;";
  if (i === currentMainStep.value)
    return "background-color: #1A1A1A; color: white;";
  return "background-color: #FFFDF9; border-color: #DDD8CF; color: #B8B0A4;";
}

function onDescribeNext({ description, files }) {
  state.value.description = description;
  state.value.files = files;
  error.value = null;
  currentSubStep.value = "followup";
}

function onFollowUpNext(answers) {
  state.value.answers = answers;
  error.value = null;
  currentSubStep.value = "processing";
}

function onAnalysisDone(result) {
  state.value.result = result;
  currentSubStep.value = "results";
}

function onAnalysisError(msg) {
  error.value = msg;
  currentSubStep.value = "followup";
}

function resetWizard() {
  state.value = { description: "", files: [], answers: [], result: null };
  error.value = null;
  currentSubStep.value = "describe";
}
</script>

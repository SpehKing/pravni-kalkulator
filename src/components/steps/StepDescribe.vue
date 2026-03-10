<template>
  <div class="card-float p-8 sm:p-10">
    <h1 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 2rem; font-weight: 600; color: #1A1A1A; margin-bottom: 0.5rem; line-height: 1.2;">
      Opišite svojo pravno situacijo
    </h1>
    <p style="font-size: 0.9rem; color: #8A8279; margin-bottom: 2rem; line-height: 1.6;">
      Čim podrobneje opišite spor ali problem, ki ga želite analizirati.
    </p>

    <!-- Description textarea -->
    <div style="margin-bottom: 1.75rem;">
      <label style="display: block; font-size: 0.8rem; font-weight: 500; color: #4A4540; margin-bottom: 0.5rem; letter-spacing: 0.04em; text-transform: uppercase;">
        Opis problema
      </label>
      <textarea
        v-model="description"
        rows="6"
        placeholder="Na primer: Delodajalec mi je odrekel izplačilo nadur za zadnjih 6 mesecev, kljub temu da sem redno delal prekoračitve delovnega časa..."
        style="width: 100%; border-radius: 12px; border: 1px solid #DDD8CF; background: #FDFCF9; color: #1A1A1A; font-size: 0.9rem; padding: 0.85rem 1rem; outline: none; resize: none; font-family: 'DM Sans', sans-serif; line-height: 1.6; transition: border-color 0.2s ease;"
        @focus="e => e.target.style.borderColor = '#A0694B'"
        @blur="e => e.target.style.borderColor = '#DDD8CF'"
      ></textarea>
      <p v-if="descriptionError" style="font-size: 0.78rem; color: #A0694B; margin-top: 0.4rem;">{{ descriptionError }}</p>
    </div>

    <!-- File upload -->
    <div style="margin-bottom: 2rem;">
      <label style="display: block; font-size: 0.8rem; font-weight: 500; color: #4A4540; margin-bottom: 0.5rem; letter-spacing: 0.04em; text-transform: uppercase;">
        Priložite dokumente <span style="color: #B8B0A4; font-weight: 400; text-transform: none; letter-spacing: 0;">(neobvezno)</span>
      </label>
      <div
        style="border-radius: 14px; padding: 2rem; text-align: center; cursor: pointer; transition: all 0.25s ease; border: 1.5px dashed;"
        :style="isDragging
          ? 'border-color: #A0694B; background: #F9F0EB;'
          : 'border-color: #DDD8CF; background: #FDFCF9;'"
        @dragover.prevent="isDragging = true"
        @dragleave="isDragging = false"
        @drop.prevent="onDrop"
        @click="fileInput.click()"
        @mouseenter="e => { if (!isDragging) e.currentTarget.style.borderColor = '#C8896A' }"
        @mouseleave="e => { if (!isDragging) e.currentTarget.style.borderColor = '#DDD8CF' }"
      >
        <svg style="margin: 0 auto 0.75rem; display: block;" width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="#B8B0A4" stroke-width="1.5" stroke-linejoin="round"/>
          <polyline points="14 2 14 8 20 8" stroke="#B8B0A4" stroke-width="1.5" stroke-linejoin="round"/>
          <line x1="12" y1="13" x2="12" y2="18" stroke="#B8B0A4" stroke-width="1.5" stroke-linecap="round"/>
          <polyline points="9 16 12 13 15 16" stroke="#B8B0A4" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
        <p style="font-size: 0.875rem; color: #6B6460;">
          Povlecite datoteke sem ali <span style="color: #A0694B; font-weight: 500;">izberite</span>
        </p>
        <p style="font-size: 0.75rem; color: #B8B0A4; margin-top: 0.35rem;">PDF, JPG, PNG, DOC, DOCX, TXT</p>
        <input
          ref="fileInput"
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
          style="display: none;"
          @change="onFileChange"
        />
      </div>

      <!-- File list -->
      <ul v-if="files.length" style="margin-top: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem;">
        <li
          v-for="(file, i) in files"
          :key="i"
          style="display: flex; align-items: center; justify-content: space-between; background: #FFFDF9; border: 1px solid #E0DAD0; border-radius: 12px; padding: 0.6rem 0.875rem; font-size: 0.85rem;"
        >
          <div style="display: flex; align-items: center; gap: 0.6rem; min-width: 0;">
            <svg style="flex-shrink: 0;" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="#A0694B" stroke-width="1.5" stroke-linejoin="round"/>
            </svg>
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #2E2A26;">{{ file.name }}</span>
            <span style="color: #B8B0A4; flex-shrink: 0;">{{ formatSize(file.size) }}</span>
          </div>
          <button @click.stop="removeFile(i)" style="margin-left: 0.5rem; color: #B8B0A4; flex-shrink: 0; transition: color 0.2s; background: none; border: none; cursor: pointer; padding: 2px;"
            @mouseenter="e => e.currentTarget.style.color = '#A05040'"
            @mouseleave="e => e.currentTarget.style.color = '#B8B0A4'"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
              <path d="M7.95 6.536l4.242-4.243a1 1 0 111.415 1.414L9.364 7.95l4.243 4.242a1 1 0 11-1.415 1.415L7.95 9.364l-4.243 4.243a1 1 0 01-1.414-1.415L6.536 7.95 2.293 3.707a1 1 0 011.414-1.414L7.95 6.536z"/>
            </svg>
          </button>
        </li>
      </ul>
      <p v-if="fileError" style="font-size: 0.78rem; color: #A0694B; margin-top: 0.4rem;">{{ fileError }}</p>
    </div>

    <div style="display: flex; justify-content: flex-end;">
      <button
        @click="handleNext"
        class="btn-pill btn-pill-primary"
        style="padding: 0.625rem 2rem; font-size: 0.875rem;"
      >
        Naprej &rarr;
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['next'])

const description = ref('')
const files = ref([])
const isDragging = ref(false)
const fileInput = ref(null)
const descriptionError = ref('')
const fileError = ref('')

const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']

function addFiles(newFiles) {
  fileError.value = ''
  for (const f of newFiles) {
    if (!ALLOWED.includes(f.type) && !f.name.match(/\.(pdf|jpg|jpeg|png|doc|docx|txt)$/i)) {
      fileError.value = `Datoteka "${f.name}" ni podprta.`
      continue
    }
    if (f.size > 5 * 1024 * 1024) {
      fileError.value = `Datoteka "${f.name}" je prevelika (max 5 MB).`
      continue
    }
    files.value.push(f)
  }
}

function onDrop(e) {
  isDragging.value = false
  addFiles([...e.dataTransfer.files])
}

function onFileChange(e) {
  addFiles([...e.target.files])
  e.target.value = ''
}

function removeFile(i) {
  files.value.splice(i, 1)
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function handleNext() {
  descriptionError.value = ''
  if (description.value.trim().length < 20) {
    descriptionError.value = 'Prosimo, opišite problem (vsaj 20 znakov).'
    return
  }

  const fileData = await Promise.all(
    files.value.map(f => new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = e => resolve({ name: f.name, type: f.type, size: f.size, base64: e.target.result.split(',')[1] })
      reader.readAsDataURL(f)
    }))
  )

  emit('next', { description: description.value.trim(), files: fileData })
}
</script>

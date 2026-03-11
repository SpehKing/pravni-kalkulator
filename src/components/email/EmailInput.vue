<template>
  <div class="card-float p-8 sm:p-10">
    <h1 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 2rem; font-weight: 600; color: #1A1A1A; margin-bottom: 0.5rem; line-height: 1.2;">
      Analiza dohodne e-pošte
    </h1>
    <p style="font-size: 0.9rem; color: #8A8279; margin-bottom: 2rem; line-height: 1.6;">
      Prilepite e-pošto stranke za takojšnjo analizo — osnutek odgovora + preverjanje skladnosti.
    </p>

    <!-- Test email quick-select -->
    <div style="margin-bottom: 1.5rem;">
      <div style="font-size: 0.75rem; font-weight: 600; color: #4A4540; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.625rem;">
        Testni primeri
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
        <button
          v-for="email in testEmails"
          :key="email.id"
          @click="loadTestEmail(email)"
          class="btn-pill"
          :style="selectedTest === email.id
            ? 'background: #1A1A1A; color: white; font-size: 0.78rem; padding: 0.35rem 0.875rem;'
            : 'background: #F5F2ED; color: #4A4540; border: 1px solid #DDD8CF; font-size: 0.78rem; padding: 0.35rem 0.875rem;'"
        >
          {{ email.label }}
        </button>
      </div>
    </div>

    <!-- Email textarea -->
    <div style="margin-bottom: 1.75rem;">
      <label style="display: block; font-size: 0.8rem; font-weight: 500; color: #4A4540; margin-bottom: 0.5rem; letter-spacing: 0.04em; text-transform: uppercase;">
        Vsebina e-pošte
      </label>
      <textarea
        v-model="emailText"
        rows="12"
        placeholder="Prilepite e-pošto stranke sem..."
        style="width: 100%; border-radius: 12px; border: 1px solid #DDD8CF; background: #FDFCF9; color: #1A1A1A; font-size: 0.875rem; padding: 0.875rem 1rem; outline: none; resize: vertical; font-family: 'DM Sans', sans-serif; line-height: 1.6; transition: border-color 0.2s ease;"
        @input="selectedTest = null"
        @focus="e => e.target.style.borderColor = '#A0694B'"
        @blur="e => e.target.style.borderColor = '#DDD8CF'"
      ></textarea>
      <p v-if="textError" style="font-size: 0.78rem; color: #A0694B; margin-top: 0.4rem;">{{ textError }}</p>
    </div>

    <div style="display: flex; justify-content: flex-end;">
      <button
        @click="handleSubmit"
        class="btn-pill btn-pill-primary"
        style="padding: 0.625rem 2rem; font-size: 0.875rem;"
      >
        Analiziraj &rarr;
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['submit'])

const emailText = ref('')
const textError = ref('')
const selectedTest = ref(null)

const testEmails = [
  {
    id: 1,
    label: 'E1 — IP zaščita',
    content: `From: Marko Kovač <marko@deepmaint.si>
To: info@jadek-pensa.si
Subject: Zaščita intelektualne lastnine pred licenčnimi pogajanji
Date: Mon, 10 Mar 2026 08:15:00 +0100

Spoštovani,

sem CTO podjetja DeepMaint d.o.o., slovenskega deeptech startupa. Razvili smo nov algoritem za prediktivno vzdrževanje v proizvodnji. Trenutno nimamo nobenih patentov.

Imamo tri soustanovitelje. Eden od njih, Gregor Zupan, zapušča podjetje in nismo prepričani, kako je z dodelitvijo IP pravic iz njegove pogodbe o zaposlitvi.

Kmalu vstopamo v pogajanja z nemškim industrijskim partnerjem IndustrieWerk AG, ki želi licencirati našo tehnologijo. Ali nam lahko pomagate zaščititi našo intelektualno lastnino, preden karkoli podpišemo?

Hvala in lep pozdrav,
Marko Kovač
CTO, DeepMaint d.o.o.`
  },
  {
    id: 2,
    label: 'E2 — GDPR kršitev',
    content: `From: Petra Krajnc <petra.krajnc@webshop.si>
To: info@jadek-pensa.si
Subject: URGENT: Data breach - need immediate legal help
Date: Mon, 10 Mar 2026 07:30:00 +0100

Dear Jadek & Pensa team,

I am the Head of Legal at WebShop d.o.o., a mid-sized Slovenian e-commerce company.

Over the weekend (Saturday evening), we discovered that a third-party marketing platform we use (MarketPulse) exposed customer email addresses and purchase histories of approximately 12,000 customers. We have contained the breach as of Sunday morning, but we have NOT made any notifications — neither to the Information Commissioner nor to affected customers.

We are unsure about our exact obligations and timelines. Can you help us urgently?

Best regards,
Petra Krajnc
Head of Legal, WebShop d.o.o.`
  },
  {
    id: 3,
    label: 'E3 — Delovna razmerja',
    content: `From: Sarah Mitchell <s.mitchell@globalcorp-si.com>
To: info@jadek-pensa.si
Subject: Terminated employee threatening lawsuit
Date: Mon, 10 Mar 2026 08:45:00 +0100

Pozdravljeni,

I am the HR Director at GlobalCorp Slovenija d.o.o., which is the Slovenian subsidiary of GlobalCorp International Ltd (UK).

We terminated an employee, Janez Horvat, three weeks ago due to documented performance issues. He is now threatening to sue us, claiming the dismissal was actually retaliation for raising safety concerns at our production facility last year.

Tukaj je kratek timeline:
- Sept 2025: Employee raises safety concern about ventilation in production hall
- Oct 2025: First performance review flagging issues (documented)
- Dec 2025: Second performance review, formal warning issued
- Feb 2026: Termination for performance reasons

He has some internal emails that he says prove retaliation. I'm attaching the relevant correspondence.

Can you advise us on our exposure and represent us if he files a claim?

Best regards / Lep pozdrav,
Sarah Mitchell
HR Director, GlobalCorp Slovenija d.o.o.`
  },
  {
    id: 4,
    label: 'E4 — M&A prevzem',
    content: `From: Dr. Klaus Weber <k.weber@techacquire.de>
To: info@jadek-pensa.si
Subject: Legal due diligence for acquisition of Slovenian software company
Date: Mon, 10 Mar 2026 09:00:00 +0100

Dear colleagues,

I am General Counsel of TechAcquire GmbH, a German technology company. We are in advanced negotiations to acquire CodeNova d.o.o., a Slovenian software company.

We need comprehensive legal due diligence covering four workstreams:
1. IP ownership verification (ensuring all code IP is properly assigned to the company)
2. Open source license compliance review
3. Employee agreements review (key person clauses, non-competes, IP assignment)
4. GDPR compliance assessment (they process EU customer data)

Can your firm handle all four workstreams? What would the timeline and team look like?

Kind regards,
Dr. Klaus Weber
General Counsel, TechAcquire GmbH`
  },
  {
    id: 5,
    label: 'E5 — AML rdeče zastavice',
    content: `From: Ahmed Al-Rashid <a.rashid@arabesque-holdings.ae>
To: info@jadek-pensa.si
Subject: Urgent - Slovenian subsidiary setup for IP management
Date: Mon, 10 Mar 2026 09:30:00 +0100

Dear Sir/Madam,

I represent Arabesque Holdings Ltd, recently incorporated in Dubai, UAE. We wish to establish a Slovenian subsidiary to manage European IP assets on behalf of our group.

The structure involves transferring intellectual property rights from a third entity (registered in the British Virgin Islands) to the new Slovenian company. The initial capitalization will be approximately EUR 2,000,000, contributed in cash.

We need this done very quickly — ideally within 2 weeks. Please advise on your fees and how fast you can act. Time is of the essence.

Regards,
Ahmed Al-Rashid
Arabesque Holdings Ltd
Dubai, UAE`
  }
]

function loadTestEmail(email) {
  selectedTest.value = email.id
  emailText.value = email.content
  textError.value = ''
}

function handleSubmit() {
  textError.value = ''
  if (emailText.value.trim().length < 30) {
    textError.value = 'Prosimo, vnesite vsebino e-pošte (vsaj 30 znakov).'
    return
  }
  emit('submit', { text: emailText.value.trim(), testId: selectedTest.value })
}
</script>

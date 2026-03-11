# Plan: Enhance Email Intake with Real Data, Classification, Timeline & Compliance

## Context

The existing EmailIntake app (Vue 3 + Vercel Functions + OpenAI) uses fake English-named lawyers and English domain categories. The goal is to replace all fake data with real Jadek & Pensa lawyer/firm data, update classification to 12 Slovenian legal domains, add timeline visualization, early warnings, and enhanced compliance features. All output must read as if written by a human lawyer.

---

## Phase 1: Replace Fake Data with Real Data

### 1.1 Create conversion script + new `lawyers.json`

- **Create** `web/scripts/convert-csv-to-json.mjs`
- Parse `LawBrainer/0_data/Reference odvetnikov - Sheet1.csv` (16 lawyers)
- Output new `web/api/data/lawyers.json` with structure per lawyer:
  ```json
  { "id": "IRPE", "name": "Iris Pensa", "title": "Partnerka",
    "profile": "<from CSV>",
    "specializations": ["Delovno pravo", "Migracijsko pravo"],
    "current_workload": "medium", "capacity_status": "AMBER",
    "cases": [<parsed from CSV JSON column>] }
  ```
- Map specializations from each lawyer's `podrocje_prava` across their cases to the 12 Slovenian categories
- Set workload: 1 lawyer RED (Pavle Pensa - busiest), rest split AMBER/GREEN

### 1.4 Update `fee_matrix.json`

- Re-key from English to Slovenian domain names matching the 12-category taxonomy

**Files modified:** `web/api/data/lawyers.json`, `web/api/data/firm_references.json` (new), `web/api/data/firm_experience.json`, `web/api/data/fee_matrix.json`

---

## Phase 2: Update Domain Classification in `parse-email.js`

### 2.1 Change domain list

- **Modify** `web/api/parse-email.js` line 34
- Replace: `IP, GDPR, M&A, employment, corporate, dispute_resolution, tax, regulatory, technology_contracts, AML`
- With: `Davčno pravo, Delovno pravo, Insolvenčno pravo in prestrukturiranja, Intelektualna lastnina, Javno naročanje, Komercialne pogodbe, Konkurenčno pravo, Korporacijsko pravo, Migracijsko pravo, Preprečevanje in reševanje sporov, Prevzemi in združitve, Varstvo osebnih podatkov`

### 2.2 Upgrade model

- Change `gpt-5-mini-2025-08-07` to `gpt-4o` (classification drives everything downstream)

### 2.3 Verify SummaryCard badges

- Check `web/src/components/email/SummaryCard.vue` — domain badges now show longer Slovenian text, may need smaller font or wrapping

**Files modified:** `web/api/parse-email.js`, `web/src/components/email/SummaryCard.vue` (if needed)

---

## Phase 3: Enhance `generate-draft.js`

### 3.1 Load new data

- Add `firm_references.json` to the data loading block (line 23-25)
- Replace `gpt-5-mini` with `gpt-4o` (line 67)

### 3.2 Pre-filter lawyers

- Before sending to LLM, filter lawyers to top ~6 candidates whose specializations overlap with detected `legalDomains` (saves tokens)

### 3.3 Rewrite system prompt

The prompt must instruct the LLM to:

- **Match 2-3 lawyers** by specialization + case relevance; explain WHY with references to specific past cases
- **Include firm achievements** for matched practice area (from firm_references.json), woven naturally into the draft
- **Generate follow-up questions** about what key information the client hasn't provided but should
- **Generate timeline** (`timeline: [{ naslovFaze, opisFaze, trajanjeFaze }]`) — legal process phases with estimated durations
- **Generate early warnings** (`opozorila: string[]`) — things client must NOT do wrong
- **End with subtle closing nudge** toward hiring the firm
- **"Več je več" principle**: maximize praise, don't be critically objective
- Output must read as written by a human lawyer — no mention of databases or AI

### 3.4 Expand response structure

Add new fields to the return JSON:

```json
{
  "assignedTeam": [{ "lawyerId", "name", "title", "matchReason", "relevanceScore", "relevantCases": [string] }],
  "followUpQuestions": string[],
  "firmExperience": string[],
  "firmReference": { "area", "achievements", "marketing" },
  "feeEstimate": { ... },
  "matterForm": { ... },
  "draftEmail": { "subject", "body", "language" },
  "timeline": [{ "naslovFaze", "opisFaze", "trajanjeFaze" }],
  "opozorila": string[]
}
```

### 3.5 Update sanitization

Add sanitization for `timeline`, `opozorila`, `firmReference`, `relevantCases`

**Files modified:** `web/api/generate-draft.js`

---

## Phase 4: New Frontend Components (Timeline + Warnings)

### 4.1 Create `TimelineCard.vue`

- **Create** `web/src/components/email/TimelineCard.vue`
- Vertical timeline with connected nodes
- Each node: phase title (bold), description, duration badge
- J&P color scheme (#A0694B accent)
- Disclaimer footer: "Navedeni roki so okvirni..."
- Props: `timeline: Array`

### 4.2 Create `WarningsCard.vue`

- **Create** `web/src/components/email/WarningsCard.vue`
- Warning icon list with amber/red styling
- Header: "Zgodnja opozorila"
- Props: `warnings: Array`

### 4.3 Update `ComplianceDashboard.vue`

- Add `TimelineCard` and `WarningsCard` between `FollowUpCard` and `FeeCard`
- Use `v-if` guards for graceful fallback

### 4.4 Enhance `TeamCard.vue`

- Show `relevantCases` under each lawyer (collapsible "Relevantne izkušnje" section)

**Files modified:** `web/src/components/email/ComplianceDashboard.vue`
**Files created:** `web/src/components/email/TimelineCard.vue`, `web/src/components/email/WarningsCard.vue`
**Files modified:** `web/src/components/email/TeamCard.vue`

---

## Phase 5: Compliance Enhancements

### 5.1 Language detection + translation

- In `parse-email.js`: already detects language
- In `EmailIntake.vue`: if language !== "sl", add a translation LLM call before generate-draft, and translate the final draftEmail back to original language
- Store both `originalEmail` and `translatedEmail`

### 5.2 PEP checking in `check-compliance.js`

- Add to AML prompt: assess if any person entities could be politically exposed
- New response field: `pepAssessment: { flagged: boolean, persons: [{ name, reason }] }`
- If flagged → block automatic email sending

### 5.3 Enhance `UrgencyCard.vue`

- Add live countdown timer (`setInterval`, clear on unmount)
- Semaphore colors: red (<24h), orange (24-72h), green (>72h)

### 5.4 Update `AmlCard.vue`

- Add PEP section below red flags

**Files modified:** `web/src/pages/EmailIntake.vue`, `web/api/check-compliance.js`, `web/src/components/email/UrgencyCard.vue`, `web/src/components/email/AmlCard.vue`

---

## Phase 6: Lawyer Dashboard (lower priority)

### 6.1 Create `LawyerDashboard.vue`

- Grid of all 16 lawyers with name, title, specializations, workload status
- Optional `?domains=...` query param highlights best-fit lawyers
- Route: `/odvetniki`

### 6.2 Update router

- Add route in `web/src/router.js`
- Add nav link in EmailIntake header

**Files created:** `web/src/pages/LawyerDashboard.vue`
**Files modified:** `web/src/router.js`, `web/src/pages/EmailIntake.vue`

---

## Phase 7: Update Test Cache

### 7.1 Update `testEmailCache.js`

- After all API changes, regenerate the 5 cached test scenarios to match new domain names, lawyer names, and response structure (timeline, opozorila, firmReference fields)

**Files modified:** `web/src/data/testEmailCache.js`

---

## Implementation Order

1. Phase 1 (data) — foundation, must be first
2. Phase 2 (domains) — needed by everything downstream
3. Phase 3 (generate-draft) — produces new data for UI
4. Phase 4 (timeline + warnings UI) — consumes Phase 3 output
5. Phase 5 (compliance) — independent of Phase 4
6. Phase 6 (dashboard) — independent, lowest priority
7. Phase 7 (cache) — must be last

## Verification

1. Run `pnpm dev` and submit a test email in Slovenian
2. Verify domains appear in Slovenian in SummaryCard
3. Verify real lawyer names appear in TeamCard with relevant case references
4. Verify timeline renders with phases and durations
5. Verify early warnings display in WarningsCard
6. Verify draft email reads naturally, mentions firm achievements, ends with nudge
7. Test with non-Slovenian email to verify translation flow
8. Test AML scenario (UAE holding) to verify PEP flagging
9. Navigate to /odvetniki and verify dashboard displays all lawyers

## Plan: 3-Step Legal Case Chat Interface

Strip the Mosaic Vue template to a minimal 3-step wizard where users describe a legal dispute, answer AI-generated questions, and receive a success probability score. Backend via Netlify serverless functions. UI in Slovenian.

---

### Phase 1 — Scaffolding & Cleanup

**Step 1: Strip template to minimal shell**

- Remove Sidebar, Header, all 64 routes, all existing pages, charts, and most partials
- Keep `App.vue` (simplified), `main.js`, CSS/Tailwind, `ModalBasic.vue`, `Banner.vue`
- Simplify `web/src/router.js` to a single `/` route → new `CaseWizard.vue`
- Simplify `web/src/App.vue` to bare `<router-view />`

**Step 2: Add Netlify Functions infrastructure**

- Create `web/netlify.toml` (build config, functions directory)
- Create `web/netlify/functions/` directory
- Add `openai` npm dependency to `web/package.json`

---

### Phase 2 — Step 1: Problem Description & AI Questions

**Step 3: Create `CaseWizard.vue` orchestrator**

- Full-screen centered layout with 3-step progress bar (pattern from `Onboarding01.vue`)
- Steps: "Opis problema" → "Analiza" → "Rezultat"
- Manages shared reactive state, renders child step components conditionally

**Step 4: Build Step 1a — `StepDescribe.vue`**

- Large textarea for problem description (Slovenian placeholder)
- Drag-and-drop file upload zone (`.pdf`, `.jpg`, `.png`, `.doc`, `.docx`, `.txt`)
- Basic questions section rendered from a configurable array (empty for now — user defines later)
- "Naprej" button validates and advances to Step 1b

**Step 5: Build Step 1b — `StepFollowUp.vue`**

- On mount, calls `/api/generate-questions` with description + file metadata + basic answers
- Shows loading spinner, then renders returned questions as dynamic inputs
- "Nazaj" / "Pošlji v analizo" buttons

**Step 6: `generate-questions` serverless function** (_parallel with Step 5_)

- `web/netlify/functions/generate-questions.js`
- Calls OpenAI GPT-4o-mini with system prompt: "Generate 3–5 follow-up questions in Slovenian to assess court case viability"
- Pattern follows `gpt_utils.py` `send_to_openai()` approach in JS
- Returns `[{ id, question, type }]`

---

### Phase 3 — Step 2: Processing & Analysis

**Step 7: Build `StepProcessing.vue`**

- Animated spinner with cycling status messages ("Analiziram vaš primer...", "Preverjam sodno prakso...", etc.)
- Calls `/api/analyze-case`, auto-advances to Step 3 on completion

**Step 8: `analyze-case` serverless function** (_parallel with Step 7_)

- `web/netlify/functions/analyze-case.js`
- Calls OpenAI GPT-4o with all gathered data and system prompt: "Assess success probability as a Slovenian legal expert"
- Returns `{ percentage: number, explanation: string, factors: [{ factor, impact }] }`

---

### Phase 4 — Step 3: Results Display

**Step 9: Build `StepResults.vue`**

- Large circular percentage gauge (CSS/SVG — green >60%, yellow 30–60%, red <30%)
- Explanation text section
- Key factors as cards with positive/negative impact indicators
- "Nova analiza" button resets wizard

---

### Phase 5 — Polish

**Step 10: Styling & responsive** — mobile-first, violet accent, dark mode, minimal top bar with app name
**Step 11: Error handling** — `Banner.vue` error alerts, file validation, loading states
**Step 12: Deployment config** — `netlify.toml` SPA routing, `OPENAI_API_KEY` env var

---

### Relevant Files

**Modify:**

- `web/src/App.vue`, `web/src/router.js`, `web/package.json`

**Reference patterns from:**

- `web/src/pages/Onboarding01.vue` — progress bar, step layout
- `web/src/partials/messages/MessagesBody.vue` — message bubble styling
- `web/src/components/Banner.vue` — error/success alerts
- `fill_documents/code/gpt_utils.py` — OpenAI call pattern

**Create (8 new files):**

- `web/src/pages/CaseWizard.vue` — wizard orchestrator
- `web/src/components/steps/StepDescribe.vue` — problem description
- `web/src/components/steps/StepFollowUp.vue` — AI follow-up questions
- `web/src/components/steps/StepProcessing.vue` — analysis in progress
- `web/src/components/steps/StepResults.vue` — score + explanation
- `web/netlify.toml` — Netlify config
- `web/netlify/functions/generate-questions.js` — question generation API
- `web/netlify/functions/analyze-case.js` — case analysis API

---

### Verification

1. `pnpm dev` — wizard loads at `/`, no broken imports
2. Step 1a: fill description, upload PDF, see file in list, click "Naprej"
3. Step 1b: loading spinner → questions render → fill answers
4. Step 2: processing animation → API fires → auto-advance
5. Step 3: percentage gauge + explanation + "Nova analiza" resets
6. `npx netlify dev` — both functions respond locally
7. Error: disconnect network → error banner with retry
8. Responsive + dark mode passes visual check

---

### Decisions

- **Netlify serverless** over Express — matches existing `_redirects`, simpler deployment
- **Minimal app** — all template chrome removed for single-purpose wizard
- **Basic questions deferred** — configurable array ready, user fills in later
- **GPT-4o-mini** for question generation (fast/cheap), **GPT-4o** for final analysis (accurate)
- **Files as base64** in request body (Netlify 6MB limit — flag for large files later)
- Steps 1a/1b are sub-steps of "Step 1" — progress bar shows 3 main steps

### Further Considerations

1. **File size**: Netlify's 6MB body limit may be hit with large PDFs. Could add client-side PDF text extraction via `pdf.js` if needed.
2. **Session persistence**: State lost on refresh. `localStorage` persistence can be added in v2.
3. **Rate limiting**: No auth or rate limiting on serverless functions initially. Add if deploying publicly.

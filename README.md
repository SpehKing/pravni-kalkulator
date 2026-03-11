# 🌐 Live Demo: [ailaw-omega.vercel.app](https://ailaw-omega.vercel.app)

# LegalAI Intake — AI-Powered Client Intake System for Law Firms

An end-to-end intelligent intake system that processes incoming client emails, classifies their legal matter, assesses compliance risk, matches them with the right attorney, and generates a personalized, professional response — all in seconds.

---

## Overview

When a potential client sends an email to a law firm, a significant amount of skilled attorney time is spent on tasks that are largely procedural: understanding the type of legal matter, checking for conflicts of interest, assessing AML/KYC risk, identifying relevant deadlines, and drafting an initial response. **LegalAI Intake** automates this entire pipeline, allowing attorneys to focus on what they do best — practicing law.

The system ingests a raw client email (including attachments), runs it through a multi-step LLM pipeline, and produces:

- A classified legal area with attorney recommendations
- A conflict-of-interest and AML/KYC compliance check
- Key questions the client still needs to answer
- An actionable timeline of expected process phases
- Early warnings for critical legal pitfalls
- A polished, personalized draft response ready to send

All output is surfaced on an internal attorney dashboard, with a clean email preview for client-facing communication.

---

## Architecture

```
Client Email (raw text + attachments)
        │
        ▼
┌─────────────────────────────────┐
│   A: INTAKE & ANALYSIS PIPELINE │
└─────────────────────────────────┘
        │
        ├─► [1] Legal Area Classification
        │       └─ LLM prompt: classify into 12 legal domains
        │           (Tax, Employment, IP, M&A, GDPR, etc.)
        │           5-shot prompting for improved accuracy
        │
        ├─► [2] Attorney Matching
        │       └─ Filter attorneys by legal domain + workload
        │           LLM selects best fit using attorney profiles
        │
        ├─► [3] Case Analysis
        │       └─ Key missing info extraction
        │           Clarifying questions for the client
        │
        ├─► [4] Timeline Generation
        │       └─ LLM extracts process phases, durations
        │           Rendered as an interactive visual timeline
        │
        └─► [5] Early Warnings
                └─ Domain-specific critical legal flags
                    (e.g. absolute novelty in IP, AML thresholds)

┌─────────────────────────────────┐
│   B: COMPLIANCE PIPELINE        │
└─────────────────────────────────┘
        │
        ├─► [1] Conflict of Interest Check
        │       └─ Cross-reference client against past/active matters
        │
        ├─► [2] AML / KYC Screening
        │       └─ Risk classification (low / medium / high)
        │           Based on ZPPDFT-2 framework
        │           High-risk → flagged for human compliance review
        │
        ├─► [3] PEP Screening
        │       └─ LLM web search for political exposure indicators
        │           Boolean output → auto-hold if True
        │
        └─► [4] Deadline Detection
                └─ Urgency classifier (red / orange / green)
                    Extracts timestamps, computes remaining time

┌─────────────────────────────────┐
│   FRONTEND (Vue.js Dashboard)   │
└─────────────────────────────────┘
        │
        ├─► EmailIntake.vue      — Full pipeline UI, email preview
        ├─► LawyerDashboard.vue  — Attorney availability & workload
        └─► CaseWizard.vue       — Step-by-step case intake wizard
```

### Tech Stack

| Layer          | Technology                                     |
| -------------- | ---------------------------------------------- |
| Frontend       | Vue.js 3, Vite, Tailwind CSS 4, Vue Router     |
| LLM            | OpenAI GPT-4o (async, multi-step pipeline)     |
| Classification | 5-shot prompting over 12 legal domains         |
| Data           | Structured attorney & case reference databases |
| Document Gen   | LaTeX + pdflatex (for formal legal documents)  |
| Deployment     | Vercel                                         |

---

## Classification: 5-Shot Prompting

Legal area classification uses a **5-shot prompting approach** — each LLM call is preceded by five curated examples of real client queries mapped to their correct legal domain. This significantly improves classification accuracy compared to zero-shot inference, especially for ambiguous or multi-domain queries (e.g. a GDPR breach in an M&A context).

The system currently classifies across 12 domains:
`Tax Law · Employment Law · Insolvency · IP · Public Procurement · Commercial Contracts · Competition Law · Corporate Law · Immigration · Dispute Resolution · M&A · Data Protection`

---

## Key Features

**Attorney Dashboard** — Real-time view of attorney availability and workload. The system highlights the best-matched attorneys for each incoming case based on domain expertise and current capacity.

**Visual Timeline** — The LLM extracts expected process phases and durations from the case description and renders them as an interactive timeline. Clients receive a clear picture of what to expect. Includes a disclaimer that estimates are preliminary and based on incomplete information.

**Early Warnings** — Domain-specific alerts for critical legal pitfalls that clients must not overlook. Examples: disclosure of an invention before patent filing destroys absolute novelty; GDPR breaches carry a 72-hour notification deadline; M&A transactions may trigger mandatory public offer thresholds.

**Multilingual Support** — The pipeline detects the input language and ensures both intake processing and client-facing output are in the client's language.

**Estimated Fee Guidance** — Based on the legal classification and estimated hours per matter type, the system computes a preliminary fee range using the firm's hourly rate.

---

## Future Steps

### Fine-Tuned BERT for Legal Domain Classification

The current 5-shot GPT-4o classifier performs well but relies on a general-purpose LLM. A dedicated **fine-tuned BERT model** (or a Slovenian legal domain variant) trained on annotated case law and client intake queries would provide faster, cheaper, and more reliable classification — particularly for edge cases and mixed-domain queries. This is a natural next step once sufficient labeled training data is accumulated.

### Fine-Tuned LLM for Legal Analysis

Replacing the general-purpose GPT-4o backbone with a **fine-tuned LLM** trained on Slovenian court decisions (Sodna Praksa), legal commentary, and firm-specific case outcomes would dramatically improve the quality of case analysis, early warnings, and timeline estimation. A fine-tuned model would understand Slovenian legal terminology natively, reason about jurisdiction-specific rules without extensive prompting, and produce outputs that require less attorney review before sending.

### Automated Case File Generation

Pre-filling the firm's internal case-opening form (client name, matter description, legal area, assigned attorney, conflict status, AML classification) once an attorney confirms the intake — eliminating the remaining administrative overhead.

### Expanded Compliance Engine

Deeper integration with AJPES and public registries for automated entity enrichment during conflict and AML checks, reducing reliance on manual data entry.

---

## Scenarios Demonstrated

The system is tested against five representative client scenarios:

1. **Deeptech Startup** — IP protection and licensing before negotiations with a foreign partner; conflict-of-interest trigger
2. **E-commerce (GDPR breach)** — Data breach affecting 12,000 customers; 72-hour notification deadline active
3. **Foreign subsidiary (Employment dispute)** — Wrongful termination claim; multilingual input (SLO/ENG); conflict check on parent company
4. **German M&A** — Acquisition of a Slovenian company; IP, employment, and GDPR due diligence; AML/KYC required
5. **UAE Holding (High AML risk)** — Asset management subsidiary setup; opaque ownership, cash contributions; system recommends rejection or enhanced review

---

## Setup

```bash
# Frontend
cd web
pnpm install
pnpm dev

# Python pipeline (LLM processing)
source lawenv/bin/activate
python fill_documents/code/main.py
```

Requires an OpenAI API key in `.env` at the project root.

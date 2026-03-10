# Prvi Odziv Naprednega Odvetnika — Requirements, Implementation & Test Cases

**Challenge sponsor:** Odvetniška pisarna Jadek & Pensa
**Hackathon:** AIxPravo Hekaton, 11. marca 2026, FMF Ljubljana
**Team:** Law Brainer

---

## 1. Challenge Summary

Build an AI tool that transforms incoming client emails into two simultaneous outputs:

- **Result A — Draft client email** (for lawyer review before sending)
- **Result B — Internal compliance dashboard** (conflict check, AML/KYC, deadlines, capacity)

The tool replaces the empty "we received your email" auto-reply with a substantive first response + compliance analysis, saving ~1 day/month of lawyer time and winning clients through speed.

**Judging emphasis:** High-level conceptual solutions covering MANY proposed elements > narrow deep execution of few. But solutions must be realistic and practical, not hypothetical.

---

## 2. Requirements List

### 2.1 CORE REQUIREMENTS (Preferred Features — Higher Points)

#### REQ-1: Email Parsing & Issue Classification

- **Input:** Client email (plain text, HTML, or .eml)
- **Output:** Classification into one or more legal domains: IP, GDPR/privacy, M&A, employment, corporate/commercial, dispute resolution, tax, regulatory, technology contracts
- **Must handle:** Ambiguous/multi-issue emails, mixed Slovenian/English text
- **Must handle:** Vague inquiries (like Email 5 — UAE holding company)

#### REQ-2: Problem Summary Generation

- Generate 3–5 sentence restatement of the client's problem
- Use precise legal terminology but keep it client-accessible
- **MUST NOT hallucinate facts** not present in the original email

#### REQ-3: Team Matching

- Match inquiry to 2–3 best-suited lawyers from a firm knowledge base
- Knowledge base contains: lawyer profiles, specializations, experience descriptions, seniority
- Provide brief explanation of why each lawyer is relevant
- **Data:** Create mock `lawyers.json` with ~8-10 lawyer profiles

#### REQ-4: Targeted Follow-up Questions

- Generate 3–5 specific, practical questions tailored to the problem
- NOT generic intake questions — senior-lawyer-level scoping questions
- Example for GDPR: "Have you identified whether the exposed data includes special category data under Article 9?"

#### REQ-5: Conflict of Interest Check

- Extract all entity names (persons, companies, counterparties, targets) from email
- Cross-reference against firm's client/matter database (mock `clients.json`)
- Output status per entity: `NO_CONFLICT` | `POTENTIAL_CONFLICT` | `CONFLICT_DETECTED`
- If conflict detected: flag prominently, suppress client email draft until lawyer reviews
- **Data:** Create mock `clients.json` with ~15-20 entries that include deliberate matches for test emails

#### REQ-6: AML/KYC Risk Screening

- Analyze email for AML risk indicators per ZPPDFT-2 and EU AML Directive
- Indicators: client type, jurisdictions, transaction complexity, beneficial ownership transparency, source of funds, urgency patterns, red flags
- Output: risk classification (`STANDARD` | `ENHANCED` | `REFUSE`), list of specific red flags, KYC document checklist
- Must flag high-risk third countries (UAE, etc.), opaque structures, cash-intensive deals, urgency pressure

### 2.2 BONUS REQUIREMENTS (Lower Points But Impressive)

#### REQ-7: Firm Experience Matching

- Retrieve relevant past matters/case studies from firm knowledge base
- Output: 1–2 sentences suitable for the client email showing credibility

#### REQ-8: Multilingual Handling

- Process Slovenian, English, or mixed-language emails
- Respond in the same language as the incoming email (or configurable preferred language)

#### REQ-9: Urgency Detection with Deadline Countdown

- Detect time-sensitive elements: 72-hour GDPR notification, statute of limitations, contractual deadlines
- Calculate remaining time from email timestamp
- Display countdown timers in internal dashboard
- Adjust client email tone/timeline accordingly

#### REQ-10: Attachment-Aware Processing

- If email references attachments, incorporate them into analysis
- Support: PDF, DOCX, plain text attachments

#### REQ-11: Preliminary Scope & Fee Indication (Internal Only)

- Estimate likely scope (hours, workstreams) and fee range
- Draw from a fee matrix by matter type
- Stays internal — NOT in client email

#### REQ-12: Matter Opening Form Auto-Population

- Auto-fill: client name, matter description, practice area, responsible lawyer, conflict status, AML classification, estimated value
- Ready for lawyer to approve and trigger administrative setup

#### REQ-13: Firm Capacity Check

- Query internal workload database for team availability
- Status: `GREEN` (available) | `AMBER` (stretched) | `RED` (unavailable)
- Let lawyer assess if taking the matter is realistic

---

## 3. Architecture & Technology Stack

### 3.1 Tech Stack

| Layer             | Technology                                                              | Rationale                                         |
| ----------------- | ----------------------------------------------------------------------- | ------------------------------------------------- |
| Frontend          | React (existing Mosaic template site)                                   | Already built, has dashboard/chat/form components |
| AI Backend        | Anthropic Claude API (claude-sonnet-4-20250514)                         | Fast, high-quality reasoning, handles Slovenian   |
| Email Parsing     | Custom prompt + Claude API                                              | Cheaper/faster than training a model              |
| Entity Extraction | Claude API structured output (JSON mode)                                | Reliable NER for legal entities                   |
| Conflict Check    | Local JSON matching + fuzzy string matching                             | Simple, deterministic, testable                   |
| AML Screening     | Rule-based flags + Claude API analysis                                  | Combine hard rules with LLM reasoning             |
| Mock Data         | JSON files (lawyers, clients, matters, fees)                            | No database needed for hackathon                  |
| Language          | TypeScript/JavaScript (frontend), Python optional for backend utilities |

### 3.2 System Flow

```
[Client Email Input]
       │
       ▼
[Step 1: Parse & Classify]
  - Extract email text
  - Classify legal domains
  - Detect language
  - Extract entities (names, companies, jurisdictions)
  - Detect urgency/deadlines
       │
       ▼
[Step 2: Parallel Processing]
  ┌────┴────┐
  │         │
  ▼         ▼
[Result A]  [Result B]
 Client     Compliance
 Draft      Dashboard
  │         │
  │         ├─ Conflict check (entity matching)
  │         ├─ AML/KYC screening
  │         ├─ Deadline detection
  │         └─ Capacity check
  │
  ├─ Summary
  ├─ Team match
  ├─ Firm experience
  ├─ Follow-up questions
  └─ Next steps
       │
       ▼
[Step 3: Display Both Results]
  - Left panel: Draft email (editable)
  - Right panel: Compliance dashboard
  - If CONFLICT → block email sending, show warning
```

---

## 4. Implementation Plan (Step-by-Step Chunks)

### Phase 1: Mock Data & Foundation (30 min)

#### Step 1.1: Create Mock Data Files

**`data/lawyers.json`** — Array of 8-10 lawyer profiles:

```json
[
  {
    "id": "L001",
    "name": "Ana Novak",
    "title": "Partner",
    "specializations": ["IP", "technology_contracts", "M&A"],
    "experience_description": "15 years in IP litigation and technology licensing, led 50+ patent and trade secret matters",
    "languages": ["sl", "en", "de"],
    "current_workload": "medium",
    "email": "ana.novak@jadek-pensa.si"
  }
]
```

Include at least: 2 IP lawyers, 2 GDPR/privacy, 2 M&A, 1 employment, 1 corporate/AML specialist, 1 dispute resolution.

**`data/clients.json`** — Array of 15-20 client/matter records:

```json
[
  {
    "id": "C001",
    "client_name": "TechVision GmbH",
    "matter_description": "Patent licensing agreement review",
    "practice_area": "IP",
    "responsible_lawyer": "L001",
    "status": "active",
    "counterparties": ["IndustrieWerk AG"],
    "date_opened": "2024-06-15"
  }
]
```

**CRITICAL:** Include entries that deliberately match test email entities:

- Email 1: German partner name should match an existing client → create "IndustrieWerk AG" or similar as existing client
- Email 4: Target Slovenian software company should match a former client
- Other entries for realistic conflict checking

**`data/fee_matrix.json`** — Fee ranges by matter type:

```json
{
  "IP_protection": {
    "min_hours": 20,
    "max_hours": 60,
    "hourly_rate": 250,
    "description": "IP audit + filing"
  },
  "GDPR_breach": {
    "min_hours": 15,
    "max_hours": 40,
    "hourly_rate": 280,
    "description": "Breach response + notification"
  },
  "M&A_due_diligence": {
    "min_hours": 80,
    "max_hours": 200,
    "hourly_rate": 300,
    "description": "Full DD across workstreams"
  },
  "employment_dispute": {
    "min_hours": 10,
    "max_hours": 30,
    "hourly_rate": 220,
    "description": "Dispute advisory + representation"
  },
  "corporate_setup": {
    "min_hours": 15,
    "max_hours": 40,
    "hourly_rate": 260,
    "description": "Subsidiary incorporation + compliance"
  }
}
```

**`data/firm_experience.json`** — Anonymized past matters for credibility:

```json
[
  {
    "practice_area": "IP",
    "description": "Advised a leading Slovenian tech company on a multi-jurisdictional patent portfolio strategy involving 5 EU countries.",
    "year": 2024
  }
]
```

#### Step 1.2: Create Test Email Files

**`data/test_emails/email1_startup_ip.txt`**

```
From: Marko Kovač <marko@deepmaint.si>
To: info@jadek-pensa.si
Subject: Zaščita intelektualne lastnine pred licenčnimi pogajanji
Date: Mon, 10 Mar 2026 08:15:00 +0100

Spoštovani,

sem CTO podjetja DeepMaint d.o.o., slovenskega deeptech startupa. Razvili smo nov algoritem za prediktivno vzdrževanje v proizvodnji. Trenutno nimamo nobenih patentov.

Imamo tri soustanovitelje. Eden od njih, Gregor Zupan, zapušča podjetje in nismo prepričani, kako je z dodelitvijo IP pravic iz njegove pogodbe o zaposlitvi.

Kmalu vstopamo v pogajanja z nemškim industrijskim partnerjem IndustrieWerk AG, ki želi licencirati našo tehnologijo. Ali nam lahko pomagate zaščititi našo intelektualno lastnino, preden karkoli podpišemo?

Hvala in lep pozdrav,
Marko Kovač
CTO, DeepMaint d.o.o.
```

**`data/test_emails/email2_gdpr_breach.txt`**

```
From: Petra Krajnc <petra.krajnc@webshop.si>
To: info@jadek-pensa.si
Subject: URGENT: Data breach - need immediate legal help
Date: Mon, 10 Mar 2026 07:30:00 +0100

Dear Jadek & Pensa team,

I am the Head of Legal at WebShop d.o.o., a mid-sized Slovenian e-commerce company.

Over the weekend (Saturday evening), we discovered that a third-party marketing platform we use (MarketPulse) exposed customer email addresses and purchase histories of approximately 12,000 customers. We have contained the breach as of Sunday morning, but we have NOT made any notifications — neither to the Information Commissioner nor to affected customers.

We are unsure about our exact obligations and timelines. Can you help us urgently?

Best regards,
Petra Krajnc
Head of Legal, WebShop d.o.o.
```

**`data/test_emails/email3_employment.txt`**

```
From: Sarah Mitchell <s.mitchell@globalcorp-si.com>
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
HR Director, GlobalCorp Slovenija d.o.o.
```

**`data/test_emails/email4_ma_due_diligence.txt`**

```
From: Dr. Klaus Weber <k.weber@techacquire.de>
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
General Counsel, TechAcquire GmbH
```

**`data/test_emails/email5_aml_red_flags.txt`**

```
From: Ahmed Al-Rashid <a.rashid@arabesque-holdings.ae>
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
Dubai, UAE
```

### Phase 2: Core API Integration (45 min)

#### Step 2.1: Email Parsing & Classification Service

Create a service function that sends the email to Claude API with a structured prompt:

```typescript
// services/emailAnalyzer.ts

interface EmailAnalysis {
  language: "sl" | "en" | "mixed";
  legal_domains: string[]; // ["IP", "GDPR", "M&A", ...]
  entities: ExtractedEntity[]; // persons, companies, jurisdictions
  urgency: "normal" | "high" | "critical";
  deadlines: Deadline[]; // detected time-sensitive elements
  summary: string; // 3-5 sentence problem summary
  key_facts: string[]; // bullet points of key facts
}

interface ExtractedEntity {
  name: string;
  type: "person" | "company" | "jurisdiction" | "counterparty";
  role: string; // e.g., "sender", "opposing_party", "target_company"
}

interface Deadline {
  description: string;
  deadline_type: "statutory" | "contractual" | "regulatory";
  hours_remaining: number | null;
  source: string; // e.g., "GDPR Art. 33 — 72h breach notification"
}
```

**Claude API prompt structure:**

```
System: You are a senior legal intake analyst at a Slovenian law firm.
Analyze the incoming client email and return ONLY a JSON object with the
following structure: { language, legal_domains, entities, urgency, deadlines,
summary, key_facts }

Rules:
- Do NOT hallucinate facts not present in the email
- Extract ALL entity names (people, companies, jurisdictions)
- For urgency: "critical" if statutory deadline running, "high" if client
  says urgent, "normal" otherwise
- For deadlines: calculate hours_remaining from email timestamp
- legal_domains must be from: [IP, GDPR, M&A, employment, corporate,
  dispute_resolution, tax, regulatory, technology_contracts, AML]
```

#### Step 2.2: Conflict Check Service

```typescript
// services/conflictChecker.ts

interface ConflictResult {
  status: "NO_CONFLICT" | "POTENTIAL_CONFLICT" | "CONFLICT_DETECTED";
  matches: ConflictMatch[];
  block_email: boolean; // true if any CONFLICT_DETECTED
}

interface ConflictMatch {
  extracted_entity: string;
  matched_client: string;
  match_type: "exact" | "fuzzy" | "related";
  confidence: number;
  details: string;
}
```

Implementation approach:

1. Take entities from Step 2.1
2. Normalize names (lowercase, remove legal suffixes like d.o.o., GmbH, Ltd)
3. Exact match against `clients.json` client names + counterparties
4. Fuzzy match using Levenshtein distance (threshold: 0.85 similarity)
5. If any match found: `CONFLICT_DETECTED` (exact) or `POTENTIAL_CONFLICT` (fuzzy)

#### Step 2.3: AML/KYC Screening Service

```typescript
// services/amlScreener.ts

interface AMLResult {
  risk_level: "STANDARD" | "ENHANCED" | "REFUSE";
  red_flags: RedFlag[];
  kyc_documents_required: string[];
  zppdft2_applicable: boolean;
  reasoning: string;
}

interface RedFlag {
  flag: string;
  severity: "low" | "medium" | "high";
  source: string; // which part of email triggered this
}
```

Rule-based flags (check before sending to Claude API):

- High-risk jurisdictions: UAE, BVI, Cayman Islands, Panama, etc.
- Opaque beneficial ownership / complex multi-layered structures
- Cash-intensive transactions (> EUR 15,000 cash)
- Unusual urgency pressure
- Vague business purpose
- PEP indicators

Then send to Claude for contextual analysis with ZPPDFT-2 awareness.

#### Step 2.4: Team Matching Service

```typescript
// services/teamMatcher.ts

interface TeamMatch {
  lawyers: LawyerMatch[];
  firm_experience: string[]; // relevant past matter descriptions
}

interface LawyerMatch {
  lawyer: Lawyer;
  relevance_score: number;
  match_reason: string;
}
```

Matching logic:

1. Map legal_domains from analysis to lawyer specializations
2. Score by: specialization match → seniority → workload availability → language match
3. Return top 2-3 with explanation

### Phase 3: Response Generation (30 min)

#### Step 3.1: Client Email Draft Generator

Send to Claude API with all context:

- Original email
- Email analysis (domains, summary, entities)
- Matched lawyers
- Firm experience
- Conflict status (if clear, include; if blocked, don't generate)

**Output structure:**

```typescript
interface ClientEmailDraft {
  subject: string;
  greeting: string;
  summary_paragraph: string; // "We understand that..."
  firm_experience_paragraph: string; // "Our firm has extensive..."
  proposed_team: string; // "Your matter would be led by..."
  follow_up_questions: string[]; // 3-5 tailored questions
  next_steps: string; // "We suggest a call on..."
  closing: string;
  full_draft: string; // combined HTML email
  language: "sl" | "en";
}
```

#### Step 3.2: Internal Dashboard Data Aggregator

Combine all analysis into dashboard-ready format:

```typescript
interface ComplianceDashboard {
  // Header
  client_name: string;
  matter_title: string;
  received_at: string;

  // Conflict section
  conflict: ConflictResult;

  // AML section
  aml: AMLResult;

  // Urgency section
  urgency: "normal" | "high" | "critical";
  deadlines: Deadline[];

  // Team section
  team: TeamMatch;
  capacity_status: "GREEN" | "AMBER" | "RED";

  // Fee estimate (internal)
  fee_estimate: {
    matter_type: string;
    hours_range: string;
    fee_range: string;
  };

  // Matter opening form
  matter_form: {
    client_name: string;
    matter_description: string;
    practice_area: string;
    responsible_lawyer: string;
    conflict_status: string;
    aml_classification: string;
    estimated_value: string;
  };
}
```

### Phase 4: Frontend UI (45 min)

#### Step 4.1: Email Input Page

- Text area for pasting email content
- File upload for .eml / .txt / .html files
- "Analyze" button to trigger processing
- Loading state with progress indicators

#### Step 4.2: Split-View Results Page

- **Left panel:** Draft client email (editable, with "Copy" / "Send" button)
  - If conflict detected: red banner blocking send, "Resolve Conflict First"
- **Right panel:** Compliance dashboard
  - Conflict status card (color-coded)
  - AML risk card (color-coded: green/amber/red)
  - Deadline countdown timers
  - Team capacity semaphore
  - Fee estimate card
  - Matter form (pre-filled, editable)

#### Step 4.3: Email Selection View (Optional)

- Show all 5 test emails as cards
- Click to select and auto-load into analyzer
- Good for demo/presentation flow

---

## 5. Test Cases

Each test case specifies input, expected outputs, and validation criteria. These should be used to verify the tool works correctly.

### Test Case 1: Email 1 — Startup IP Protection

**Input:** `email1_startup_ip.txt`

**Expected Result A (Client Draft):**

- Language: Slovenian
- Summary mentions: algorithm for predictive maintenance, no patents filed, co-founder leaving, German partner licensing negotiations
- Legal domains identified: IP (primary), corporate/employment (co-founder IP assignment)
- Follow-up questions should include:
  - Questions about existing IP assignment agreements with co-founders
  - Questions about the co-founder's employment/founder agreement
  - Questions about the timeline for German partner negotiations
  - Questions about the nature of the algorithm (patentable vs. trade secret)
- Team: Should include IP specialist + corporate lawyer

**Expected Result B (Compliance):**

- **Conflict check:** `CONFLICT_DETECTED` — "IndustrieWerk AG" matches existing client in database
- **Email draft must be BLOCKED** until conflict resolved
- **AML:** STANDARD risk (Slovenian startup, legitimate business)
- **Urgency:** HIGH (negotiations pending, but no statutory deadline)
- **Entities extracted:** DeepMaint d.o.o., Marko Kovač, Gregor Zupan, IndustrieWerk AG

**Validation assertions:**

```javascript
assert(analysis.legal_domains.includes("IP"));
assert(analysis.entities.some((e) => e.name.includes("IndustrieWerk")));
assert(conflict.status === "CONFLICT_DETECTED");
assert(conflict.block_email === true);
assert(aml.risk_level === "STANDARD");
assert(analysis.language === "sl");
assert(draft === null || draft.blocked === true); // No draft when conflict
```

### Test Case 2: Email 2 — GDPR Breach Response

**Input:** `email2_gdpr_breach.txt`

**Expected Result A (Client Draft):**

- Language: English
- Summary mentions: third-party platform breach, 12,000 customers, email + purchase data exposed, no notifications made
- Legal domains: GDPR/privacy (primary)
- Follow-up questions should include:
  - Whether exposed data includes special category data (Art. 9 GDPR)
  - Current data processing agreement with MarketPulse
  - Whether they've documented the breach per Art. 33(5) GDPR
  - Sub-processor list for MarketPulse
- Tone: URGENT — must reflect the criticality
- Team: GDPR specialist as lead

**Expected Result B (Compliance):**

- **Conflict check:** NO_CONFLICT (WebShop d.o.o. and MarketPulse not in client database)
- **AML:** STANDARD
- **Urgency:** CRITICAL
- **Deadlines:** 72-hour GDPR breach notification deadline (Art. 33 GDPR)
  - Email sent Monday 07:30, breach discovered Saturday evening
  - Countdown should show < 24 hours remaining (breach discovered ~Saturday 20:00, 72h = Tuesday 20:00, current = Monday 07:30 → ~36.5h remaining)
- **Entities extracted:** WebShop d.o.o., Petra Krajnc, MarketPulse

**Validation assertions:**

```javascript
assert(analysis.legal_domains.includes("GDPR"));
assert(analysis.urgency === "critical");
assert(analysis.deadlines.length > 0);
assert(analysis.deadlines[0].deadline_type === "regulatory");
assert(analysis.deadlines[0].hours_remaining < 48);
assert(conflict.status === "NO_CONFLICT");
assert(aml.risk_level === "STANDARD");
assert(analysis.language === "en");
assert(
  draft.follow_up_questions.some(
    (q) => q.includes("Article 9") || q.includes("special category"),
  ),
);
```

### Test Case 3: Email 3 — Employment Dispute (Mixed Language)

**Input:** `email3_employment.txt`

**Expected Result A (Client Draft):**

- Language: Mixed / English (primary language of email)
- Summary mentions: terminated employee, performance-based dismissal, retaliation claim, safety concerns, Slovenian subsidiary of UK parent
- Legal domains: employment (primary), dispute_resolution
- Follow-up questions should include:
  - Documentation of safety concern and company's response
  - Whether dismissal procedure followed ZDR-1 (Slovenian employment law)
  - Content of the internal emails the employee has
  - Whether the employee has already filed with the Labour Court

**Expected Result B (Compliance):**

- **Conflict check:** Must check "GlobalCorp International Ltd" (parent) against client database
  - If match found: `POTENTIAL_CONFLICT` (parent company is a client but subsidiary isn't)
  - If no match: `NO_CONFLICT`
- **AML:** STANDARD
- **Urgency:** HIGH (potential lawsuit imminent, but no statutory countdown)
- **Entities extracted:** GlobalCorp Slovenija d.o.o., GlobalCorp International Ltd, Sarah Mitchell, Janez Horvat

**Validation assertions:**

```javascript
assert(analysis.legal_domains.includes("employment"));
assert(analysis.language === "en" || analysis.language === "mixed");
assert(analysis.entities.some((e) => e.name.includes("GlobalCorp")));
assert(analysis.entities.some((e) => e.name === "Janez Horvat"));
assert(analysis.urgency === "high" || analysis.urgency === "normal");
assert(aml.risk_level === "STANDARD");
```

### Test Case 4: Email 4 — Tech M&A Due Diligence

**Input:** `email4_ma_due_diligence.txt`

**Expected Result A (Client Draft):**

- Language: English
- Summary mentions: acquisition of Slovenian software company, four DD workstreams (IP, open source, employment, GDPR)
- Legal domains: M&A (primary), IP, employment, GDPR
- Should propose a team covering all four workstreams
- Follow-up questions about: timeline expectations, exclusivity period, data room access, target company size/employee count

**Expected Result B (Compliance):**

- **Conflict check:** "CodeNova d.o.o." should match a former client in database → `POTENTIAL_CONFLICT`
- **AML:** `ENHANCED` — M&A transactions trigger enhanced due diligence under ZPPDFT-2
- **Urgency:** NORMAL (no statutory deadline)
- **Fee estimate:** M&A DD range (80-200 hours, higher fee bracket)
- **Entities extracted:** TechAcquire GmbH, Dr. Klaus Weber, CodeNova d.o.o.

**Validation assertions:**

```javascript
assert(analysis.legal_domains.includes("M&A"));
assert(analysis.legal_domains.includes("IP"));
assert(analysis.legal_domains.includes("GDPR"));
assert(analysis.entities.some((e) => e.name.includes("CodeNova")));
assert(
  conflict.status === "POTENTIAL_CONFLICT" ||
    conflict.status === "CONFLICT_DETECTED",
);
assert(aml.risk_level === "ENHANCED");
assert(analysis.language === "en");
assert(teamMatch.lawyers.length >= 2);
```

### Test Case 5: Email 5 — AML Red Flags (UAE Holding)

**Input:** `email5_aml_red_flags.txt`

**Expected Result A (Client Draft):**

- Language: English
- Summary mentions: UAE holding company, Slovenian subsidiary, IP asset management, BVI entity, cash contribution
- Legal domains: corporate (primary), IP, AML
- Draft should be CAUTIOUS in tone — no commitments, request for information
- Follow-up questions should be KYC-focused:
  - Beneficial ownership structure
  - Source of funds for EUR 2M cash
  - Purpose and nature of IP assets
  - Identity of the BVI entity

**Expected Result B (Compliance):**

- **Conflict check:** NO_CONFLICT (new entity, not in database)
- **AML:** `REFUSE` or at minimum `ENHANCED`
- **Red flags detected (minimum):**
  - UAE jurisdiction (high-risk third country considerations)
  - BVI entity (opaque jurisdiction)
  - Complex multi-layered structure (UAE → BVI → Slovenia)
  - Cash contribution of EUR 2,000,000
  - Urgency pressure ("within 2 weeks", "time is of the essence")
  - Vague business purpose ("manage European IP assets")
  - Recently formed entity
- **KYC documents required (minimum):**
  - Certified copies of incorporation documents (UAE + BVI entities)
  - Beneficial ownership declaration + supporting evidence
  - Source of funds documentation
  - Proof of legitimate business purpose
  - Identity documents of all beneficial owners
  - Corporate structure chart
- **Dashboard must prominently flag this as highest risk**

**Validation assertions:**

```javascript
assert(aml.risk_level === "ENHANCED" || aml.risk_level === "REFUSE");
assert(aml.red_flags.length >= 5);
assert(
  aml.red_flags.some(
    (f) =>
      f.flag.toLowerCase().includes("uae") ||
      f.flag.toLowerCase().includes("jurisdiction"),
  ),
);
assert(
  aml.red_flags.some(
    (f) =>
      f.flag.toLowerCase().includes("cash") ||
      f.flag.toLowerCase().includes("funds"),
  ),
);
assert(
  aml.red_flags.some(
    (f) =>
      f.flag.toLowerCase().includes("urgency") ||
      f.flag.toLowerCase().includes("pressure"),
  ),
);
assert(
  aml.red_flags.some(
    (f) =>
      f.flag.toLowerCase().includes("opaque") ||
      f.flag.toLowerCase().includes("bvi") ||
      f.flag.toLowerCase().includes("structure"),
  ),
);
assert(aml.kyc_documents_required.length >= 5);
assert(conflict.status === "NO_CONFLICT");
assert(analysis.language === "en");
```

### Cross-Cutting Test Cases

#### TC-6: All 5 Emails Produce Both Outputs

```javascript
for (const email of testEmails) {
  const result = await analyzeEmail(email);
  assert(
    result.clientDraft !== undefined,
    `Email ${email.id}: missing client draft`,
  );
  assert(
    result.complianceDashboard !== undefined,
    `Email ${email.id}: missing dashboard`,
  );
  assert(result.complianceDashboard.conflict !== undefined);
  assert(result.complianceDashboard.aml !== undefined);
}
```

#### TC-7: Conflict Blocks Email Sending

```javascript
const result1 = await analyzeEmail(email1); // has conflict with IndustrieWerk AG
assert(result1.complianceDashboard.conflict.block_email === true);
assert(result1.clientDraft.sendable === false);
// UI should show red "CONFLICT" banner
```

#### TC-8: Entity Extraction Completeness

```javascript
// Each email should extract at least 2 entities
for (const email of testEmails) {
  const analysis = await analyzeEmail(email);
  assert(
    analysis.entities.length >= 2,
    `Email ${email.id}: insufficient entities`,
  );
  assert(analysis.entities.every((e) => e.name && e.type && e.role));
}
```

#### TC-9: No Hallucination Check

```javascript
// Summary should not contain facts not in the original email
const result2 = await analyzeEmail(email2);
// Summary should NOT mention "personal data" if original says "email addresses and purchase histories"
// Summary should NOT invent a fine amount
// Summary should NOT assume breach was intentional
assert(!result2.clientDraft.summary.includes("fine")); // no invented consequences
assert(!result2.clientDraft.summary.includes("intentional")); // no invented intent
```

#### TC-10: Language Detection & Response Matching

```javascript
const result1 = await analyzeEmail(email1); // Slovenian email
assert(result1.clientDraft.language === "sl");

const result2 = await analyzeEmail(email2); // English email
assert(result2.clientDraft.language === "en");

const result3 = await analyzeEmail(email3); // Mixed
assert(
  result3.clientDraft.language === "en" ||
    result3.clientDraft.language === "mixed",
);
```

---

## 6. Mock Data Specifications

### 6.1 Lawyers Database (for conflict triggers)

Ensure `clients.json` contains these entries to trigger test cases:

- `"IndustrieWerk AG"` as active client (triggers Email 1 conflict)
- `"CodeNova d.o.o."` as former client (triggers Email 4 conflict)
- `"GlobalCorp International Ltd"` — optionally add for Email 3

### 6.2 AML Red Flag Rules

Hard-coded list for rule-based pre-screening before Claude API:

```typescript
const HIGH_RISK_JURISDICTIONS = [
  "UAE",
  "United Arab Emirates",
  "Dubai",
  "Abu Dhabi",
  "BVI",
  "British Virgin Islands",
  "Cayman Islands",
  "Panama",
  "Seychelles",
  "Belize",
  "Vanuatu",
];

const AML_KEYWORDS = [
  "cash contribution",
  "cash payment",
  "urgent",
  "time is of the essence",
  "as quickly as possible",
  "holding company",
  "IP assets",
  "IP transfer",
  "beneficial owner",
  "nominee",
  "trust",
];

const ZPPDFT2_THRESHOLDS = {
  cash_transaction_reporting: 15000, // EUR
  enhanced_dd_trigger: true, // for lawyers under ZPPDFT-2
};
```

---

## 7. Presentation Tips for Demo

1. **Start with Email 2 (GDPR breach)** — most visually impressive because of the countdown timer and urgency indicators
2. **Then Email 5 (AML red flags)** — shows compliance power with multiple red flags lit up
3. **Then Email 1 (IP/conflict)** — shows conflict blocking the email send
4. **Briefly show Email 4 (M&A)** — demonstrates multi-workstream team matching
5. **Close with the "Monday morning" narrative** — "5 emails, all analyzed in under 60 seconds, lawyer saves a full day"

---

## 8. File Structure Summary

```
project/
├── data/
│   ├── lawyers.json
│   ├── clients.json
│   ├── fee_matrix.json
│   ├── firm_experience.json
│   └── test_emails/
│       ├── email1_startup_ip.txt
│       ├── email2_gdpr_breach.txt
│       ├── email3_employment.txt
│       ├── email4_ma_due_diligence.txt
│       └── email5_aml_red_flags.txt
├── services/
│   ├── emailAnalyzer.ts       (REQ-1, REQ-2, REQ-4, REQ-8, REQ-9)
│   ├── conflictChecker.ts     (REQ-5)
│   ├── amlScreener.ts         (REQ-6)
│   ├── teamMatcher.ts         (REQ-3, REQ-7, REQ-13)
│   ├── draftGenerator.ts      (REQ-2, REQ-4, REQ-7)
│   └── dashboardAggregator.ts (REQ-11, REQ-12)
├── components/
│   ├── EmailInput.tsx          (Step 4.1)
│   ├── ResultsView.tsx         (Step 4.2)
│   ├── ClientDraftPanel.tsx    (left panel)
│   ├── ComplianceDashboard.tsx (right panel)
│   ├── ConflictCard.tsx
│   ├── AMLCard.tsx
│   ├── DeadlineTimer.tsx
│   ├── TeamCapacity.tsx
│   ├── FeeEstimate.tsx
│   └── MatterForm.tsx
└── tests/
    ├── email1.test.ts
    ├── email2.test.ts
    ├── email3.test.ts
    ├── email4.test.ts
    ├── email5.test.ts
    └── crosscutting.test.ts
```

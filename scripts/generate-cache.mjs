/**
 * Generate cached API responses for all 5 test emails.
 * Run: node scripts/generate-cache.mjs
 * Outputs: src/data/testEmailCache.js
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Load API key from .env
const envFile = readFileSync(join(root, "..", ".env"), "utf8");
const apiKey = envFile.match(/OPENAI_API_KEY=(.+)/)?.[1]?.trim();
if (!apiKey) {
  console.error("No OPENAI_API_KEY in .env");
  process.exit(1);
}

const openai = new OpenAI({ apiKey });

// Load data files
const lawyers = JSON.parse(
  readFileSync(join(root, "api/data/lawyers.json"), "utf8"),
);
const feeMatrix = JSON.parse(
  readFileSync(join(root, "api/data/fee_matrix.json"), "utf8"),
);
const firmExperience = JSON.parse(
  readFileSync(join(root, "api/data/firm_experience.json"), "utf8"),
);
const firmReferences = JSON.parse(
  readFileSync(join(root, "api/data/firm_references.json"), "utf8"),
);
const clients = JSON.parse(
  readFileSync(join(root, "api/data/clients.json"), "utf8"),
);

// Map Slovenian domains → keywords (for pre-filtering lawyers by work description)
const DOMAIN_KEYWORDS = {
  "Davčno pravo": ["davčn", "davek", "ddv"],
  "Delovno pravo": ["delovn", "zaposlen", "delavsk"],
  "Insolvenčno pravo in prestrukturiranja": [
    "insolvenčn",
    "prestrukturir",
    "stečaj",
  ],
  "Intelektualna lastnina": [
    "intelektualna lastnin",
    "patent",
    "blagovna znamka",
    "avtorsk",
  ],
  "Javno naročanje": ["javno naroča", "infrastrukturni"],
  "Komercialne pogodbe": ["pogodb", "komercialn"],
  "Konkurenčno pravo": ["konkurenčn", "konkurenc"],
  "Korporacijsko pravo": ["korporacijsk", "kapitalsk", "delničarsk"],
  "Migracijsko pravo": ["migracij", "tujci"],
  "Preprečevanje in reševanje sporov": ["spor", "arbitraž", "pravd"],
  "Prevzemi in združitve": ["prevzem", "združitev", "M&A", "transakcij"],
  "Varstvo osebnih podatkov": ["GDPR", "osebni podatk", "varstvo podatk"],
};

// --- Test emails (same as EmailInput.vue) ---
const testEmails = [
  {
    id: 1,
    content: `From: Marko Kovač <marko@deepmaint.si>\nTo: info@jadek-pensa.si\nSubject: Zaščita intelektualne lastnine pred licenčnimi pogajanji\nDate: Mon, 10 Mar 2026 08:15:00 +0100\n\nSpoštovani,\n\nsem CTO podjetja DeepMaint d.o.o., slovenskega deeptech startupa. Razvili smo nov algoritem za prediktivno vzdrževanje v proizvodnji. Trenutno nimamo nobenih patentov.\n\nImamo tri soustanovitelje. Eden od njih, Gregor Zupan, zapušča podjetje in nismo prepričani, kako je z dodelitvijo IP pravic iz njegove pogodbe o zaposlitvi.\n\nKmalu vstopamo v pogajanja z nemškim industrijskim partnerjem IndustrieWerk AG, ki želi licencirati našo tehnologijo. Ali nam lahko pomagate zaščititi našo intelektualno lastnino, preden karkoli podpišemo?\n\nHvala in lep pozdrav,\nMarko Kovač\nCTO, DeepMaint d.o.o.`,
  },
  {
    id: 2,
    content: `From: Petra Krajnc <petra.krajnc@webshop.si>\nTo: info@jadek-pensa.si\nSubject: URGENT: Data breach - need immediate legal help\nDate: Mon, 10 Mar 2026 07:30:00 +0100\n\nDear Jadek & Pensa team,\n\nI am the Head of Legal at WebShop d.o.o., a mid-sized Slovenian e-commerce company.\n\nOver the weekend (Saturday evening), we discovered that a third-party marketing platform we use (MarketPulse) exposed customer email addresses and purchase histories of approximately 12,000 customers. We have contained the breach as of Sunday morning, but we have NOT made any notifications — neither to the Information Commissioner nor to affected customers.\n\nWe are unsure about our exact obligations and timelines. Can you help us urgently?\n\nBest regards,\nPetra Krajnc\nHead of Legal, WebShop d.o.o.`,
  },
  {
    id: 3,
    content: `From: Sarah Mitchell <s.mitchell@globalcorp-si.com>\nTo: info@jadek-pensa.si\nSubject: Terminated employee threatening lawsuit\nDate: Mon, 10 Mar 2026 08:45:00 +0100\n\nPozdravljeni,\n\nI am the HR Director at GlobalCorp Slovenija d.o.o., which is the Slovenian subsidiary of GlobalCorp International Ltd (UK).\n\nWe terminated an employee, Janez Horvat, three weeks ago due to documented performance issues. He is now threatening to sue us, claiming the dismissal was actually retaliation for raising safety concerns at our production facility last year.\n\nTukaj je kratek timeline:\n- Sept 2025: Employee raises safety concern about ventilation in production hall\n- Oct 2025: First performance review flagging issues (documented)\n- Dec 2025: Second performance review, formal warning issued\n- Feb 2026: Termination for performance reasons\n\nHe has some internal emails that he says prove retaliation. I'm attaching the relevant correspondence.\n\nCan you advise us on our exposure and represent us if he files a claim?\n\nBest regards / Lep pozdrav,\nSarah Mitchell\nHR Director, GlobalCorp Slovenija d.o.o.`,
  },
  {
    id: 4,
    content: `From: Dr. Klaus Weber <k.weber@techacquire.de>\nTo: info@jadek-pensa.si\nSubject: Legal due diligence for acquisition of Slovenian software company\nDate: Mon, 10 Mar 2026 09:00:00 +0100\n\nDear colleagues,\n\nI am General Counsel of TechAcquire GmbH, a German technology company. We are in advanced negotiations to acquire CodeNova d.o.o., a Slovenian software company.\n\nWe need comprehensive legal due diligence covering four workstreams:\n1. IP ownership verification (ensuring all code IP is properly assigned to the company)\n2. Open source license compliance review\n3. Employee agreements review (key person clauses, non-competes, IP assignment)\n4. GDPR compliance assessment (they process EU customer data)\n\nCan your firm handle all four workstreams? What would the timeline and team look like?\n\nKind regards,\nDr. Klaus Weber\nGeneral Counsel, TechAcquire GmbH`,
  },
  {
    id: 5,
    content: `From: Ahmed Al-Rashid <a.rashid@arabesque-holdings.ae>\nTo: info@jadek-pensa.si\nSubject: Urgent - Slovenian subsidiary setup for IP management\nDate: Mon, 10 Mar 2026 09:30:00 +0100\n\nDear Sir/Madam,\n\nI represent Arabesque Holdings Ltd, recently incorporated in Dubai, UAE. We wish to establish a Slovenian subsidiary to manage European IP assets on behalf of our group.\n\nThe structure involves transferring intellectual property rights from a third entity (registered in the British Virgin Islands) to the new Slovenian company. The initial capitalization will be approximately EUR 2,000,000, contributed in cash.\n\nWe need this done very quickly — ideally within 2 weeks. Please advise on your fees and how fast you can act. Time is of the essence.\n\nRegards,\nAhmed Al-Rashid\nArabesque Holdings Ltd\nDubai, UAE`,
  },
];

// --- Replicate API logic ---

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
  "Marshall Islands",
  "Bahamas",
];
const AML_KEYWORDS_HIGH = [
  "cash contribution",
  "cash payment",
  "cash capitalization",
  "time is of the essence",
  "as quickly as possible",
  "within 2 weeks",
  "very quickly",
  "holding company",
  "nominee",
  "trust structure",
  "beneficial owner",
];
const AML_KEYWORDS_MEDIUM = [
  "urgent",
  "immediately",
  "quickly",
  "IP assets",
  "IP transfer",
  "recently incorporated",
  "newly formed",
  "no questions",
];

function normalizeEntityName(name) {
  return name
    .toLowerCase()
    .replace(
      /\b(d\.o\.o\.|d\.d\.|a\.g\.|gmbh|ltd|llc|inc|s\.r\.o\.|s\.a\.)\b/gi,
      "",
    )
    .replace(/[.,]/g, "")
    .trim();
}

function checkConflict(entities) {
  const matches = [];
  for (const entity of entities) {
    if (entity.type !== "company" && entity.type !== "person") continue;
    const normalizedEntity = normalizeEntityName(entity.name);
    for (const client of clients) {
      const normalizedClient = normalizeEntityName(client.client_name);
      if (
        normalizedEntity.length > 3 &&
        (normalizedClient.includes(normalizedEntity) ||
          normalizedEntity.includes(normalizedClient))
      ) {
        matches.push({
          extractedEntity: entity.name,
          matchedClient: client.client_name,
          matchType: normalizedClient === normalizedEntity ? "exact" : "fuzzy",
          clientStatus: client.status,
          matterId: client.id,
          matterDescription: client.matter_description,
          details: `Found as ${client.status} client — matter: "${client.matter_description}"`,
        });
        break;
      }
      for (const cp of client.counterparties || []) {
        const normalizedCp = normalizeEntityName(cp);
        if (
          normalizedEntity.length > 3 &&
          (normalizedCp.includes(normalizedEntity) ||
            normalizedEntity.includes(normalizedCp))
        ) {
          matches.push({
            extractedEntity: entity.name,
            matchedClient: cp,
            matchType: "counterparty",
            clientStatus: client.status,
            matterId: client.id,
            matterDescription: `Counterparty in matter: "${client.matter_description}" (client: ${client.client_name})`,
            details: `Appears as counterparty in matter involving ${client.client_name}`,
          });
          break;
        }
      }
    }
  }
  if (matches.length === 0)
    return { status: "NO_CONFLICT", matches: [], blockEmail: false };
  const hasActiveConflict = matches.some((m) => m.clientStatus === "active");
  const status = hasActiveConflict ? "CONFLICT_DETECTED" : "POTENTIAL_CONFLICT";
  return { status, matches, blockEmail: status === "CONFLICT_DETECTED" };
}

function runAmlPreScreening(emailText) {
  const text = emailText.toLowerCase();
  const flags = [];
  let ruleBasedRiskScore = 0;
  for (const j of HIGH_RISK_JURISDICTIONS) {
    if (text.includes(j.toLowerCase())) {
      flags.push({
        flag: `High-risk jurisdiction detected: ${j}`,
        severity: "high",
        source: "Jurisdiction screening",
      });
      ruleBasedRiskScore += 3;
    }
  }
  for (const kw of AML_KEYWORDS_HIGH) {
    if (text.includes(kw.toLowerCase())) {
      flags.push({
        flag: `AML indicator: "${kw}"`,
        severity: "high",
        source: "Keyword screening",
      });
      ruleBasedRiskScore += 2;
    }
  }
  for (const kw of AML_KEYWORDS_MEDIUM) {
    if (text.includes(kw.toLowerCase())) {
      flags.push({
        flag: `AML indicator: "${kw}"`,
        severity: "medium",
        source: "Keyword screening",
      });
      ruleBasedRiskScore += 1;
    }
  }
  const cashMatch = emailText.match(
    /EUR\s*([\d,]+(?:\.\d+)?)\s*(?:million)?/gi,
  );
  if (cashMatch) {
    for (const match of cashMatch) {
      const numStr = match.replace(/[^0-9.,]/g, "").replace(",", "");
      const amount = parseFloat(numStr);
      if (!isNaN(amount) && amount >= 15000) {
        flags.push({
          flag: `Large cash transaction: ${match}`,
          severity: "high",
          source: "ZPPDFT-2 cash threshold",
        });
        ruleBasedRiskScore += 3;
      }
    }
  }
  return { flags, ruleBasedRiskScore };
}

// --- API call functions ---

async function parseEmail(emailText) {
  const systemPrompt = `You are a legal intake analyst at a Slovenian law firm. Parse the incoming client email and return ONLY a JSON object — no markdown, no extra text.

Return this exact structure:
{
  "language": "sl" | "en" | "mixed",
  "legalDomains": string[],
  "entities": [{ "name": string, "type": "person"|"company"|"jurisdiction"|"counterparty", "role": string }],
  "urgency": "normal" | "high" | "critical",
  "deadlines": [{ "description": string, "deadlineType": "statutory"|"contractual"|"regulatory", "hoursRemaining": number|null, "source": string }],
  "summary": string,
  "keyFacts": string[]
}

RULES:
- legalDomains from: IP, GDPR, M&A, employment, corporate, dispute_resolution, tax, regulatory, technology_contracts, AML
- Extract ALL entity names (people, companies, jurisdictions, counterparties)
- urgency "critical" = statutory deadline running; "high" = client says urgent; "normal" otherwise
- For GDPR breach emails: 72h deadline runs from breach DISCOVERY (not email sent). Assume breach discovered Saturday ~20:00, email sent Monday 07:30 → ~36h remaining
- summary: 3-5 sentences using precise legal terminology, no invented facts
- keyFacts: 3-6 bullet points`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Parse this client email:\n\n${emailText}` },
    ],
  });
  const result = JSON.parse(completion.choices[0].message.content);
  return {
    language: ["sl", "en", "mixed"].includes(result.language)
      ? result.language
      : "en",
    legalDomains: Array.isArray(result.legalDomains)
      ? result.legalDomains.slice(0, 10)
      : [],
    entities: Array.isArray(result.entities)
      ? result.entities.slice(0, 20).map((e) => ({
          name: String(e.name || ""),
          type: e.type || "company",
          role: String(e.role || ""),
        }))
      : [],
    urgency: ["normal", "high", "critical"].includes(result.urgency)
      ? result.urgency
      : "normal",
    deadlines: Array.isArray(result.deadlines)
      ? result.deadlines.slice(0, 5).map((d) => ({
          description: String(d.description || ""),
          deadlineType: d.deadlineType || "statutory",
          hoursRemaining:
            d.hoursRemaining != null ? Number(d.hoursRemaining) : null,
          source: String(d.source || ""),
        }))
      : [],
    summary: String(result.summary || ""),
    keyFacts: Array.isArray(result.keyFacts)
      ? result.keyFacts.slice(0, 8).map(String)
      : [],
  };
}

async function generateDraft(emailText, parsed) {
  const { language, legalDomains, urgency, deadlines, summary } = parsed;

  const relevantKeywords = (legalDomains || []).flatMap(
    (d) => DOMAIN_KEYWORDS[d] || [],
  );
  const filteredLawyers =
    relevantKeywords.length > 0
      ? lawyers
          .filter((l) =>
            relevantKeywords.some((kw) =>
              (l.work || "").toLowerCase().includes(kw.toLowerCase()),
            ),
          )
          .slice(0, 8)
      : lawyers.slice(0, 8);

  const matchedRef =
    (legalDomains || []).reduce((found, domain) => {
      return found || firmReferences.find((r) => r.area === domain);
    }, null) || firmReferences[0];

  const writingLanguage = language === "sl" ? "slovenščini" : "angleščini";

  const systemPrompt = `Si izkusen odvetnik in partner v Odvetnicki pisarni Jadek & Pensa v Ljubljani. Ustvari celoten paket odziva na e-posto stranke. Odgovori SAMO z JSON objektom — brez markdowna.

RAZPOLOZLJIVI ODVETNIKI (pred-filtrirani po podrocju):
${JSON.stringify(filteredLawyers, null, 2)}

PRETEKLE IZKUSNJE PISARNE:
${JSON.stringify(firmExperience, null, 2)}

REFERENCE PISARNE ZA ZAZNANO PODROCJE:
${JSON.stringify(matchedRef, null, 2)}

HONORARJI (INTERNO — ne omenjaj v osnutku e-poste):
${JSON.stringify(feeMatrix, null, 2)}

ANALIZA E-POSTE STRANKE:
- Jezik: ${language}
- Pravna podrocja: ${JSON.stringify(legalDomains)}
- Nujnost: ${urgency}
- Roki: ${JSON.stringify(deadlines)}
- Povzetek: ${summary}

VRNI TOCNO TO JSON STRUKTURO:
{
  "assignedTeam": [{ "lawyerId": string, "name": string, "title": string, "matchReason": string, "relevanceScore": number, "relevantCases": [string] }],
  "followUpQuestions": string[],
  "firmExperience": string[],
  "firmReference": { "area": string, "achievements": [string], "marketing": string },
  "feeEstimate": { "matterType": string, "hoursRange": string, "feeRange": string, "currency": "EUR" },
  "matterForm": { "clientName": string, "matterDescription": string, "practiceArea": string, "responsibleLawyer": string, "estimatedValue": string },
  "draftEmail": { "subject": string, "body": string, "language": "sl"|"en" },
  "timeline": [{ "naslovFaze": string, "opisFaze": string, "trajanjeFaze": string }],
  "opozorila": string[]
}

NAVODILA:
- assignedTeam: 2-3 odvetniki z najboljsim ujemanjem; matchReason MORA vsebovati sklicevanje na konkretne pretekle zadeve; relevantCases: 2-3 kratki opisi primerljivih zadev (vsak v 1 stavku, v slovenscini)
- followUpQuestions: 4-6 specificnih vprasanj izkusenega partnerja — fokusirano na manjkajoce podatke; NIC genericnih vprasanj
- firmExperience: 1-2 opisi preteklih zadev pisarne, ki sta neposredno relevantni za to stranko
- firmReference: prepiši iz podanega referenčnega objekta brez bistvenih sprememb
- feeEstimate: samo interno — NIKOLI ne omenjaj honorarjev v draftEmail.body
- timeline: 4-6 faz postopka z realisticno oceno trajanja; jasno, brez pravniskega zargona, iz perspektive stranke
- opozorila: 3-5 zelo konkretnih opozoril — pravne pasti, ki bi jih laik zlahka zgresel; formuliraj kot "Ne smete..." ali "Pazite, da..."
- draftEmail.body: PISI V ${writingLanguage}; ton izkusenega odvetnika; omeni konkretne dosezke predlagane ekipe; vkljuci 2-3 kljucna vprasanja; "Vec je vec"; NIKOLI ne omeni umetne inteligence ali baz podatkov
- Urgency = critical: draftEmail.body takoj naslov roke in predlozi sestanek v 24 urah`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Ustvari paket odziva za to e-posto stranke:\n\n${emailText}`,
      },
    ],
  });
  const result = JSON.parse(completion.choices[0].message.content);
  return {
    assignedTeam: Array.isArray(result.assignedTeam)
      ? result.assignedTeam.slice(0, 3).map((l) => ({
          lawyerId: String(l.lawyerId || ""),
          name: String(l.name || ""),
          title: String(l.title || ""),
          matchReason: String(l.matchReason || ""),
          relevanceScore: Math.min(
            100,
            Math.max(0, Number(l.relevanceScore) || 0),
          ),
          relevantCases: Array.isArray(l.relevantCases)
            ? l.relevantCases.slice(0, 3).map(String)
            : [],
        }))
      : [],
    followUpQuestions: Array.isArray(result.followUpQuestions)
      ? result.followUpQuestions.slice(0, 6).map(String)
      : [],
    firmExperience: Array.isArray(result.firmExperience)
      ? result.firmExperience.slice(0, 3).map(String)
      : [],
    firmReference: result.firmReference
      ? {
          area: String(result.firmReference.area || ""),
          achievements: Array.isArray(result.firmReference.achievements)
            ? result.firmReference.achievements.slice(0, 6).map(String)
            : [],
          marketing: String(result.firmReference.marketing || ""),
        }
      : null,
    feeEstimate: {
      matterType: String(result.feeEstimate?.matterType || ""),
      hoursRange: String(result.feeEstimate?.hoursRange || ""),
      feeRange: String(result.feeEstimate?.feeRange || ""),
      currency: "EUR",
    },
    matterForm: {
      clientName: String(result.matterForm?.clientName || ""),
      matterDescription: String(result.matterForm?.matterDescription || ""),
      practiceArea: String(result.matterForm?.practiceArea || ""),
      responsibleLawyer: String(result.matterForm?.responsibleLawyer || ""),
      estimatedValue: String(result.matterForm?.estimatedValue || ""),
    },
    draftEmail: {
      subject: String(result.draftEmail?.subject || ""),
      body: String(result.draftEmail?.body || ""),
      language: ["sl", "en", "mixed"].includes(result.draftEmail?.language)
        ? result.draftEmail.language
        : "en",
    },
    timeline: Array.isArray(result.timeline)
      ? result.timeline.slice(0, 8).map((t) => ({
          naslovFaze: String(t.naslovFaze || ""),
          opisFaze: String(t.opisFaze || ""),
          trajanjeFaze: String(t.trajanjeFaze || ""),
        }))
      : [],
    opozorila: Array.isArray(result.opozorila)
      ? result.opozorila.slice(0, 6).map(String)
      : [],
  };
}

async function checkCompliance(emailText, entities) {
  const conflict = checkConflict(entities);
  const { flags: preScreenFlags, ruleBasedRiskScore } =
    runAmlPreScreening(emailText);

  const systemPrompt = `You are the AML compliance officer at Jadek & Pensa law firm in Slovenia. Analyze the email for AML/KYC risk under ZPPDFT-2 (Slovenian AML law) and EU AML Directives.

Pre-screening identified these rule-based flags:
${JSON.stringify(preScreenFlags, null, 2)}

Rule-based risk score: ${ruleBasedRiskScore} (0-5 = standard, 6-10 = enhanced, 11+ = refuse)

Return ONLY a JSON object:
{
  "riskLevel": "STANDARD" | "ENHANCED" | "REFUSE",
  "redFlags": [
    { "flag": string, "severity": "low"|"medium"|"high", "source": string }
  ],
  "kycDocuments": ["required KYC document 1", ...],
  "zppdft2Applicable": boolean,
  "reasoning": "2-3 sentence explanation of risk assessment",
  "pepAssessment": { "flagged": boolean, "persons": [{ "name": string, "reason": string }] }
}

RULES:
- REFUSE if: UAE/BVI/offshore + cash + urgency pressure + opaque structure all present together
- ENHANCED if: any high-risk jurisdiction OR large transaction OR complex structure OR M&A transaction
- STANDARD if: Slovenian company, transparent structure, clear business purpose, no red flags
- M&A transactions always trigger ENHANCED under ZPPDFT-2
- kycDocuments should be specific to the risks identified
- Add your own red flags beyond pre-screening if you identify additional risks from the email context
- Do NOT duplicate pre-screening flags verbatim — synthesize and add context
- pepAssessment: flag any person/entity that may be a PEP or connected to high-risk jurisdictions; set flagged=true if concerns exist`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Analyze this email for AML/KYC compliance:\n\n${emailText}`,
      },
    ],
    max_completion_tokens: 2000,
  });
  const amlResult = JSON.parse(completion.choices[0].message.content);

  const allRedFlags = [
    ...preScreenFlags,
    ...(Array.isArray(amlResult.redFlags) ? amlResult.redFlags : []),
  ];
  const seenFlags = new Set();
  const uniqueFlags = allRedFlags.filter((f) => {
    const key = f.flag.toLowerCase().substring(0, 30);
    if (seenFlags.has(key)) return false;
    seenFlags.add(key);
    return true;
  });

  return {
    conflict: {
      status: conflict.status,
      matches: conflict.matches,
      blockEmail: conflict.blockEmail,
    },
    aml: {
      riskLevel: ["STANDARD", "ENHANCED", "REFUSE"].includes(
        amlResult.riskLevel,
      )
        ? amlResult.riskLevel
        : ruleBasedRiskScore >= 11
          ? "REFUSE"
          : ruleBasedRiskScore >= 6
            ? "ENHANCED"
            : "STANDARD",
      redFlags: uniqueFlags.slice(0, 12),
      kycDocuments: Array.isArray(amlResult.kycDocuments)
        ? amlResult.kycDocuments.slice(0, 10).map(String)
        : [],
      zppdft2Applicable: Boolean(amlResult.zppdft2Applicable),
      reasoning: String(amlResult.reasoning || ""),
      pepAssessment: amlResult.pepAssessment
        ? {
            flagged: Boolean(amlResult.pepAssessment.flagged),
            persons: Array.isArray(amlResult.pepAssessment.persons)
              ? amlResult.pepAssessment.persons
                  .slice(0, 5)
                  .map((p) => ({
                    name: String(p.name || ""),
                    reason: String(p.reason || ""),
                  }))
              : [],
          }
        : { flagged: false, persons: [] },
    },
  };
}

// --- Main ---
async function processEmail(id, emailText) {
  console.log(`  [${id}] Step 1: parse-email...`);
  const parsed = await parseEmail(emailText);

  console.log(
    `  [${id}] Step 2: generate-draft + check-compliance (parallel)...`,
  );
  const [draft, compliance] = await Promise.all([
    generateDraft(emailText, parsed),
    checkCompliance(emailText, parsed.entities),
  ]);

  return {
    analysis: { ...parsed, ...draft },
    compliance,
  };
}

async function main() {
  console.log("Generating cached responses for 5 test emails...\n");
  const cache = {};

  for (const email of testEmails) {
    console.log(`Processing test email ${email.id}...`);
    try {
      cache[email.id] = await processEmail(email.id, email.content);
      console.log(`  [${email.id}] Done!\n`);
    } catch (e) {
      console.error(`  [${email.id}] ERROR: ${e.message}\n`);
      process.exit(1);
    }
  }

  const output = `// Auto-generated cached API responses for test emails.
// Generated on: ${new Date().toISOString()}
// Re-generate: node scripts/generate-cache.mjs

export const testEmailCache = ${JSON.stringify(cache, null, 2)}
`;

  const outPath = join(root, "src/data/testEmailCache.js");
  writeFileSync(outPath, output);
  console.log(`Cache written to ${outPath}`);
}

main();

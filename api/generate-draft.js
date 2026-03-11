import OpenAI from "openai";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Map Slovenian legal domains → Slovenian keywords for pre-filtering lawyers by work description
const DOMAIN_KEYWORDS = {
  "Davčno pravo": ["davčn", "davek", "ddv", "davčni"],
  "Delovno pravo": ["delovn", "zaposlen", "delavsk", "kadrovsk"],
  "Insolvenčno pravo in prestrukturiranja": [
    "insolvenčn",
    "prestrukturir",
    "stečaj",
    "finančn",
  ],
  "Intelektualna lastnina": [
    "intelektualna lastnin",
    "patent",
    "blagovna znamka",
    "avtorsk",
    "IP",
  ],
  "Javno naročanje": ["javno naroča", "naročil", "infrastrukturni"],
  "Komercialne pogodbe": ["pogodb", "komercialn", "pogodbeno"],
  "Konkurenčno pravo": ["konkurenčn", "konkurenc", "prevzeml"],
  "Korporacijsko pravo": [
    "korporacijsk",
    "kapitalsk",
    "delničarsk",
    "poslovodn",
  ],
  "Migracijsko pravo": ["migracij", "tujci", "zaposlovanje tujc"],
  "Preprečevanje in reševanje sporov": [
    "spor",
    "arbitraž",
    "pravd",
    "litigacij",
  ],
  "Prevzemi in združitve": ["prevzem", "združitev", "M&A", "transakcij"],
  "Varstvo osebnih podatkov": [
    "GDPR",
    "osebni podatk",
    "varstvo podatk",
    "informacijski pooblaščen",
  ],
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const body = req.body;
  if (!body) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const { emailText, language, legalDomains, urgency, deadlines, summary } =
    body;
  if (!emailText || emailText.trim().length < 20) {
    return res.status(400).json({ error: "Email je prekratek." });
  }

  const lawyers = JSON.parse(
    readFileSync(join(__dirname, "data", "lawyers.json"), "utf8"),
  );
  const feeMatrix = JSON.parse(
    readFileSync(join(__dirname, "data", "fee_matrix.json"), "utf8"),
  );
  const firmExperience = JSON.parse(
    readFileSync(join(__dirname, "data", "firm_experience.json"), "utf8"),
  );
  const firmReferences = Object.values(
    JSON.parse(
      readFileSync(join(__dirname, "data", "firm_reference.json"), "utf8"),
    ),
  );

  // Pre-filter lawyers to top ~8 candidates whose work description overlaps with detected domains
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

  // Find the best matching firm reference for the detected domains
  const matchedRef =
    (legalDomains || []).reduce((found, domain) => {
      return found || firmReferences.find((r) => r.podrocje === domain);
    }, null) || firmReferences[0];

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const writingLanguage = language === "sl" ? "slovenščini" : "angleščini";

  const systemPrompt = `Si izkusen odvetnik in partner v Odvetnicki pisarni Jadek & Pensa v Ljubljani. Ustvaric celoten paket odziva na e-posto stranke. Odgovori SAMO z JSON objektom — brez markdowna, brez uvoda, brez razlag zunaj JSON-a.

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
- timeline: 4-6 faz postopka z realisticno oceno trajanja (npr. "2-3 tedne"); jasno, brez pravniskega zargona, iz perspektive stranke
- opozorila: 3-5 zelo konkretnih opozoril — pravne pasti, ki bi jih laik zlahka zgresel, zamujeni roki, procesne napake; formuliraj kot "Ne smete..." ali "Pazite, da..."
- draftEmail.body: PISI V ${writingLanguage}; ton izkusenega odvetnika (ne robot); omeni konkretne dosezke in sposobnosti predlagane ekipe iz izkusenj pisarne; vkljuci 2-3 kljucna vprasanja za stranko; zakljuci z nezno, a jasno spodbudo k angazmaju pisarne; "Vec je vec" — bodi ambiciozen in pohvalen; NIKOLI ne omeni baz podatkov, algoritmov ali umetne inteligence
- Urgency = critical: draftEmail.body takoj naslov roke in predlozi sestanek v 24 urah`;

  try {
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

    const sanitized = {
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
        ? result.followUpQuestions.slice(0, 7).map(String)
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

    return res.status(200).json(sanitized);
  } catch (e) {
    console.error("generate-draft error:", e);
    return res.status(500).json({ error: "Napaka pri generiranju osnutka." });
  }
}

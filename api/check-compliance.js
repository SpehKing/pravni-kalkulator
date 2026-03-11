import OpenAI from "openai";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

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

function checkConflict(entities, clients) {
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

  if (matches.length === 0) {
    return { status: "NO_CONFLICT", matches: [], blockEmail: false };
  }

  const hasActiveConflict = matches.some((m) => m.clientStatus === "active");
  const status = hasActiveConflict ? "CONFLICT_DETECTED" : "POTENTIAL_CONFLICT";

  return {
    status,
    matches,
    blockEmail: status === "CONFLICT_DETECTED",
  };
}

function runAmlPreScreening(emailText) {
  const text = emailText.toLowerCase();
  const flags = [];
  let ruleBasedRiskScore = 0;

  for (const jurisdiction of HIGH_RISK_JURISDICTIONS) {
    if (text.includes(jurisdiction.toLowerCase())) {
      flags.push({
        flag: `High-risk jurisdiction detected: ${jurisdiction}`,
        severity: "high",
        source: "Jurisdiction screening",
      });
      ruleBasedRiskScore += 3;
    }
  }

  for (const keyword of AML_KEYWORDS_HIGH) {
    if (text.includes(keyword.toLowerCase())) {
      flags.push({
        flag: `AML indicator: "${keyword}"`,
        severity: "high",
        source: "Keyword screening",
      });
      ruleBasedRiskScore += 2;
    }
  }

  for (const keyword of AML_KEYWORDS_MEDIUM) {
    if (text.includes(keyword.toLowerCase())) {
      flags.push({
        flag: `AML indicator: "${keyword}"`,
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const body = req.body;
  if (!body) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const { emailText, entities = [] } = body;
  if (!emailText || emailText.trim().length < 20) {
    return res.status(400).json({ error: "Email je prekratek." });
  }

  const clients = JSON.parse(
    readFileSync(join(__dirname, "data", "clients.json"), "utf8"),
  );

  const conflict = checkConflict(entities, clients);
  const { flags: preScreenFlags, ruleBasedRiskScore } =
    runAmlPreScreening(emailText);

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
- pepAssessment: assess if any named persons in the email could be politically exposed (politicians, government officials, senior public figures, their close associates or family). Set flagged=true and list them with reason if any are suspected PEPs`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini-2025-08-07",
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

    const sanitized = {
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

    return res.status(200).json(sanitized);
  } catch (e) {
    console.error("Compliance check error:", e);
    return res
      .status(500)
      .json({ error: "Napaka pri preverjanju skladnosti." });
  }
}

import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const body = req.body;
  if (!body) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const { emailText } = body;
  if (!emailText || emailText.trim().length < 20) {
    return res.status(400).json({ error: "Email je prekratek." });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
- legalDomains from: Davčno pravo, Delovno pravo, Insolvenčno pravo in prestrukturiranja, Intelektualna lastnina, Javno naročanje, Komercialne pogodbe, Konkurenčno pravo, Korporacijsko pravo, Migracijsko pravo, Preprečevanje in reševanje sporov, Prevzemi in združitve, Varstvo osebnih podatkov
- Extract ALL entity names (people, companies, jurisdictions, counterparties)
- urgency "critical" = statutory deadline running; "high" = client says urgent; "normal" otherwise
- For GDPR breach emails: 72h deadline runs from breach DISCOVERY (not email sent). Assume breach discovered Saturday ~20:00, email sent Monday 07:30 → ~36h remaining
- summary: 3-5 sentences using precise legal terminology, no invented facts
- keyFacts: 3-6 bullet points`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Parse this client email:\n\n${emailText}` },
      ],
    });

    const result = JSON.parse(completion.choices[0].message.content);

    const sanitized = {
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

    return res.status(200).json(sanitized);
  } catch (e) {
    console.error("parse-email error:", e);
    return res
      .status(500)
      .json({ error: "Napaka pri razčlenjevanju e-pošte." });
  }
}

import OpenAI from 'openai'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed')
  }

  const body = req.body
  if (!body) {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  const { emailText, language, legalDomains, urgency, deadlines, summary } = body
  if (!emailText || emailText.trim().length < 20) {
    return res.status(400).json({ error: 'Email je prekratek.' })
  }

  const lawyers = JSON.parse(readFileSync(join(__dirname, 'data', 'lawyers.json'), 'utf8'))
  const feeMatrix = JSON.parse(readFileSync(join(__dirname, 'data', 'fee_matrix.json'), 'utf8'))
  const firmExperience = JSON.parse(readFileSync(join(__dirname, 'data', 'firm_experience.json'), 'utf8'))

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const systemPrompt = `You are a senior associate at Jadek & Pensa, a Slovenian law firm. Based on the parsed email analysis, generate a professional response package. Return ONLY a JSON object — no markdown.

LAWYERS AVAILABLE:
${JSON.stringify(lawyers, null, 2)}

FEE MATRIX:
${JSON.stringify(feeMatrix, null, 2)}

FIRM EXPERIENCE:
${JSON.stringify(firmExperience, null, 2)}

EMAIL ANALYSIS:
- Language: ${language}
- Legal domains: ${JSON.stringify(legalDomains)}
- Urgency: ${urgency}
- Deadlines: ${JSON.stringify(deadlines)}
- Summary: ${summary}

Return this exact structure:
{
  "assignedTeam": [{ "lawyerId": string, "name": string, "title": string, "matchReason": string, "relevanceScore": number }],
  "followUpQuestions": string[],
  "firmExperience": string[],
  "feeEstimate": { "matterType": string, "hoursRange": string, "feeRange": string, "currency": "EUR" },
  "matterForm": { "clientName": string, "matterDescription": string, "practiceArea": string, "responsibleLawyer": string, "estimatedValue": string },
  "draftEmail": { "subject": string, "body": string, "language": "sl"|"en" }
}

RULES:
- assignedTeam: 2-3 lawyers matched by specialization to the legal domains
- followUpQuestions: 3-5 specific senior-lawyer-level scoping questions (NOT generic)
- firmExperience: 1-2 relevant past matter descriptions from the firm experience list
- feeEstimate: internal only, do NOT mention in draftEmail
- draftEmail.body: write in ${language === 'sl' ? 'Slovenian' : 'English'}, professional tone, acknowledge matter + show experience + propose team + ask follow-up questions + next steps
- If urgency is critical, reflect urgency in draft tone`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-5-mini-2025-08-07',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate draft response for this email:\n\n${emailText}` }
      ],
    })

    const result = JSON.parse(completion.choices[0].message.content)

    const sanitized = {
      assignedTeam: Array.isArray(result.assignedTeam) ? result.assignedTeam.slice(0, 3).map(l => ({
        lawyerId: String(l.lawyerId || ''),
        name: String(l.name || ''),
        title: String(l.title || ''),
        matchReason: String(l.matchReason || ''),
        relevanceScore: Math.min(100, Math.max(0, Number(l.relevanceScore) || 0))
      })) : [],
      followUpQuestions: Array.isArray(result.followUpQuestions) ? result.followUpQuestions.slice(0, 6).map(String) : [],
      firmExperience: Array.isArray(result.firmExperience) ? result.firmExperience.slice(0, 3).map(String) : [],
      feeEstimate: {
        matterType: String(result.feeEstimate?.matterType || ''),
        hoursRange: String(result.feeEstimate?.hoursRange || ''),
        feeRange: String(result.feeEstimate?.feeRange || ''),
        currency: 'EUR'
      },
      matterForm: {
        clientName: String(result.matterForm?.clientName || ''),
        matterDescription: String(result.matterForm?.matterDescription || ''),
        practiceArea: String(result.matterForm?.practiceArea || ''),
        responsibleLawyer: String(result.matterForm?.responsibleLawyer || ''),
        estimatedValue: String(result.matterForm?.estimatedValue || '')
      },
      draftEmail: {
        subject: String(result.draftEmail?.subject || ''),
        body: String(result.draftEmail?.body || ''),
        language: ['sl', 'en', 'mixed'].includes(result.draftEmail?.language) ? result.draftEmail.language : 'en'
      }
    }

    return res.status(200).json(sanitized)
  } catch (e) {
    console.error('generate-draft error:', e)
    return res.status(500).json({ error: 'Napaka pri generiranju osnutka.' })
  }
}

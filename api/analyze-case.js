import OpenAI from 'openai'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed')
  }

  const body = req.body
  if (!body) {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  const { description, files = [], answers = [] } = body

  if (!description || description.trim().length < 10) {
    return res.status(400).json({ error: 'Opis je prekratek.' })
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const answersText = answers.length
    ? answers.map((a, i) => `V${i + 1}: ${a.question}\nO: ${a.answer || '(ni odgovora)'}`).join('\n')
    : '(ni dodatnih odgovorov)'

  const fileText = files.length
    ? `Priloženi dokumenti: ${files.map(f => f.name).join(', ')}`
    : ''

  const userContent = [
    `Opis primera:\n${description}`,
    fileText,
    `\nOdgovori na vprašanja:\n${answersText}`,
  ].filter(Boolean).join('\n\n')

  const messages = [
    {
      role: 'system',
      content: `Si izkušen slovenski pravnik s specializacijo za civilno in delovno pravo. Na podlagi podanih informacij oceni verjetnost uspeha primera na slovenskem sodišču. Vrni JSON objekt z naslednjimi polji:
- "percentage": število med 0 in 100 (verjetnost uspeha v %)
- "explanation": string, 2-4 stavki razlage v slovenščini
- "factors": seznam objektov z polji "factor" (string, opis dejavnika) in "impact" ("positive" ali "negative")

Primer formata: {"percentage":65,"explanation":"Primer ima dobre možnosti...","factors":[{"factor":"Pisni dokazi potrjujejo trditve","impact":"positive"}]}`,
    },
    {
      role: 'user',
      content: userContent,
    },
  ]

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-5.4-2026-03-05',
      response_format: { type: 'json_object' },
      messages,
      max_completion_tokens: 4000,
    })

    const result = JSON.parse(completion.choices[0].message.content)

    const sanitized = {
      percentage: Math.min(100, Math.max(0, Math.round(Number(result.percentage) || 50))),
      explanation: String(result.explanation || ''),
      factors: Array.isArray(result.factors) ? result.factors.slice(0, 8).map(f => ({
        factor: String(f.factor || ''),
        impact: f.impact === 'positive' ? 'positive' : 'negative',
      })) : [],
    }

    return res.status(200).json(sanitized)
  } catch (e) {
    console.error('OpenAI error:', e)
    return res.status(500).json({ error: 'Napaka pri analizi primera.' })
  }
}

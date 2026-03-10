import OpenAI from 'openai'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed')
  }

  const body = req.body
  if (!body) {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  const { description, fileNames = [] } = body

  if (!description || description.trim().length < 10) {
    return res.status(400).json({ error: 'Opis je prekratek.' })
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const userContent = [
    `Opis primera: ${description}`,
    fileNames.length ? `Priložene datoteke: ${fileNames.join(', ')}` : null,
  ].filter(Boolean).join('\n')

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-5-mini-2025-08-07',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Si izkušen slovenski pravnik. Na podlagi opisa pravnega primera generiraj 3 do 5 natančnih sledečih vprašanj v slovenščini, ki bodo pomagala oceniti verjetnost uspeha primera na sodišču. Vrni JSON objekt z enim poljem "questions", ki je seznam objektov z naslednjimi polji: "id" (string), "question" (string, vprašanje), "type" ("text" | "yesno" | "select"), in opcijsko "options" (seznam nizov, samo za type="select"). Primer: {"questions": [{"id":"q1","question":"Ali imate pisne dokaze?","type":"yesno"}]}`,
        },
        {
          role: 'user',
          content: userContent,
        },
      ],
      max_completion_tokens: 4000,
    })

    const parsed = JSON.parse(completion.choices[0].message.content)
    const questions = parsed.questions || parsed

    return res.status(200).json(questions)
  } catch (e) {
    console.error('OpenAI error:', e)
    return res.status(500).json({ error: 'Napaka pri klicu AI.' })
  }
}

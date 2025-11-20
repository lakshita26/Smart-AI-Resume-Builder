export async function openaiChat(options: {
  model?: string
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[]
  temperature?: number
  max_tokens?: number
  timeoutMs?: number
}) {
  const {
    model = 'gpt-4o',
    messages,
    temperature = 0.7,
    max_tokens = 500,
    timeoutMs = 8000,
  } = options

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured')

  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature, max_tokens }),
    signal: controller.signal as any,
  })

  clearTimeout(id)

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`OpenAI API error: ${res.status} ${res.statusText} ${body}`)
  }

  const data = await res.json()
  const choice = data?.choices?.[0]
  if (!choice) return ''
  return choice.message?.content ?? choice.text ?? ''
}

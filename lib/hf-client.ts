export async function hfGenerate(model: string, input: string, options?: {max_new_tokens?: number, temperature?: number}) {
  const apiKey = process.env.HUGGINGFACE_API_KEY
  if (!apiKey) throw new Error('HUGGINGFACE_API_KEY not configured')
  if (!model) throw new Error('HUGGINGFACE_MODEL not configured')

  const url = `https://api-inference.huggingface.co/models/${model}`
  const body: any = { inputs: input }
  if (options?.max_new_tokens) body.parameters = { max_new_tokens: options.max_new_tokens }
  if (options?.temperature !== undefined) body.parameters = { ...(body.parameters || {}), temperature: options.temperature }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`Hugging Face API error: ${res.status} ${res.statusText} ${txt}`)
  }

  const data = await res.json()
  // HF returns different shapes depending on model; common: [{generated_text: '...'}] or {generated_text: '...'}
  if (Array.isArray(data)) {
    const first = data[0]
    return first?.generated_text ?? (typeof first === 'string' ? first : JSON.stringify(first))
  }
  if (typeof data === 'object') return (data as any).generated_text ?? JSON.stringify(data)
  return String(data)
}

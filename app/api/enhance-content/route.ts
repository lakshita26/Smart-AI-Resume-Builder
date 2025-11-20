import { generateText } from 'ai';
import { enhanceSummary, improveDescription, suggestSkills } from '@/lib/local-nlp'

let _warnedNoGateway = false

export async function POST(req: Request) {
  try {
    const { content, type, context } = await req.json();

    // If no AI gateway/api key is configured, skip calling the SDK and return
    // a deterministic local fallback immediately. This avoids repeated
    // GatewayError logs and makes local dev faster.
    const hasGateway = !!process.env.AI_GATEWAY_API_KEY
    if (!hasGateway) {
      if (!_warnedNoGateway) {
        console.info('[v0] AI gateway not configured — using local fallback for enhance-content')
        _warnedNoGateway = true
      }
      // Use local NLP for enhancement
      const summaryFallback = (c: string) => enhanceSummary(c)
      const descriptionFallback = (c: string) => improveDescription(c)
      const skillsFallback = (c: string) => suggestSkills(c)

      const enhanced = (type === 'summary' ? summaryFallback(type === 'summary' ? content : '') : type === 'description' ? descriptionFallback(content) : skillsFallback(content)) || content
      return Response.json({ enhanced, fallback: true })
    }

    const prompts: Record<string, string> = {
      summary: `Rewrite this professional summary to be more impactful and ATS-friendly. 
Make it concise (3-4 sentences), highlight key achievements, and include relevant keywords.
Context: ${context}

Original summary:
${content}

Provide only the improved summary without any preamble.`,
      
      description: `Improve this job description to be more achievement-focused and quantifiable.
Use action verbs, add metrics where possible, and make it ATS-optimized.
Context: ${context}

Original description:
${content}

Provide only the improved description as bullet points.`,
      
      skills: `Analyze this skill list and suggest 10-15 relevant skills for a ${context} based on industry trends.
Include both technical and soft skills. Current skills: ${content}

Provide only a comma-separated list of recommended skills.`,
    };

    try {
      // Prefer Hugging Face if configured
      if (process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_MODEL) {
        try {
          const model = process.env.HUGGINGFACE_MODEL as string
          const text = await hfGenerate(model, prompts[type] || prompts.summary, { max_new_tokens: 256, temperature: 0.7 })
          return Response.json({ enhanced: (text || '').trim() })
        } catch (e) {
          console.warn('[v0] Hugging Face generation failed, falling back', e)
        }
      }

      // Prefer direct OpenAI calls if an OPENAI_API_KEY is configured
      if (process.env.OPENAI_API_KEY) {
        const messages = [
          { role: 'system', content: 'You are an expert resume writer.' },
          { role: 'user', content: prompts[type] || prompts.summary },
        ]
        const text = await openaiChat({ messages, model: 'gpt-4o', temperature: 0.7, max_tokens: 500 })
        return Response.json({ enhanced: (text || '').trim() })
      }

      // wrap generateText with a timeout so local dev doesn't hang if provider stalls
      const call = generateText({
        model: 'openai/gpt-4o',
        prompt: prompts[type] || prompts.summary,
        maxOutputTokens: 500,
        temperature: 0.7,
      })

      const timeoutMs = 8000
      const { text } = await Promise.race([
        call,
        new Promise((_, reject) => setTimeout(() => reject(new Error('AI call timed out')), timeoutMs)),
      ]) as any

      return Response.json({ enhanced: (text || '').trim() })
    } catch (err: any) {
      console.error('[v0] generateText error:', err)
      // If AI gateway/auth is not configured (including nested causes), return a safe fallback so the UI remains functional in dev.
      const errStr = String(err) + ' ' + String(err?.cause ?? '')
      const isAuthError = err?.type === 'authentication_error' || err?.cause?.type === 'authentication_error' || /AI Gateway authentication failed/i.test(errStr) || /No authentication provided/i.test(errStr) || /AI call timed out/i.test(errStr)
      if (isAuthError) {
        const summaryFallback = (c: string) => {
          const words = (c || '').trim().split(/\s+/).filter(Boolean)
          const max = 40
          return words.slice(0, max).join(' ') + (words.length > max ? '...' : '')
        }

        const descriptionFallback = (c: string) => {
          const lines = (c || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean)
          if (lines.length === 0) return c
          return lines.map(line => {
            if (/^[-*•]\s*/.test(line)) return line
            return `- ${line}`
          }).join('\n')
        }

        const skillsFallback = (c: string) => {
          const cleaned = (c || '').split(',').map(s => s.trim()).filter(Boolean)
          if (cleaned.length === 0) return 'Machine Learning, Java, C++, Python, React, Node.js, Docker, SQL, Git, Communication, Teamwork, Problem Solving'
          return cleaned.slice(0, 30).join(', ')
        }

        const enhanced = (type === 'summary' ? summaryFallback(content) : type === 'description' ? descriptionFallback(content) : skillsFallback(content)) || content
        return Response.json({ enhanced, fallback: true })
      }

      throw err
    }
  } catch (error) {
    console.error('[v0] Content enhancement error:', error);
    return Response.json(
      { error: 'Failed to enhance content' },
      { status: 500 }
    );
  }
}

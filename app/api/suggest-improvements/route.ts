import { streamText } from 'ai';
import { improveDescription } from '@/lib/local-nlp'

function heuristicSuggestions(resumeData: any, focusArea: string) {
  const suggestions: string[] = []
  if (focusArea === 'experience') {
    const first = resumeData?.experiences?.[0]
    const sample = first ? `${first.position} at ${first.company}: ${first.description?.slice(0, 160)}` : ''
    suggestions.push('Use strong action verbs at the start of each bullet (e.g., "Led", "Implemented", "Reduced").')
    suggestions.push('Quantify impact where possible — add metrics like % improvement, $ saved, or user counts.')
    suggestions.push('Prioritize results over responsibilities; convert passive sentences into achievements with outcomes.')
    suggestions.push('Include relevant technologies and tools used in each role (e.g., React, Node.js, PostgreSQL).')
    suggestions.push(`Example (concise): ${sample} -> "Led migration to React, improving page load by 35% and reducing errors by 12%."`)
  } else if (focusArea === 'summary') {
    const s = resumeData?.personalInfo?.summary || ''
    suggestions.push('Start with a clear value statement: who you are, years of experience, and top skills.')
    suggestions.push('Mention 2–3 key achievements or areas of expertise relevant to the role.')
    suggestions.push('Keep it concise (2–4 lines) and tailored to the job — avoid generic phrases like "hardworking".')
    suggestions.push('Use keywords from the job description to pass ATS checks (e.g., "machine learning", "React").')
    suggestions.push(`Example: "Senior Frontend Engineer with 6+ years building UX-focused applications using React and TypeScript — led a redesign that increased engagement by 22%."`)
  } else {
    const skills = resumeData?.skills || ''
    suggestions.push('Group skills by category (Languages, Frameworks, Tools, Cloud) for scannability.')
    suggestions.push('Replace vague items (e.g., "communication") with concrete tools and proficiencies (e.g., "REST APIs, GraphQL").')
    suggestions.push('Prioritize job-specific skills at the top and remove outdated items.')
    suggestions.push('Include proficiency level when helpful (e.g., "Advanced", "Familiar").')
    suggestions.push(`Example: "Languages: JavaScript (Advanced), Python (Intermediate); Frameworks: React, Next.js; Tools: Docker, Git"`)
  }
  return suggestions
}

export async function POST(req: Request) {
  try {
    const { resumeData, focusArea } = await req.json()

    const hasGateway = Boolean(process.env.AI_GATEWAY_API_KEY)
    if (!hasGateway) {
      // Fast local fallback for development when no AI key is set
      let suggestions: string[] = []
      if (focusArea === 'experience') {
        suggestions = improveDescription(resumeData?.experiences?.map((e: any) => e.description).join('\n') || '')
      } else if (focusArea === 'summary') {
        suggestions = [improveDescription(resumeData?.personalInfo?.summary || '')]
      } else {
        suggestions = [improveDescription(resumeData?.skills || '')]
      }
      return Response.json({ fallback: true, suggestions })
    }

    // If OPENAI_API_KEY is configured use direct API call and return suggestions array
    // Prefer Hugging Face if configured
    if (process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_MODEL) {
      try {
        const model = process.env.HUGGINGFACE_MODEL as string
        const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
          { role: 'system', content: 'You are a professional resume coach providing specific, actionable advice.' },
          { role: 'user', content: `Provide 5 detailed suggestions to improve the ${focusArea} section of this resume. Return only a JSON array of suggestions.` + (focusArea === 'experience' ? `\n\nExperiences:\n${resumeData.experiences.map((exp: any) => `\n${exp.position} at ${exp.company}\n${exp.description}\n`).join('\n')}` : focusArea === 'summary' ? `\nSummary: ${resumeData.personalInfo.summary}\n` : `\nSkills: ${resumeData.skills}\n`) },
        ]
        // HF: call with a descriptive prompt; expect model to return JSON array
        const hfPrompt = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')
        const text = await hfGenerate(model, hfPrompt, { max_new_tokens: 512, temperature: 0.8 })
        try {
          const parsed = JSON.parse(text)
          if (Array.isArray(parsed)) return Response.json({ suggestions: parsed })
        } catch (e) {
          console.warn('[v0] HF suggest-improvements parse failed, falling back', e)
        }
      } catch (e) {
        console.warn('[v0] Hugging Face suggest-improvements failed, falling back', e)
      }
    }

    if (process.env.OPENAI_API_KEY) {
      const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        { role: 'system', content: 'You are a professional resume coach providing specific, actionable advice.' },
        { role: 'user', content: `Provide 5 detailed suggestions to improve the ${focusArea} section of this resume. Return only a JSON array of suggestions.` + (focusArea === 'experience' ? `\n\nExperiences:\n${resumeData.experiences.map((exp: any) => `\n${exp.position} at ${exp.company}\n${exp.description}\n`).join('\n')}` : focusArea === 'summary' ? `\nSummary: ${resumeData.personalInfo.summary}\n` : `\nSkills: ${resumeData.skills}\n`) },
      ]

      const text = await openaiChat({ messages, model: 'gpt-4o', temperature: 0.8, max_tokens: 1000 })
      try {
        const parsed = JSON.parse(text)
        if (Array.isArray(parsed)) return Response.json({ suggestions: parsed })
      } catch (e) {
        // If parse fails, fall through to streaming SDK path
        console.warn('[v0] suggest-improvements: OpenAI JSON parse failed, falling back to streaming SDK', e)
      }
    }

    // When a gateway/provider key is present, stream suggestions using the AI SDK
    const result = streamText({
      model: 'openai/gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a professional resume coach providing specific, actionable advice.',
        },
        {
          role: 'user',
          content: `Provide detailed suggestions to improve the ${focusArea} section of this resume:\n\n${focusArea === 'experience' ? `\nExperiences:\n${resumeData.experiences.map((exp: any) => `\n${exp.position} at ${exp.company}\n${exp.description}\n`).join('\n')}` : focusArea === 'summary' ? `\nSummary: ${resumeData.personalInfo.summary}\n` : `\nSkills: ${resumeData.skills}\n`}\nGive 5 specific, actionable improvements with examples.`,
        },
      ],
      maxOutputTokens: 1000,
      temperature: 0.8,
    });

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('[v0] Suggestions error:', error)
    try {
      // Fallback on unexpected errors
      const body = await req.json().catch(() => ({}))
      const suggestions = heuristicSuggestions(body.resumeData || {}, body.focusArea || 'skills')
      return Response.json({ fallback: true, suggestions })
    } catch (e) {
      return Response.json({ error: 'Failed to generate suggestions' }, { status: 500 })
    }
  }
}

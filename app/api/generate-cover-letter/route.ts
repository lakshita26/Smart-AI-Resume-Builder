import { generateText } from 'ai'
import { enhanceSummary, extractKeywords } from '@/lib/local-nlp'

export async function POST(req: Request) {
  try {
    const { resumeData, jobDescription, companyName, position, tone } = await req.json()

    // If no AI gateway is configured, return a deterministic fallback cover letter
    const hasGateway = !!process.env.AI_GATEWAY_API_KEY
    if (!hasGateway) {
      console.info('[v0] AI gateway not configured 4 returning fallback cover letter')
      const name = resumeData?.personalInfo?.name || 'Candidate'
      const summary = resumeData?.personalInfo?.summary || ''
      const topExps = (resumeData?.experiences || []).slice(0, 2)
      const achievements = topExps.map((e: any) => `${e.position} at ${e.company}`).join('; ')
      const skills = resumeData?.skills || ''

      // Use local NLP enhancement for summary
      const enhancedSummary = enhanceSummary(summary)
      const fallback = `${name}\n\nDear Hiring Manager at ${companyName || 'your company'},\n\nI am excited to apply for the ${position || 'open role'} at ${companyName || 'your organization'}. ${enhancedSummary} I have experience as ${achievements} and skills including ${skills}. I am confident I can contribute to your team and help achieve its goals.\n\nThank you for considering my application. I look forward to the opportunity to discuss how my experience can contribute to ${companyName || 'your company'}.\n\nSincerely,\n${name}`

      const keywords = extractKeywords(jobDescription || '')

      return Response.json({
        coverLetter: fallback,
        keywordsUsed: keywords.slice(0, 8),
        matchedExperiences: topExps.map((e: any) => e.position),
        fallback: true,
      })
    }

    const prompt = `You are an expert career coach. Generate a compelling cover letter based on the following:

Resume Summary: ${resumeData.personalInfo.summary}
Key Experiences: ${resumeData.experiences.map((exp: any) => 
  `${exp.position} at ${exp.company}: ${exp.description}`
).join('\n')}
Skills: ${resumeData.skills}

Job Description: ${jobDescription}
Company: ${companyName}
Position: ${position}
Tone: ${tone}

Create a tailored, ATS-friendly cover letter that:
1. Opens with a strong hook showing enthusiasm for the role
2. Highlights 2-3 key achievements from the resume that match the job requirements
3. Demonstrates understanding of the company and role
4. Includes specific keywords from the job description
5. Closes with a call to action
6. Uses ${tone} tone throughout
7. Is 3-4 paragraphs, professional, and personalized

Format as plain text with proper paragraphs.`

    // If a Hugging Face API key/model are set, prefer them
    if (process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_MODEL) {
      try {
        const model = process.env.HUGGINGFACE_MODEL as string
        const text = await hfGenerate(model, prompt, { max_new_tokens: 512, temperature: 0.7 })
        const keywords = extractKeywords(jobDescription || '')
        return Response.json({
          coverLetter: text,
          keywordsUsed: keywords.slice(0, 8),
          matchedExperiences: resumeData.experiences.slice(0, 2).map((exp: any) => exp.position),
        })
      } catch (e) {
        console.warn('[v0] Hugging Face cover letter generation failed, falling back', e)
      }
    }

    // If an OPENAI_API_KEY is set, call the OpenAI API directly
    if (process.env.OPENAI_API_KEY) {
      const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        { role: 'system', content: 'You are an expert career coach.' },
        { role: 'user', content: prompt },
      ]
      const text = await openaiChat({ messages, model: 'gpt-4o', temperature: 0.7 })

      // Extract keywords used for explainability
      const keywords = extractKeywords(jobDescription || '')

      return Response.json({ 
        coverLetter: text,
        keywordsUsed: keywords.slice(0, 8),
        matchedExperiences: resumeData.experiences.slice(0, 2).map((exp: any) => exp.position),
      })
    }

    const { text } = await generateText({
      model: 'openai/gpt-4o',
      prompt,
      temperature: 0.7,
    })

    // Extract keywords used for explainability
    const keywords = extractKeywords(jobDescription || '')

    return Response.json({ 
      coverLetter: text,
      keywordsUsed: keywords.slice(0, 8),
      matchedExperiences: resumeData.experiences.slice(0, 2).map((exp: any) => exp.position)
    })
  } catch (error) {
    console.error('[v0] Cover letter generation failed:', error)
    return Response.json({ error: 'Failed to generate cover letter' }, { status: 500 })
  }
}


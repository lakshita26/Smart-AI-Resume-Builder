import { generateText } from 'ai'

export async function POST(req: Request) {
  try {
    const { resumeData, jobAnalysis, numVariants = 3 } = await req.json()

    const variants = []

    for (let i = 0; i < numVariants; i++) {
      const focus = i === 0 ? 'technical skills' : i === 1 ? 'leadership and impact' : 'innovation and problem-solving'
      
      const prompt = `Create a tailored resume variant focusing on ${focus}.

Current Resume:
Name: ${resumeData.personalInfo.name}
Summary: ${resumeData.personalInfo.summary}
Experience: ${JSON.stringify(resumeData.experiences, null, 2)}
Skills: ${resumeData.skills}

Job Requirements:
Required Skills: ${jobAnalysis.requiredSkills.join(', ')}
Key Responsibilities: ${jobAnalysis.responsibilities.join(', ')}

Rewrite the professional summary and top 2 experience descriptions to emphasize ${focus} while incorporating these keywords: ${jobAnalysis.keywords.slice(0, 10).join(', ')}

Return as JSON:
{
  "summary": "enhanced summary",
  "experiences": [
    { "company": "", "position": "", "duration": "", "description": "enhanced description" }
  ],
  "focusArea": "${focus}"
}`

      const { text } = await generateText({
        model: 'openai/gpt-4o',
        prompt,
        temperature: 0.8,
      })

      try {
        const parsed = JSON.parse(text)
        variants.push(parsed)
      } catch {
        // Fallback if JSON parsing fails
        variants.push({
          summary: resumeData.personalInfo.summary,
          experiences: resumeData.experiences.slice(0, 2),
          focusArea: focus
        })
      }
    }

    return Response.json({ variants })
  } catch (error) {
    console.error('[v0] Variant generation failed:', error)
    return Response.json({ error: 'Failed to generate variants' }, { status: 500 })
  }
}

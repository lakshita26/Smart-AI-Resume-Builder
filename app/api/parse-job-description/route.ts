import { generateObject } from 'ai'
import { extractKeywords, suggestSkills } from '@/lib/local-nlp'
import { z } from 'zod'

const JobAnalysisSchema = z.object({
  title: z.string().describe('Extracted job title'),
  company: z.string().describe('Company name'),
  requiredSkills: z.array(z.string()).describe('Required technical and soft skills'),
  preferredSkills: z.array(z.string()).describe('Preferred or nice-to-have skills'),
  responsibilities: z.array(z.string()).describe('Key job responsibilities'),
  qualifications: z.array(z.string()).describe('Required qualifications'),
  keywords: z.array(z.string()).describe('Important ATS keywords from the description'),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']).describe('Experience level required'),
  industry: z.string().describe('Industry or domain'),
})

export async function POST(req: Request) {
  try {
    const { jobDescription } = await req.json()
    // Short-circuit to a deterministic fallback when no AI gateway is configured
    const hasGateway = !!process.env.AI_GATEWAY_API_KEY
    if (!hasGateway) {
      console.info('[v0] AI gateway not configured — returning mock job analysis for parse-job-description')
      // Use local NLP for extraction
      const text = (jobDescription || '').toString().replace(/\r/g, '\n')
      const lines: string[] = text.split('\n').map((l: string) => l.trim()).filter(Boolean)
      const titleLine: string = lines.find((l: string) => /role|position|we are hiring|we are looking/i.test(l)) || lines[0] || ''
      const sampleTitle = (titleLine.match(/(Senior|Junior|Lead|Principal)?\s*[A-Za-z ]+(Engineer|Developer|Manager|Analyst|Specialist|Director)?/i)?.[0] || '').trim()

      const keywords = extractKeywords(text)
      const skills = suggestSkills(text).split(',').map(s => s.trim()).filter(Boolean)

      const analysisMock = {
        title: sampleTitle || 'Not specified',
        company: 'Not specified',
        requiredSkills: skills.slice(0, 8),
        preferredSkills: skills.slice(8, 15),
        responsibilities: lines.slice(0, 5),
        qualifications: [],
        keywords,
        experienceLevel: 'mid',
        industry: 'Not specified',
      }
      return Response.json({ analysis: analysisMock, fallback: true })
    }

    const { object } = await generateObject({
      model: 'openai/gpt-4o',
      schema: JobAnalysisSchema,
      prompt: `Analyze this job description and extract structured information:

${jobDescription}

Extract:
- Job title and company name
- Required vs preferred skills (technical and soft skills)
- Key responsibilities
- Qualifications needed
- Important keywords for ATS optimization
- Experience level (entry/mid/senior/executive)
- Industry/domain

Be thorough and specific.`,
    })

    return Response.json({ analysis: object })
  } catch (error) {
    console.error('[v0] Job parsing failed:', error)
    return Response.json({ error: 'Failed to parse job description' }, { status: 500 })
  }
}

import { generateObject } from 'ai';
import { z } from 'zod';
import { analyzeResumeWithNLP } from '@/lib/nlp-analyzer';
import { INDUSTRY_KEYWORDS, ACTION_VERBS } from '@/lib/datasets/resume-keywords';

const resumeAnalysisSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('Overall ATS compatibility score'),
  atsScore: z.number().min(0).max(100).describe('ATS parsing score'),
  keywordScore: z.number().min(0).max(100).describe('Keyword optimization score'),
  formatScore: z.number().min(0).max(100).describe('Format and structure score'),
  strengths: z.array(z.string()).describe('Resume strengths'),
  improvements: z.array(z.string()).describe('Areas for improvement'),
  missingKeywords: z.array(z.string()).describe('Important keywords missing from the resume'),
  suggestedKeywords: z.array(z.string()).describe('Keywords to add based on industry'),
  recommendations: z.array(z.string()).describe('Specific actionable recommendations'),
});

export async function POST(req: Request) {
  console.log('[v0] ===== NLP RESUME ANALYSIS API CALLED =====');
  
  try {
    const body = await req.json();
    console.log('[v0] Full request body:', JSON.stringify(body, null, 2));
    
    const { resumeData, targetRole, industry, seniority } = body;

    console.log('[v0] Extracted data:', { 
      hasResumeData: !!resumeData,
      hasPersonalInfo: !!resumeData?.personalInfo,
      personalInfoName: resumeData?.personalInfo?.name,
      targetRole, 
      industry, 
      seniority 
    });

    if (!resumeData) {
      console.error('[v0] No resume data provided');
      return Response.json(
        { error: 'No resume data provided. Please fill out your resume form.' },
        { status: 400 }
      );
    }

    const hasName = resumeData.personalInfo?.name;
    const hasExperience = resumeData.experiences && resumeData.experiences.length > 0;
    const hasSummary = resumeData.personalInfo?.summary;
    const hasEducation = resumeData.education && resumeData.education.length > 0;
    const hasSkills = resumeData.skills;
    
    console.log('[v0] Validation check:', {
      hasName,
      hasExperience,
      hasSummary,
      hasEducation,
      hasSkills
    });

    // At minimum, we need some content to analyze
    if (!hasName && !hasExperience && !hasSummary && !hasEducation && !hasSkills) {
      console.error('[v0] No content to analyze');
      return Response.json(
        { error: 'Please add some content to your resume before analyzing.' },
        { status: 400 }
      );
    }

    console.log('[v0] Validation passed - proceeding with analysis');

    console.log('[v0] Starting NLP analysis...');
    const nlpAnalysis = analyzeResumeWithNLP(resumeData, industry || 'general');
    
    console.log('[v0] NLP Analysis Results:', nlpAnalysis);

    const industryKeywords = INDUSTRY_KEYWORDS[industry || 'general'] || INDUSTRY_KEYWORDS.general;
    const missingKeywords = industryKeywords.filter(
      keyword => !nlpAnalysis.industryKeywordsFound.includes(keyword)
    ).slice(0, 8);

    console.log('[v0] Missing keywords:', missingKeywords);

    const resumeText = `
Name: ${resumeData.personalInfo?.name || 'Not provided'}
Email: ${resumeData.personalInfo?.email || 'Not provided'}
Phone: ${resumeData.personalInfo?.phone || 'Not provided'}
Location: ${resumeData.personalInfo?.location || 'Not provided'}

Professional Summary:
${resumeData.personalInfo?.summary || 'No summary provided'}

Experience:
${resumeData.experiences && resumeData.experiences.length > 0 ? resumeData.experiences.map((exp: any, idx: number) => `
${idx + 1}. ${exp.position || 'Position'} at ${exp.company || 'Company'} (${exp.duration || 'Duration'})
   ${exp.description || 'No description provided'}
`).join('\n') : 'No experience listed'}

Education:
${resumeData.education && resumeData.education.length > 0 ? resumeData.education.map((edu: any, idx: number) => `
${idx + 1}. ${edu.degree || 'Degree'} from ${edu.institution || 'Institution'} (${edu.duration || 'Duration'})
   ${edu.description || ''}
`).join('\n') : 'No education listed'}

Skills:
${resumeData.skills || 'No skills listed'}

--- NLP ANALYSIS RESULTS ---
Total Words: ${nlpAnalysis.wordCount}
Action Verbs Found: ${nlpAnalysis.actionVerbsUsed.join(', ') || 'None'}
Industry Keywords Found: ${nlpAnalysis.industryKeywordsFound.join(', ') || 'None'}
Quantifiable Metrics: ${nlpAnalysis.quantifiableMetrics.join(', ') || 'None'}
Readability Score: ${nlpAnalysis.readabilityScore.toFixed(1)}/100
Has Measurable Achievements: ${nlpAnalysis.hasQuantifiableAchievements ? 'Yes' : 'No'}
`;

    console.log('[v0] Calling AI model with NLP-enhanced prompt...');

    const { object } = await generateObject({
      model: 'openai/gpt-4o',
      schema: resumeAnalysisSchema,
      messages: [
        {
          role: 'system',
          content: `You are an expert ATS resume analyzer using NLP (Natural Language Processing) techniques. 
          Analyze resumes based on:
          - Keyword density and relevance
          - Action verb usage (strong vs weak verbs)
          - Quantifiable achievements (numbers, percentages, metrics)
          - Readability and sentence structure
          - ATS compatibility (format, sections, keywords)
          
          Use the NLP analysis provided to give realistic, data-driven scores.
          Be honest: most resumes score 50-75, not 80-95.
          Provide specific, actionable feedback based on the NLP metrics.`,
        },
        {
          role: 'user',
          content: `Using NLP analysis, evaluate this ${seniority || 'mid'}-level ${targetRole || 'professional'} resume for the ${industry || 'general'} industry:

${resumeText}

Based on the NLP analysis:
1. Score keyword optimization: ${nlpAnalysis.industryKeywordsFound.length} industry keywords found out of ${industryKeywords.length} total
2. Score action verb usage: ${nlpAnalysis.actionVerbsUsed.length} action verbs found in ${nlpAnalysis.wordCount} words
3. Score quantifiable achievements: ${nlpAnalysis.quantifiableMetrics.length} metrics found
4. Score readability: Current score is ${nlpAnalysis.readabilityScore.toFixed(1)}/100

Provide:
- Realistic scores (not all high!) based on actual NLP metrics
- At least 3 specific strengths with examples from the resume
- At least 4 concrete improvements referencing the NLP analysis
- ${missingKeywords.length} missing keywords from: ${missingKeywords.join(', ')}
- 8-12 suggested keywords for ${industry} ${targetRole}
- 5-7 actionable recommendations with specific steps`,
        },
      ],
    });

    console.log('[v0] AI analysis completed successfully');
    console.log('[v0] Final scores:', { 
      overall: object.overallScore,
      ats: object.atsScore,
      keywords: object.keywordScore,
      format: object.formatScore 
    });

    return Response.json({ 
      analysis: object,
      nlpMetrics: {
        wordCount: nlpAnalysis.wordCount,
        actionVerbsCount: nlpAnalysis.actionVerbsUsed.length,
        keywordsCount: nlpAnalysis.industryKeywordsFound.length,
        metricsCount: nlpAnalysis.quantifiableMetrics.length,
        readabilityScore: Math.round(nlpAnalysis.readabilityScore),
      }
    });

  } catch (error) {
    console.error('[v0] ===== ANALYSIS ERROR =====');
    console.error('[v0] Error type:', error?.constructor?.name);
    console.error('[v0] Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('[v0] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('[v0] Full error object:', JSON.stringify(error, null, 2));
    
    return Response.json(
      { 
        error: 'Failed to analyze resume with AI. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

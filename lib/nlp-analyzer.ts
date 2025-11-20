// NLP utilities for resume analysis
import { INDUSTRY_KEYWORDS, ACTION_VERBS, ATS_OPTIMIZATION_TIPS } from './datasets/resume-keywords'

export interface NLPAnalysis {
  wordCount: number
  sentenceCount: number
  actionVerbsUsed: string[]
  actionVerbsPercentage: number
  industryKeywordsFound: string[]
  keywordDensity: number
  quantifiableMetrics: string[]
  hasQuantifiableAchievements: boolean
  readabilityScore: number
  averageWordsPerSentence: number
}

export class ResumeNLPAnalyzer {
  private text: string
  private industry: string

  constructor(text: string, industry: string = 'general') {
    this.text = text.toLowerCase()
    this.industry = industry
  }

  // Extract sentences from text
  private getSentences(): string[] {
    return this.text
      .split(/[.!?]+/)
      .filter(s => s.trim().length > 0)
      .map(s => s.trim())
  }

  // Extract words from text
  private getWords(): string[] {
    return this.text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0)
  }

  // Find action verbs used in the text
  private findActionVerbs(): string[] {
    const words = this.getWords()
    const lowerActionVerbs = ACTION_VERBS.map(v => v.toLowerCase())
    
    return words.filter(word => 
      lowerActionVerbs.some(verb => word.includes(verb) || verb.includes(word))
    )
  }

  // Find industry-specific keywords
  private findIndustryKeywords(): string[] {
    const industryKeywords = INDUSTRY_KEYWORDS[this.industry] || INDUSTRY_KEYWORDS.general
    const generalKeywords = INDUSTRY_KEYWORDS.general
    const allRelevantKeywords = [...industryKeywords, ...generalKeywords]
    
    const found: string[] = []
    allRelevantKeywords.forEach(keyword => {
      if (this.text.includes(keyword.toLowerCase())) {
        found.push(keyword)
      }
    })
    
    return [...new Set(found)]
  }

  // Extract numbers and quantifiable metrics
  private findQuantifiableMetrics(): string[] {
    const metrics: string[] = []
    
    // Find percentages
    const percentages = this.text.match(/\d+%/g)
    if (percentages) metrics.push(...percentages)
    
    // Find dollar amounts
    const dollars = this.text.match(/\$[\d,]+/g)
    if (dollars) metrics.push(...dollars)
    
    // Find numbers with context
    const numbers = this.text.match(/\d+[\+]?\s*(million|thousand|billion|k|team|users|customers|projects|years|months)/gi)
    if (numbers) metrics.push(...numbers)
    
    return metrics
  }

  // Calculate readability (Flesch Reading Ease approximation)
  private calculateReadability(): number {
    const words = this.getWords()
    const sentences = this.getSentences()
    
    if (sentences.length === 0 || words.length === 0) return 0
    
    const syllables = words.reduce((count, word) => count + this.countSyllables(word), 0)
    const avgWordsPerSentence = words.length / sentences.length
    const avgSyllablesPerWord = syllables / words.length
    
    // Flesch Reading Ease formula
    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
    
    // Normalize to 0-100
    return Math.max(0, Math.min(100, score))
  }

  // Simple syllable counter
  private countSyllables(word: string): number {
    word = word.toLowerCase()
    if (word.length <= 3) return 1
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    word = word.replace(/^y/, '')
    
    const syllables = word.match(/[aeiouy]{1,2}/g)
    return syllables ? syllables.length : 1
  }

  // Perform full NLP analysis
  public analyze(): NLPAnalysis {
    const words = this.getWords()
    const sentences = this.getSentences()
    const actionVerbs = this.findActionVerbs()
    const keywords = this.findIndustryKeywords()
    const metrics = this.findQuantifiableMetrics()
    
    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      actionVerbsUsed: actionVerbs,
      actionVerbsPercentage: words.length > 0 ? (actionVerbs.length / words.length) * 100 : 0,
      industryKeywordsFound: keywords,
      keywordDensity: words.length > 0 ? (keywords.length / words.length) * 100 : 0,
      quantifiableMetrics: metrics,
      hasQuantifiableAchievements: metrics.length > 0,
      readabilityScore: this.calculateReadability(),
      averageWordsPerSentence: sentences.length > 0 ? words.length / sentences.length : 0,
    }
  }
}

// Analyze entire resume data structure
export function analyzeResumeWithNLP(resumeData: any, industry: string): NLPAnalysis {
  let fullText = ''
  
  // Collect all text from resume
  if (resumeData.personalInfo) {
    fullText += ` ${resumeData.personalInfo.name || ''}`
    fullText += ` ${resumeData.personalInfo.summary || ''}`
  }
  
  if (resumeData.experiences) {
    resumeData.experiences.forEach((exp: any) => {
      fullText += ` ${exp.company || ''}`
      fullText += ` ${exp.position || ''}`
      fullText += ` ${exp.description || ''}`
    })
  }
  
  if (resumeData.education) {
    resumeData.education.forEach((edu: any) => {
      fullText += ` ${edu.institution || ''}`
      fullText += ` ${edu.degree || ''}`
      fullText += ` ${edu.description || ''}`
    })
  }
  
  if (resumeData.skills) {
    fullText += ` ${resumeData.skills}`
  }
  
  const analyzer = new ResumeNLPAnalyzer(fullText, industry)
  return analyzer.analyze()
}

import nlp from 'compromise'
import Sentiment from 'sentiment'

const sentiment = new Sentiment()

export function extractKeywords(text: string): string[] {
  if (!text) return []
  const doc = nlp(text)
  // Get nouns, verbs, and topics
  const nouns = doc.nouns().out('array')
  const verbs = doc.verbs().out('array')
  const topics = doc.topics().out('array')
  // Deduplicate and filter
  return Array.from(new Set([...nouns, ...verbs, ...topics])).filter(w => w.length > 2)
}

export function analyzeSentiment(text: string): { score: number, comparative: number, type: string } {
  const result = sentiment.analyze(text)
  let type = 'neutral'
  if (result.score > 2) type = 'positive'
  else if (result.score < -2) type = 'negative'
  return { score: result.score, comparative: result.comparative, type }
}

export function enhanceSummary(text: string): string {
  if (!text) return ''
  const keywords = extractKeywords(text)
  const sentimentResult = analyzeSentiment(text)
  // Simple template-based enhancement
  let enhanced = text.trim()
  if (sentimentResult.type === 'negative') {
    enhanced = `Seeking new opportunities to leverage my skills. ${enhanced}`
  } else if (sentimentResult.type === 'positive') {
    enhanced = `Results-driven professional with strengths in ${keywords.slice(0, 3).join(', ')}. ${enhanced}`
  } else {
    enhanced = `Experienced in ${keywords.slice(0, 3).join(', ')}. ${enhanced}`
  }
  // Shorten to 2 sentences max
  const sentences = enhanced.split(/(?<=[.!?])\s+/)
  return sentences.slice(0, 2).join(' ')
}

export function improveDescription(text: string): string {
  if (!text) return ''
  const doc = nlp(text)
  const sentences: string[] = doc.sentences().out('array')
  // Add action verbs and bullet points
  return sentences.map((s: string) => {
    const verb = nlp(s).verbs().toPastTense().out('text')
    return `- ${verb || s}`
  }).join('\n')
}

export function suggestSkills(text: string): string {
  const keywords = extractKeywords(text)
  // List of known technical/professional skills
  const knownSkills = [
    'Machine Learning', 'Java', 'C++', 'Python', 'React', 'Node.js', 'Docker', 'SQL', 'Git',
    'AWS', 'Azure', 'GCP', 'Kubernetes', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Linux',
    'TensorFlow', 'PyTorch', 'Scikit-learn', 'PostgreSQL', 'MongoDB', 'MySQL', 'Figma', 'Photoshop',
    'Agile', 'Scrum', 'Jira', 'CI/CD', 'REST', 'GraphQL', 'Spring', 'Django', 'Flask', 'Express',
    'C#', '.NET', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Objective-C', 'R', 'SAS', 'SPSS',
    'Tableau', 'Power BI', 'Excel', 'Salesforce', 'SAP', 'Oracle', 'MATLAB', 'Perl', 'Hadoop', 'Spark'
  ]
  // Filter keywords to include only known skills
  const filteredSkills = keywords.filter(word =>
    knownSkills.some(skill => word.toLowerCase() === skill.toLowerCase())
  )
  // If no skills found, fallback to some tech skills
  const finalSkills = filteredSkills.length > 0 ? filteredSkills : knownSkills.slice(0, 8)
  return finalSkills.slice(0, 15).join(', ')
}

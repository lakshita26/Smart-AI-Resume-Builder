export const industryKeywords = {
  technology: [
    'software development',
    'web development',
    'backend',
    'frontend',
    'full stack',
    'agile',
    'scrum',
    'kanban',
    'CI/CD',
    'cloud computing',
    'AWS',
    'Azure',
    'GCP',
    'Docker',
    'Kubernetes',
    'microservices',
    'API development',
    'REST',
    'GraphQL',
    'database design',
    'SQL',
    'Postgres',
    'MySQL',
    'NoSQL',
    'MongoDB',
    'version control',
    'Git',
    'testing',
    'unit testing',
    'integration testing',
    'debugging',
    'performance optimization',
    'scalability',
    'security',
    'devops',
    'infrastructure as code',
    'monitoring',
    'problem-solving',
    'collaboration',
    'code review',
    'technical documentation',
  ],
  marketing: [
    'digital marketing',
    'SEO',
    'SEM',
    'content marketing',
    'social media',
    'Google Analytics',
    'email campaigns',
    'A/B testing',
    'conversion optimization',
    'marketing automation',
    'CRM',
    'brand management',
    'market research',
    'campaign management',
    'ROI analysis',
    'stakeholder management',
    'content strategy',
    'growth marketing',
    'paid media',
  ],
  finance: [
    'financial analysis',
    'budgeting',
    'forecasting',
    'risk management',
    'compliance',
    'financial modeling',
    'Excel',
    'QuickBooks',
    'SAP',
    'auditing',
    'tax preparation',
    'accounts payable',
    'accounts receivable',
    'financial reporting',
    'GAAP',
    'regulatory compliance',
    'data analysis',
    'valuation',
  ],
  healthcare: [
    'patient care',
    'medical records',
    'HIPAA compliance',
    'EMR/EHR',
    'clinical procedures',
    'diagnosis',
    'treatment planning',
    'patient education',
    'medical terminology',
    'healthcare regulations',
    'quality assurance',
    'interdisciplinary collaboration',
    'telemedicine',
    'patient safety',
  ],
  education: [
    'curriculum development',
    'lesson planning',
    'classroom management',
    'student assessment',
    'educational technology',
    'differentiated instruction',
    'parent communication',
    'learning management systems',
    'student engagement',
    'educational standards',
    'instructional design',
    'assessment design',
  ],
  general: [
    'leadership',
    'team management',
    'project management',
    'communication',
    'problem-solving',
    'critical thinking',
    'time management',
    'adaptability',
    'collaboration',
    'strategic planning',
    'data analysis',
    'process improvement',
    'stakeholder management',
    'budget management',
    'presentation skills',
  ],
};

export const actionVerbs = [
  'achieved',
  'improved',
  'developed',
  'implemented',
  'led',
  'managed',
  'created',
  'designed',
  'optimized',
  'increased',
  'reduced',
  'streamlined',
  'coordinated',
  'executed',
  'delivered',
  'launched',
  'established',
  'transformed',
  'analyzed',
  'resolved',
  'spearheaded',
  'orchestrated',
  'mentored',
  'automated',
];

export const atsOptimizationTips = [
  'Use standard section headings (Experience, Education, Skills)',
  'Include relevant keywords from the job description',
  'Use a simple, clean format without complex tables or graphics',
  'List skills in a dedicated Skills section',
  'Include measurable achievements with numbers and percentages',
  'Use industry-standard job titles',
  'Spell out acronyms on first use',
  'Save as .docx or .pdf format',
  'Use standard fonts (Arial, Calibri, Times New Roman)',
  'Avoid headers and footers for important information',
];

export const INDUSTRY_KEYWORDS = industryKeywords;
export const ACTION_VERBS = actionVerbs;
export const ATS_OPTIMIZATION_TIPS = atsOptimizationTips;

export function getRelevantKeywords(industry: string, skills: string[]): string[] {
  const industryKeys = industryKeywords[industry as keyof typeof industryKeywords] || industryKeywords.general;
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
  const currentSkillsNormalized = skills
    .flatMap(s => s.split(',').map(x => normalize(x)))
    .filter(Boolean)

  // return keywords that are not already present (by partial token match)
  const results = [] as string[]
  for (const keyword of industryKeys) {
    const nk = normalize(keyword)
    const present = currentSkillsNormalized.some(cs => cs.includes(nk) || nk.includes(cs))
    if (!present) results.push(keyword)
    if (results.length >= 12) break
  }
  return results
}

export function calculateKeywordMatch(content: string, targetKeywords: string[]): number {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
  const contentNorm = normalize(content)
  const matchedKeywords = targetKeywords.filter(keyword => {
    const k = normalize(keyword)
    // match by full token or partial token
    return contentNorm.split(' ').some(tok => tok === k || tok.includes(k) || k.includes(tok)) || contentNorm.includes(k)
  })

  return targetKeywords.length > 0
    ? Math.round((matchedKeywords.length / targetKeywords.length) * 100)
    : 0;
}

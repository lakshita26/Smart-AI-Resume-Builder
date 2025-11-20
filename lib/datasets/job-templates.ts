export interface JobTemplate {
  id: string;
  title: string;
  industry: string;
  level: 'entry' | 'mid' | 'senior' | 'executive';
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
}

export const jobTemplates: JobTemplate[] = [
  {
    id: '1',
    title: 'Software Engineer',
    industry: 'technology',
    level: 'mid',
    description: 'Develop and maintain scalable web applications',
    requiredSkills: [
      'JavaScript',
      'React',
      'Node.js',
      'SQL',
      'Git',
      'REST APIs',
      'Agile methodologies',
    ],
    preferredSkills: [
      'TypeScript',
      'AWS',
      'Docker',
      'CI/CD',
      'GraphQL',
      'Testing frameworks',
    ],
    responsibilities: [
      'Design and implement new features for web applications',
      'Collaborate with cross-functional teams',
      'Write clean, maintainable code',
      'Participate in code reviews',
      'Optimize application performance',
    ],
  },
  {
    id: '2',
    title: 'Digital Marketing Manager',
    industry: 'marketing',
    level: 'mid',
    description: 'Lead digital marketing initiatives and campaigns',
    requiredSkills: [
      'SEO/SEM',
      'Google Analytics',
      'Content Marketing',
      'Social Media Management',
      'Email Marketing',
      'Campaign Management',
    ],
    preferredSkills: [
      'Marketing Automation',
      'A/B Testing',
      'CRM Systems',
      'Data Analysis',
      'Paid Advertising',
    ],
    responsibilities: [
      'Develop and execute digital marketing strategies',
      'Manage marketing campaigns across multiple channels',
      'Analyze campaign performance and ROI',
      'Manage marketing budget',
      'Lead a team of marketing specialists',
    ],
  },
  {
    id: '3',
    title: 'Data Scientist',
    industry: 'technology',
    level: 'senior',
    description: 'Extract insights from complex datasets using ML',
    requiredSkills: [
      'Python',
      'Machine Learning',
      'Statistical Analysis',
      'SQL',
      'Data Visualization',
      'Deep Learning',
    ],
    preferredSkills: [
      'TensorFlow',
      'PyTorch',
      'Big Data (Spark)',
      'Cloud Platforms',
      'NLP',
      'Computer Vision',
    ],
    responsibilities: [
      'Build and deploy machine learning models',
      'Analyze large datasets to extract actionable insights',
      'Collaborate with engineering teams',
      'Present findings to stakeholders',
      'Mentor junior data scientists',
    ],
  },
  {
    id: '4',
    title: 'Financial Analyst',
    industry: 'finance',
    level: 'entry',
    description: 'Analyze financial data and prepare reports',
    requiredSkills: [
      'Financial Modeling',
      'Excel',
      'Data Analysis',
      'Financial Reporting',
      'Forecasting',
      'Budget Analysis',
    ],
    preferredSkills: [
      'SQL',
      'Power BI',
      'Python',
      'Bloomberg Terminal',
      'CFA Level 1',
    ],
    responsibilities: [
      'Prepare financial reports and forecasts',
      'Analyze financial performance',
      'Support budget planning process',
      'Conduct variance analysis',
      'Assist in month-end close',
    ],
  },
  {
    id: '5',
    title: 'Product Manager',
    industry: 'technology',
    level: 'senior',
    description: 'Define product strategy and roadmap',
    requiredSkills: [
      'Product Strategy',
      'Agile/Scrum',
      'User Research',
      'Data Analysis',
      'Stakeholder Management',
      'Roadmap Planning',
    ],
    preferredSkills: [
      'Technical Background',
      'SQL',
      'A/B Testing',
      'Wireframing',
      'API Knowledge',
    ],
    responsibilities: [
      'Define product vision and strategy',
      'Manage product backlog and roadmap',
      'Work with engineering teams',
      'Conduct user research and testing',
      'Analyze product metrics',
    ],
  },
  {
    id: '6',
    title: 'Frontend Engineer',
    industry: 'technology',
    level: 'mid',
    description: 'Build responsive, accessible user interfaces',
    requiredSkills: ['JavaScript', 'React', 'HTML', 'CSS', 'Accessibility', 'Performance'],
    preferredSkills: ['TypeScript', 'Testing frameworks', 'GraphQL', 'Webpack'],
    responsibilities: [
      'Implement UI components following design specs',
      'Optimize front-end performance',
      'Collaborate with designers and backend engineers',
      'Write unit and integration tests',
    ],
  },
  {
    id: '7',
    title: 'Backend Engineer',
    industry: 'technology',
    level: 'mid',
    description: 'Design and implement scalable server-side systems',
    requiredSkills: ['Java', 'Spring Boot', 'REST APIs', 'SQL', 'Database Design', 'Testing'],
    preferredSkills: ['Docker', 'Kubernetes', 'CI/CD', 'Cloud Platforms'],
    responsibilities: [
      'Design and build backend services',
      'Ensure reliability and scalability',
      'Integrate with databases and external APIs',
      'Participate in architecture discussions',
    ],
  },
  {
    id: '8',
    title: 'DevOps Engineer',
    industry: 'technology',
    level: 'mid',
    description: 'Maintain CI/CD pipelines and infrastructure automation',
    requiredSkills: ['CI/CD', 'Docker', 'Kubernetes', 'Terraform', 'Monitoring'],
    preferredSkills: ['AWS', 'Azure', 'GCP', 'SRE practices'],
    responsibilities: [
      'Build and maintain deployment pipelines',
      'Automate infrastructure provisioning',
      'Monitor system health and respond to incidents',
    ],
  },
];

export function findMatchingJobs(skills: string[], experience: number): JobTemplate[] {
  const level = experience < 2 ? 'entry' : experience < 5 ? 'mid' : 'senior';
  
  return jobTemplates
    .filter(job => job.level === level || (experience >= 5 && job.level === 'senior'))
    .map(job => {
      const matchedSkills = job.requiredSkills.filter(skill =>
        skills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      );
      
      return {
        ...job,
        matchScore: (matchedSkills.length / job.requiredSkills.length) * 100,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);
}

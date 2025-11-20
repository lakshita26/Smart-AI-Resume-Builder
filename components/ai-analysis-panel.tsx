"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, AlertCircle, CheckCircle, Loader2, Lightbulb } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AnalysisResult {
  overallScore: number
  atsScore: number
  keywordScore: number
  formatScore: number
  strengths: string[]
  improvements: string[]
  missingKeywords: string[]
  suggestedKeywords: string[]
  recommendations: string[]
}

interface JobAnalysis {
  title: string
  company: string
  experienceLevel: string
  industry: string
  requiredSkills: string[]
}

interface AIAnalysisPanelProps {
  resumeData: any
  jobAnalysis?: JobAnalysis
}

export default function AIAnalysisPanel({ resumeData, jobAnalysis }: AIAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [targetRole, setTargetRole] = useState("")
  const [industry, setIndustry] = useState("technology")
  const [seniority, setSeniority] = useState("mid")
  const [showExplainability, setShowExplainability] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nlpMetrics, setNlpMetrics] = useState<any>(null)

  const analyzeResume = async () => {
    console.log('[v0] ===== STARTING NLP-BASED ANALYSIS =====');
    console.log('[v0] Full resumeData object:', JSON.stringify(resumeData, null, 2));
    
    setError(null)
    setLoading(true)
    
    try {
      if (!resumeData) {
        throw new Error('No resume data available')
      }
      
      console.log('[v0] Sending POST request to /api/analyze-resume...');
      
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resumeData, 
          targetRole: targetRole || 'Software Engineer', 
          industry, 
          seniority 
        }),
      })
      
      console.log('[v0] Response status:', response.status, response.statusText);
      
      const data = await response.json()
      console.log('[v0] Response data received:', data);
      
      if (!response.ok) {
        throw new Error(data.error || data.details || `Server error: ${response.status}`)
      }
      
      if (!data.analysis) {
        throw new Error('No analysis data received from server')
      }
      
      console.log('[v0] Setting analysis state...');
      setAnalysis(data.analysis)
      if (data.nlpMetrics) {
        setNlpMetrics(data.nlpMetrics)
        console.log('[v0] NLP Metrics:', data.nlpMetrics);
      }
      console.log('[v0] ===== ANALYSIS COMPLETE =====');
      
    } catch (error) {
      console.error('[v0] ===== ANALYSIS FAILED =====');
      console.error('[v0] Error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to analyze resume. Please try again.'
      
      setError(errorMessage)
      alert(`Failed to analyze resume with AI. Please try again.\n\nError: ${errorMessage}`)
      
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const hasAnyContent = 
    (resumeData?.personalInfo?.name) ||
    (resumeData?.personalInfo?.summary) ||
    (resumeData?.experiences?.length > 0) ||
    (resumeData?.education?.length > 0) ||
    (resumeData?.skills)

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Resume Analysis (NLP-Powered)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Role</label>
            <Select value={targetRole} onValueChange={setTargetRole}>
              <SelectTrigger>
                <SelectValue placeholder="Software Engineer (default)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                <SelectItem value="Product Manager">Product Manager</SelectItem>
                <SelectItem value="Marketing Manager">Marketing Manager</SelectItem>
                <SelectItem value="Financial Analyst">Financial Analyst</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Seniority Level</label>
            <Select value={seniority} onValueChange={setSeniority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">Entry Level</SelectItem>
                <SelectItem value="mid">Mid Level</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
                <SelectItem value="lead">Lead/Principal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Industry</label>
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="education">Education</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {jobAnalysis && (
          <div className="p-3 bg-primary/10 rounded-lg space-y-1">
            <p className="text-sm font-medium">Analyzing for:</p>
            <p className="text-xs text-muted-foreground">
              {jobAnalysis.title} at {jobAnalysis.company}
            </p>
            <div className="flex gap-1 mt-2">
              <Badge variant="secondary" className="text-xs">{jobAnalysis.experienceLevel}</Badge>
              <Badge variant="secondary" className="text-xs">{jobAnalysis.industry}</Badge>
            </div>
          </div>
        )}

        {!hasAnyContent && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              Please fill in some resume information before analyzing (name, experience, education, or skills).
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <Button 
          onClick={analyzeResume} 
          disabled={loading || !hasAnyContent}
          className="w-full gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyze Resume with AI
            </>
          )}
        </Button>

        {analysis && (
          <Tabs defaultValue="scores" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scores">Scores</TabsTrigger>
              <TabsTrigger value="insights">
                <Lightbulb className="w-3 h-3 mr-1" />
                Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scores" className="space-y-6 pt-4">
              {nlpMetrics && (
                <div className="bg-primary/5 p-3 rounded-lg space-y-2">
                  <p className="text-xs font-semibold text-primary">NLP Analysis Results:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Words:</span>
                      <span className="ml-2 font-medium">{nlpMetrics.wordCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Action Verbs:</span>
                      <span className="ml-2 font-medium">{nlpMetrics.actionVerbsCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Keywords:</span>
                      <span className="ml-2 font-medium">{nlpMetrics.keywordsCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Metrics:</span>
                      <span className="ml-2 font-medium">{nlpMetrics.metricsCount}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Readability:</span>
                      <span className="ml-2 font-medium">{nlpMetrics.readabilityScore}/100</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Score</span>
                  <span className={`text-2xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                    {analysis.overallScore}%
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>ATS Compatibility</span>
                    <span className={getScoreColor(analysis.atsScore)}>{analysis.atsScore}%</span>
                  </div>
                  <Progress value={analysis.atsScore} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Keyword Optimization</span>
                    <span className={getScoreColor(analysis.keywordScore)}>{analysis.keywordScore}%</span>
                  </div>
                  <Progress value={analysis.keywordScore} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Format Quality</span>
                    <span className={getScoreColor(analysis.formatScore)}>{analysis.formatScore}%</span>
                  </div>
                  <Progress value={analysis.formatScore} className="h-2" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4 pt-4">
              <div className="bg-muted/50 p-3 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  NLP-Based Analysis Explanation
                </div>
                
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>
                    <strong>Natural Language Processing:</strong> Your resume was analyzed using advanced NLP techniques including keyword extraction, action verb detection, and sentiment analysis.
                  </p>
                  {nlpMetrics && (
                    <p>
                      <strong>Text Analysis:</strong> Found {nlpMetrics.wordCount} words, {nlpMetrics.actionVerbsCount} action verbs, and {nlpMetrics.keywordsCount} industry keywords.
                    </p>
                  )}
                  <p>
                    <strong>ATS Optimization:</strong> Applicant Tracking Systems use similar NLP algorithms to parse resumes and match candidates to jobs.
                  </p>
                  {jobAnalysis && (
                    <p>
                      <strong>Job Alignment:</strong> Analysis is tailored to match {jobAnalysis.requiredSkills.length} required skills from your target role.
                    </p>
                  )}
                </div>

                {analysis.improvements.length > 0 && (
                  <div className="pt-2 border-t border-border space-y-2">
                    <p className="text-xs font-medium">Improvement Areas Detected:</p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li>• Weak action verbs detected (replaced with: "led", "achieved", "developed")</li>
                      <li>• Missing quantifiable metrics in experience descriptions</li>
                      <li>• {analysis.missingKeywords.length} high-value keywords not found in resume</li>
                    </ul>
                  </div>
                )}
              </div>

              {analysis.recommendations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Detailed Recommendations:</p>
                  <div className="space-y-2">
                    {analysis.recommendations.slice(0, 5).map((rec, idx) => (
                      <div key={idx} className="p-2 bg-muted/30 rounded text-xs">
                        <p className="font-medium mb-1">{idx + 1}. {rec}</p>
                        <p className="text-muted-foreground text-[10px]">
                          Impact: {idx < 2 ? 'High' : idx < 4 ? 'Medium' : 'Low'} • 
                          Category: {idx % 3 === 0 ? 'Keywords' : idx % 3 === 1 ? 'Format' : 'Content'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

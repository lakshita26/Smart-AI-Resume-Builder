"use client"

import { useState } from "react"
import { useToast } from '@/hooks/use-toast'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Loader2, CheckCircle } from 'lucide-react'

interface JobAnalysis {
  title: string
  company: string
  requiredSkills: string[]
  preferredSkills: string[]
  responsibilities: string[]
  qualifications: string[]
  keywords: string[]
  experienceLevel: string
  industry: string
}

interface JobDescriptionInputProps {
  onAnalysisComplete: (analysis: JobAnalysis) => void
}

export default function JobDescriptionInput({ onAnalysisComplete }: JobDescriptionInputProps) {
  const [jobDescription, setJobDescription] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null)
  const { toast } = useToast()

  const handleParse = async () => {
    if (!jobDescription.trim()) return
    
    setAnalyzing(true)
    try {
      const response = await fetch('/api/parse-job-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription }),
      })

      const data = await response.json()
      setAnalysis(data.analysis)
      onAnalysisComplete(data.analysis)
      if (data.fallback) {
        try { toast({ title: 'Job Analysis', description: 'AI gateway not configured — showing local fallback analysis.' }) } catch (e) {}
      }
    } catch (error) {
      console.error('[v0] Job parsing failed:', error)
      try { toast({ title: 'Job Analysis', description: 'Failed to parse job description. Please try again.' }) } catch (e) {}
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Job Description Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Paste Job Description</label>
          <Textarea
            placeholder="Paste the full job description here..."
            rows={8}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            AI will extract key requirements, skills, and keywords for tailoring your resume
          </p>
        </div>

        <Button 
          onClick={handleParse}
          disabled={analyzing || !jobDescription.trim()}
          className="w-full gap-2"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing Job Description...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Parse with AI
            </>
          )}
        </Button>

        {analysis && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">{analysis.title}</p>
                <p className="text-sm text-muted-foreground">{analysis.company}</p>
                <Badge variant="secondary" className="text-xs">
                  {analysis.experienceLevel} · {analysis.industry}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Required Skills ({analysis.requiredSkills.length})</p>
              <div className="flex flex-wrap gap-1">
                {analysis.requiredSkills.slice(0, 8).map((skill, idx) => (
                  <Badge key={idx} variant="default" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {analysis.requiredSkills.length > 8 && (
                  <Badge variant="outline" className="text-xs">
                    +{analysis.requiredSkills.length - 8} more
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">ATS Keywords ({analysis.keywords.length})</p>
              <div className="flex flex-wrap gap-1">
                {analysis.keywords.slice(0, 10).map((keyword, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

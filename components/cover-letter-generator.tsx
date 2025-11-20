"use client"

import { useState } from "react"
import { useToast } from '@/hooks/use-toast'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { FileText, Loader2, Download, Lightbulb } from 'lucide-react'

interface CoverLetterGeneratorProps {
  resumeData: any
  jobDescription?: string
}

export default function CoverLetterGenerator({ resumeData, jobDescription }: CoverLetterGeneratorProps) {
  const [companyName, setCompanyName] = useState("")
  const [position, setPosition] = useState("")
  const [tone, setTone] = useState("professional")
  const [jobDesc, setJobDesc] = useState(jobDescription || "")
  const [generating, setGenerating] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [keywordsUsed, setKeywordsUsed] = useState<string[]>([])
  const [matchedExp, setMatchedExp] = useState<string[]>([])
  const { toast } = useToast()

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const response = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeData,
          jobDescription: jobDesc,
          companyName,
          position,
          tone,
        }),
      })

      const data = await response.json()
      setCoverLetter(data.coverLetter)
      setKeywordsUsed(data.keywordsUsed || [])
      setMatchedExp(data.matchedExperiences || [])
      if (data.fallback) {
        try { toast({ title: 'Cover Letter', description: 'AI gateway not configured — showing local fallback result.' }) } catch (e) {}
      }
    } catch (error) {
      console.error('[v0] Cover letter generation failed:', error)
      try { toast({ title: 'Cover Letter', description: 'Failed to generate cover letter. Please try again.' }) } catch (e) {}
    } finally {
      setGenerating(false)
    }
  }

  const handleExport = () => {
    const element = document.createElement('a')
    const file = new Blob([coverLetter], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `cover-letter-${companyName || 'draft'}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          AI Cover Letter Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input
              placeholder="e.g., Google"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Position</Label>
            <Input
              placeholder="e.g., Software Engineer"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="conversational">Conversational</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Job Description (Optional)</Label>
          <Textarea
            placeholder="Paste job description to tailor the cover letter..."
            rows={4}
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            className="text-xs"
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating || !companyName || !position}
          className="w-full gap-2"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Cover Letter...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Generate with AI
            </>
          )}
        </Button>

        {coverLetter && (
          <div className="space-y-4 pt-4 border-t border-border">
            {/* Explainability Section */}
            {keywordsUsed.length > 0 && (
              <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  AI Insights
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Keywords Incorporated:</p>
                    <div className="flex flex-wrap gap-1">
                      {keywordsUsed.map((keyword, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {matchedExp.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Highlighted Experiences:</p>
                      <div className="flex flex-wrap gap-1">
                        {matchedExp.map((exp, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {exp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={16}
              className="font-serif text-sm"
            />

            <Button onClick={handleExport} variant="outline" className="w-full gap-2">
              <Download className="w-4 h-4" />
              Export Cover Letter
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

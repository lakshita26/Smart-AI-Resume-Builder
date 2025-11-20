"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Download, Eye, Sparkles, Loader2, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import ResumePreview from "@/components/resume-preview"
import JobDescriptionInput from "@/components/job-description-input"
import CoverLetterGenerator from "@/components/cover-letter-generator"

interface Experience {
  id: string
  company: string
  position: string
  duration: string
  description: string
}

interface Education {
  id: string
  institution: string
  degree: string
  duration: string
  description: string
}

export default function ResumeBuilder() {
  const [template, setTemplate] = useState("modern")
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
  })
  const [experiences, setExperiences] = useState<Experience[]>([
    { id: "1", company: "", position: "", duration: "", description: "" },
  ])
  const [education, setEducation] = useState<Education[]>([
    { id: "1", institution: "", degree: "", duration: "", description: "" },
  ])
  const [skills, setSkills] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const resumeRef = useRef<HTMLDivElement>(null)
  const [enhancing, setEnhancing] = useState<string | null>(null)
  const [jobAnalysis, setJobAnalysis] = useState<any>(null)
  const [showJobInput, setShowJobInput] = useState(false)
  const [showCoverLetter, setShowCoverLetter] = useState(false)
  const [exportFormat, setExportFormat] = useState<'pdf' | 'word'>('pdf')

  const addExperience = () => {
    setExperiences([
      ...experiences,
      { id: Date.now().toString(), company: "", position: "", duration: "", description: "" },
    ])
  }

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter((exp) => exp.id !== id))
  }

  const addEducation = () => {
    setEducation([
      ...education,
      { id: Date.now().toString(), institution: "", degree: "", duration: "", description: "" },
    ])
  }

  const removeEducation = (id: string) => {
    setEducation(education.filter((edu) => edu.id !== id))
  }

  const handleExportPDF = async () => {
    if (!resumeRef.current) return

    try {
      console.log("[v0] Starting PDF export...")
      
      // Create a print-friendly version
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        alert('Please allow popups to download the PDF')
        return
      }

      // Get the resume content
      const resumeContent = resumeRef.current.innerHTML

      // Write print-friendly HTML
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${personalInfo.name || 'Resume'}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              background: white;
              color: black;
              padding: 20px;
              line-height: 1.6;
            }
            @media print {
              body {
                margin: 0;
                padding: 20px;
              }
            }
            h1, h2, h3, h4, h5, h6 {
              color: #1a1a1a;
              margin-bottom: 0.5em;
            }
            p {
              margin-bottom: 0.5em;
            }
            .text-muted-foreground,
            .text-muted,
            .text-gray-600 {
              color: #666 !important;
            }
            /* Force all colors to print-safe values */
            [class*="bg-"] {
              background-color: white !important;
            }
            [class*="text-"] {
              color: black !important;
            }
            [class*="border-"] {
              border-color: #ccc !important;
            }
          </style>
        </head>
        <body>
          ${resumeContent}
        </body>
        </html>
      `)
      
      printWindow.document.close()
      
      // Wait for content to load, then trigger print dialog
      setTimeout(() => {
        printWindow.print()
        // Close the window after printing (user can save as PDF)
        setTimeout(() => {
          printWindow.close()
        }, 100)
      }, 250)
      
      console.log("[v0] Print dialog opened")
    } catch (error) {
      console.log("[v0] PDF export failed:", error)
      alert("Failed to export PDF. Please try again.")
    }
  }

  const handleExportWord = () => {
    const htmlContent = resumeRef.current?.innerHTML || ''
    const blob = new Blob([`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${personalInfo.name || 'Resume'}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
          h1, h2, h3 { color: #1a1a1a; margin-bottom: 0.5em; }
          p { margin-bottom: 0.5em; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `], { type: 'application/msword' })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${personalInfo.name || 'Resume'}.doc`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExport = () => {
    if (exportFormat === 'pdf') {
      handleExportPDF()
    } else {
      handleExportWord()
    }
  }

  const { toast } = useToast()

  const enhanceContent = async (type: 'summary' | 'description' | 'skills', experienceId?: string) => {
    setEnhancing(type + (experienceId || ''))
    try {
      let content = ''
      let context = ''

      if (type === 'summary') {
        content = personalInfo.summary
        context = `${personalInfo.name}, ${experiences[0]?.position || 'professional'}`
      } else if (type === 'skills') {
        content = skills
        context = experiences[0]?.position || 'general professional'
      } else if (type === 'description' && experienceId) {
        const exp = experiences.find(e => e.id === experienceId)
        content = exp?.description || ''
        context = `${exp?.position} at ${exp?.company}`
      }

      // client-side timeout and abort
      const controller = new AbortController()
      const signal = controller.signal
      const clientTimeout = setTimeout(() => controller.abort(), 9000)

      let response: Response
      try {
        response = await fetch('/api/enhance-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, type, context }),
          signal,
        })
      } catch (err: any) {
        clearTimeout(clientTimeout)
        if (err?.name === 'AbortError') {
          // client-side timeout — provide a deterministic local fallback
          const fallbackLocal = {
            // Return a concise first-N-words summary (idempotent, avoids duplication)
            summary: (c: string) => {
              const words = (c || '').trim().split(/\s+/).filter(Boolean)
              const max = 40
              return words.slice(0, max).join(' ') + (words.length > max ? '...' : '')
            },
            description: (c: string) => {
              const lines = (c || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
              if (lines.length === 0) return c
              return lines.map((line) => (/^[-*•]\s*/.test(line) ? line : `- ${line}`)).join('\n')
            },
            skills: (c: string) => {
              const cleaned = (c || '').split(',').map(s => s.trim()).filter(Boolean)
              if (cleaned.length === 0) {
                // Provide a broad set of technical + soft skills as a helpful default
                return 'Machine Learning, Java, C++, Python, React, Node.js, Docker, SQL, Git, Communication, Teamwork, Problem Solving'
              }
              return cleaned.slice(0, 30).join(', ')
            }
          }

          const enhanced = (fallbackLocal as any)[type]?.(content) || content

          // If the enhancement didn't change the content, notify and don't update
          if ((enhanced || '').trim() === (content || '').trim()) {
            try { toast({ title: 'AI Enhance', description: 'No improvements were generated.' }) } catch (e) {}
            return
          }

          if (type === 'summary') setPersonalInfo({ ...personalInfo, summary: enhanced })
          else if (type === 'skills') setSkills(enhanced)
          else if (type === 'description' && experienceId) setExperiences(experiences.map(exp => exp.id === experienceId ? { ...exp, description: enhanced } : exp))

          try { toast({ title: 'AI Enhance', description: 'Request timed out — showing local fallback result.' }) } catch (e) {}
          return
        }
        throw err
      }

      clearTimeout(clientTimeout)
      const data = await response.json()
      if (!response.ok) {
        try { toast({ title: 'AI Enhance', description: data?.error || 'Enhancement failed' }) } catch (e) {}
      } else {
        if (data.fallback) {
          try { toast({ title: 'AI Enhance', description: 'AI gateway not configured — showing local fallback result.' }) } catch (e) {}
        }

        // If the enhancement didn't change the content, notify and skip updating state
        const enhancedTrim = (data.enhanced || '').trim()
        if (enhancedTrim === (content || '').trim()) {
          try { toast({ title: 'AI Enhance', description: 'No improvements were generated.' }) } catch (e) {}
        } else {
          if (type === 'summary') {
            setPersonalInfo({ ...personalInfo, summary: data.enhanced })
          } else if (type === 'skills') {
            setSkills(data.enhanced)
          } else if (type === 'description' && experienceId) {
            setExperiences(experiences.map(exp =>
              exp.id === experienceId ? { ...exp, description: data.enhanced } : exp
            ))
          }
        }
      }
    } catch (error) {
      console.error('[v0] Enhancement failed:', error)
      try { toast({ title: 'AI Enhance', description: 'Failed to enhance content. Please try again.' }) } catch (e) {}
    } finally {
      setEnhancing(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <Button
          variant={showJobInput ? "default" : "outline"}
          onClick={() => setShowJobInput(!showJobInput)}
          className="gap-2"
        >
          <FileText className="w-4 h-4" />
          {showJobInput ? "Hide" : "Add"} Job Description
        </Button>
        <Button
          variant={showCoverLetter ? "default" : "outline"}
          onClick={() => setShowCoverLetter(!showCoverLetter)}
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {showCoverLetter ? "Hide" : "Generate"} Cover Letter
        </Button>
      </div>

      {showJobInput && (
        <JobDescriptionInput onAnalysisComplete={setJobAnalysis} />
      )}

      {showCoverLetter && (
        <CoverLetterGenerator 
          resumeData={{ personalInfo, experiences, education, skills }}
          jobDescription={jobAnalysis?.title ? `${jobAnalysis.title} at ${jobAnalysis.company}` : undefined}
        />
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="space-y-6">
          {/* Template Selection */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Choose Template
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={template} onValueChange={setTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Form Tabs */}
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                </TabsList>

                {/* Personal Info */}
                <TabsContent value="personal" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={personalInfo.name}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        placeholder="+1 234 567 8900"
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="San Francisco, CA"
                      value={personalInfo.location}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="summary">Professional Summary</Label>
                    <Textarea
                      id="summary"
                      placeholder="Brief professional summary..."
                      rows={4}
                      value={personalInfo.summary}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 bg-transparent"
                      onClick={() => enhanceContent('summary')}
                      disabled={enhancing === 'summary' || !personalInfo.summary}
                    >
                      {enhancing === 'summary' ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          AI Enhance
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>

                {/* Experience */}
                <TabsContent value="experience" className="space-y-4 mt-4">
                  {experiences.map((exp, index) => (
                    <Card key={exp.id} className="border-border bg-muted/30">
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-foreground">Experience {index + 1}</h4>
                          {experiences.length > 1 && (
                            <Button variant="ghost" size="sm" onClick={() => removeExperience(exp.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Company</Label>
                            <Input
                              placeholder="Company Name"
                              value={exp.company}
                              onChange={(e) => {
                                const updated = experiences.map((item) =>
                                  item.id === exp.id ? { ...item, company: e.target.value } : item,
                                )
                                setExperiences(updated)
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Position</Label>
                            <Input
                              placeholder="Job Title"
                              value={exp.position}
                              onChange={(e) => {
                                const updated = experiences.map((item) =>
                                  item.id === exp.id ? { ...item, position: e.target.value } : item,
                                )
                                setExperiences(updated)
                              }}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Duration</Label>
                          <Input
                            placeholder="Jan 2020 - Present"
                            value={exp.duration}
                            onChange={(e) => {
                              const updated = experiences.map((item) =>
                                item.id === exp.id ? { ...item, duration: e.target.value } : item,
                              )
                              setExperiences(updated)
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            placeholder="Key responsibilities and achievements..."
                            rows={3}
                            value={exp.description}
                            onChange={(e) => {
                              const updated = experiences.map((item) =>
                                item.id === exp.id ? { ...item, description: e.target.value } : item,
                              )
                              setExperiences(updated)
                            }}
                          />
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2 bg-transparent"
                            onClick={() => enhanceContent('description', exp.id)}
                            disabled={enhancing === `description${exp.id}` || !exp.description}
                          >
                            {enhancing === `description${exp.id}` ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Enhancing...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3" />
                                AI Enhance
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button onClick={addExperience} variant="outline" className="w-full gap-2 bg-transparent">
                    <Plus className="w-4 h-4" />
                    Add Experience
                  </Button>
                </TabsContent>

                {/* Education */}
                <TabsContent value="education" className="space-y-4 mt-4">
                  {education.map((edu, index) => (
                    <Card key={edu.id} className="border-border bg-muted/30">
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-foreground">Education {index + 1}</h4>
                          {education.length > 1 && (
                            <Button variant="ghost" size="sm" onClick={() => removeEducation(edu.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Institution</Label>
                            <Input
                              placeholder="University Name"
                              value={edu.institution}
                              onChange={(e) => {
                                const updated = education.map((item) =>
                                  item.id === edu.id ? { ...item, institution: e.target.value } : item,
                                )
                                setEducation(updated)
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Degree</Label>
                            <Input
                              placeholder="Bachelor of Science"
                              value={edu.degree}
                              onChange={(e) => {
                                const updated = education.map((item) =>
                                  item.id === edu.id ? { ...item, degree: e.target.value } : item,
                                )
                                setEducation(updated)
                              }}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Duration</Label>
                          <Input
                            placeholder="2016 - 2020"
                            value={edu.duration}
                            onChange={(e) => {
                              const updated = education.map((item) =>
                                item.id === edu.id ? { ...item, duration: e.target.value } : item,
                              )
                              setEducation(updated)
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            placeholder="Relevant coursework, achievements..."
                            rows={2}
                            value={edu.description}
                            onChange={(e) => {
                              const updated = education.map((item) =>
                                item.id === edu.id ? { ...item, description: e.target.value } : item,
                              )
                              setEducation(updated)
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button onClick={addEducation} variant="outline" className="w-full gap-2 bg-transparent">
                    <Plus className="w-4 h-4" />
                    Add Education
                  </Button>
                </TabsContent>

                {/* Skills */}
                <TabsContent value="skills" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills (comma separated)</Label>
                    <Textarea
                      id="skills"
                      placeholder="JavaScript, React, Node.js, Python, Machine Learning"
                      rows={6}
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate each skill with a comma for better formatting. Examples: Machine Learning, Java, C++, React, Docker
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 bg-transparent"
                    onClick={() => enhanceContent('skills')}
                    disabled={enhancing === 'skills'}
                  >
                    {enhancing === 'skills' ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Suggesting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        Suggest Skills
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button className="flex-1 gap-2" onClick={() => setShowPreview(!showPreview)}>
              <Eye className="w-4 h-4" />
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>
            
            <div className="flex-1 flex gap-2">
              <Select value={exportFormat} onValueChange={(val: 'pdf' | 'word') => setExportFormat(val)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="word">Word</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleExport}
                disabled={!showPreview}
              >
                <Download className="w-4 h-4" />
                Export {exportFormat.toUpperCase()}
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:sticky lg:top-24">
          {showPreview ? (
            <div ref={resumeRef}>
              <ResumePreview
                template={template}
                personalInfo={personalInfo}
                experiences={experiences}
                education={education}
                skills={skills}
              />
            </div>
          ) : (
            <Card className="border-border bg-card">
              <CardContent className="py-16 text-center">
                <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Click "Show Preview" to see your resume</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

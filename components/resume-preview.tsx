import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin, Briefcase, GraduationCap, Code } from "lucide-react"

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

interface PersonalInfo {
  name: string
  email: string
  phone: string
  location: string
  summary: string
}

interface ResumePreviewProps {
  template: string
  personalInfo: PersonalInfo
  experiences: Experience[]
  education: Education[]
  skills: string
}

export default function ResumePreview({ template, personalInfo, experiences, education, skills }: ResumePreviewProps) {
  const skillsList = skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  const renderTemplate = () => {
    switch (template) {
      case "modern":
        return (
          <ModernTemplate
            personalInfo={personalInfo}
            experiences={experiences}
            education={education}
            skillsList={skillsList}
          />
        )
      case "professional":
        return (
          <ProfessionalTemplate
            personalInfo={personalInfo}
            experiences={experiences}
            education={education}
            skillsList={skillsList}
          />
        )
      case "minimal":
        return (
          <MinimalTemplate
            personalInfo={personalInfo}
            experiences={experiences}
            education={education}
            skillsList={skillsList}
          />
        )
      case "creative":
        return (
          <CreativeTemplate
            personalInfo={personalInfo}
            experiences={experiences}
            education={education}
            skillsList={skillsList}
          />
        )
      default:
        return (
          <ModernTemplate
            personalInfo={personalInfo}
            experiences={experiences}
            education={education}
            skillsList={skillsList}
          />
        )
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-8 space-y-6" style={{ minHeight: "800px" }}>
        {renderTemplate()}
      </CardContent>
    </Card>
  )
}

// Modern Template (Original Design)
function ModernTemplate({ personalInfo, experiences, education, skillsList }: any) {
  return (
    <>
      <div className="text-center space-y-2 pb-6 border-b border-border">
        <h1 className="text-3xl font-bold text-foreground">{personalInfo.name || "Your Name"}</h1>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap">
          {personalInfo.email && (
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {personalInfo.email}
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {personalInfo.phone}
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {personalInfo.location}
            </div>
          )}
        </div>
      </div>

      {personalInfo.summary && (
        <div>
          <h2 className="text-lg font-semibold text-primary mb-2">Professional Summary</h2>
          <p className="text-sm text-foreground leading-relaxed">{personalInfo.summary}</p>
        </div>
      )}

      {experiences.some((exp: any) => exp.company || exp.position) && (
        <div>
          <h2 className="text-lg font-semibold text-primary mb-3">Experience</h2>
          <div className="space-y-4">
            {experiences.map(
              (exp: any) =>
                (exp.company || exp.position) && (
                  <div key={exp.id} className="space-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{exp.position || "Position"}</h3>
                        <p className="text-sm text-muted-foreground">{exp.company || "Company"}</p>
                      </div>
                      {exp.duration && <span className="text-xs text-muted-foreground">{exp.duration}</span>}
                    </div>
                    {exp.description && <p className="text-sm text-foreground leading-relaxed">{exp.description}</p>}
                  </div>
                ),
            )}
          </div>
        </div>
      )}

      {education.some((edu: any) => edu.institution || edu.degree) && (
        <div>
          <h2 className="text-lg font-semibold text-primary mb-3">Education</h2>
          <div className="space-y-4">
            {education.map(
              (edu: any) =>
                (edu.institution || edu.degree) && (
                  <div key={edu.id} className="space-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{edu.degree || "Degree"}</h3>
                        <p className="text-sm text-muted-foreground">{edu.institution || "Institution"}</p>
                      </div>
                      {edu.duration && <span className="text-xs text-muted-foreground">{edu.duration}</span>}
                    </div>
                    {edu.description && <p className="text-sm text-foreground leading-relaxed">{edu.description}</p>}
                  </div>
                ),
            )}
          </div>
        </div>
      )}

      {skillsList.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-primary mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skillsList.map((skill: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// Professional Template (Two-column layout with left sidebar)
function ProfessionalTemplate({ personalInfo, experiences, education, skillsList }: any) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left Sidebar */}
      <div className="col-span-1 space-y-6 border-r border-border pr-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{personalInfo.name || "Your Name"}</h1>
          <div className="space-y-1 text-xs text-muted-foreground">
            {personalInfo.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="break-all">{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 flex-shrink-0" />
                {personalInfo.phone}
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                {personalInfo.location}
              </div>
            )}
          </div>
        </div>

        {skillsList.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Code className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-primary uppercase">Skills</h2>
            </div>
            <div className="space-y-1">
              {skillsList.map((skill: string, index: number) => (
                <div key={index} className="text-xs text-foreground">
                  • {skill}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Content */}
      <div className="col-span-2 space-y-6">
        {personalInfo.summary && (
          <div>
            <p className="text-sm text-foreground leading-relaxed">{personalInfo.summary}</p>
          </div>
        )}

        {experiences.some((exp: any) => exp.company || exp.position) && (
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
              <Briefcase className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-primary uppercase">Experience</h2>
            </div>
            <div className="space-y-4">
              {experiences.map(
                (exp: any) =>
                  (exp.company || exp.position) && (
                    <div key={exp.id} className="space-y-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground text-sm">{exp.position || "Position"}</h3>
                          <p className="text-xs text-muted-foreground">{exp.company || "Company"}</p>
                        </div>
                        {exp.duration && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{exp.duration}</span>
                        )}
                      </div>
                      {exp.description && <p className="text-xs text-foreground leading-relaxed">{exp.description}</p>}
                    </div>
                  ),
              )}
            </div>
          </div>
        )}

        {education.some((edu: any) => edu.institution || edu.degree) && (
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
              <GraduationCap className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-primary uppercase">Education</h2>
            </div>
            <div className="space-y-4">
              {education.map(
                (edu: any) =>
                  (edu.institution || edu.degree) && (
                    <div key={edu.id} className="space-y-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground text-sm">{edu.degree || "Degree"}</h3>
                          <p className="text-xs text-muted-foreground">{edu.institution || "Institution"}</p>
                        </div>
                        {edu.duration && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{edu.duration}</span>
                        )}
                      </div>
                      {edu.description && <p className="text-xs text-foreground leading-relaxed">{edu.description}</p>}
                    </div>
                  ),
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Minimal Template (Clean, simple, and compact)
function MinimalTemplate({ personalInfo, experiences, education, skillsList }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-1 pb-3 border-b-2 border-primary">
        <h1 className="text-4xl font-light text-foreground tracking-wide">{personalInfo.name || "Your Name"}</h1>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </div>

      {personalInfo.summary && (
        <div>
          <p className="text-sm text-foreground leading-relaxed">{personalInfo.summary}</p>
        </div>
      )}

      {experiences.some((exp: any) => exp.company || exp.position) && (
        <div>
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Experience</h2>
          <div className="space-y-3">
            {experiences.map(
              (exp: any) =>
                (exp.company || exp.position) && (
                  <div key={exp.id}>
                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className="font-semibold text-foreground text-sm">{exp.position || "Position"}</h3>
                      {exp.duration && <span className="text-xs text-muted-foreground">{exp.duration}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{exp.company || "Company"}</p>
                    {exp.description && <p className="text-xs text-foreground leading-relaxed">{exp.description}</p>}
                  </div>
                ),
            )}
          </div>
        </div>
      )}

      {education.some((edu: any) => edu.institution || edu.degree) && (
        <div>
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Education</h2>
          <div className="space-y-3">
            {education.map(
              (edu: any) =>
                (edu.institution || edu.degree) && (
                  <div key={edu.id}>
                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className="font-semibold text-foreground text-sm">{edu.degree || "Degree"}</h3>
                      {edu.duration && <span className="text-xs text-muted-foreground">{edu.duration}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{edu.institution || "Institution"}</p>
                    {edu.description && <p className="text-xs text-foreground leading-relaxed">{edu.description}</p>}
                  </div>
                ),
            )}
          </div>
        </div>
      )}

      {skillsList.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Skills</h2>
          <p className="text-sm text-foreground">{skillsList.join(" • ")}</p>
        </div>
      )}
    </div>
  )
}

// Creative Template (Bold colors and modern design)
function CreativeTemplate({ personalInfo, experiences, education, skillsList }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-primary/10 -m-8 p-8 mb-6 border-l-4 border-primary">
        <h1 className="text-4xl font-bold text-primary mb-3">{personalInfo.name || "Your Name"}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-foreground">
          {personalInfo.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              {personalInfo.email}
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              {personalInfo.phone}
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              {personalInfo.location}
            </div>
          )}
        </div>
      </div>

      {personalInfo.summary && (
        <div className="bg-muted/30 p-4 rounded-lg border-l-4 border-primary">
          <p className="text-sm text-foreground leading-relaxed italic">{personalInfo.summary}</p>
        </div>
      )}

      {experiences.some((exp: any) => exp.company || exp.position) && (
        <div>
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Experience
          </h2>
          <div className="space-y-4 pl-4 border-l-2 border-primary/30">
            {experiences.map(
              (exp: any) =>
                (exp.company || exp.position) && (
                  <div key={exp.id} className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                    <div className="space-y-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-foreground">{exp.position || "Position"}</h3>
                          <p className="text-sm text-primary font-medium">{exp.company || "Company"}</p>
                        </div>
                        {exp.duration && (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            {exp.duration}
                          </span>
                        )}
                      </div>
                      {exp.description && <p className="text-sm text-foreground leading-relaxed">{exp.description}</p>}
                    </div>
                  </div>
                ),
            )}
          </div>
        </div>
      )}

      {education.some((edu: any) => edu.institution || edu.degree) && (
        <div>
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Education
          </h2>
          <div className="space-y-4 pl-4 border-l-2 border-primary/30">
            {education.map(
              (edu: any) =>
                (edu.institution || edu.degree) && (
                  <div key={edu.id} className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                    <div className="space-y-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-foreground">{edu.degree || "Degree"}</h3>
                          <p className="text-sm text-primary font-medium">{edu.institution || "Institution"}</p>
                        </div>
                        {edu.duration && (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            {edu.duration}
                          </span>
                        )}
                      </div>
                      {edu.description && <p className="text-sm text-foreground leading-relaxed">{edu.description}</p>}
                    </div>
                  </div>
                ),
            )}
          </div>
        </div>
      )}

      {skillsList.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <Code className="w-5 h-5" />
            Skills
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {skillsList.map((skill: string, index: number) => (
              <div
                key={index}
                className="px-3 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg text-center"
              >
                {skill}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

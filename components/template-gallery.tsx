import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Download } from "lucide-react"

export default function TemplateGallery() {
  const templates = [
    {
      name: "Modern",
      description: "Clean and contemporary design with bold typography",
      preview: "/modern-resume-template.png",
    },
    {
      name: "Minimal",
      description: "Simple and elegant with focus on content",
      preview: "/minimal-resume-template.png",
    },
    {
      name: "Professional",
      description: "Traditional format suitable for corporate roles",
      preview: "/professional-resume-template.png",
    },
    {
      name: "Creative",
      description: "Eye-catching design for creative industries",
      preview: "/creative-resume-template.png",
    },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-4">Choose Your Template</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          All templates are ATS-friendly and optimized for both human readers and applicant tracking systems
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {templates.map((template, index) => (
          <Card
            key={index}
            className="border-border bg-card overflow-hidden group hover:border-primary/50 transition-all"
          >
            <div className="aspect-[3/4] bg-muted relative overflow-hidden">
              <img
                src={template.preview || "/placeholder.svg"}
                alt={template.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="sm" variant="secondary" className="gap-2">
                  <Eye className="w-3 h-3" />
                  Preview
                </Button>
                <Button size="sm" className="gap-2">
                  <Download className="w-3 h-3" />
                  Use
                </Button>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
              <p className="text-xs text-muted-foreground">{template.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

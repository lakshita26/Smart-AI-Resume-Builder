"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Sparkles, Upload, LogOut, User } from 'lucide-react'
import ResumeBuilder from "@/components/resume-builder"
import TemplateGallery from "@/components/template-gallery"
import AuthModal from "@/components/auth-modal"

interface User {
  name: string
  email: string
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("builder")
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  const [user, setUser] = useState<User | null>(null)

  const handleSignIn = () => {
    setAuthMode("signin")
    setAuthModalOpen(true)
  }

  const handleSignUp = () => {
    setAuthMode("signup")
    setAuthModalOpen(true)
  }

  const handleLogout = () => {
    setUser(null)
  }

  const handleAuthSuccess = (userData: User) => {
    setUser(userData)
    setAuthModalOpen(false)
  }

  return (
    <div className="dark min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Smart AI Resume Builder</h1>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      Welcome, {user.name}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={handleSignIn}>
                    Sign In
                  </Button>
                  <Button variant="default" size="sm" onClick={handleSignUp}>
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="inline-block mb-4 px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full border border-primary/20">
            AI-Powered Resume Optimization
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Make your Resumes easily
          </h2>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" className="gap-2" onClick={() => setActiveTab("builder")}>
              <Sparkles className="w-4 h-4" />
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => setActiveTab("templates")}>
              View Templates
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="builder" className="gap-2">
              <FileText className="w-4 h-4" />
              Builder
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <Upload className="w-4 h-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="mt-0">
            <ResumeBuilder />
          </TabsContent>

          <TabsContent value="templates" className="mt-0">
            <TemplateGallery />
          </TabsContent>
        </Tabs>
      </section>

      {/* Features Grid */}
      <section className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <h3 className="text-2xl font-bold text-center mb-12 text-foreground">Powerful Features</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: "AI Optimization",
                description: "Smart content suggestions and keyword optimization",
              },
              {
                icon: FileText,
                title: "Pro Templates",
                description: "4 professional templates for every industry",
              },
              {
                icon: Upload,
                title: "Easy Export",
                description: "Download in PDF, DOCX, or share online",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
              >
                <feature.icon className="w-8 h-8 text-primary mb-4" />
                <h4 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>Smart AI Resume Builder - Build Your Future</p>
        </div>
      </footer>

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
        mode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}

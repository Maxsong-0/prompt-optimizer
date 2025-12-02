"use client"

import { GraduationCap, Code2, Camera, Building2 } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"

export function UseCasesSection() {
  const { t } = useLanguage()

  const useCases = [
    {
      icon: GraduationCap,
      title: t.useCases.items.student.title,
      description: t.useCases.items.student.description,
      examples: t.useCases.items.student.examples || ["Research assistance", "Essay outlines", "Concept explanations"],
    },
    {
      icon: Code2,
      title: t.useCases.items.developer.title,
      description: t.useCases.items.developer.description,
      examples: t.useCases.items.developer.examples || ["Code reviews", "Documentation", "Bug fixing"],
    },
    {
      icon: Camera,
      title: t.useCases.items.creator.title,
      description: t.useCases.items.creator.description,
      examples: t.useCases.items.creator.examples || ["Art direction", "Style prompts", "Composition guides"],
    },
    {
      icon: Building2,
      title: t.useCases.items.business.title,
      description: t.useCases.items.business.description,
      examples: t.useCases.items.business.examples || ["Email templates", "Report generation", "Data analysis"],
    },
  ]

  return (
    <section className="py-20 bg-sidebar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t.useCases.title}</h2>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">{t.useCases.subtitle}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase) => (
            <div
              key={useCase.title}
              className="group p-6 rounded-xl bg-card border border-border hover:border-border-hover transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center mb-4">
                <useCase.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{useCase.title}</h3>
              <p className="text-sm text-foreground-secondary mb-4">{useCase.description}</p>
              <ul className="space-y-1">
                {useCase.examples.map((example: string) => (
                  <li key={example} className="text-xs text-foreground-muted flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-accent" />
                    {example}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

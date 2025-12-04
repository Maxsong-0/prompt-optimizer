"use client"

import { GraduationCap, Code2, Camera, Building2 } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"
import { motion } from "framer-motion"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion"

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
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t.useCases.title}</h2>
            <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">{t.useCases.subtitle}</p>
          </div>
        </FadeIn>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => (
            <StaggerItem key={useCase.title}>
              <motion.div
                className="group p-6 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-border-hover transition-colors duration-300 h-full"
                whileHover={{ 
                  y: -8,
                  boxShadow: "0 20px 40px rgba(79, 70, 229, 0.15)"
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center mb-4"
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 5,
                    boxShadow: "0 0 20px rgba(6, 182, 212, 0.4)"
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <useCase.icon className="w-6 h-6 text-accent" />
                </motion.div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{useCase.title}</h3>
                <p className="text-sm text-foreground-secondary mb-4">{useCase.description}</p>
                <ul className="space-y-1">
                  {useCase.examples.map((example: string, i: number) => (
                    <motion.li 
                      key={example} 
                      className="text-xs text-foreground-muted flex items-center gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    >
                      <motion.span 
                        className="w-1 h-1 rounded-full bg-accent"
                        whileHover={{ scale: 2 }}
                      />
                      {example}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}

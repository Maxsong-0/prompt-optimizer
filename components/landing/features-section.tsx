"use client"

import { Wand2, GitCompare, LayoutTemplate, Layers } from "lucide-react"
import { FeatureCard } from "@/components/ui/feature-card"
import { useLanguage } from "@/lib/i18n/language-context"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion"

export function FeaturesSection() {
  const { t } = useLanguage()

  const features = [
    {
      icon: Wand2,
      title: t.features.items.optimization.title,
      description: t.features.items.optimization.description,
    },
    {
      icon: GitCompare,
      title: t.features.items.comparison.title,
      description: t.features.items.comparison.description,
    },
    {
      icon: LayoutTemplate,
      title: t.features.items.templates.title,
      description: t.features.items.templates.description,
    },
    {
      icon: Layers,
      title: t.features.items.multiModel.title,
      description: t.features.items.multiModel.description,
    },
  ]

  return (
    <section id="features" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t.features.title}</h2>
            <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">{t.features.subtitle}</p>
          </div>
        </FadeIn>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}

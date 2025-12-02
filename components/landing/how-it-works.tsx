"use client"

import { PenLine, Target, Sparkles, Check } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"

export function HowItWorksSection() {
  const { t } = useLanguage()

  const steps = [
    {
      icon: PenLine,
      step: "01",
      title: t.howItWorks.steps[0].title,
      description: t.howItWorks.steps[0].description,
    },
    {
      icon: Target,
      step: "02",
      title: t.howItWorks.steps[1].title,
      description: t.howItWorks.steps[1].description,
    },
    {
      icon: Sparkles,
      step: "03",
      title: t.howItWorks.steps[2].title,
      description: t.howItWorks.steps[2].description,
    },
    {
      icon: Check,
      step: "04",
      title: t.howItWorks.steps[3]?.title || "Compare & Apply",
      description:
        t.howItWorks.steps[3]?.description ||
        "Review the differences, pick your favorite, and copy it to your clipboard.",
    },
  ]

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t.howItWorks.title}</h2>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">{t.howItWorks.subtitle}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.step} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-primary/50 to-transparent -z-10" />
              )}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-accent" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent text-white text-xs font-bold flex items-center justify-center">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-foreground-secondary leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import { Check } from "lucide-react"
import { GradientButton } from "@/components/ui/gradient-button"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function PricingSection() {
  const { t } = useLanguage()

  const plans = [
    {
      ...t.pricing.free,
      popular: false,
      href: "/register",
    },
    {
      ...t.pricing.pro,
      popular: true,
      href: "/register",
    },
    {
      ...t.pricing.team,
      popular: false,
      href: "/contact",
    },
  ]

  return (
    <section id="pricing" className="py-20 bg-sidebar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t.pricing.title}</h2>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">{t.pricing.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative p-6 rounded-xl border transition-all duration-300",
                plan.popular
                  ? "bg-gradient-to-br from-primary/10 to-accent/10 border-primary/50 scale-105"
                  : "bg-card border-border hover:border-border-hover",
              )}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-primary to-accent text-white">
                  {t.pricing.popular}
                </span>
              )}
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-foreground-muted">/{plan.period}</span>
                </div>
                <p className="text-sm text-foreground-secondary mt-2">{plan.description}</p>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-accent" />
                    </div>
                    <span className="text-sm text-foreground-secondary">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href={plan.href}>
                <GradientButton variant={plan.popular ? "primary" : "secondary"} className="w-full">
                  {plan.cta}
                </GradientButton>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

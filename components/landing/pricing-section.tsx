"use client"

import { Check } from "lucide-react"
import { GradientButton } from "@/components/ui/gradient-button"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { motion } from "framer-motion"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion"

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
    <section id="pricing" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t.pricing.title}</h2>
            <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">{t.pricing.subtitle}</p>
          </div>
        </FadeIn>

        <StaggerContainer className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <StaggerItem key={plan.name}>
              <motion.div
                className={cn(
                  "relative p-6 rounded-xl border transition-colors duration-300 h-full backdrop-blur-sm",
                  plan.popular
                    ? "bg-gradient-to-br from-primary/5 to-accent/5 border-primary/30"
                    : "bg-card/50 border-border/50 hover:border-border-hover",
                )}
                initial={{ scale: plan.popular ? 1.05 : 1 }}
                whileHover={{ 
                  y: -8,
                  scale: plan.popular ? 1.08 : 1.03,
                  boxShadow: plan.popular 
                    ? "0 25px 50px rgba(79, 70, 229, 0.25)" 
                    : "0 20px 40px rgba(79, 70, 229, 0.12)"
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {plan.popular && (
                  <motion.span 
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-primary to-accent text-white"
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                  >
                    {t.pricing.popular}
                  </motion.span>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <motion.span 
                      className="text-4xl font-bold text-foreground"
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                    >
                      {plan.price}
                    </motion.span>
                    <span className="text-sm text-foreground-muted">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-foreground-secondary mt-2">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <motion.li 
                      key={feature} 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                    >
                      <motion.div 
                        className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0"
                        whileHover={{ scale: 1.2, backgroundColor: "rgba(6, 182, 212, 0.4)" }}
                      >
                        <Check className="w-3 h-3 text-accent" />
                      </motion.div>
                      <span className="text-sm text-foreground-secondary">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                <Link href={plan.href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <GradientButton variant={plan.popular ? "primary" : "secondary"} className="w-full">
                      {plan.cta}
                    </GradientButton>
                  </motion.div>
                </Link>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}

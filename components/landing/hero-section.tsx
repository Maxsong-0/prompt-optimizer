"use client"

import { ArrowRight, Sparkles, Zap, Check, LayoutDashboard } from "lucide-react"
import { GradientButton } from "@/components/ui/gradient-button"
import { PromptCard } from "@/components/ui/prompt-card"
import { useLanguage } from "@/lib/i18n/language-context"
import { useUser } from "@/lib/supabase/hooks"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import { useState, useEffect } from "react"

export function HeroSection() {
  const { t } = useLanguage()
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const [isNavigating, setIsNavigating] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleGetStarted = () => {
    setIsNavigating(true)
    setTimeout(() => {
      router.push(user ? "/dashboard" : "/register")
    }, 300)
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Animated Background Glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary/20 to-accent/15 rounded-full blur-[150px] -z-10"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.35, 0.5, 0.35],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <div className="absolute inset-0 -z-10 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-accent/20 rounded-full blur-[1px]"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + i,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <span className="text-xs text-foreground-muted">Scroll to explore</span>
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-foreground-muted/30 flex justify-center pt-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-accent"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <FadeIn delay={0.1}>
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border mb-6"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                >
                  <Sparkles className="w-4 h-4 text-accent" />
                </motion.div>
                <span className="text-sm text-foreground-secondary">{t.hero.badge}</span>
              </motion.div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 text-balance">
                {t.hero.title}{" "}
                <motion.span
                  className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent inline-block"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  style={{ backgroundSize: "200% 200%" }}
                >
                  {t.hero.titleHighlight}
                </motion.span>{" "}
                {t.hero.titleEnd}
              </h1>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p className="text-lg text-foreground-secondary mb-8 leading-relaxed max-w-xl">{t.hero.description}</p>
            </FadeIn>

            <StaggerContainer delay={0.4} className="space-y-3 mb-8">
              {t.hero.benefits.map((benefit, index) => (
                <StaggerItem key={benefit}>
                  <motion.li
                    className="flex items-center gap-3"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <motion.div
                      className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center"
                      whileHover={{ scale: 1.2, backgroundColor: "rgba(6, 182, 212, 0.4)" }}
                    >
                      <Check className="w-3 h-3 text-accent" />
                    </motion.div>
                    <span className="text-foreground-secondary">{benefit}</span>
                  </motion.li>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <FadeIn delay={0.6}>
              <div className="flex flex-wrap items-center gap-4">
                <motion.div className="relative" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  {/* Glow effect behind button */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent blur-xl opacity-50"
                    animate={
                      isNavigating
                        ? {
                            scale: [1, 1.5, 2],
                            opacity: [0.5, 0.8, 0],
                          }
                        : {
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0.5, 0.3],
                          }
                    }
                    transition={{
                      duration: isNavigating ? 0.5 : 2,
                      repeat: isNavigating ? 0 : Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                  <GradientButton size="lg" onClick={handleGetStarted} className="relative z-10">
                    {isNavigating ? (
                      <motion.span className="flex items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                        </motion.span>
                        Loading...
                      </motion.span>
                    ) : mounted && !userLoading && user ? (
                      // 已登录：显示 Go to Dashboard
                      <>
                        <LayoutDashboard className="w-5 h-5 mr-2" />
                        {t.nav.dashboard || "Go to Dashboard"}
                      </>
                    ) : (
                      // 未登录：显示 Start Optimizing
                      <>
                        {t.hero.cta}
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                        >
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </motion.span>
                      </>
                    )}
                  </GradientButton>
                </motion.div>
                <Link href="/dashboard/templates">
                  <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                    <GradientButton variant="secondary" size="lg">
                      {t.hero.ctaSecondary}
                    </GradientButton>
                  </motion.div>
                </Link>
              </div>
            </FadeIn>
          </div>

          {/* Right Content - Product Preview */}
          <FadeIn direction="left" delay={0.4}>
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl blur-xl"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
              <div className="relative space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                >
                  <PromptCard title="Original Prompt" content="Write a blog post about AI" tags={["Writing", "Blog"]} />
                </motion.div>

                <motion.div
                  className="flex justify-center"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.3, type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    className="p-2 rounded-full bg-gradient-to-r from-primary to-accent"
                    animate={{
                      boxShadow: [
                        "0 0 0 rgba(79, 70, 229, 0)",
                        "0 0 30px rgba(79, 70, 229, 0.6)",
                        "0 0 0 rgba(79, 70, 229, 0)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <Zap className="w-5 h-5 text-white" />
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                >
                  <PromptCard
                    title="Optimized Version"
                    content={`You are an expert tech blogger with 10+ years of experience writing engaging, informative content.

Write a comprehensive blog post about AI that:
- Explains core concepts in simple terms
- Includes real-world examples and use cases
- Is structured with clear headings and bullet points
- Targets a general audience interested in technology
- Is approximately 1500 words

Tone: Professional yet conversational
Format: Start with a hook, include 3-4 main sections, end with a call-to-action`}
                    tags={["Writing", "Blog", "Enhanced"]}
                    variant="optimized"
                  />
                </motion.div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

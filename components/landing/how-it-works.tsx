"use client"

import { PenLine, Target, Sparkles, Check } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"
import { motion } from "framer-motion"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion"

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
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t.howItWorks.title}</h2>
            <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">{t.howItWorks.subtitle}</p>
          </div>
        </FadeIn>

        <div className="relative">
          {/* 连续的连接线 - 从第一个图标到最后一个图标 */}
          <motion.div 
            className="hidden lg:block absolute top-8 z-0"
            style={{
              left: 'calc(12.5% + 32px)', // 第一个item中心 + 半个图标宽度
              right: 'calc(12.5% + 32px)', // 最后一个item中心 + 半个图标宽度
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          >
            <div className="h-px bg-gradient-to-r from-primary/60 via-accent/50 to-primary/60" />
          </motion.div>

          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <StaggerItem key={step.step} className="relative z-10">
                <motion.div 
                  className="flex flex-col items-center text-center"
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="relative mb-6">
                    {/* 图标容器 - 添加背景色以遮挡线条 */}
                    <motion.div 
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center relative z-10"
                      style={{ backgroundColor: 'var(--background)' }}
                      whileHover={{ 
                        scale: 1.1,
                        boxShadow: "0 0 30px rgba(79, 70, 229, 0.4)"
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <step.icon className="w-7 h-7 text-accent" />
                    </motion.div>
                    
                    {/* 步骤编号 */}
                    <motion.span 
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent text-white text-xs font-bold flex items-center justify-center z-20"
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 15,
                        delay: 0.2 + index * 0.1 
                      }}
                    >
                      {step.step}
                    </motion.span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-foreground-secondary leading-relaxed">{step.description}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  )
}

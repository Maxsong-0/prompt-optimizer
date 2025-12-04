"use client"

import { Star } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useLanguage } from "@/lib/i18n/language-context"
import { motion } from "framer-motion"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion"

export function TestimonialsSection() {
  const { t } = useLanguage()

  const testimonials = [
    {
      name: t.testimonials.items?.[0]?.name || "Sarah Chen",
      role: t.testimonials.items?.[0]?.role || "Content Creator",
      avatar: "SC",
      content:
        t.testimonials.items?.[0]?.content ||
        "Promto has transformed how I create content. My ChatGPT outputs are 10x better now!",
    },
    {
      name: t.testimonials.items?.[1]?.name || "Marcus Johnson",
      role: t.testimonials.items?.[1]?.role || "Software Engineer",
      avatar: "MJ",
      content:
        t.testimonials.items?.[1]?.content ||
        "The code generation prompts are incredibly detailed. Saved me hours of debugging.",
    },
    {
      name: t.testimonials.items?.[2]?.name || "Emily Rodriguez",
      role: t.testimonials.items?.[2]?.role || "UX Designer",
      avatar: "ER",
      content:
        t.testimonials.items?.[2]?.content ||
        "Perfect for Midjourney prompts. My image quality improved dramatically overnight.",
    },
  ]

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t.testimonials.title}</h2>
            <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">{t.testimonials.subtitle}</p>
          </div>
        </FadeIn>

        <StaggerContainer className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <StaggerItem key={testimonial.name}>
              <motion.div 
                className="p-6 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm h-full"
                whileHover={{ 
                  y: -6,
                  boxShadow: "0 20px 40px rgba(79, 70, 229, 0.12)"
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ 
                        delay: 0.2 + i * 0.1,
                        type: "spring",
                        stiffness: 400,
                        damping: 15
                      }}
                    >
                      <Star className="w-4 h-4 fill-warning text-warning" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-foreground-secondary mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm">
                        {testimonial.avatar}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                  <div>
                    <p className="font-medium text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-foreground-muted">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}

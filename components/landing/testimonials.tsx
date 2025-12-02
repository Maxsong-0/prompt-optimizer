"use client"

import { Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useLanguage } from "@/lib/i18n/language-context"

export function TestimonialsSection() {
  const { t } = useLanguage()

  const testimonials = [
    {
      name: t.testimonials.items?.[0]?.name || "Sarah Chen",
      role: t.testimonials.items?.[0]?.role || "Content Creator",
      avatar: "SC",
      content:
        t.testimonials.items?.[0]?.content ||
        "PromptCraft has transformed how I create content. My ChatGPT outputs are 10x better now!",
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
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t.testimonials.title}</h2>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">{t.testimonials.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className="p-6 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-foreground-secondary mb-6 leading-relaxed">"{testimonial.content}"</p>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={`/.jpg?height=40&width=40&query=${testimonial.name} avatar`} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm">
                    {testimonial.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-foreground-muted">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

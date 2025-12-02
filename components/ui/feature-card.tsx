"use client"

import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  className?: string
  index?: number
}

export function FeatureCard({ icon: Icon, title, description, className, index = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3 },
      }}
      className={cn(
        "group relative p-6 rounded-xl bg-card border border-border transition-colors duration-300 hover:border-border-hover cursor-pointer",
        className,
      )}
    >
      {/* Animated glow effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 -z-10"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Animated border glow */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0"
        whileHover={{
          opacity: 1,
          boxShadow: "0 0 30px rgba(79, 70, 229, 0.3)",
        }}
        transition={{ duration: 0.3 }}
      />

      <div className="flex items-center gap-3 mb-3">
        <motion.div
          className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30"
          whileHover={{
            scale: 1.1,
            rotate: 5,
            borderColor: "rgba(79, 70, 229, 0.6)",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <Icon className="w-5 h-5 text-accent" />
        </motion.div>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-foreground-secondary leading-relaxed">{description}</p>
    </motion.div>
  )
}

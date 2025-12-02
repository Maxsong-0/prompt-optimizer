"use client"

import { motion } from "framer-motion"
import { TemplatesGrid } from "@/components/dashboard/templates-grid"
import { useLanguage } from "@/lib/i18n/language-context"

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export default function TemplatesPage() {
  const { t } = useLanguage()

  return (
    <motion.div
      className="flex flex-col h-screen"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.header
        className="h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center px-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h1 className="text-lg font-semibold text-foreground">{t.dashboard.templates.title}</h1>
      </motion.header>
      <motion.div
        className="flex-1 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <TemplatesGrid />
      </motion.div>
    </motion.div>
  )
}

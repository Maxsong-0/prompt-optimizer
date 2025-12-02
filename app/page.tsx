"use client"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorksSection } from "@/components/landing/how-it-works"
import { UseCasesSection } from "@/components/landing/use-cases"
import { TestimonialsSection } from "@/components/landing/testimonials"
import { PricingSection } from "@/components/landing/pricing-section"
import { PageWrapper } from "@/components/layout/page-wrapper"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageWrapper>
        <main>
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <UseCasesSection />
          <TestimonialsSection />
          <PricingSection />
        </main>
      </PageWrapper>
      <Footer />
    </div>
  )
}

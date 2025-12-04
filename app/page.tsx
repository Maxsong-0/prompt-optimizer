"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorksSection } from "@/components/landing/how-it-works"
import { UseCasesSection } from "@/components/landing/use-cases"
import { TestimonialsSection } from "@/components/landing/testimonials"
import { PricingSection } from "@/components/landing/pricing-section"
import { PageWrapper } from "@/components/layout/page-wrapper"
import dynamic from "next/dynamic"

// 动态导入 LightPillar 组件，避免 SSR 问题
const LightPillar = dynamic(() => import("@/components/ui/light-pillar"), {
  ssr: false,
  loading: () => null
})

export default function LandingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 处理 OAuth 回调 code（如果 Supabase 回调到根路径）
  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      // 重定向到正确的 callback 处理路由
      router.replace(`/api/auth/callback?code=${code}&next=/dashboard`)
    }
  }, [searchParams, router])
  return (
    <div className="min-h-screen relative">
      {/* LightPillar 动态背景 - 固定背景，光柱延伸更长 */}
      <div className="fixed inset-0 -z-10 backdrop-blur-[2px]">
        <LightPillar
          topColor="#38BDF8"      // 浅蓝色 (sky-400)
          bottomColor="#818CF8"   // 淡紫蓝色 (indigo-400)
          intensity={0.55}
          rotationSpeed={0.15}
          glowAmount={0.004}
          pillarWidth={2.0}
          pillarHeight={0.15}
          noiseIntensity={0.35}
          pillarRotation={-35}
          interactive={false}
          mixBlendMode="normal"
        />
      </div>

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

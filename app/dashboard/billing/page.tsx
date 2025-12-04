"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Check,
  CreditCard,
  Download,
  Sparkles,
  Zap,
  FileText,
  Users,
  Headphones,
  X,
  AlertTriangle,
  BarChart3,
  Settings,
  Loader2,
} from "lucide-react"
import { GradientButton } from "@/components/ui/gradient-button"
import { useLanguage } from "@/lib/i18n/language-context"
import { useUser } from "@/lib/supabase/hooks"
import { cn } from "@/lib/utils"

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

interface ProfileData {
  subscription_tier: 'free' | 'pro' | 'enterprise'
  credits: number
  role: string
}

interface QuotaData {
  quick_daily: number
  deep_daily: number
  quick_remaining: number
  deep_remaining: number
}

interface UsageData {
  total_prompts: number
  total_optimizations: number
  today_quick: number
  today_deep: number
}

const plans = [
  {
    id: "free",
    price: 0,
    features: ["10 optimizations/day", "Basic templates", "7-day history"],
    featuresZh: ["每天 10 次优化", "基础模板", "7 天历史记录"],
  },
  {
    id: "pro",
    price: 12,
    popular: true,
    features: ["Unlimited optimizations", "All templates", "Unlimited history", "Priority support", "API access"],
    featuresZh: ["无限优化次数", "全部模板", "无限历史记录", "优先支持", "API 访问"],
  },
  {
    id: "enterprise",
    price: 29,
    perUser: true,
    features: [
      "Everything in Pro",
      "Team workspace",
      "Admin controls",
      "SSO integration",
      "Analytics",
      "Dedicated support",
    ],
    featuresZh: ["包含专业版全部功能", "团队工作空间", "管理员控制", "SSO 集成", "数据分析", "专属支持"],
  },
]

const planNames = {
  en: { free: "Free", pro: "Pro", enterprise: "Enterprise" },
  zh: { free: "免费版", pro: "专业版", enterprise: "企业版" },
}

const planDescriptions = {
  en: {
    free: "For individuals getting started",
    pro: "For power users and professionals",
    enterprise: "For teams and organizations",
  },
  zh: {
    free: "适合个人入门使用",
    pro: "适合高级用户和专业人士",
    enterprise: "适合团队和企业",
  },
}

export default function BillingPage() {
  const { t, language } = useLanguage()
  const { user, loading: userLoading } = useUser()
  const currentLanguage = language || 'en'
  
  // Data states
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [quota, setQuota] = useState<QuotaData | null>(null)
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Modal states
  const [showChangePlanModal, setShowChangePlanModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  // Fetch billing data
  useEffect(() => {
    async function fetchBillingData() {
      if (!user) return
      
      setIsLoading(true)
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setProfile(data.data.profile)
            setQuota(data.data.quota)
            setUsage(data.data.stats)
          }
        }
      } catch (error) {
        console.error('Failed to fetch billing data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (!userLoading) {
      fetchBillingData()
    }
  }, [user, userLoading])

  const currentPlan = profile?.subscription_tier || 'free'

  const features = [
    { icon: Zap, label: t.dashboard.billing.features.unlimited },
    { icon: FileText, label: t.dashboard.billing.features.allTemplates },
    { icon: Headphones, label: t.dashboard.billing.features.priority },
    { icon: Sparkles, label: t.dashboard.billing.features.api },
    { icon: Users, label: t.dashboard.billing.features.team },
    { icon: BarChart3, label: t.dashboard.billing.features.analytics },
  ]

  // Calculate usage percentage
  const getUsagePercentage = () => {
    if (currentPlan === 'pro' || currentPlan === 'enterprise') return 100
    const totalUsed = (usage?.today_quick || 0) + (usage?.today_deep || 0)
    const totalLimit = (quota?.quick_daily || 10)
    return Math.min((totalUsed / totalLimit) * 100, 100)
  }

  // Loading state
  if (isLoading || userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <motion.div
      className="flex flex-col h-screen"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Header */}
      <motion.header
        className="h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center px-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div>
          <h1 className="text-lg font-semibold text-foreground">{t.dashboard.billing.title}</h1>
          <p className="text-xs text-foreground-muted">
            {language === "zh" ? "管理你的订阅和账单" : "Manage your subscription and billing"}
          </p>
        </div>
      </motion.header>

      <motion.div
        className="flex-1 overflow-y-auto p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <motion.div
          className="max-w-4xl mx-auto space-y-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Current Plan */}
          <motion.div
            className={cn(
              "p-6 rounded-xl border",
              currentPlan === 'pro' || currentPlan === 'enterprise'
                ? "bg-gradient-to-br from-primary/20 to-accent/20 border-primary/30"
                : "bg-card border-border"
            )}
            variants={itemVariants}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {(currentPlan === 'pro' || currentPlan === 'enterprise') && (
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5 text-accent" />
                    </motion.div>
                  )}
                  <h3 className="text-lg font-semibold text-foreground">
                    {planNames[currentLanguage][currentPlan as keyof typeof planNames.en]}
                  </h3>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-accent/20 text-accent border border-accent/30">
                    {t.dashboard.billing.changePlanModal.current}
                  </span>
                </div>
                <p className="text-sm text-foreground-secondary mb-4">
                  {planDescriptions[currentLanguage][currentPlan as keyof typeof planDescriptions.en]}
                </p>
                
                {/* Credits display */}
                <div className="flex items-center gap-4 text-sm text-foreground-secondary">
                  <span>
                    {language === 'zh' ? '积分余额' : 'Credits'}: 
                    <span className="ml-1 font-medium text-foreground">{profile?.credits || 0}</span>
                  </span>
                </div>

                <p className="text-3xl font-bold text-foreground mt-4">
                  ${plans.find(p => p.id === currentPlan)?.price || 0}
                  <span className="text-sm font-normal text-foreground-muted">{t.dashboard.billing.perMonth}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <GradientButton variant="secondary" size="sm" onClick={() => setShowChangePlanModal(true)}>
                  {t.dashboard.billing.changePlan}
                </GradientButton>
                {currentPlan !== 'free' && (
                  <GradientButton
                    variant="ghost"
                    size="sm"
                    className="text-error hover:bg-error/10"
                    onClick={() => setShowCancelModal(true)}
                  >
                    {t.dashboard.billing.cancelSubscription}
                  </GradientButton>
                )}
              </div>
            </div>

            {/* Usage bar */}
            <div className="mt-6 pt-6 border-t border-primary/20">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-foreground-secondary">{t.dashboard.billing.usage.title}</span>
                <span className="text-foreground font-medium">
                  {(usage?.today_quick || 0) + (usage?.today_deep || 0)} / {currentPlan === 'free' ? quota?.quick_daily || 10 : (language === "zh" ? "无限" : "Unlimited")}
                </span>
              </div>
              <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${getUsagePercentage()}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between text-xs text-foreground-muted mt-2">
                <span>
                  {language === "zh" ? "今日快速优化" : "Quick today"}: {usage?.today_quick || 0}
                </span>
                <span>
                  {language === "zh" ? "今日深度优化" : "Deep today"}: {usage?.today_deep || 0}
                </span>
              </div>
            </div>

            {/* Features - Only show for paid plans */}
            {currentPlan !== 'free' && (
              <div className="mt-6 pt-6 border-t border-primary/20">
                <h4 className="text-sm font-medium text-foreground mb-3">
                  {language === "zh" ? "包含功能" : "Included Features"}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.label}
                      className="flex items-center gap-2 text-sm text-foreground-secondary"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 + index * 0.05 }}
                    >
                      <Check className="w-4 h-4 text-success shrink-0" />
                      <span>{feature.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Payment Method */}
          <motion.div
            className="p-6 rounded-xl bg-card border border-border"
            variants={itemVariants}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">{t.dashboard.billing.paymentMethod.title}</h3>
              <GradientButton variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-1" />
                {language === "zh" ? "管理" : "Manage"}
              </GradientButton>
            </div>
            
            {currentPlan === 'free' ? (
              <div className="p-4 rounded-lg bg-surface border border-border text-center">
                <p className="text-sm text-foreground-muted">
                  {language === 'zh' 
                    ? '升级到付费计划后可添加支付方式'
                    : 'Add a payment method after upgrading to a paid plan'}
                </p>
                <GradientButton size="sm" className="mt-3" onClick={() => setShowChangePlanModal(true)}>
                  {language === 'zh' ? '升级计划' : 'Upgrade Plan'}
                </GradientButton>
              </div>
            ) : (
              <>
                <motion.div
                  className="flex items-center justify-between p-4 rounded-lg bg-surface border border-border"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 rounded bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Visa {t.dashboard.billing.paymentMethod.cardEnding} 4242
                      </p>
                      <p className="text-xs text-foreground-muted">{t.dashboard.billing.paymentMethod.expires} 12/26</p>
                    </div>
                  </div>
                  <GradientButton variant="secondary" size="sm">
                    {t.dashboard.billing.paymentMethod.update}
                  </GradientButton>
                </motion.div>
                <button className="mt-3 text-sm text-accent hover:underline">
                  + {language === "zh" ? "添加支付方式" : "Add payment method"}
                </button>
              </>
            )}
          </motion.div>

          {/* Usage Statistics */}
          <motion.div
            className="p-6 rounded-xl bg-card border border-border"
            variants={itemVariants}
            transition={{ duration: 0.4 }}
          >
            <h3 className="text-sm font-medium text-foreground mb-4">
              {language === 'zh' ? '使用统计' : 'Usage Statistics'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-surface border border-border text-center">
                <p className="text-2xl font-bold text-foreground">{usage?.total_prompts || 0}</p>
                <p className="text-xs text-foreground-muted">{language === 'zh' ? '总提示词' : 'Total Prompts'}</p>
              </div>
              <div className="p-4 rounded-lg bg-surface border border-border text-center">
                <p className="text-2xl font-bold text-foreground">{usage?.total_optimizations || 0}</p>
                <p className="text-xs text-foreground-muted">{language === 'zh' ? '总优化次数' : 'Total Optimizations'}</p>
              </div>
              <div className="p-4 rounded-lg bg-surface border border-border text-center">
                <p className="text-2xl font-bold text-foreground">{quota?.quick_remaining || 0}</p>
                <p className="text-xs text-foreground-muted">{language === 'zh' ? '剩余快速优化' : 'Quick Remaining'}</p>
              </div>
              <div className="p-4 rounded-lg bg-surface border border-border text-center">
                <p className="text-2xl font-bold text-foreground">{quota?.deep_remaining || 0}</p>
                <p className="text-xs text-foreground-muted">{language === 'zh' ? '剩余深度优化' : 'Deep Remaining'}</p>
              </div>
            </div>
          </motion.div>

          {/* Coming Soon - Payment Integration */}
          <motion.div
            className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20"
            variants={itemVariants}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">
                  {language === 'zh' ? '支付功能即将上线' : 'Payment Integration Coming Soon'}
                </p>
                <p className="text-sm text-foreground-secondary mt-1">
                  {language === 'zh'
                    ? '我们正在集成 Stripe 支付系统，届时您可以直接在线升级订阅计划。目前您可以通过联系我们手动升级。'
                    : 'We are integrating Stripe payment system. Soon you will be able to upgrade your subscription online. Currently, please contact us to upgrade manually.'}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Change Plan Modal */}
      <AnimatePresence>
        {showChangePlanModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowChangePlanModal(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative w-full max-w-3xl bg-card border border-border rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">{t.dashboard.billing.changePlanModal.title}</h2>
                <button
                  onClick={() => setShowChangePlanModal(false)}
                  className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                >
                  <X className="w-5 h-5 text-foreground-muted" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    className={cn(
                      "relative p-5 rounded-xl border transition-all",
                      plan.id === currentPlan
                        ? "bg-primary/10 border-primary"
                        : "bg-surface border-border hover:border-primary/50",
                    )}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-xs rounded-full bg-accent text-white">
                        {t.dashboard.billing.changePlanModal.popular}
                      </span>
                    )}
                    {plan.id === currentPlan && (
                      <span className="absolute -top-2 right-3 px-2 py-0.5 text-xs rounded-full bg-primary text-white">
                        {t.dashboard.billing.changePlanModal.current}
                      </span>
                    )}
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {planNames[currentLanguage][plan.id as keyof typeof planNames.en]}
                    </h3>
                    <p className="text-2xl font-bold text-foreground mb-1">
                      ${plan.price}
                      <span className="text-sm font-normal text-foreground-muted">
                        {plan.perUser ? t.dashboard.billing.perUser : t.dashboard.billing.perMonth}
                      </span>
                    </p>
                    <p className="text-xs text-foreground-muted mb-4">
                      {planDescriptions[currentLanguage][plan.id as keyof typeof planDescriptions.en]}
                    </p>
                    <ul className="space-y-2 mb-4">
                      {(language === "zh" ? plan.featuresZh : plan.features).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-foreground-secondary">
                          <Check className="w-4 h-4 text-success shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <GradientButton
                      variant={plan.id === currentPlan ? "secondary" : "primary"}
                      size="sm"
                      className="w-full"
                      disabled={plan.id === currentPlan}
                    >
                      {plan.id === currentPlan
                        ? t.dashboard.billing.changePlanModal.current
                        : t.dashboard.billing.changePlanModal.select}
                    </GradientButton>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowCancelModal(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                >
                  <AlertTriangle className="w-6 h-6 text-error" />
                </motion.div>
                <h2 className="text-xl font-semibold text-foreground">{t.dashboard.billing.cancelModal.title}</h2>
              </div>
              <p className="text-sm text-foreground-secondary mb-6">{t.dashboard.billing.cancelModal.description}</p>
              <div className="flex gap-3">
                <GradientButton variant="secondary" className="flex-1" onClick={() => setShowCancelModal(false)}>
                  {t.dashboard.billing.cancelModal.keepPlan}
                </GradientButton>
                <GradientButton
                  variant="ghost"
                  className="flex-1 text-error hover:bg-error/10"
                  onClick={() => setShowCancelModal(false)}
                >
                  {t.dashboard.billing.cancelModal.confirmCancel}
                </GradientButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

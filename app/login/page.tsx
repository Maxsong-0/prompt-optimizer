"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import dynamic from "next/dynamic"
import { Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle, Loader2, CheckCircle2, KeyRound } from "lucide-react"
import { GradientButton } from "@/components/ui/gradient-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useLanguage } from "@/lib/i18n/language-context"
import { motion, FormItem, AnimatedLink } from "@/components/ui/motion"

// 动态导入 LightPillar 组件，避免 SSR 问题
const LightPillar = dynamic(() => import("@/components/ui/light-pillar"), {
  ssr: false,
  loading: () => null
})

// 登录方式类型
type LoginMethod = 'password' | 'otp'

// OTP 状态类型
type OtpStatus = 'idle' | 'sending' | 'sent' | 'error'

// 邮箱状态类型
type EmailStatus = 'idle' | 'checking' | 'registered' | 'not_registered' | 'error' | 'invalid'

// 邮箱格式验证
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export default function LoginPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null)
  const [otpStatus, setOtpStatus] = useState<OtpStatus>('idle')
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle')
  const [countdown, setCountdown] = useState(0)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
    rememberMe: false,
  })

  // 检查邮箱是否已注册
  const checkEmail = useCallback(async (email: string) => {
    if (!email || !isValidEmail(email)) {
      setEmailStatus(email ? 'invalid' : 'idle')
      return
    }

    setEmailStatus('checking')
    
    try {
      const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`)
      const data = await response.json()
      
      if (data.success) {
        setEmailStatus(data.data.exists ? 'registered' : 'not_registered')
      } else {
        setEmailStatus('error')
      }
    } catch {
      setEmailStatus('error')
    }
  }, [])

  // debounce 邮箱检测
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email) {
        checkEmail(formData.email)
      } else {
        setEmailStatus('idle')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [formData.email, checkEmail])

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // 发送验证码
  const handleSendOtp = async () => {
    if (!formData.email || countdown > 0) return
    
    // 邮箱格式验证
    if (!isValidEmail(formData.email)) {
      setLoginError(t.auth.login.invalidEmail || '请输入有效的邮箱地址')
      return
    }

    // 检查邮箱是否已注册
    if (emailStatus === 'not_registered') {
      setLoginError(t.auth.login.emailNotRegistered || '该邮箱尚未注册，请先注册')
      return
    }

    if (emailStatus !== 'registered') {
      setLoginError(t.auth.login.checkEmailFirst || '请先验证邮箱')
      return
    }
    
    setOtpStatus('sending')
    setLoginError(null)
    
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, type: 'login' }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setOtpStatus('sent')
        setCountdown(60) // 60秒倒计时
      } else {
        setOtpStatus('error')
        setLoginError(data.error || t.auth.login.sendCodeError || '发送验证码失败')
      }
    } catch {
      setOtpStatus('error')
      setLoginError(t.auth.login.networkError || '网络错误，请稍后重试')
    }
  }

  // 密码登录
  const handlePasswordLogin = async () => {
    setIsLoading(true)
    setLoginError(null)
    
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        router.push("/dashboard")
      } else {
        setLoginError(data.error || t.auth.login.loginError || '登录失败')
      }
    } catch {
      setLoginError(t.auth.login.networkError || '网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 验证码登录
  const handleOtpLogin = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setLoginError(t.auth.login.otpRequired || '请输入6位验证码')
      return
    }
    
    setIsLoading(true)
    setLoginError(null)
    
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          type: 'email',
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        router.push("/dashboard")
      } else {
        setLoginError(data.error || t.auth.login.otpInvalid || '验证码错误')
      }
    } catch {
      setLoginError(t.auth.login.networkError || '网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (loginMethod === 'password') {
      await handlePasswordLogin()
    } else {
      await handleOtpLogin()
    }
  }

  // OAuth登录处理
  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    try {
      setOauthLoading(provider)
      const response = await fetch('/api/auth/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, redirect_to: '/dashboard' }),
      })
      
      const data = await response.json()
      
      if (data.success && data.data?.url) {
        window.location.href = data.data.url
      } else {
        console.error('OAuth error:', data.error || 'Unknown error')
        alert(data.error || 'OAuth登录失败，请检查配置')
      }
    } catch (error) {
      console.error('OAuth request failed:', error)
      alert('网络错误，请稍后重试')
    } finally {
      setOauthLoading(null)
    }
  }

  return (
    <motion.div
      className="min-h-screen bg-background flex overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Left Panel - Branding */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* LightPillar 动态背景 */}
        <div className="absolute inset-0 backdrop-blur-[2px]">
          <LightPillar
            topColor="#38BDF8"
            bottomColor="#818CF8"
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

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              className="w-10 h-10 rounded-xl overflow-hidden"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image src="/apple-icon.png" alt="Promto Logo" width={40} height={40} className="w-full h-full object-cover" />
            </motion.div>
            <motion.span
              className="text-2xl font-bold text-foreground"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              Promto
            </motion.span>
          </Link>

          <motion.div
            className="max-w-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-foreground mb-6 text-balance">
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
            <p className="text-lg text-foreground-secondary leading-relaxed">{t.hero.description}</p>
          </motion.div>

          <motion.p
            className="text-sm text-foreground-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {t.footer.copyright}
          </motion.p>
        </div>
      </motion.div>

      {/* Right Panel - Login Form */}
      <motion.div
        className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="lg:hidden mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors"
          >
            <motion.span
              className="flex items-center gap-2"
              whileHover={{ x: -5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.common.back}</span>
            </motion.span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <motion.div
            className="lg:hidden flex items-center gap-2 mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="w-8 h-8 rounded-lg overflow-hidden"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Image src="/apple-icon.png" alt="Promto Logo" width={32} height={32} className="w-full h-full object-cover" />
            </motion.div>
            <span className="text-xl font-bold text-foreground">Promto</span>
          </motion.div>

          <FormItem index={0} className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">{t.auth.login.title}</h2>
            <p className="text-foreground-secondary">{t.auth.login.subtitle}</p>
          </FormItem>

          {/* 登录方式切换 Tab */}
          <FormItem index={1} className="mb-6">
            <div className="flex bg-muted/50 rounded-lg p-1">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('password')
                  setLoginError(null)
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  loginMethod === 'password'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                {t.auth.login.passwordLogin || '密码登录'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('otp')
                  setLoginError(null)
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  loginMethod === 'otp'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                {t.auth.login.otpLogin || '验证码登录'}
              </button>
            </div>
          </FormItem>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 邮箱输入 */}
            <FormItem index={2} className="space-y-2">
              <Label htmlFor="email">{t.auth.login.email}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className={`pl-10 pr-10 ${
                    emailStatus === 'not_registered' ? 'border-yellow-500 focus-visible:ring-yellow-500' : 
                    emailStatus === 'registered' ? 'border-green-500 focus-visible:ring-green-500' : ''
                  }`}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                {/* 邮箱状态图标 */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {emailStatus === 'checking' && (
                    <Loader2 className="w-5 h-5 text-foreground-muted animate-spin" />
                  )}
                  {emailStatus === 'registered' && (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                  {emailStatus === 'not_registered' && (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  )}
                  {emailStatus === 'invalid' && formData.email && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
              {/* 邮箱状态提示 */}
              {emailStatus === 'not_registered' && (
                <motion.p 
                  className="text-sm text-yellow-500 flex items-center gap-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle className="w-4 h-4" />
                  {t.auth.login.emailNotRegistered || '该邮箱尚未注册'}
                  <Link href="/register" className="underline ml-1">
                    {t.auth.login.goRegister || '去注册'}
                  </Link>
                </motion.p>
              )}
              {emailStatus === 'registered' && (
                <motion.p 
                  className="text-sm text-green-500 flex items-center gap-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {t.auth.login.emailRegistered || '邮箱已注册'}
                </motion.p>
              )}
              {emailStatus === 'invalid' && formData.email && (
                <motion.p 
                  className="text-sm text-red-500 flex items-center gap-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle className="w-4 h-4" />
                  {t.auth.login.invalidEmail || '请输入有效的邮箱地址'}
                </motion.p>
              )}
            </FormItem>

            {/* 密码登录方式 */}
            {loginMethod === 'password' && (
              <>
                <FormItem index={3} className="space-y-2">
                  <Label htmlFor="password">{t.auth.login.password}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </motion.button>
                  </div>
                </FormItem>

                <FormItem index={4} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: checked as boolean })}
                    />
                    <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                      {t.auth.login.rememberMe}
                    </Label>
                  </div>
                  <Link href="/forgot-password">
                    <AnimatedLink className="text-sm text-accent hover:underline">
                      {t.auth.login.forgotPassword}
                    </AnimatedLink>
                  </Link>
                </FormItem>
              </>
            )}

            {/* 验证码登录方式 */}
            {loginMethod === 'otp' && (
              <FormItem index={3} className="space-y-2">
                <Label htmlFor="otp">{t.auth.login.verificationCode || '验证码'}</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="000000"
                      className="pl-10"
                      maxLength={6}
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                  <GradientButton
                    type="button"
                    variant="secondary"
                    onClick={handleSendOtp}
                    disabled={!formData.email || countdown > 0 || otpStatus === 'sending'}
                    className="whitespace-nowrap min-w-[120px]"
                  >
                    {otpStatus === 'sending' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : countdown > 0 ? (
                      `${countdown}s`
                    ) : (
                      t.auth.login.sendCode || '发送验证码'
                    )}
                  </GradientButton>
                </div>
                {otpStatus === 'sent' && (
                  <motion.p 
                    className="text-sm text-green-500 flex items-center gap-1"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {t.auth.login.codeSent || '验证码已发送，请查收邮件'}
                  </motion.p>
                )}
              </FormItem>
            )}

            {/* 错误提示 */}
            {loginError && (
              <FormItem index={5}>
                <motion.div 
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {loginError}
                </motion.div>
              </FormItem>
            )}

            <FormItem index={6}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative">
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent opacity-0"
                  animate={
                    isLoading
                      ? {
                          opacity: [0.3, 0.6, 0.3],
                          scale: [1, 1.05, 1],
                        }
                      : {}
                  }
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                />
                <GradientButton type="submit" className="w-full relative z-10" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <motion.span className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                      </motion.span>
                      {t.auth.login.signingIn}
                    </motion.span>
                  ) : (
                    t.auth.login.signIn
                  )}
                </GradientButton>
              </motion.div>
            </FormItem>
          </form>

          <FormItem index={7} className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-foreground-muted">{t.auth.login.orContinueWith}</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
                <GradientButton 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => handleOAuthLogin('google')}
                  disabled={oauthLoading !== null}
                >
                  {oauthLoading === 'google' ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 mr-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </motion.span>
                  ) : (
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  {t.auth.login.google}
                </GradientButton>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
                <GradientButton 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => handleOAuthLogin('github')}
                  disabled={oauthLoading !== null}
                >
                  {oauthLoading === 'github' ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 mr-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </motion.span>
                  ) : (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  )}
                  {t.auth.login.github}
                </GradientButton>
              </motion.div>
            </div>
          </FormItem>

          <FormItem index={8}>
            <p className="mt-8 text-center text-sm text-foreground-secondary">
              {t.auth.login.noAccount}{" "}
              <Link href="/register">
                <AnimatedLink className="text-accent hover:underline font-medium">{t.auth.login.signUp}</AnimatedLink>
              </Link>
            </p>
          </FormItem>
        </div>
      </motion.div>
    </motion.div>
  )
}

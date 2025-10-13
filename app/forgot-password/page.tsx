"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowLeft, Sparkles, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"email" | "otp" | "reset">("email")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()
  const { t } = useLanguage()

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch(`${baseUrl}/v1/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStep("otp")
        setSuccess(t("otpSent"))
      } else {
        const data = await res.json()
        setError(data.details || data.message || t("failedToSendOtp"))
      }
    } catch (err) {
      setError(t("failedToSendOtp"))
    }
    setIsLoading(false)
  }

  const handleResendOtp = async () => {
    setIsLoading(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch(`${baseUrl}/v1/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setSuccess(t("otpResent"))
      } else {
        const data = await res.json()
        setError(data.details || data.message || t("failedToResendOtp"))
      }
    } catch (err) {
      setError(t("failedToResendOtp"))
    }
    setIsLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    if (!otp) {
      setError(t("pleaseEnterOtp"))
      return
    }
    setStep("reset")
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")
    if (!newPassword || !confirmPassword) {
      setError(t("pleaseFillAllPassword"))
      setIsLoading(false)
      return
    }
    if (newPassword !== confirmPassword) {
      setError(t("passwordsDoNotMatch"))
      setIsLoading(false)
      return
    }
    try {
      const res = await fetch(`${baseUrl}/v1/api/resetpassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          new_password: newPassword,
          confirm_new_password: confirmPassword,
        }),
      })
      if (res.ok) {
        setSuccess(t("resetPasswordSuccess"))
        setTimeout(() => router.push("/login"), 2000)
      } else {
        const data = await res.json()
        setError(data.details || data.message || t("failedToResetPassword"))
      }
    } catch (err) {
      setError(t("failedToResetPassword"))
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Enhanced background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-crimson-600/20 to-pink-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Top controls */}
      <div className="absolute top-6 right-6 z-20 flex items-center space-x-4">
        {/* Language switcher */}
        <div className="z-20">
          <LanguageSwitcher />
        </div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Enhanced logo and branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 dark:bg-neutral-800/20 backdrop-blur-sm rounded-2xl mb-6 shadow-xl border border-white/30 dark:border-neutral-700/30">
            <Sparkles className="h-12 w-12 text-crimson-600" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-3">
            {t("resetPasswordTitle")}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg max-w-md mx-auto">
            {step === "email"
              ? t("enterEmailToReset")
              : step === "otp"
              ? t("enterOtp")
              : t("setNewPassword")}
          </p>
        </div>

        {/* Enhanced reset password card */}
        <Card className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="space-y-2 pb-6 pt-8 px-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-crimson-600 to-crimson-700 rounded-xl shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-neutral-900 dark:text-white">
              {step === "email"
                ? t("forgotPasswordTitle")
                : step === "otp"
                ? t("verifyOtp")
                : t("setNewPassword")}
            </CardTitle>
            <CardDescription className="text-center text-neutral-600 dark:text-neutral-400">
              {step === "email"
                ? t("enterEmailToReset")
                : step === "otp"
                ? t("checkEmailForOtp")
                : t("enterNewPassword") + " / " + t("confirmNewPassword")}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-center text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center text-sm text-emerald-600 dark:text-emerald-400">
                {success}
              </div>
            )}

            {step === "email" && (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    {t("emailAddress")}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-14 bg-slate-50/50 dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-crimson-600 focus:border-transparent text-base transition-all duration-200"
                      required
                    />
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-crimson-600 to-crimson-700 hover:from-crimson-700 hover:to-crimson-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-base group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{t("sending")}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Send className="w-5 h-5" />
                      <span>{t("sendOtp")}</span>
                    </div>
                  )}
                </Button>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="otp" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    {t("enterOtp")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="otp"
                      type="text"
                      placeholder={t("enterOtp")}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="h-14 bg-slate-50/50 dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-crimson-600 focus:border-transparent text-base pl-4 transition-all duration-200"
                      required
                    />
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-crimson-600 to-crimson-700 hover:from-crimson-700 hover:to-crimson-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-base group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{t("verifying")}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <span>{t("verifyOtp")}</span>
                      <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  )}
                </Button>
                
                <div className="text-center">
                  <Button 
                    type="button" 
                    variant="link" 
                    className="text-crimson-600 hover:text-crimson-700 transition-colors duration-200" 
                    onClick={handleResendOtp} 
                    disabled={isLoading}
                  >
                    {t("resendOtp")}
                  </Button>
                </div>
              </form>
            )}

            {step === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="new-password" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    {t("enterNewPassword")}
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder={t("enterNewPassword")}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-14 bg-slate-50/50 dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-crimson-600 focus:border-transparent text-base pl-4 transition-all duration-200"
                    required
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="confirm-password" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    {t("confirmNewPassword")}
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder={t("confirmNewPassword")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-14 bg-slate-50/50 dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-crimson-600 focus:border-transparent text-base pl-4 transition-all duration-200"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-crimson-600 to-crimson-700 hover:from-crimson-700 hover:to-crimson-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-base group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{t("resetting")}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <span>{t("resetPasswordTitle")}</span>
                      <ArrowLeft className="w-5 h-5" />
                    </div>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-8 text-center">
              <Link
                href="/login"
                className="inline-flex items-center space-x-2 text-sm text-crimson-600 hover:text-crimson-700 font-semibold transition-colors duration-200 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                <span>{t("backToSignIn")}</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced footer */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center space-x-6 text-sm text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-crimson-600" />
              <span>Secure Reset</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

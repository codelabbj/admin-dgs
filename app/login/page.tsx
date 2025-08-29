"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, ArrowRight, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { storeAuthData } from "@/utils/auth"
import { useTheme } from "next-themes"

export default function Login() {
  const { theme, setTheme } = useTheme()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const router = useRouter()
  const { t } = useLanguage()

  const [apiError, setApiError] = useState("")
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setApiError("")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })
      
      const data = await res.json()
      if (res.ok) {
        console.log('Login successful, storing auth data:', data)
        // Store authentication data using the utility function
        storeAuthData(data)
        
        console.log('Auth data stored, checking localStorage:', {
          access: localStorage.getItem('access'),
          refresh: localStorage.getItem('refresh'),
          exp: localStorage.getItem('exp'),
          user: localStorage.getItem('user')
        })
        
        // Add a small delay to ensure auth data is processed
        console.log('Waiting 500ms before redirect...')
        setTimeout(() => {
          console.log('Redirecting to dashboard using router...')
          router.push("/")
        }, 500)
      } else {
        setApiError(data.details || data.message || "Login failed.")
      }
    } catch (err) {
      setApiError("Login failed.")
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
            <img 
              src={theme === "dark" ? "/logo_dark1.png" : "/logo_light11.png"} 
              alt="Logo" 
              className="h-12 w-auto"
            />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-3">{t("welcomeBack")}</h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg max-w-md mx-auto">
            {t("signInToAccount")}
          </p>
        </div>

        {/* Enhanced login card */}
        <Card className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="space-y-2 pb-6 pt-8 px-8">
            {/* <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-crimson-600 to-crimson-700 rounded-xl shadow-lg">
                <Crown className="h-6 w-6 text-white" />
              </div>
            </div> */}
            <CardTitle className="text-2xl font-bold text-center text-neutral-900 dark:text-white">
              {t("signIn")}
            </CardTitle>
            <CardDescription className="text-center text-neutral-600 dark:text-neutral-400">
              {t("enterCredentials")}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            {apiError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-center text-sm text-red-600 dark:text-red-400">
                {apiError}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-12 h-14 bg-slate-50/50 dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-crimson-600 focus:border-transparent text-base transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  {t("password")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("password")}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-12 pr-12 h-14 bg-slate-50/50 dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-crimson-600 focus:border-transparent text-base transition-all duration-200"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 hover:bg-slate-100 dark:hover:bg-neutral-700 rounded-lg"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-neutral-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-neutral-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: checked as boolean })}
                    className="data-[state=checked]:bg-crimson-600 data-[state=checked]:border-crimson-600 rounded-lg"
                  />
                  <Label htmlFor="remember" className="text-sm text-neutral-600 dark:text-neutral-400">
                    {t("rememberMe")}
                  </Label>
                </div>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-crimson-600 hover:text-crimson-700 font-semibold transition-colors duration-200"
                >
                  {t("forgotPassword")}
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-crimson-600 to-crimson-700 hover:from-crimson-700 hover:to-crimson-800 text-black dark:text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-base group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center text-black dark:text-white space-x-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white  rounded-full animate-spin"></div>
                    <span>{t("signingIn")}</span>
                  </div>
                ) : (
                  <div className="flex items-center text-black dark:text-white space-x-3">
                    <span>{t("signIn")}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                )}
              </Button>
            </form>

            {/* <div className="mt-8 text-center">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {t("dontHaveAccount")} {" "}
                <Link 
                  href="/register" 
                  className="text-crimson-600 hover:text-crimson-700 font-semibold transition-colors duration-200"
                >
                  {t("signUp")}
                </Link>
              </p>
            </div> */}
          </CardContent>
        </Card>

        {/* Enhanced footer */}
        {/* <div className="text-center mt-8">
          <div className="flex items-center justify-center space-x-6 text-sm text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center space-x-2">
              <Crown className="h-4 w-4 text-crimson-600" />
              <span>Admin Dashboard</span>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  )
}

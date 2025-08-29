"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    password: "",
    confirmPassword: "",
    entrepriseName: "",
    agreeToTerms: false,
  })
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState("register") // 'register' or 'otp'
  const [apiMessage, setApiMessage] = useState("")
  const router = useRouter()
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setApiMessage("")
    if (step === "register") {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/register-customer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            phone: formData.phone,
            first_name: formData.firstName,
            last_name: formData.lastName,
            country: formData.country,
            password: formData.password,
            entreprise_name: formData.entrepriseName,
          }),
        })
        const data = await res.json()
        if (res.ok) {
          setApiMessage(data.message)
          setStep("otp")
        } else {
          setApiMessage(data.message || data.message || "Registration failed.")
        }
      } catch (err) {
        setApiMessage("Registration failed.")
      }
      setIsLoading(false)
    } else if (step === "otp") {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/activate-account`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            otp,
          }),
        })
        const data = await res.json()
        if (res.ok) {
          setApiMessage(data.message)
          // Redirect to login after activation
          setTimeout(() => router.push("/login"), 2000)
        } else {
          setApiMessage(data.message || "Activation failed.")
        }
      } catch (err) {
        setApiMessage("Activation failed.")
      }
      setIsLoading(false)
    }
  }

  const countries = [
    { value: "bj", label: t("benin") },
    { value: "tg", label: t("togo") },
    { value: "bf", label: t("burkinaFaso") },
    { value: "ne", label: t("niger") },
    { value: "ci", label: t("coteDivoire") },
  ]

  const getStepTitle = () => {
    if (step === "register") {
      return t("createAccount")
    } else if (step === "otp") {
      return t("verifyEmail")
    }
    return ""
  }

  const getStepDescription = () => {
    if (step === "register") {
      return t("fillDetails")
    } else if (step === "otp") {
      return t("enterOtp")
    }
    return ""
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

      <div className="w-full max-w-2xl relative z-10">
        {/* Enhanced logo and branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 dark:bg-neutral-800/20 backdrop-blur-sm rounded-2xl mb-6 shadow-xl border border-white/30 dark:border-neutral-700/30">
            <Building2 className="h-12 w-12 text-crimson-600" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-3">{t("joinpay")}</h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg max-w-md mx-auto">
            {t("createMerchantAccount")}
          </p>
        </div>

        {/* Enhanced registration card */}
        <Card className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="space-y-2 pb-6 pt-8 px-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-crimson-600 to-crimson-700 rounded-xl shadow-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-neutral-900 dark:text-white">
              {getStepTitle()}
            </CardTitle>
            <CardDescription className="text-center text-neutral-600 dark:text-neutral-400">
              {getStepDescription()}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            {apiMessage && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-center text-sm text-blue-600 dark:text-blue-400">
                {apiMessage}
              </div>
            )}

            {step === "register" ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="firstName" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      {t("firstName")}
                    </Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="pl-10 h-12 bg-slate-50/50 dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-crimson-600 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="lastName" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      {t("lastName")}
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="h-12 bg-slate-50/50 dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-crimson-600 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="entrepriseName" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    {t("entrepriseName") || "Company Name"}
                  </Label>
                  <Input
                    id="entrepriseName"
                    type="text"
                    placeholder={t("entrepriseName") || "Your Company Ltd"}
                    value={formData.entrepriseName}
                    onChange={(e) => setFormData({ ...formData, entrepriseName: e.target.value })}
                    className="h-12 bg-slate-50/50 dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-crimson-600 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    {t("emailAddress")}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 h-12 bg-slate-50/50 dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-crimson-600 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="country" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      {t("country")}
                    </Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => setFormData({ ...formData, country: value })}
                    >
                      <SelectTrigger className="h-12 bg-slate-50/50 dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-crimson-600 focus:border-transparent transition-all duration-200">
                        <SelectValue placeholder={t("selectCountry")} />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      {t("phoneNumber")}
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1234567890"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="pl-10 h-12 bg-slate-50/50 dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-crimson-600 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    {t("password")}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("password")}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-12 h-12 bg-slate-50/50 dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-crimson-600 focus:border-transparent transition-all duration-200"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-slate-100 dark:hover:bg-neutral-700 rounded-lg"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-neutral-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-neutral-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    {t("confirmPassword")}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("confirmPassword")}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-10 pr-12 h-12 bg-slate-50/50 dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-crimson-600 focus:border-transparent transition-all duration-200"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-slate-100 dark:hover:bg-neutral-700 rounded-lg"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-neutral-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-neutral-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
                    className="mt-1 data-[state=checked]:bg-crimson-600 data-[state=checked]:border-crimson-600 rounded-lg"
                  />
                  <Label htmlFor="terms" className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {t("agreeToTerms")} {" "}
                    <Link href="/terms" className="text-crimson-600 hover:text-crimson-700 font-semibold transition-colors duration-200">
                      {t("termsOfService")}
                    </Link> {" "}
                    {t("and")} {" "}
                    <Link href="/privacy" className="text-crimson-600 hover:text-crimson-700 font-semibold transition-colors duration-200">
                      {t("privacyPolicy")}
                    </Link>
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-crimson-600 to-crimson-700 hover:from-crimson-700 hover:to-crimson-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-base group"
                  disabled={isLoading || !formData.agreeToTerms}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{t("creatingAccount")}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <span>{t("createAccount")}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="otp" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    {t("enterOtp") || "Verification Code"}
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder={t("enterOtp") || "Enter 6-digit code"}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="h-12 bg-slate-50/50 dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-crimson-600 focus:border-transparent transition-all duration-200 pl-4"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-crimson-600 to-crimson-700 hover:from-crimson-700 hover:to-crimson-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-base group"
                  disabled={isLoading || !otp}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <span>{t("verifyOtp") || "Verify Email"}</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-8 text-center">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {t("alreadyHaveAccount")} {" "}
                <Link href="/login" className="text-crimson-600 hover:text-crimson-700 font-semibold transition-colors duration-200">
                  {t("signIn")}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced footer */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center space-x-6 text-sm text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-crimson-600" />
              <span>Merchant Platform</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

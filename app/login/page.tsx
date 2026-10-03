"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, ShieldCheck, Zap, Globe } from "lucide-react"
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/v1/api/login`, {
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
        console.log('Login response structure:', {
          hasAccess: !!data.access,
          hasRefresh: !!data.refresh,
          hasExp: !!data.exp,
          hasData: !!data.data,
          hasDataAccess: !!data.data?.access,
          hasDataRefresh: !!data.data?.refresh,
          hasDataExp: !!data.data?.exp,
          isStaff: data.is_staff,
          dataIsStaff: data.data?.is_staff,
          fullResponse: data
        })
        
        // Check if user is staff - check both direct and nested locations
        const isStaff = data.is_staff || data.data?.is_staff
        if (isStaff === false) {
          // Show backend error when user is not staff
          const errorMessage = data.detail || data.details || data.message || data.error || "Access denied. Staff privileges required."
          setApiError(errorMessage)
          return
        }
        
        // Proceed with normal login flow when is_staff is true
        // Store authentication data using the utility function
        storeAuthData(data)
        
        console.log('Auth data stored, checking localStorage:', {
          access: localStorage.getItem('access'),
          refresh: localStorage.getItem('refresh'),
          exp: localStorage.getItem('exp'),
          user: localStorage.getItem('user')
        })
        
        // Add a small delay to ensure auth data is processed
        console.log('Waiting 1000ms before redirect to ensure AuthGuard processes the state...')
        setTimeout(() => {
          console.log('Redirecting to dashboard using router...')
          router.push("/")
        }, 1000)
      } else {
        // Essayer de récupérer le message d'erreur du backend
        const errorMessage = data.detail || data.details || data.message || data.error || "Login failed."
        setApiError(errorMessage)
      }
    } catch (err) {
      setApiError("Login failed.")
    }
    setIsLoading(false)
  }

  const resolvedLogo = theme === "dark" ? "/logo_dark1.png" : "/logo_light11.png"

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panneau de marque (desktop) */}
      <div className="relative hidden overflow-hidden bg-neutral-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <img src="/logo_dark1.png" alt="DGS" className="h-10 w-10 object-contain" />
          <span className="text-lg font-semibold text-white">DGS Admin</span>
        </div>
        <div className="relative max-w-md space-y-6">
          <h2 className="text-balance text-4xl font-semibold leading-tight text-white">
            Pilotez toute votre plateforme de paiement depuis un seul endroit.
          </h2>
          <ul className="space-y-4 text-neutral-300">
            {[
              { icon: Zap, text: "Transactions, recharges et retraits en temps réel" },
              { icon: Globe, text: "Opérateurs, corridors et devises centralisés" },
              { icon: ShieldCheck, text: "Accès réservé au personnel autorisé" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-4 w-4 text-white" />
                </span>
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-neutral-500">© {new Date().getFullYear()} DGS. Tous droits réservés.</p>
      </div>

      {/* Formulaire */}
      <div className="relative flex items-center justify-center bg-background px-4 py-10 sm:px-8">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <LanguageSwitcher />
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
            <img src={resolvedLogo} alt="DGS" className="mb-6 h-12 w-auto object-contain lg:hidden" />
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("welcomeBack")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("signInToAccount")}</p>
          </div>

          {apiError && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">{t("emailAddress")}</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11 pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder={t("password")}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-11 pl-10 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" className="group h-11 w-full text-base" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("signingIn")}
                </>
              ) : (
                <>
                  {t("signIn")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { smartFetch, getUserData, clearAuthData } from "@/utils/auth"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  Users,
  Shield,
  Settings,
  LogOut,
  Bell,
  User,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  Building,
  Activity,
  Database,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Globe,
  Key,
  Server,
  Network,
  ShieldCheck,
  Eye,
  EyeOff,
  Home,
  CreditCard,
  MessageCircle,
  ShoppingCart,
  Store,
  Zap,
  Code,
} from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/hooks/use-auth"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isBalanceVisible, setIsBalanceVisible] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [balance, setBalance] = useState<string>("0")
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const { requireAuth } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getUserData()
        if (user) {
          setUserData(user)
          // Fetch balance
          const balanceResponse = await smartFetch("/api/balance")
          if (balanceResponse && balanceResponse.ok) {
            const balanceData = await balanceResponse.json()
            if (balanceData && balanceData.balance) {
              setBalance(balanceData.balance)
            }
          }
      }
    } catch (error) {
        console.error("Error fetching user data:", error)
        router.push("/login")
    } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  const navigation = [
    { name: t("dashboard"), href: "/", icon: Home, current: pathname === "/" },
    { name: t("customers"), href: "/customers", icon: Users, current: pathname === "/customers" },
    { name: t("transactions"), href: "/transactions", icon: CreditCard, current: pathname === "/transactions" },
    // { name: t("myStore"), href: "/store", icon: Store, current: pathname === "/store" },
    // { name: t("payDirect"), href: "/pay", icon: Zap, current: pathname === "/pay" },
    // { name: t("payDirect"), href: "/direct", icon: MessageCircle, current: pathname === "/direct" },
    { name: t("developers"), href: "/developers", icon: Code, current: pathname === "/developers" },
    // { name: t("settings"), href: "/settings", icon: Settings, current: pathname === "/settings" },
    { name: t("profile"), href: "/profile", icon: User, current: pathname === "/profile" },
  ]

  const handleLogout = () => {
    try {
      clearAuthData()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crimson-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">{t("loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 text-black dark:text-white flex">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-crimson-600 to-crimson-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-screen flex-col">
          {/* Logo */}
          <div className="flex-shrink-0 flex h-16 items-center justify-between px-6 border-b border-crimson-500/20">
          <div className="flex items-center space-x-3">
              {/* <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-crimson-600" />
              </div> */}
              <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src={theme === "dark" ? "/logo_dark1.png" : "/logo_light11.png"} 
                alt="Logo" 
                className="w-10 h-10 object-contain"
              />
            </div>
              <span className="text-xl font-bold text-black dark:text-white">Admin DGS</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
              className="lg:hidden text-white hover:bg-crimson-500/20"
              onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent text-black dark:text-white">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    item.current
                      ? "bg-white/20 text-black dark:text-white shadow-lg"
                      : "text-crimson-100 hover:bg-white/10 hover:text-black/100 dark:hover:text-white/100"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${
                    item.current ? "text-black dark:text-white" : "text-crimson-200 group-hover:text-black dark:group-hover:text-white"
                  }`} />
                  <span>{item.name}</span>
                  {item.current && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-black dark:bg-white"></div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="flex-shrink-0 border-t border-crimson-500/20 p-4">
              <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 ring-2 ring-white/20">
                <AvatarImage src={userData?.avatar || "/placeholder-user.jpg"} />
                                  <AvatarFallback className="bg-white/20 text-white font-semibold">
                    {userData?.name?.charAt(0) || t("companyShortName").charAt(0)}
                  </AvatarFallback>
                </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black dark:text-white truncate">
                  {userData?.name || t("companyShortName")}
                </p>
                <p className="text-xs text-crimson-200 truncate">
                  {userData?.email || "user@example.com"}
                  </p>
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        {/* Top navbar */}
        <div className="sticky top-0 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-neutral-700">
          <div className="flex h-16 items-center justify-between px-6">
            {/* Left side */}
            <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
                className="lg:hidden text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

              {/* Balance display */}
              <div className="hidden md:flex items-center space-x-3 bg-slate-100 dark:bg-neutral-800 rounded-xl px-4 py-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">{t("availableBalance")}:</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {isBalanceVisible ? `${balance} FCFA` : "••••••"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                    onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                  >
                    {isBalanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
          </div>

            {/* Right side */}
          <div className="flex items-center space-x-4">
              {/* Language switcher */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  onClick={() => setLanguage(language === "en" ? "fr" : "en")}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {language === "en" ? "EN" : "FR"}
                </Button>
            </div>

              {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
                className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Notifications */}
              {/* <Button
              variant="ghost"
              size="icon"
                className="relative text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            >
              <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-crimson-600 text-xs text-white p-0 flex items-center justify-center">
                  3
                </Badge>
              </Button> */}

              {/* Profile dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userData?.avatar || "/placeholder-user.jpg"} />
                                      <AvatarFallback className="bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-slate-300 text-sm">
                    {userData?.name?.charAt(0) || t("companyShortName").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium">
                    {userData?.name || t("companyShortName")}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-slate-200 dark:border-neutral-700 py-2 z-50">
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-700"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>{t("profile")}</span>
                </Link>
                    <Link
                      href="/settings"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-700"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>{t("settings")}</span>
                </Link>
                    <div className="border-t border-slate-200 dark:border-neutral-700 my-2" />
                    <button
                  onClick={handleLogout}
                      className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t("signOut")}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>

        {/* Page content */}
        <main className="flex-1 p-6">
            {children}
        </main>
      </div>
    </div>
  )
}
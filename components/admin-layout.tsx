"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { smartFetch, getUserData } from "@/utils/auth"
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
  Building2,
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
} from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [showSystemStats, setShowSystemStats] = useState(false)
  const router = useRouter()

  // Load user profile
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Admin layout: Starting to load user profile after delay')
      loadUserProfile()
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const loadUserProfile = async () => {
    try {
      const userData = getUserData()
      if (userData) {
        setUserProfile(userData)
      }

      try {
        const response = await smartFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/v1/api/user-details`)

        if (response.ok) {
          const data = await response.json()
          setUserProfile(data)
          localStorage.setItem('user', JSON.stringify(data))
        }
      } catch (apiError) {
        console.error('API call failed:', apiError)
      }
    } catch (error) {
      console.error('Failed to load user profile:', error)
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const handleLogout = async () => {
    try {
      // Clear local storage and redirect
      localStorage.removeItem("access")
      localStorage.removeItem("refresh")
      localStorage.removeItem("exp")
      localStorage.removeItem("user")
      router.push("/login")
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getUserInitials = () => {
    if (!userProfile) return "A"
    const firstName = userProfile.first_name || ""
    const lastName = userProfile.last_name || ""
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [isLiveMode, setIsLiveMode] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    setMounted(true)
  }, [])

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: BarChart3, badge: null },
    { name: "Users", href: "/admin/users", icon: Users, badge: "2.4K" },
    { name: "Security", href: "/admin/security", icon: Shield, badge: "Live" },
    { name: "Analytics", href: "/admin/analytics", icon: Activity, badge: null },
    { name: "Database", href: "/admin/database", icon: Database, badge: "99.9%" },
    { name: "Reports", href: "/admin/reports", icon: FileText, badge: "New" },
    { name: "System", href: "/admin/system", icon: Server, badge: "Stable" },
    { name: "Settings", href: "/admin/settings", icon: Settings, badge: null },
  ]

  if (!mounted) {
    return null
  }

  return (
    <div className="bg-slate-50/30 dark:bg-neutral-950 h-screen flex overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-neutral-900 border-r border-slate-200 dark:border-neutral-700 shadow-2xl transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-24 px-8 border-b border-slate-200 dark:border-neutral-700 bg-gradient-to-r from-slate-800 to-slate-900 dark:from-neutral-800 dark:to-neutral-900 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-blue-500/20">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{t("companyShortName") || "Admin"}</p>
              <p className="text-sm text-blue-200 dark:text-blue-300 font-medium">Administration Panel</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-white/20"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Navigation - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <nav className="px-6 py-8 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center justify-between px-6 py-4 mx-2 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/25 scale-105"
                    : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:scale-105"
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center space-x-4">
                    <item.icon
                      className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-500 group-hover:text-blue-600"}`}
                    />
                    <span className="font-semibold">{item.name}</span>
                  </div>
                  {item.badge && (
                    <Badge
                      variant={isActive ? "secondary" : "outline"}
                      className={`${isActive
                        ? "bg-white/20 text-white border-white/30"
                        : "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-400"
                        } text-xs font-medium`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-neutral-700 flex-shrink-0">
          <Link href="/admin/profile" className="block">
            <div className="bg-slate-100 dark:bg-neutral-800 rounded-2xl p-4 mb-4 hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer border border-slate-200 dark:border-neutral-600">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12 ring-2 ring-blue-600 dark:ring-blue-400 text-white">
                  <AvatarImage src={userProfile?.logo || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : "Loading..."}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    System Administrator
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top navbar - Fixed */}
        <header className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-neutral-700 h-24 flex items-center justify-between px-4 md:px-8 shadow-sm flex-shrink-0 z-30">
          <div className="flex items-center space-x-8">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>

            <div className="hidden md:block">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">System Overview & Management</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 md:space-x-8">
            {/* System Status Toggle */}
            <div className="flex items-center space-x-2 md:space-x-4 bg-slate-100 dark:bg-neutral-800 rounded-2xl px-3 md:px-6 py-2 md:py-3 border border-slate-200 dark:border-neutral-600">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400 hidden sm:inline">
                System Stats
              </span>
              <Switch
                checked={showSystemStats}
                onCheckedChange={setShowSystemStats}
                className="data-[state=checked]:bg-blue-600"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-slate-200 dark:hover:bg-neutral-700"
                onClick={() => setShowSystemStats(!showSystemStats)}
              >
                {showSystemStats ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>

            {/* Live/Sandbox Toggle */}
            <div className="flex items-center space-x-2 md:space-x-3 bg-slate-100 dark:bg-neutral-800 rounded-2xl px-3 md:px-4 py-2 border border-slate-200 dark:border-neutral-600">
              <span className={`text-sm font-medium hidden lg:inline ${!isLiveMode ? "text-slate-500" : "text-slate-700 dark:text-slate-300"}`}>
                Sandbox
              </span>
              <Switch
                checked={isLiveMode}
                onCheckedChange={setIsLiveMode}
                className="data-[state=checked]:bg-blue-600"
              />
              <span className={`text-sm font-medium hidden lg:inline ${isLiveMode ? "text-slate-500" : "text-slate-700 dark:text-slate-300"}`}>
                Live
              </span>
              {isLiveMode && (
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white ml-0 md:ml-2 font-medium">
                  LIVE
                </Badge>
              )}
            </div>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl"
            >
              <Bell className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-600 rounded-full animate-pulse"></span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-3 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl px-4 py-2"
                >
                  <Avatar className="h-10 w-10 ring-2 ring-blue-600 text-white">
                    <AvatarImage src={userProfile?.logo || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold">
                      {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : "Loading..."}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      Administrator
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-2xl border-slate-200 dark:border-neutral-700">
                <DropdownMenuLabel className="font-semibold">Administrator Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/admin/profile">
                  <DropdownMenuItem className="rounded-xl cursor-pointer">
                    <User className="mr-3 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                </Link>
                <Link href="/admin/settings">
                  <DropdownMenuItem className="rounded-xl cursor-pointer">
                    <Settings className="mr-3 h-4 w-4" />
                    System Settings
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="rounded-xl text-red-600 focus:text-red-600 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-slate-50/30 dark:bg-neutral-950">
          <div className="p-4 md:p-8 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

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
  Activity,
  Database,
  FileText,
  Server,
  ShieldCheck,
  Loader2,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { cn } from "@/lib/utils"

interface AdminLayoutProps {
  children: React.ReactNode
}

type NavItem = { name: string; href: string; icon: React.ElementType }
type NavGroup = { label: string; items: NavItem[] }

export function AdminLayout({ children }: AdminLayoutProps) {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { t } = useLanguage()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => { setIsSidebarOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isSidebarOpen])

  useEffect(() => {
    const timer = setTimeout(() => { loadUserProfile() }, 800)
    return () => clearTimeout(timer)
  }, [])

  const loadUserProfile = async () => {
    try {
      const userData = getUserData()
      if (userData) setUserProfile(userData)
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

  const handleLogout = () => {
    localStorage.removeItem("access")
    localStorage.removeItem("refresh")
    localStorage.removeItem("exp")
    localStorage.removeItem("user")
    router.push("/login")
  }

  const getUserInitials = () => {
    if (!userProfile) return "A"
    const firstName = userProfile.first_name || ""
    const lastName = userProfile.last_name || ""
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const groups: NavGroup[] = [
    {
      label: "Vue d'ensemble",
      items: [
        { name: "Dashboard", href: "/admin", icon: BarChart3 },
        { name: "Activité", href: "/admin/analytics", icon: Activity },
      ],
    },
    {
      label: "Gestion",
      items: [
        { name: "Utilisateurs", href: "/admin/users", icon: Users },
        { name: "Sécurité", href: "/admin/security", icon: Shield },
        { name: "Rapports", href: "/admin/reports", icon: FileText },
      ],
    },
    {
      label: "Système",
      items: [
        { name: "Base de données", href: "/admin/database", icon: Database },
        { name: "Serveur", href: "/admin/system", icon: Server },
        { name: "Paramètres", href: "/admin/settings", icon: Settings },
      ],
    },
  ]

  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname?.startsWith(href + "/")

  const currentTitle =
    groups.flatMap((g) => g.items).find((i) => isActive(i.href))?.name ||
    (pathname?.startsWith("/admin/profile") ? "Profil" : "Admin DGS")

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Overlay mobile */}
      <div
        aria-hidden="true"
        onClick={() => setIsSidebarOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden",
          isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[17rem] max-w-[85vw] flex-col border-r bg-sidebar transition-transform duration-300 ease-out lg:w-64 lg:translate-x-0",
          isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        {/* Header sidebar */}
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
              <ShieldCheck className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold">{t("companyShortName") || "DGS"}</p>
              <p className="truncate text-[11px] text-muted-foreground">Administration</p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation groupée */}
        <nav className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-3 py-4">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                      )}
                      <Icon
                        className={cn(
                          "h-[18px] w-[18px] shrink-0",
                          active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer sidebar — profil */}
        <div className="shrink-0 border-t p-3">
          <Link
            href="/admin/profile"
            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-sidebar-accent"
          >
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={userProfile?.logo || ""} />
              <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : "Chargement…"}
              </p>
              <p className="truncate text-xs text-muted-foreground">Administrateur</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="flex min-h-screen min-w-0 flex-col lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
          <div className="flex h-14 items-center justify-between gap-3 px-3 sm:h-16 sm:px-6">
            {/* Gauche : burger + titre */}
            <div className="flex min-w-0 items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Ouvrir le menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="truncate text-base font-semibold sm:text-lg">{currentTitle}</h1>
            </div>

            {/* Droite : actions */}
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <LanguageSwitcher />

              {/* Bouton notifications */}
              <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notifications">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
              </Button>

              {/* Toggle thème */}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                aria-label="Changer le thème"
              >
                {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {/* Menu utilisateur */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 gap-2 px-1.5 sm:px-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={userProfile?.logo || ""} />
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden max-w-[9rem] truncate text-sm font-medium md:block">
                      {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : "Admin"}
                    </span>
                    <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <p className="truncate text-sm font-medium">
                      {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : "Admin"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">Administrateur système</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Paramètres système
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-w-0 flex-1 p-3 sm:p-6">
          <div className="mx-auto w-full max-w-[1600px] min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

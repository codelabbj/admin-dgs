"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Users,
  Shield,
  LogOut,
  User,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  AlertTriangle,
  Globe,
  Network,
  Home,
  CreditCard,
  Code,
  DollarSign,
  Coins,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Loader2,
} from "lucide-react"
import { useTheme } from "next-themes"

import { getUserData, clearAuthData } from "@/utils/auth"
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
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
}

type NavItem = { name: string; href: string; icon: React.ElementType }
type NavGroup = { label: string; items: NavItem[] }

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getUserData()
        if (user) setUserData(user)
      } catch (error) {
        console.error("Error fetching user data:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [router])

  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  // Empêche le scroll de la page derrière le menu mobile
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isSidebarOpen])

  const groups: NavGroup[] = [
    {
      label: "Général",
      items: [
        { name: t("dashboard"), href: "/", icon: Home },
        { name: t("users"), href: "/users", icon: Users },
        { name: "Clients (config)", href: "/customers", icon: Shield },
      ],
    },
    {
      label: "Flux financiers",
      items: [
        { name: t("transactions"), href: "/transactions", icon: CreditCard },
        { name: "Recharges", href: "/recharges", icon: ArrowDownToLine },
        { name: "Retraits", href: "/withdrawal", icon: ArrowUpFromLine },
        { name: "Remboursements", href: "/refunds", icon: AlertTriangle },
        { name: "Commissions", href: "/commission-management", icon: DollarSign },
      ],
    },
    {
      label: "Configuration",
      items: [
        { name: "Webhooks", href: "/webhooks", icon: Code },
        { name: "Opérateurs", href: "/operators", icon: Network },
        { name: "Soldes PAL", href: "/pal-wallets", icon: Wallet },
        { name: "Corridors PAL", href: "/pal-corridors", icon: Network },
        { name: "Devises", href: "/currencies", icon: Coins },
        { name: "Pays", href: "/countries", icon: Globe },
      ],
    },
  ]

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname?.startsWith(href + "/")

  const currentTitle =
    groups.flatMap((g) => g.items).find((i) => isActive(i.href))?.name ||
    (pathname?.startsWith("/profile") ? t("profile") : "Admin DGS")

  const handleLogout = () => {
    try {
      clearAuthData()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const displayName = userData?.name || userData?.first_name || t("companyShortName")
  const initial = (displayName || "A").charAt(0).toUpperCase()
  const logoSrc = mounted && resolvedTheme === "dark" ? "/logo_dark1.png" : "/logo_light11.png"

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">{t("loading")}</p>
        </div>
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
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <img src={logoSrc} alt="DGS" className="h-8 w-8 shrink-0 object-contain" />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold">Admin DGS</p>
              <p className="truncate text-[11px] text-muted-foreground">Console d'administration</p>
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
                      {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />}
                      <Icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t p-3">
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-sidebar-accent"
          >
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={userData?.avatar || "/placeholder-user.jpg"} />
              <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">{initial}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{userData?.email || ""}</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Contenu */}
      <div className="flex min-h-screen min-w-0 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
          <div className="flex h-14 items-center justify-between gap-3 px-3 sm:h-16 sm:px-6">
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

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <LanguageSwitcher />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                aria-label="Changer le thème"
              >
                {mounted && resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 gap-2 px-1.5 sm:px-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={userData?.avatar || "/placeholder-user.jpg"} />
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{initial}</AvatarFallback>
                    </Avatar>
                    <span className="hidden max-w-[9rem] truncate text-sm font-medium md:block">{displayName}</span>
                    <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate font-normal">
                    <p className="truncate text-sm font-medium">{displayName}</p>
                    <p className="truncate text-xs text-muted-foreground">{userData?.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      {t("profile")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("signOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-3 sm:p-6">
          <div className="mx-auto w-full max-w-[1600px] min-w-0">{children}</div>
        </main>
      </div>
    </div>
  )
}

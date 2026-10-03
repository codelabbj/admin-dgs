"use client"

import React, { useState, useEffect } from "react"
import { smartFetch } from "@/utils/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DateFilter } from "@/components/ui/date-filter"
import { useLanguage } from "@/contexts/language-context"
import {
  Users,
  Shield,
  Activity,
  Database,
  FileText,
  AlertTriangle,
  CheckCircle,
  Server,
  ShieldCheck,
  Cpu,
  HardDrive,
  Wifi,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Bell,
  AlertCircle,
  BarChart3,
  UserCheck,
  Settings,
} from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"

// ─── Types ─────────────────────────────────────────────────────────────────
interface StatCard {
  label: string
  value: string | number
  delta?: string
  deltaType?: "up" | "down" | "neutral"
  icon: React.ElementType
  iconColor: string
}

interface Alert {
  id: number
  type: "warning" | "info" | "success"
  message: string
  time: string
}

interface Activity {
  id: number
  action: string
  user: string
  time: string
  status: "success" | "warning" | "info"
}

// ─── Composant ─────────────────────────────────────────────────────────────
export function AdminDashboardContent() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  useEffect(() => {
    const timer = setTimeout(() => { fetchStats() }, 800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (startDate || endDate) fetchStats()
  }, [startDate, endDate])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const accessToken = localStorage.getItem("access")
      if (!accessToken) { setLoading(false); return }

      let url = `${baseUrl}/prod/v1/api/statistic`
      const params = new URLSearchParams()
      if (startDate) params.append("start_date", startDate.toISOString().split("T")[0])
      if (endDate) params.append("end_date", endDate.toISOString().split("T")[0])
      if (params.toString()) url += `?${params}`

      const res = await smartFetch(url)
      if (res.ok) setStats(await res.json())
    } catch (e) {
      console.error("Error fetching stats:", e)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setIsRefreshing(true)
    await fetchStats()
    setIsRefreshing(false)
  }

  // ── Mock data ──────────────────────────────────────────────────────────
  const systemMetrics = {
    cpu: 23, memory: 67, disk: 45, network: 89,
    uptime: "99.9%", lastBackup: "il y a 2h",
    activeUsers: 1247, totalTransactions: 45678,
    revenue: 234567, pendingApprovals: 12,
  }

  const statCards: StatCard[] = [
    {
      label: "Utilisateurs actifs",
      value: systemMetrics.activeUsers.toLocaleString(),
      delta: "+12.5%",
      deltaType: "up",
      icon: Users,
      iconColor: "bg-blue-600",
    },
    {
      label: "Transactions",
      value: systemMetrics.totalTransactions.toLocaleString(),
      delta: "+8.2%",
      deltaType: "up",
      icon: CreditCard,
      iconColor: "bg-violet-600",
    },
    {
      label: "Revenus",
      value: `$${systemMetrics.revenue.toLocaleString()}`,
      delta: "+15.3%",
      deltaType: "up",
      icon: DollarSign,
      iconColor: "bg-emerald-600",
    },
    {
      label: "En attente",
      value: systemMetrics.pendingApprovals,
      delta: "À traiter",
      deltaType: "neutral",
      icon: AlertCircle,
      iconColor: "bg-amber-500",
    },
  ]

  const systemCards = [
    { label: "CPU", value: systemMetrics.cpu, icon: Cpu, color: "text-blue-600" },
    { label: "Mémoire", value: systemMetrics.memory, icon: HardDrive, color: "text-violet-600" },
    { label: "Réseau", value: systemMetrics.network, icon: Wifi, color: "text-emerald-600" },
    { label: "Disque", value: systemMetrics.disk, icon: Database, color: "text-amber-500" },
  ]

  const recentActivity: Activity[] = [
    { id: 1, action: "Connexion utilisateur", user: "john.doe", time: "il y a 2 min", status: "success" },
    { id: 2, action: "Paiement traité", user: "merchant_123", time: "il y a 5 min", status: "success" },
    { id: 3, action: "Alerte sécurité", user: "système", time: "il y a 8 min", status: "warning" },
    { id: 4, action: "Sauvegarde BDD", user: "admin", time: "il y a 1h", status: "success" },
    { id: 5, action: "Nouvel utilisateur", user: "jane.smith", time: "il y a 2h", status: "info" },
  ]

  const systemAlerts: Alert[] = [
    { id: 1, type: "warning", message: "Utilisation mémoire élevée détectée", time: "il y a 5 min" },
    { id: 2, type: "info", message: "Maintenance programmée dans 2h", time: "il y a 1h" },
    { id: 3, type: "success", message: "Analyse sécurité terminée", time: "il y a 2h" },
  ]

  const chartData = [
    { name: "Lun", users: 1200, transactions: 4500, revenue: 12000 },
    { name: "Mar", users: 1350, transactions: 5200, revenue: 14500 },
    { name: "Mer", users: 1100, transactions: 4800, revenue: 13200 },
    { name: "Jeu", users: 1400, transactions: 5600, revenue: 15800 },
    { name: "Ven", users: 1250, transactions: 5100, revenue: 14200 },
    { name: "Sam", users: 900, transactions: 3800, revenue: 10800 },
    { name: "Dim", users: 800, transactions: 3200, revenue: 9200 },
  ]

  const alertIcon = (type: Alert["type"]) => {
    if (type === "warning") return <AlertTriangle className="h-4 w-4 text-amber-500" />
    if (type === "info") return <Bell className="h-4 w-4 text-blue-500" />
    return <CheckCircle className="h-4 w-4 text-emerald-500" />
  }

  const alertBg = (type: Alert["type"]) => {
    if (type === "warning") return "bg-amber-50 dark:bg-amber-900/20"
    if (type === "info") return "bg-blue-50 dark:bg-blue-900/20"
    return "bg-emerald-50 dark:bg-emerald-900/20"
  }

  const activityIcon = (status: Activity["status"]) => {
    if (status === "success") return <CheckCircle className="h-4 w-4 text-emerald-500" />
    if (status === "warning") return <AlertTriangle className="h-4 w-4 text-amber-500" />
    return <Bell className="h-4 w-4 text-blue-500" />
  }

  const activityBadge = (status: Activity["status"]) => {
    if (status === "success") return "border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400"
    if (status === "warning") return "border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400"
    return "border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400"
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <RefreshCw className="h-7 w-7 animate-spin text-primary" />
          <p className="text-sm">Chargement du tableau de bord…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">

      {/* ── En-tête de page ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Vue d'ensemble</h2>
          <p className="text-sm text-muted-foreground">Statistiques système en temps réel</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DateFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onClearFilters={() => { setStartDate(undefined); setEndDate(undefined) }}
          />
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
        </div>
      </div>

      {/* ── Cartes KPI ───────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label} className="dash-rise overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className={`rounded-lg p-2.5 ${card.iconColor}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  {card.deltaType === "up" && (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      {card.delta}
                    </span>
                  )}
                  {card.deltaType === "down" && (
                    <span className="flex items-center gap-1 text-xs font-medium text-red-500">
                      <ArrowDownRight className="h-3.5 w-3.5" />
                      {card.delta}
                    </span>
                  )}
                  {card.deltaType === "neutral" && (
                    <Badge variant="outline" className="text-xs">{card.delta}</Badge>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ── Graphique + Alertes ──────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Graphique activité */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Activité hebdomadaire</CardTitle>
            <CardDescription>Utilisateurs, transactions et revenus sur 7 jours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gTx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "10px",
                    fontSize: "13px",
                  }}
                />
                <Area type="monotone" dataKey="users" stroke="#2563eb" fill="url(#gUsers)" strokeWidth={2} />
                <Area type="monotone" dataKey="transactions" stroke="#7c3aed" fill="url(#gTx)" strokeWidth={2} />
                <Area type="monotone" dataKey="revenue" stroke="#059669" fill="url(#gRev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alertes système */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Alertes système</CardTitle>
            <CardDescription>Notifications récentes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {systemAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 rounded-lg p-3 ${alertBg(alert.type)}`}
              >
                <div className="mt-0.5 shrink-0">{alertIcon(alert.type)}</div>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug">{alert.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{alert.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Infra système ────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {systemCards.map((sc) => {
          const Icon = sc.icon
          return (
            <Card key={sc.label}>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${sc.color}`} />
                    <span className="text-sm font-medium">{sc.label}</span>
                  </div>
                  <span className="text-sm font-semibold">{sc.value}%</span>
                </div>
                <Progress value={sc.value} className="h-1.5" />
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ── Activité récente + Actions rapides ───────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activité récente */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Activité récente</CardTitle>
            <CardDescription>Dernières actions et événements système</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3 transition-colors hover:bg-accent/50"
              >
                <div className="flex items-center gap-3">
                  <div className="shrink-0">{activityIcon(activity.status)}</div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">par {activity.user}</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                  <Badge variant="outline" className={`text-[10px] ${activityBadge(activity.status)}`}>
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Actions rapides</CardTitle>
            <CardDescription>Tâches administratives courantes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Gérer les utilisateurs", icon: UserCheck, href: "/admin/users", color: "bg-primary hover:bg-primary/90 text-primary-foreground" },
              { label: "Paramètres sécurité", icon: Shield, href: "/admin/security", color: "bg-emerald-600 hover:bg-emerald-700 text-white" },
              { label: "Voir les rapports", icon: BarChart3, href: "/admin/reports", color: "bg-violet-600 hover:bg-violet-700 text-white" },
              { label: "Config système", icon: Settings, href: "/admin/settings", color: "bg-amber-500 hover:bg-amber-600 text-white" },
              { label: "Outils base de données", icon: Database, href: "/admin/database", color: "bg-slate-600 hover:bg-slate-700 text-white" },
            ].map((action) => {
              const Icon = action.icon
              return (
                <a key={action.label} href={action.href}>
                  <Button className={`w-full justify-start gap-2 rounded-lg ${action.color}`}>
                    <Icon className="h-4 w-4" />
                    {action.label}
                  </Button>
                </a>
              )
            })}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}

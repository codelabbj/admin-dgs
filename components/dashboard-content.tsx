"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { smartFetch } from "@/utils/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "@/contexts/language-context"
import {
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  MapPin,
  CreditCard,
  Smartphone,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Activity,
  DollarSign,
  Calendar,
  Clock,
  RefreshCw,
  Zap,
  Shield,
  BarChart3,
} from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts"

export function DashboardContent() {
  // Désactiver temporairement useAuth pour tester
  // const { isLoading, requireAuth, checkAuth } = useAuth()
  const [showBalances, setShowBalances] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { t } = useLanguage()

  // Désactiver temporairement la vérification d'authentification
  // useEffect(() => {
  //   checkAuth()
  // }, [checkAuth])

  // Contourner temporairement l'exigence d'authentification
  // if (!requireAuth()) {
  //   return null
  // }

  // Désactiver temporairement la vérification de chargement
  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-slate-50/30 dark:bg-neutral-950 flex items-center justify-center">
  //       <div className="flex items-center space-x-2">
  //         <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
  //         <span className="text-lg font-medium text-blue-600">Loading dashboard...</span>
  //       </div>
  //     </div>
  //   )
  // }

  // Interface pour les statistiques API
  interface StatsData {
    total_fee: number
    payin_fee: number
    payout_fee: number
    all_operation_amount: number
    total_success_transaction: number
    failled_transaction: number[]
    payment_methode: { [key: string]: number }
    country_payment: { [key: string]: number }
    total_customers: number
    total_verified: number
    total_verification_pending: number
    total_blocked: number
    total_with_custom_fee: number
    total_customer_pay_fee: number
    payin_fee_sum: number
    payin_fee_avg: number
    payout_fee_sum: number
    payout_fee_avg: number
  }

  // État pour les données API
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  useEffect(() => {
    // Ajouter un délai pour s'assurer que l'authentification soit complètement établie
    const timer = setTimeout(() => {
      console.log('Contenu du tableau de bord: Début de récupération des statistiques après délai')
      fetchStats()
    }, 1000) // Attendre 1 seconde pour que l'authentification soit complètement établie
    
    return () => clearTimeout(timer)
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Vérifier que nous avons un token valide avant de faire l'appel
      const accessToken = localStorage.getItem("access")
      if (!accessToken) {
        console.warn("No access token available for statistics API")
        setError("Token d'authentification manquant")
        return
      }
      
      const res = await smartFetch(`${baseUrl}/prod/v1/api/statistic`)
      
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      } else {
        const errorText = await res.text()
        console.error(`Statistics API error: ${res.status} - ${errorText}`)
        
        if (res.status === 401) {
          setError("Token d'authentification invalide ou expiré")
      } else {
        setError(`Échec de récupération des statistiques: ${res.status}`)
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      setError('Échec de récupération des statistiques')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setIsRefreshing(true)
    await fetchStats()
    setIsRefreshing(false)
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return showBalances ? "0 FCFA" : "••••••"
    return showBalances ? `${amount.toLocaleString()} FCFA` : "••••••"
  }

  // Utiliser les données API pour les emplacements des clients si disponibles, sinon afficher l'état vide
  const customerLocationData = stats?.country_payment
    ? Object.entries(stats.country_payment).map(([country, percentage]) => ({
        country: t(country as any) || country, // Retour au nom du pays original si la traduction n'est pas trouvée
        percentage,
      }))
    : []

  // Utiliser les données API pour les méthodes de paiement si disponibles, sinon afficher l'état vide
  const paymentMethodData = stats?.payment_methode
    ? Object.entries(stats.payment_methode).map(([method, data]: [string, any]) => ({
        name: method,
        value: data.percentage || 0,
        color: method === "Mobile Money" ? "#dc2626" : method === "Credit Card" ? "#10b981" : "#8b5cf6",
      }))
    : []

  // Données simulées pour le tableau de bord amélioré
  const recentTransactions = [
    { id: 1, type: "Paiement", amount: "25,000 FCFA", status: "Terminé", time: "il y a 2 min", method: "Mobile Money" },
    { id: 2, type: "Transfert", amount: "50,000 FCFA", status: "En Attente", time: "il y a 15 min", method: "Virement Bancaire" },
    { id: 3, type: "Paiement", amount: "12,500 FCFA", status: "Terminé", time: "il y a 1 heure", method: "Carte de Crédit" },
    { id: 4, type: "Retrait", amount: "100,000 FCFA", status: "En Cours", time: "il y a 3 heures", method: "Virement Bancaire" },
  ]

  // Calculer les statistiques rapides basées sur les données API
  const quickStats = stats ? [
    { 
      label: "Total Clients", 
      value: stats.total_customers.toLocaleString(), 
      change: "+12%", 
      icon: Users, 
      color: "blue" 
    },
    { 
      label: "Transactions Réussies", 
      value: stats.total_success_transaction.toLocaleString(), 
      change: "+5%", 
      icon: Activity, 
      color: "green" 
    },
    { 
      label: "Total Frais", 
      value: `${stats.total_fee.toLocaleString()} FCFA`, 
      change: "+23%", 
      icon: DollarSign, 
      color: "purple" 
    },
    { 
      label: "Clients Vérifiés", 
      value: stats.total_verified.toLocaleString(), 
      change: "Stable", 
      icon: Shield, 
      color: "emerald" 
    },
  ] : [
    { label: "Total Utilisateurs", value: "2,847", change: "+12%", icon: Users, color: "blue" },
    { label: "Sessions Actives", value: "156", change: "+5%", icon: Activity, color: "green" },
    { label: "Appels API", value: "1.2M", change: "+23%", icon: Zap, color: "purple" },
    { label: "Disponibilité", value: "99.9%", change: "Stable", icon: Shield, color: "emerald" },
  ]

  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="space-y-8 p-6 pb-20">
          <div className="flex items-center justify-center h-64">
            <div className="text-neutral-600 dark:text-neutral-400">{t("loading")}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-8 p-6 pb-20">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between sticky top-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md z-10 py-6 -mx-6 px-6 border-b border-slate-200 dark:border-neutral-700">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">{t("dashboard")}</h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">{t("welcomeBack2")}</p>
          </div>
          <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="lg"
              className="rounded-xl border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800 bg-transparent"
            onClick={() => setShowBalances(!showBalances)}
          >
            {showBalances ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showBalances ? t("hideBalances") : t("showBalances")}
          </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800 bg-transparent"
              onClick={refreshData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <Card key={index} className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-3 bg-${stat.color}-600 rounded-xl shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{stat.label}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Badge className={`bg-${stat.color}-100 text-${stat.color}-800 hover:bg-${stat.color}-100 rounded-full text-xs`}>
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>

        {/* Enhanced Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 backdrop-blur-xl border-emerald-200 dark:border-emerald-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-emerald-600 rounded-xl shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-emerald-600 group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mt-4">
                {t("operationBalance")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">
                {formatCurrency(stats?.all_operation_amount)}
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-emerald-200 text-emerald-800 hover:bg-emerald-200 rounded-full">+8.2%</Badge>
                <span className="text-sm text-emerald-700 dark:text-emerald-300">{t("fromLastWeek")}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 backdrop-blur-xl border-purple-200 dark:border-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-purple-600 rounded-xl shadow-lg">
                  <TrendingDown className="h-6 w-6 text-white" />
                </div>
                <ArrowDownRight className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 mt-4">
                {t("availableBalance")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-2">
                {formatCurrency(stats?.all_operation_amount)}
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-purple-200 text-purple-800 hover:bg-purple-200 rounded-full">-2.1%</Badge>
                <span className="text-sm text-purple-700 dark:text-purple-300">{t("fromYesterday")}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fee Statistics Section */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 backdrop-blur-xl border-blue-200 dark:border-blue-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 mt-4">
                  Frais d'Entrée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                  {formatCurrency(stats.payin_fee)}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-200 text-blue-800 hover:bg-blue-200 rounded-full">
                    Moy: {stats.payin_fee_avg.toFixed(2)} FCFA
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 rounded-full text-xs">
                    Somme: {stats.payin_fee_sum.toLocaleString()} FCFA
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 backdrop-blur-xl border-green-200 dark:border-green-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-green-600 rounded-xl shadow-lg">
                    <TrendingDown className="h-6 w-6 text-white" />
                  </div>
                  <ArrowDownRight className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 mt-4">
                  Frais de Sortie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900 dark:text-green-100 mb-2">
                  {formatCurrency(stats.payout_fee)}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-200 text-green-800 hover:bg-green-200 rounded-full">
                    Moy: {stats.payout_fee_avg.toFixed(2)} FCFA
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 rounded-full text-xs">
                    Somme: {stats.payout_fee_sum.toLocaleString()} FCFA
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 backdrop-blur-xl border-orange-200 dark:border-orange-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-orange-600 rounded-xl shadow-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-orange-600 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300 mt-4">
                  Total Frais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-900 dark:text-orange-100 mb-2">
                  {formatCurrency(stats.total_fee)}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-orange-200 text-orange-800 hover:bg-orange-200 rounded-full">
                    Total
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 backdrop-blur-xl border-purple-200 dark:border-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-purple-600 rounded-xl shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 mt-4">
                  Frais Personnalisés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-2">
                  {stats.total_with_custom_fee}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-purple-200 text-purple-800 hover:bg-purple-200 rounded-full">
                    Clients
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 rounded-full text-xs">
                    Payant: {stats.total_customer_pay_fee}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Customer Statistics Section */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total_customers}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Clients</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 rounded-full text-xs">
                    Total
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-green-600 rounded-xl shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total_verified}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Vérifiés</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 rounded-full text-xs">
                    {((stats.total_verified / stats.total_customers) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-yellow-600 rounded-xl shadow-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total_verification_pending}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">En Attente</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 rounded-full text-xs">
                    {((stats.total_verification_pending / stats.total_customers) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-red-600 rounded-xl shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total_blocked}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Bloqués</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100 rounded-full text-xs">
                    {stats.total_blocked > 0 ? ((stats.total_blocked / stats.total_customers) * 100).toFixed(1) : 0}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Additional Fee Analytics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-indigo-600 rounded-xl shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total_customer_pay_fee}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Clients Payant Frais</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100 rounded-full text-xs">
                    {((stats.total_customer_pay_fee / stats.total_customers) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-teal-600 rounded-xl shadow-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.payin_fee_sum.toLocaleString()}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Somme Frais Entrée</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100 rounded-full text-xs">
                    Moy: {stats.payin_fee_avg.toFixed(2)} FCFA
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-rose-600 rounded-xl shadow-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.payout_fee_sum.toLocaleString()}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Somme Frais Sortie</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 rounded-full text-xs">
                    Moy: {stats.payout_fee_avg.toFixed(2)} FCFA
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Fee Distribution Chart */}
        {stats && (
          <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
              <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-crimson-600" />
                Répartition des Frais
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">
                Distribution des frais d'entrée et de sortie
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Frais d'Entrée", value: stats.payin_fee, color: "#3b82f6" },
                        { name: "Frais de Sortie", value: stats.payout_fee, color: "#10b981" }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: "Frais d'Entrée", value: stats.payin_fee, color: "#3b82f6" },
                        { name: "Frais de Sortie", value: stats.payout_fee, color: "#10b981" }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `${value.toLocaleString()} FCFA`}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Frais d'Entrée</p>
                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      {stats.payin_fee.toLocaleString()} FCFA
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">Frais de Sortie</p>
                    <p className="text-lg font-bold text-green-900 dark:text-green-100">
                      {stats.payout_fee.toLocaleString()} FCFA
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transaction Success/Failure Chart */}
        {stats && (
          <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
              <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-crimson-600" />
                Statistiques des Transactions
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">
                Réussites vs Échecs
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: "Réussies", value: stats.total_success_transaction, color: "#10b981" },
                    { name: "Échecs", value: stats.failled_transaction[0] || 0, color: "#ef4444" }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [value.toLocaleString(), "Transactions"]}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">Transactions Réussies</p>
                    <p className="text-lg font-bold text-green-900 dark:text-green-100">
                      {stats.total_success_transaction.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">Transactions Échouées</p>
                    <p className="text-lg font-bold text-red-900 dark:text-red-100">
                      {(stats.failled_transaction[0] || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customer Status Distribution Chart */}
        {stats && (
          <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
              <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                <Users className="h-5 w-5 mr-2 text-crimson-600" />
                Distribution des Statuts Clients
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">
                Répartition des clients par statut de vérification
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Vérifiés", value: stats.total_verified, color: "#10b981" },
                        { name: "En Attente", value: stats.total_verification_pending, color: "#f59e0b" },
                        { name: "Bloqués", value: stats.total_blocked, color: "#ef4444" },
                        { name: "Autres", value: stats.total_customers - stats.total_verified - stats.total_verification_pending - stats.total_blocked, color: "#6b7280" }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: "Vérifiés", value: stats.total_verified, color: "#10b981" },
                        { name: "En Attente", value: stats.total_verification_pending, color: "#f59e0b" },
                        { name: "Bloqués", value: stats.total_blocked, color: "#ef4444" },
                        { name: "Autres", value: stats.total_customers - stats.total_verified - stats.total_verification_pending - stats.total_blocked, color: "#6b7280" }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [value, "Clients"]}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">Vérifiés</p>
                    <p className="text-lg font-bold text-green-900 dark:text-green-100">{stats.total_verified}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">En Attente</p>
                    <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">{stats.total_verification_pending}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">Bloqués</p>
                    <p className="text-lg font-bold text-red-900 dark:text-red-100">{stats.total_blocked}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-xl">
                  <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Autres</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {stats.total_customers - stats.total_verified - stats.total_verification_pending - stats.total_blocked}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fee Analytics Comparison Chart */}
        {stats && (
          <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
              <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-crimson-600" />
                Analyse Comparative des Frais
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">
                Comparaison des frais d'entrée et de sortie avec leurs moyennes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: "Frais Entrée", total: stats.payin_fee, sum: stats.payin_fee_sum, avg: stats.payin_fee_avg },
                    { name: "Frais Sortie", total: stats.payout_fee, sum: stats.payout_fee_sum, avg: stats.payout_fee_avg }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        `${value.toLocaleString()} FCFA`,
                        name === "total" ? "Total" : name === "sum" ? "Somme" : "Moyenne"
                      ]}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar dataKey="total" fill="#3b82f6" name="Total" />
                    <Bar dataKey="sum" fill="#10b981" name="Somme" />
                    <Bar dataKey="avg" fill="#f59e0b" name="Moyenne" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">Frais d'Entrée</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Total:</span>
                      <span className="font-medium">{stats.payin_fee.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Somme:</span>
                      <span className="font-medium">{stats.payin_fee_sum.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Moyenne:</span>
                      <span className="font-medium">{stats.payin_fee_avg.toFixed(2)} FCFA</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-900 dark:text-green-100">Frais de Sortie</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Total:</span>
                      <span className="font-medium">{stats.payout_fee.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Somme:</span>
                      <span className="font-medium">{stats.payout_fee_sum.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Moyenne:</span>
                      <span className="font-medium">{stats.payout_fee_avg.toFixed(2)} FCFA</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Locations */}
          <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
              <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-crimson-600" />
                {t("whereCustomers")}
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">
                {t("customerDistribution")}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {customerLocationData.length > 0 ? (
                <>
                  <div className="flex items-center justify-center mb-6">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={customerLocationData.map((item, index) => ({
                            name: item.country,
                            value: item.percentage,
                            color: index === 0 ? "#dc2626" : "#f59e0b"
                          }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {customerLocationData.map((item, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? "#dc2626" : "#f59e0b"} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => `${value}%`}
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "12px",
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {customerLocationData.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-100/50 dark:bg-neutral-800/50 rounded-xl border border-slate-200 dark:border-neutral-600"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white dark:bg-neutral-700 rounded-xl shadow-sm">
                            <MapPin className="h-4 w-4 text-crimson-600" />
                          </div>
                          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            {item.country.toUpperCase()}
                          </span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-crimson-100 text-crimson-800 hover:bg-crimson-100 rounded-full font-bold"
                        >
                          {typeof item.percentage === "number" ? item.percentage : 0}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                  {t("noDataAvailable")}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
              <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-crimson-600" />
                {t("mostUsedPayment")}
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">
                {t("paymentMethodDistribution")}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {paymentMethodData.length > 0 ? (
                <>
                  <div className="flex items-center justify-center mb-6">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={paymentMethodData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {paymentMethodData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => `${value}%`}
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "12px",
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {paymentMethodData.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-100/50 dark:bg-neutral-800/50 rounded-xl border border-slate-200 dark:border-neutral-600"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white dark:bg-neutral-700 rounded-xl shadow-sm">
                            {item.name === "Mobile Money" && <Smartphone className="h-4 w-4 text-crimson-600" />}
                            {item.name === "Credit Card" && <CreditCard className="h-4 w-4 text-crimson-600" />}
                            {item.name === "Bank Account" && <Building className="h-4 w-4 text-crimson-600" />}
                            {!["Mobile Money", "Credit Card", "Bank Account"].includes(item.name) && <CreditCard className="h-4 w-4 text-crimson-600" />}
                          </div>
                          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            {item.name === "Mobile Money" && t("mobileMoneyMethod")}
                            {item.name === "Credit Card" && t("creditCardMethod")}
                            {item.name === "Bank Account" && t("bankAccountMethod")}
                            {!["Mobile Money", "Credit Card", "Bank Account"].includes(item.name) && item.name}
                          </span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-crimson-100 text-crimson-800 hover:bg-crimson-100 rounded-full font-bold"
                        >
                          {item.value}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                  {t("noDataAvailable")}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Complete API Data Summary */}
        {stats && (
          <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
              <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-crimson-600" />
                Résumé Complet des Données API
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">
                Toutes les données de l'API de statistiques
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Financial Data */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 border-b border-blue-200 pb-2">Données Financières</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Frais:</span>
                      <span className="font-medium">{stats.total_fee.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Frais Entrée:</span>
                      <span className="font-medium">{stats.payin_fee.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Frais Sortie:</span>
                      <span className="font-medium">{stats.payout_fee.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Montant Opérations:</span>
                      <span className="font-medium">{stats.all_operation_amount.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>

                {/* Transaction Data */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 border-b border-green-200 pb-2">Données Transactions</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Transactions Réussies:</span>
                      <span className="font-medium">{stats.total_success_transaction.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Transactions Échouées:</span>
                      <span className="font-medium">{(stats.failled_transaction[0] || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Taux de Réussite:</span>
                      <span className="font-medium">
                        {((stats.total_success_transaction / (stats.total_success_transaction + (stats.failled_transaction[0] || 0))) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Data */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 border-b border-purple-200 pb-2">Données Clients</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Clients:</span>
                      <span className="font-medium">{stats.total_customers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Clients Vérifiés:</span>
                      <span className="font-medium">{stats.total_verified}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">En Attente:</span>
                      <span className="font-medium">{stats.total_verification_pending}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Bloqués:</span>
                      <span className="font-medium">{stats.total_blocked}</span>
                    </div>
                  </div>
                </div>

                {/* Fee Analytics */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100 border-b border-orange-200 pb-2">Analyses Frais</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Somme Frais Entrée:</span>
                      <span className="font-medium">{stats.payin_fee_sum.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Moyenne Frais Entrée:</span>
                      <span className="font-medium">{stats.payin_fee_avg.toFixed(2)} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Somme Frais Sortie:</span>
                      <span className="font-medium">{stats.payout_fee_sum.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Moyenne Frais Sortie:</span>
                      <span className="font-medium">{stats.payout_fee_avg.toFixed(2)} FCFA</span>
                    </div>
                  </div>
                </div>

                {/* Fee Configuration */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 border-b border-indigo-200 pb-2">Configuration Frais</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Avec Frais Personnalisés:</span>
                      <span className="font-medium">{stats.total_with_custom_fee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Clients Payant Frais:</span>
                      <span className="font-medium">{stats.total_customer_pay_fee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">% Clients Payant:</span>
                      <span className="font-medium">
                        {((stats.total_customer_pay_fee / stats.total_customers) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods & Countries */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-teal-900 dark:text-teal-100 border-b border-teal-200 pb-2">Méthodes & Pays</h4>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Méthodes de Paiement:</span>
                      {Object.entries(stats.payment_methode).map(([method, value]) => (
                        <div key={method} className="flex justify-between ml-2">
                          <span className="text-xs text-neutral-500 dark:text-neutral-500">{method}:</span>
                          <span className="text-xs font-medium">{value}%</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Pays:</span>
                      {Object.entries(stats.country_payment).map(([country, value]) => (
                        <div key={country} className="flex justify-between ml-2">
                          <span className="text-xs text-neutral-500 dark:text-neutral-500">{country.toUpperCase()}:</span>
                          <span className="text-xs font-medium">{value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Transactions */}
        {/* <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
            <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-crimson-600" />
              Transactions Récentes
            </CardTitle>
            <CardDescription className="text-neutral-600 dark:text-neutral-400">
              Dernières activités de paiement et transferts
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.status === 'Terminé' ? 'bg-emerald-100 dark:bg-emerald-900/20' :
                      transaction.status === 'En Attente' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                      'bg-blue-100 dark:bg-blue-900/20'
                    }`}>
                      <CreditCard className="h-4 w-4 text-crimson-600" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white">{transaction.type}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">{transaction.method}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-900 dark:text-white">{transaction.amount}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge 
                        className={`text-xs ${
                          transaction.status === 'Terminé' ? 'bg-emerald-100 text-emerald-800' :
                          transaction.status === 'En Attente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {transaction.status}
                      </Badge>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{transaction.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  )
}

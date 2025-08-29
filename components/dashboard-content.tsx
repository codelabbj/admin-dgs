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

  // État pour les données API
  const [stats, setStats] = useState<any>(null)
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
      
      const res = await smartFetch(`${baseUrl}/api/v1/statistic`)
      
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      } else {
        setError(`Échec de récupération des statistiques: ${res.status}`)
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

  const quickStats = [
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
                {formatCurrency(stats?.availavailable_fund)}
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-purple-200 text-purple-800 hover:bg-purple-200 rounded-full">-2.1%</Badge>
                <span className="text-sm text-purple-700 dark:text-purple-300">{t("fromYesterday")}</span>
              </div>
            </CardContent>
          </Card>
        </div>

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
                <div className="space-y-6">
                  {customerLocationData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-slate-100 dark:bg-neutral-800 rounded-xl">
                          <MapPin className="h-4 w-4 text-crimson-600" />
                        </div>
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{item.country}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-slate-200 dark:bg-neutral-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-crimson-500 to-crimson-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300 w-8">
                          {typeof item.percentage === "number" ? item.percentage : 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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

        {/* Recent Transactions */}
        <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
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
        </Card>
      </div>
    </div>
  )
}

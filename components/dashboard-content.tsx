"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { smartFetch } from "@/utils/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { useLanguage } from "@/contexts/language-context"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
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
  CalendarDays,
  X,
  Download,
  CheckCircle,
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
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
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

  // Interface pour les statistiques API globales
  interface GlobalStatsData {
    total_transactions: number
    total_payin: {
      count: number
      amount: number | null
    }
    total_payout: {
      count: number
      amount: number | null
    }
    total_commissions: number
    unpaid_commissions: number
    month_transactions: {
      count: number
      amount: number | null
    }
    available_fund: number
  }


  // Interfaces pour les nouvelles APIs de monitoring
  interface RealtimeData {
    timestamp: string
    last_hour: {
      transactions: number
      total_amount: number
      payin_count: number
      payout_count: number
      completed: number
      failed: number
      processing: number
      avg_processing_seconds: number
    }
    today: {
      transactions: number
      total_amount: number
      completed_amount: number
    }
    alerts: {
      failed_webhooks: number
      failed_callbacks: number
    }
  }

  interface TransactionFlowData {
    period: string
    data: Array<{
      hour: string
      count: number
      total_amount: number
      payin_count: number
      payout_count: number
      completed: number
      failed: number
    }>
  }

  interface OperatorPerformanceData {
    period_days: number
    operators: Array<{
      operator_config__operator_code: string
      operator_config__operator_name: string
      total_transactions: number
      total_amount: number
      completed: number
      failed: number
      success_rate: number
      avg_amount: number
    }>
  }

  interface TopCustomersData {
    customers: Array<{
      customer_id: string
      customer_name: string
      total_transactions: number
      total_amount: number
      success_rate: number
    }>
  }

  // Interface pour les données de santé API
  interface ApiHealthData {
    status: string
    wave_api: string
    recent_transactions_1h: number
    failed_callbacks_24h: number
    timestamp: string
  }

  // Interface pour les données de santé des opérateurs
  interface OperatorHealthData {
    operators: Array<{
      operator_code: string
      operator_name: string
      status: string
      balance: number | null
    }>
  }

  // Interface pour le rapport quotidien
  interface DailyReportData {
    date: string
    summary: {
      total_transactions: number
      completed_transactions: number
      failed_transactions: number
      success_rate: number
    }
    payin: {
      count: number
      volume: number
      fees_collected: number
    }
    payout: {
      count: number
      volume: number
      fees_collected: number
    }
    total_fees: number
  }

  // Interface pour le relevé client
  interface CustomerStatementData {
    customer_id: string
    period: {
      start: string
      end: string
    }
    summary: {
      total_payin: {
        count: number
        volume: number
      }
      total_payout: {
        count: number
        volume: number
      }
      total_fees_paid: number
    }
    transactions: Array<{
      reference: string
      date: string
      type: string
      amount: number
      fees: number
      status: string
    }>
    account_movements: Array<{
      date: string
      type: string
      amount: number
      balance_after: number
      description: string
    }>
  }

  // Interface pour le rapport de commissions
  interface CommissionReportData {
    period: {
      start: string
      end: string
    }
    summary: {
      total_count: number
      confirmed_count: number
      withdrawn_count: number
      total_operator_fees: number
      total_aggregator_fees: number
      unpaid_aggregator_fees: number
    }
    by_operator: Array<{
      operator_config__operator_code: string
      operator_config__operator_name: string
      count: number
      total_operator_fee: number
      total_aggregator_fee: number
      total_transaction_volume: number
    }>
  }

  // Interface pour le rapport de réconciliation
  interface ReconciliationReportData {
    date: string
    payin: {
      count: number
      volume: number
      fees_collected: number
    }
    payout: {
      count: number
      volume: number
      fees_collected: number
    }
    account_movements: {
      total_credits: number
      total_debits: number
      net: number
    }
    recharges: {
      count: number
      total: number
    }
    withdrawals: {
      count: number
      total: number
    }
    commissions: {
      count: number
      operator_fees: number
      aggregator_fees: number
    }
  }

  interface HealthData {
    status: string
    timestamp: string
    metrics: {
      stuck_transactions: number
      recent_webhook_failures: number
      success_rate_last_hour: number
      frozen_accounts: number
      unpaid_commissions_amount: number
    }
    issues: string[]
  }

  interface FinancialSummaryData {
    period: string
    start_date: string
    payin: {
      count: number
      volume: number
      fees_collected: number
    }
    payout: {
      count: number
      volume: number
      fees_collected: number
    }
    commissions: {
      count: number
      total_operator_fees: number
      total_aggregator_fees: number
    }
    total_customer_balances: number
  }

  interface AuditSummaryData {
    period_hours: number
    action_counts: Array<{
      action: string
      count: number
    }>
    suspicious_activities: number
    top_active_customers: Array<{
      customer_id: string
      action_count: number
    }>
  }

  interface SyncStatusData {
    timestamp: string
    automatic_sync: {
      frequency: string
      last_run: string | null
      next_scheduled: string
    }
    stuck_sync: {
      frequency: string
      last_run: string | null
      next_scheduled: string
    }
    pending_transactions: {
      total: number
      by_age: {
        last_10_minutes: number
        last_hour: number
        last_6_hours: number
        older_than_6h: number
      }
      orphans_without_external_id: number
    }
    stuck_transactions: {
      count: number
      sample: Array<{
        reference: string
        created_at: string
        customer_id: string
        amount: number
        phone: string
      }>
    }
    recommendations: Array<{
      level: string
      message: string
      action: string
    }>
    info: {
      auto_sync_enabled: boolean
      manual_sync_endpoint: string
      monitoring_endpoint: string
    }
  }

  interface CeleryTasksData {
    timestamp: string
    tasks: Array<{
      name: string
      status: string
      last_run: string
      next_run: string
    }>
    total_enabled_tasks: number
  }

  // État pour les données API
  const [globalStats, setGlobalStats] = useState<GlobalStatsData | null>(null)
  const [apiHealth, setApiHealth] = useState<ApiHealthData | null>(null)
  const [operatorHealth, setOperatorHealth] = useState<OperatorHealthData | null>(null)
  const [dailyReport, setDailyReport] = useState<DailyReportData | null>(null)
  const [customerStatement, setCustomerStatement] = useState<CustomerStatementData | null>(null)
  const [commissionReport, setCommissionReport] = useState<CommissionReportData | null>(null)
  const [reconciliationReport, setReconciliationReport] = useState<ReconciliationReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  // États pour les nouvelles données de monitoring
  const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null)
  const [transactionFlowData, setTransactionFlowData] = useState<TransactionFlowData | null>(null)
  const [operatorPerformanceData, setOperatorPerformanceData] = useState<OperatorPerformanceData | null>(null)
  const [topCustomersData, setTopCustomersData] = useState<TopCustomersData | null>(null)
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [financialSummaryData, setFinancialSummaryData] = useState<FinancialSummaryData | null>(null)
  const [auditSummaryData, setAuditSummaryData] = useState<AuditSummaryData | null>(null)
  const [syncStatusData, setSyncStatusData] = useState<SyncStatusData | null>(null)
  const [celeryTasksData, setCeleryTasksData] = useState<CeleryTasksData | null>(null)

  useEffect(() => {
    // Ajouter un délai pour s'assurer que l'authentification soit complètement établie
    const timer = setTimeout(() => {
      console.log('Contenu du tableau de bord: Début de récupération des statistiques après délai')
      fetchAllMonitoringData()
    }, 1000) // Attendre 1 seconde pour que l'authentification soit complètement établie
    
    return () => clearTimeout(timer)
  }, [])


  // Fonction pour récupérer toutes les données de monitoring
  const fetchAllMonitoringData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Récupérer toutes les données en parallèle
      await Promise.all([
        fetchGlobalStats(),
        fetchApiHealth(),
        fetchOperatorHealth(),
        fetchDailyReport(),
        fetchCommissionReport(),
        fetchReconciliationReport(),
        fetchRealtimeData(),
        fetchTransactionFlowData(),
        fetchOperatorPerformanceData(),
        fetchTopCustomersData(),
        fetchHealthData(),
        fetchFinancialSummaryData(),
        fetchAuditSummaryData(),
        fetchSyncStatusData(),
        fetchCeleryTasksData()
      ])
    } catch (error) {
      console.error('Erreur lors de la récupération des données de monitoring:', error)
      setError('Échec de récupération des données de monitoring')
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour récupérer les données en temps réel
  const fetchRealtimeData = async () => {
    try {
      const res = await smartFetch(`${baseUrl}/api/v2/admin/monitoring/realtime/`)
      if (res.ok) {
        const data = await res.json()
        setRealtimeData(data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données temps réel:', error)
    }
  }

  // Fonction pour récupérer les données de flux de transactions
  const fetchTransactionFlowData = async () => {
    try {
      const res = await smartFetch(`${baseUrl}/api/v2/admin/monitoring/transaction-flow/`)
      if (res.ok) {
        const data = await res.json()
        setTransactionFlowData(data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données de flux:', error)
    }
  }

  // Fonction pour récupérer les données de performance des opérateurs
  const fetchOperatorPerformanceData = async () => {
    try {
      const res = await smartFetch(`${baseUrl}/api/v2/admin/monitoring/operator-performance/?days=10`)
      if (res.ok) {
        const data = await res.json()
        setOperatorPerformanceData(data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données de performance:', error)
    }
  }

  // Fonction pour récupérer les données des meilleurs clients
  const fetchTopCustomersData = async () => {
    try {
      const res = await smartFetch(`${baseUrl}/api/v2/admin/monitoring/top-customers/?days=&limit=10`)
      if (res.ok) {
        const data = await res.json()
        setTopCustomersData(data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données des clients:', error)
    }
  }

  // Fonction pour récupérer les statistiques globales
  const fetchGlobalStats = async () => {
    try {
      const res = await smartFetch(`${baseUrl}/api/v2/admin/stats/`)
      if (res.ok) {
        const data = await res.json()
        setGlobalStats(data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques globales:', error)
    }
  }

  // Fonction pour récupérer les données de santé API
  const fetchApiHealth = async () => {
    try {
      const res = await smartFetch(`${baseUrl}/api/v2/admin/health/`)
      if (res.ok) {
        const data = await res.json()
        setApiHealth(data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données de santé API:', error)
    }
  }

  // Fonction pour récupérer les données de santé des opérateurs
  const fetchOperatorHealth = async () => {
    try {
      const res = await smartFetch(`${baseUrl}/api/v2/admin/health/operators/`)
      if (res.ok) {
        const data = await res.json()
        setOperatorHealth(data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données de santé des opérateurs:', error)
    }
  }

  // Fonction pour récupérer le rapport quotidien
  const fetchDailyReport = async () => {
    try {
      const res = await smartFetch(`${baseUrl}/api/v2/admin/reports/daily/`)
      if (res.ok) {
        const data = await res.json()
        setDailyReport(data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du rapport quotidien:', error)
    }
  }

  // Fonction pour récupérer le relevé client
  const fetchCustomerStatement = async (customerId: string) => {
    try {
      const res = await smartFetch(`${baseUrl}/api/v2/admin/reports/customer-statement/${customerId}/`)
      if (res.ok) {
        const data = await res.json()
        setCustomerStatement(data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du relevé client:', error)
    }
  }

  // Fonction pour récupérer le rapport de commissions
  const fetchCommissionReport = async (startDate?: string, endDate?: string) => {
    try {
      let url = `${baseUrl}/api/v2/admin/reports/commissions/`
      const params = new URLSearchParams()
      
      if (startDate) {
        params.append('start_date', startDate)
      }
      if (endDate) {
        params.append('end_date', endDate)
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const res = await smartFetch(url)
      if (res.ok) {
        const data = await res.json()
        setCommissionReport(data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du rapport de commissions:', error)
    }
  }

  // Fonction pour récupérer le rapport de réconciliation
  const fetchReconciliationReport = async (date?: string) => {
    try {
      let url = `${baseUrl}/api/v2/admin/reports/reconciliation/`
      const params = new URLSearchParams()
      
      if (date) {
        params.append('date', date)
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const res = await smartFetch(url)
      if (res.ok) {
        const data = await res.json()
        setReconciliationReport(data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du rapport de réconciliation:', error)
    }
  }


  // Fonction pour récupérer les données de santé
  const fetchHealthData = async () => {
    try {
      const res = await smartFetch(`${baseUrl}/api/v2/admin/monitoring/health/`)
      if (res.ok) {
        const data = await res.json()
        setHealthData(data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données de santé:', error)
    }
  }

  // Fonction pour récupérer les données de résumé financier
  const fetchFinancialSummaryData = async () => {
    try {
      const res = await smartFetch(`${baseUrl}/api/v2/admin/monitoring/financial-summary/`)
      if (res.ok) {
        const data = await res.json()
        setFinancialSummaryData(data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données financières:', error)
    }
  }

  // Fonction pour récupérer les données de résumé d'audit
  const fetchAuditSummaryData = async () => {
    try {
      const res = await smartFetch(`${baseUrl}/api/v2/admin/monitoring/audit-summary/?hours=12`)
      if (res.ok) {
        const data = await res.json()
        setAuditSummaryData(data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données d\'audit:', error)
    }
  }

  // Fonction pour récupérer les données de statut de synchronisation
  const fetchSyncStatusData = async () => {
    try {
      const res = await smartFetch(`${baseUrl}/api/v2/admin/monitoring/sync-status/`)
      if (res.ok) {
        const data = await res.json()
        setSyncStatusData(data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données de sync:', error)
    }
  }

  // Fonction pour récupérer les données des tâches Celery
  const fetchCeleryTasksData = async () => {
    try {
      const res = await smartFetch(`${baseUrl}/api/v2/admin/monitoring/celery-tasks/`)
      if (res.ok) {
        const data = await res.json()
        setCeleryTasksData(data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données Celery:', error)
    }
  }

  const refreshData = async () => {
    setIsRefreshing(true)
    await fetchAllMonitoringData()
    setIsRefreshing(false)
  }

  const clearDateFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
  }

  const applyDateFilters = () => {
    fetchAllMonitoringData()
  }

  // Refetch data when date filters change
  useEffect(() => {
    if (startDate || endDate) {
      fetchAllMonitoringData()
    }
  }, [startDate, endDate])

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return showBalances ? "0 FCFA" : "••••••"
    return showBalances ? `${amount.toLocaleString()} FCFA` : "••••••"
  }


  // Données simulées pour le tableau de bord amélioré
  const recentTransactions = [
    { id: 1, type: "Paiement", amount: "25,000 FCFA", status: "Terminé", time: "il y a 2 min", method: "Mobile Money" },
    { id: 2, type: "Transfert", amount: "50,000 FCFA", status: "En Attente", time: "il y a 15 min", method: "Virement Bancaire" },
    { id: 3, type: "Paiement", amount: "12,500 FCFA", status: "Terminé", time: "il y a 1 heure", method: "Carte de Crédit" },
    { id: 4, type: "Retrait", amount: "100,000 FCFA", status: "En Cours", time: "il y a 3 heures", method: "Virement Bancaire" },
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
            {/* <p className="text-neutral-600 dark:text-neutral-400 text-lg">{t("welcomeBack2")}</p> */}
            {/* Date Range Display */}
            {(startDate || endDate) && (
              <div className="flex items-center space-x-2 mt-2">
                <CalendarDays className="h-4 w-4 text-neutral-500" />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {startDate && endDate 
                    ? `${format(startDate, 'dd/MM/yyyy', { locale: fr })} - ${format(endDate, 'dd/MM/yyyy', { locale: fr })}`
                    : startDate 
                    ? `À partir du ${format(startDate, 'dd/MM/yyyy', { locale: fr })}`
                    : `Jusqu'au ${format(endDate!, 'dd/MM/yyyy', { locale: fr })}`
                  }
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearDateFilters}
                  className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {/* Date Filter Controls */}
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-xl border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800 bg-transparent"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Date de début
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date > new Date() || (endDate ? date > endDate : false)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-xl border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800 bg-transparent"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Date de fin
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => date > new Date() || (startDate ? date < startDate : false)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

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


        {/* Global Stats Section */}
        {globalStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 backdrop-blur-xl border-blue-200 dark:border-blue-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{globalStats.total_transactions.toLocaleString()}</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Total Transactions</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 backdrop-blur-xl border-green-200 dark:border-green-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-green-600 rounded-xl shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{globalStats.total_payin.count.toLocaleString()}</p>
                    <p className="text-sm text-green-700 dark:text-green-300">Total Payin</p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {formatCurrency(globalStats.total_payin.amount)}
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 backdrop-blur-xl border-purple-200 dark:border-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-purple-600 rounded-xl shadow-lg">
                    <TrendingDown className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{globalStats.total_payout.count.toLocaleString()}</p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Total Payout</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      {formatCurrency(globalStats.total_payout.amount)}
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 backdrop-blur-xl border-orange-200 dark:border-orange-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-orange-600 rounded-xl shadow-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{formatCurrency(globalStats.total_commissions)}</p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">Total Commissions</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 backdrop-blur-xl border-red-200 dark:border-red-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-red-600 rounded-xl shadow-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">{formatCurrency(globalStats.unpaid_commissions)}</p>
                    <p className="text-sm text-red-700 dark:text-red-300">Unpaid Commissions</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 backdrop-blur-xl border-indigo-200 dark:border-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-indigo-600 rounded-xl shadow-lg">
                    <CalendarDays className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{globalStats.month_transactions.count.toLocaleString()}</p>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">This Month</p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(globalStats.month_transactions.amount)}
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Global Stats Charts */}
        {globalStats && (
          <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
              <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-crimson-600" />
                Vue d'Ensemble des Transactions
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">
                Répartition des volumes et commissions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Transaction Volume Distribution */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Volume des Transactions</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Payin', value: globalStats.total_payin.amount || 0, color: '#10b981' },
                          { name: 'Payout', value: globalStats.total_payout.amount || 0, color: '#ef4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: { name: string; percent?: number }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Payin', value: globalStats.total_payin.amount || 0, color: '#10b981' },
                          { name: 'Payout', value: globalStats.total_payout.amount || 0, color: '#ef4444' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Volume']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Commission Status */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Statut des Commissions</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { 
                        name: 'Total', 
                        value: globalStats.total_commissions,
                        color: '#3b82f6'
                      },
                      { 
                        name: 'Impayées', 
                        value: globalStats.unpaid_commissions,
                        color: '#ef4444'
                      }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(Number(value)), 'Montant']}
                      />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Health Section */}
        {apiHealth && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 ${apiHealth.status === 'healthy' ? 'bg-green-600' : 'bg-red-600'} rounded-xl shadow-lg`}>
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-neutral-900 dark:text-white capitalize">{apiHealth.status}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">API Status</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 ${apiHealth.wave_api === 'healthy' ? 'bg-green-600' : 'bg-red-600'} rounded-xl shadow-lg`}>
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-neutral-900 dark:text-white capitalize">{apiHealth.wave_api}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Wave API</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{apiHealth.recent_transactions_1h}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Recent Transactions (1h)</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-orange-600 rounded-xl shadow-lg">
                    <RefreshCw className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{apiHealth.failed_callbacks_24h}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Failed Callbacks (24h)</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Operator Health Section */}
        {operatorHealth && (
          <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
              <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                <Zap className="h-5 w-5 mr-2 text-crimson-600" />
                Operator Health Status
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">
                Real-time status of payment operators
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {operatorHealth.operators.map((operator, index) => (
                  <div key={index} className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-neutral-900 dark:text-white">{operator.operator_name}</h4>
                      <Badge className={`${
                        operator.status === 'healthy' ? 'bg-green-100 text-green-800' :
                        operator.status === 'error' ? 'bg-red-100 text-red-800' :
                        operator.status === 'not_implemented' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {operator.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Code: <span className="font-mono">{operator.operator_code}</span>
                      </p>
                      {operator.balance !== null && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Balance: <span className="font-semibold">{formatCurrency(operator.balance)}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Daily Report Section */}
        {dailyReport && (
          <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
              <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-crimson-600" />
                Rapport Quotidien - {new Date(dailyReport.date).toLocaleDateString()}
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">
                Résumé des transactions de la journée
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Transactions</h4>
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{dailyReport.summary.total_transactions}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">Taux de succès: {dailyReport.summary.success_rate.toFixed(1)}%</p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-green-900 dark:text-green-100">Transactions Réussies</h4>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{dailyReport.summary.completed_transactions}</p>
                  <p className="text-xs text-green-700 dark:text-green-300">Volume: {formatCurrency(dailyReport.payin.volume + dailyReport.payout.volume)}</p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100">Paiements Entrants</h4>
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{dailyReport.payin.count}</p>
                  <p className="text-xs text-purple-700 dark:text-purple-300">Volume: {formatCurrency(dailyReport.payin.volume)}</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">Frais: {formatCurrency(dailyReport.payin.fees_collected)}</p>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-orange-900 dark:text-orange-100">Paiements Sortants</h4>
                    <TrendingDown className="h-4 w-4 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{dailyReport.payout.count}</p>
                  <p className="text-xs text-orange-700 dark:text-orange-300">Volume: {formatCurrency(dailyReport.payout.volume)}</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">Frais: {formatCurrency(dailyReport.payout.fees_collected)}</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">Total des Frais</h4>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{formatCurrency(dailyReport.total_fees)}</p>
                </div>
              </div>

              {/* Charts Section */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Transaction Status Pie Chart */}
                <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700">
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Répartition des Transactions</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Réussies', value: dailyReport.summary.completed_transactions, color: '#10b981' },
                          { name: 'Échouées', value: dailyReport.summary.failed_transactions, color: '#ef4444' },
                          { name: 'En Attente', value: dailyReport.summary.total_transactions - dailyReport.summary.completed_transactions - dailyReport.summary.failed_transactions, color: '#f59e0b' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: { name: string; percent?: number }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Réussies', value: dailyReport.summary.completed_transactions, color: '#10b981' },
                          { name: 'Échouées', value: dailyReport.summary.failed_transactions, color: '#ef4444' },
                          { name: 'En Attente', value: dailyReport.summary.total_transactions - dailyReport.summary.completed_transactions - dailyReport.summary.failed_transactions, color: '#f59e0b' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Transactions']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Payin vs Payout Volume Chart */}
                <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700">
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Volume Payin vs Payout</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { name: 'Payin', volume: dailyReport.payin.volume, count: dailyReport.payin.count },
                      { name: 'Payout', volume: dailyReport.payout.volume, count: dailyReport.payout.count }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          formatCurrency(Number(value)), 
                          name === 'volume' ? 'Volume' : 'Nombre'
                        ]}
                      />
                      <Bar dataKey="volume" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Commission Report Section */}
        {commissionReport && (
          <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
              <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-crimson-600" />
                Rapport de Commissions
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">
                Période: {new Date(commissionReport.period.start).toLocaleDateString()} - {new Date(commissionReport.period.end).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Commissions</h4>
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{commissionReport.summary.total_count}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">Confirmées: {commissionReport.summary.confirmed_count}</p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-green-900 dark:text-green-100">Frais Opérateurs</h4>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{formatCurrency(commissionReport.summary.total_operator_fees)}</p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100">Frais Agrégateur</h4>
                    <Activity className="h-4 w-4 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{formatCurrency(commissionReport.summary.total_aggregator_fees)}</p>
                  <p className="text-xs text-purple-700 dark:text-purple-300">Impayés: {formatCurrency(commissionReport.summary.unpaid_aggregator_fees)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">Par Opérateur</h4>
                {commissionReport.by_operator.map((operator, index) => (
                  <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold text-neutral-900 dark:text-white">{operator.operator_config__operator_name}</h5>
                      <Badge className="bg-blue-100 text-blue-800">{operator.operator_config__operator_code}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-600 dark:text-neutral-400">Transactions</p>
                        <p className="font-semibold text-neutral-900 dark:text-white">{operator.count}</p>
                      </div>
                      <div>
                        <p className="text-neutral-600 dark:text-neutral-400">Volume</p>
                        <p className="font-semibold text-neutral-900 dark:text-white">{formatCurrency(operator.total_transaction_volume)}</p>
                      </div>
                      <div>
                        <p className="text-neutral-600 dark:text-neutral-400">Frais Opérateur</p>
                        <p className="font-semibold text-neutral-900 dark:text-white">{formatCurrency(operator.total_operator_fee)}</p>
                      </div>
                      <div>
                        <p className="text-neutral-600 dark:text-neutral-400">Frais Agrégateur</p>
                        <p className="font-semibold text-neutral-900 dark:text-white">{formatCurrency(operator.total_aggregator_fee)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Commission Charts Section */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Commission Distribution Pie Chart */}
                <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700">
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Répartition des Commissions</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Frais Opérateurs', value: commissionReport.summary.total_operator_fees, color: '#10b981' },
                          { name: 'Frais Agrégateur', value: commissionReport.summary.total_aggregator_fees, color: '#3b82f6' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: { name: string; percent?: number }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Frais Opérateurs', value: commissionReport.summary.total_operator_fees, color: '#10b981' },
                          { name: 'Frais Agrégateur', value: commissionReport.summary.total_aggregator_fees, color: '#3b82f6' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Montant']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Operator Commission Bar Chart */}
                <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700">
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Commissions par Opérateur</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={commissionReport.by_operator.map(op => ({
                      name: op.operator_config__operator_name,
                      operatorFee: op.total_operator_fee,
                      aggregatorFee: op.total_aggregator_fee
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(Number(value)), 'Montant']}
                      />
                      <Bar dataKey="operatorFee" stackId="a" fill="#10b981" name="Frais Opérateur" />
                      <Bar dataKey="aggregatorFee" stackId="a" fill="#3b82f6" name="Frais Agrégateur" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reconciliation Report Section */}
        {reconciliationReport && (
          <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
              <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                <Activity className="h-5 w-5 mr-2 text-crimson-600" />
                Rapport de Réconciliation - {new Date(reconciliationReport.date).toLocaleDateString()}
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">
                État des comptes et mouvements financiers
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-green-900 dark:text-green-100">Paiements Entrants</h4>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{reconciliationReport.payin.count}</p>
                  <p className="text-xs text-green-700 dark:text-green-300">Volume: {formatCurrency(reconciliationReport.payin.volume)}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">Frais: {formatCurrency(reconciliationReport.payin.fees_collected)}</p>
                </div>

                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-red-900 dark:text-red-100">Paiements Sortants</h4>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">{reconciliationReport.payout.count}</p>
                  <p className="text-xs text-red-700 dark:text-red-300">Volume: {formatCurrency(reconciliationReport.payout.volume)}</p>
                  <p className="text-xs text-red-600 dark:text-red-400">Frais: {formatCurrency(reconciliationReport.payout.fees_collected)}</p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Solde Net</h4>
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className={`text-2xl font-bold ${reconciliationReport.account_movements.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(reconciliationReport.account_movements.net)}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Crédits: {formatCurrency(reconciliationReport.account_movements.total_credits)}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Débits: {formatCurrency(reconciliationReport.account_movements.total_debits)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-2">Recharges</h4>
                  <p className="text-lg font-bold text-neutral-900 dark:text-white">{reconciliationReport.recharges.count}</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Total: {formatCurrency(reconciliationReport.recharges.total)}</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-2">Retraits</h4>
                  <p className="text-lg font-bold text-neutral-900 dark:text-white">{reconciliationReport.withdrawals.count}</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Total: {formatCurrency(reconciliationReport.withdrawals.total)}</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-2">Commissions</h4>
                  <p className="text-lg font-bold text-neutral-900 dark:text-white">{reconciliationReport.commissions.count}</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Opérateur: {formatCurrency(reconciliationReport.commissions.operator_fees)}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Agrégateur: {formatCurrency(reconciliationReport.commissions.aggregator_fees)}
                  </p>
                </div>
              </div>

              {/* Reconciliation Charts Section */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Financial Flow Chart */}
                <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700">
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Flux Financiers</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { 
                        name: 'Crédits', 
                        value: reconciliationReport.account_movements.total_credits,
                        color: '#10b981'
                      },
                      { 
                        name: 'Débits', 
                        value: Math.abs(reconciliationReport.account_movements.total_debits),
                        color: '#ef4444'
                      }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(Number(value)), 'Montant']}
                      />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Transaction Types Distribution */}
                <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700">
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Types de Transactions</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Payin', value: reconciliationReport.payin.volume, color: '#10b981' },
                          { name: 'Payout', value: reconciliationReport.payout.volume, color: '#ef4444' },
                          { name: 'Recharges', value: reconciliationReport.recharges.total, color: '#3b82f6' },
                          { name: 'Retraits', value: reconciliationReport.withdrawals.total, color: '#f59e0b' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: { name: string; percent?: number }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Payin', value: reconciliationReport.payin.volume, color: '#10b981' },
                          { name: 'Payout', value: reconciliationReport.payout.volume, color: '#ef4444' },
                          { name: 'Recharges', value: reconciliationReport.recharges.total, color: '#3b82f6' },
                          { name: 'Retraits', value: reconciliationReport.withdrawals.total, color: '#f59e0b' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Volume']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        )}


        {/* Enhanced Balance Cards */}
        <div className="grid grid-cols-1 gap-8">
          {/* <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 backdrop-blur-xl border-emerald-200 dark:border-emerald-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
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
          </Card> */}

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
                {formatCurrency(globalStats?.available_fund)}
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-purple-200 text-purple-800 hover:bg-purple-200 rounded-full">-2.1%</Badge>
                <span className="text-sm text-purple-700 dark:text-purple-300">{t("fromYesterday")}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fee Statistics Section */}







        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 gap-8">

        </div>

        {/* Realtime Monitoring Section */}
        {realtimeData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 backdrop-blur-xl border-blue-200 dark:border-blue-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 mt-4">
                  Transactions (Dernière Heure)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                  {realtimeData.last_hour.transactions}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-200 text-blue-800 hover:bg-blue-200 rounded-full">
                    {formatCurrency(realtimeData.last_hour.total_amount)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 backdrop-blur-xl border-green-200 dark:border-green-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-green-600 rounded-xl shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 mt-4">
                  Transactions Aujourd'hui
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900 dark:text-green-100 mb-2">
                  {realtimeData.today.transactions}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-200 text-green-800 hover:bg-green-200 rounded-full">
                    {formatCurrency(realtimeData.today.total_amount)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 backdrop-blur-xl border-purple-200 dark:border-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-purple-600 rounded-xl shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 mt-4">
                  Alertes Système
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-2">
                  {realtimeData.alerts.failed_webhooks + realtimeData.alerts.failed_callbacks}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-purple-200 text-purple-800 hover:bg-purple-200 rounded-full text-xs">
                    Webhooks: {realtimeData.alerts.failed_webhooks}
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 rounded-full text-xs">
                    Callbacks: {realtimeData.alerts.failed_callbacks}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 backdrop-blur-xl border-orange-200 dark:border-orange-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-orange-600 rounded-xl shadow-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-orange-600 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300 mt-4">
                  Temps Moyen Traitement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-900 dark:text-orange-100 mb-2">
                  {realtimeData.last_hour.avg_processing_seconds}s
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-orange-200 text-orange-800 hover:bg-orange-200 rounded-full">
                    En cours: {realtimeData.last_hour.processing}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Health Status Section */}
        {healthData && (
          <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
              <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                <Shield className={`h-5 w-5 mr-2 ${
                  healthData.status === 'healthy' ? 'text-green-600' :
                  healthData.status === 'warning' ? 'text-yellow-600' :
                  'text-red-600'
                }`} />
                Statut de Santé du Système
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">
                Dernière mise à jour: {new Date(healthData.timestamp).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">Transactions Bloquées</p>
                    <p className="text-lg font-bold text-red-900 dark:text-red-100">
                      {healthData.metrics.stuck_transactions}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Échecs Webhooks</p>
                    <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
                      {healthData.metrics.recent_webhook_failures}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Taux de Réussite</p>
                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      {healthData.metrics.success_rate_last_hour}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Comptes Gelés</p>
                    <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                      {healthData.metrics.frozen_accounts}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Commissions Impayées</p>
                    <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                      {formatCurrency(healthData.metrics.unpaid_commissions_amount)}
                    </p>
                  </div>
                </div>
              </div>
              
              {healthData.issues.length > 0 && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700">
                  <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">Problèmes Détectés:</h4>
                  <ul className="space-y-1">
                    {healthData.issues.map((issue, index) => (
                      <li key={index} className="text-sm text-red-800 dark:text-red-200">• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Transaction Flow Chart */}
        {transactionFlowData && (
          <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
              <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-crimson-600" />
                Flux de Transactions ({transactionFlowData.period})
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">
                Évolution des transactions par heure
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-6">
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={transactionFlowData.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="hour" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        typeof value === 'number' ? value.toLocaleString() : value,
                        name === 'count' ? 'Nombre' : 
                        name === 'total_amount' ? 'Montant Total' :
                        name === 'payin_count' ? 'Entrées' :
                        name === 'payout_count' ? 'Sorties' :
                        name === 'completed' ? 'Terminées' :
                        name === 'failed' ? 'Échouées' : name
                      ]}
                      labelFormatter={(value) => new Date(value).toLocaleString('fr-FR')}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Area type="monotone" dataKey="count" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="completed" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="failed" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Financial Summary Section */}
        {financialSummaryData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 backdrop-blur-xl border-emerald-200 dark:border-emerald-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-emerald-600 rounded-xl shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mt-4">
                  Entrées ({financialSummaryData.period})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">
                  {financialSummaryData.payin.count}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-emerald-200 text-emerald-800 hover:bg-emerald-200 rounded-full">
                    {formatCurrency(financialSummaryData.payin.volume)}
                  </Badge>
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 rounded-full text-xs">
                    Frais: {formatCurrency(financialSummaryData.payin.fees_collected)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 backdrop-blur-xl border-red-200 dark:border-red-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-red-600 rounded-xl shadow-lg">
                    <TrendingDown className="h-6 w-6 text-white" />
                  </div>
                  <ArrowDownRight className="h-5 w-5 text-red-600 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300 mt-4">
                  Sorties ({financialSummaryData.period})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-900 dark:text-red-100 mb-2">
                  {financialSummaryData.payout.count}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-red-200 text-red-800 hover:bg-red-200 rounded-full">
                    {formatCurrency(financialSummaryData.payout.volume)}
                  </Badge>
                  <Badge className="bg-red-100 text-red-700 hover:bg-red-100 rounded-full text-xs">
                    Frais: {formatCurrency(financialSummaryData.payout.fees_collected)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 backdrop-blur-xl border-purple-200 dark:border-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-purple-600 rounded-xl shadow-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 mt-4">
                  Commissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-2">
                  {financialSummaryData.commissions.count}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-purple-200 text-purple-800 hover:bg-purple-200 rounded-full text-xs">
                    Opérateur: {formatCurrency(financialSummaryData.commissions.total_operator_fees)}
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 rounded-full text-xs">
                    Agrégateur: {formatCurrency(financialSummaryData.commissions.total_aggregator_fees)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 backdrop-blur-xl border-blue-200 dark:border-blue-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 mt-4">
                  Soldes Clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                  {formatCurrency(financialSummaryData.total_customer_balances)}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-200 text-blue-800 hover:bg-blue-200 rounded-full">
                    Total
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Operator Performance Chart */}
        {operatorPerformanceData && (
          <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
              <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-crimson-600" />
                Performance des Opérateurs ({operatorPerformanceData.period_days} jours)
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">
                Comparaison des performances par opérateur
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-6">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={operatorPerformanceData.operators}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="operator_config__operator_name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        typeof value === 'number' ? value.toLocaleString() : value,
                        name === 'total_transactions' ? 'Transactions Total' :
                        name === 'total_amount' ? 'Montant Total' :
                        name === 'completed' ? 'Terminées' :
                        name === 'failed' ? 'Échouées' :
                        name === 'success_rate' ? 'Taux de Réussite (%)' :
                        name === 'avg_amount' ? 'Montant Moyen' : name
                      ]}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar dataKey="total_transactions" fill="#3b82f6" name="Transactions Total" />
                    <Bar dataKey="completed" fill="#10b981" name="Terminées" />
                    <Bar dataKey="failed" fill="#ef4444" name="Échouées" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {operatorPerformanceData.operators.map((operator, index) => (
                  <div key={index} className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
                      {operator.operator_config__operator_name}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Transactions:</span>
                        <span className="font-medium">{operator.total_transactions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Montant:</span>
                        <span className="font-medium">{formatCurrency(operator.total_amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Taux de Réussite:</span>
                        <span className="font-medium">{operator.success_rate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Montant Moyen:</span>
                        <span className="font-medium">{formatCurrency(operator.avg_amount)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sync Status Section */}
        {syncStatusData && (
          <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
              <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                <RefreshCw className="h-5 w-5 mr-2 text-crimson-600" />
                Statut de Synchronisation
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">
                Dernière mise à jour: {new Date(syncStatusData.timestamp).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Sync Automatique</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                    Fréquence: {syncStatusData.automatic_sync.frequency}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Prochaine: {syncStatusData.automatic_sync.next_scheduled}
                  </p>
                </div>
                
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-700">
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Sync Bloquées</h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mb-1">
                    Fréquence: {syncStatusData.stuck_sync.frequency}
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Prochaine: {syncStatusData.stuck_sync.next_scheduled}
                  </p>
                </div>
                
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700">
                  <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">Transactions Bloquées</h4>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100 mb-1">
                    {syncStatusData.stuck_transactions.count}
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Échantillon disponible
                  </p>
                </div>
                
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">En Attente</h4>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mb-1">
                    {syncStatusData.pending_transactions.total}
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    &gt; 6h: {syncStatusData.pending_transactions.by_age.older_than_6h}
                  </p>
                </div>
              </div>
              
              {syncStatusData.recommendations.length > 0 && (
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Recommandations:</h4>
                  <ul className="space-y-2">
                    {syncStatusData.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className={`text-sm font-medium ${
                          rec.level === 'critical' ? 'text-red-600' :
                          rec.level === 'warning' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`}>
                          {rec.level === 'critical' ? '🚨' : rec.level === 'warning' ? '⚠️' : 'ℹ️'}
                        </span>
                        <div>
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">{rec.message}</p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300">{rec.action}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Celery Tasks Monitoring */}
        {celeryTasksData && (
          <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
              <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                <Zap className="h-5 w-5 mr-2 text-crimson-600" />
                Monitoring des Tâches Celery
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">
                Dernière mise à jour: {new Date(celeryTasksData.timestamp).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Tâches Activées</h4>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                    {celeryTasksData.total_enabled_tasks}
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Tâches Configurées</h4>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                    {celeryTasksData.tasks.length}
                  </p>
                </div>
              </div>
              
              {celeryTasksData.tasks.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">Détails des Tâches:</h4>
                  <div className="space-y-3">
                    {celeryTasksData.tasks.map((task, index) => (
                      <div key={index} className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-neutral-900 dark:text-white">{task.name}</h5>
                          <Badge className={`${
                            task.status === 'active' ? 'bg-green-100 text-green-800' :
                            task.status === 'inactive' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {task.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-neutral-600 dark:text-neutral-400">Dernière exécution:</span>
                            <span className="ml-2 font-medium">{task.last_run || 'Jamais'}</span>
                          </div>
                          <div>
                            <span className="text-neutral-600 dark:text-neutral-400">Prochaine exécution:</span>
                            <span className="ml-2 font-medium">{task.next_run || 'Non programmée'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Complete API Data Summary */}
        {false && (
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

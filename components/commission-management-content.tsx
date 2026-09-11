"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Search, Download, ChevronLeft, ChevronRight, Loader2, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"
import { smartFetch } from "@/utils/auth"

/** Évite la concaténation string des Decimal JSON ("10.00"+"0.20" → "10.000.20") */
function moneyNum(value: number | string | null | undefined): number {
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

function formatMoney(value: number | string | null | undefined, currency = "XOF"): string {
  return `${moneyNum(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}`
}

// Interfaces for commission data
interface Commission {
  uid: string
  transaction_reference: string
  customer_id: string
  operator_name: string
  operator_code?: string
  country_code?: string
  type_trans: string
  transaction_amount: number
  currency?: string
  operator_fee_rate: string
  operator_fee_amount: number
  aggregator_fee_rate: string
  aggregator_fee_amount: number
  total_fees: number
  net_amount: number
  status: string
  status_display: string
  withdrawn_at: string | null
  created_at: string
  paid_at?: string
}

interface CommissionBatch {
  id: string
  uid: string
  operator_code: string
  operator_name?: string
  country_code?: string
  country_label?: string
  currency?: string
  total_amount: number
  commission_count?: number
  commissions_count?: number
  status: string
  created_at: string
  paid_at?: string
}

interface CountryOption {
  uid: string
  code: string
  name: string
  is_active?: boolean
}

interface CurrencyBreakdown {
  currency: string
  count: number
  total: number
}

interface WithdrawalRequest {
  commission_ids: string[]
  country_code: string
  currency?: string
  payment_method: string
  notes: string
}

export function CommissionManagementContent() {
  const router = useRouter()
  
  // States for data
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [unpaidCommissions, setUnpaidCommissions] = useState<Commission[]>([])
  const [unpaidSummary, setUnpaidSummary] = useState<{
    count: number
    total_amount: number
    by_currency: CurrencyBreakdown[]
  }>({ count: 0, total_amount: 0, by_currency: [] })
  const [commissionBatches, setCommissionBatches] = useState<CommissionBatch[]>([])
  const [countries, setCountries] = useState<CountryOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // States for filters
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [countryFilter, setCountryFilter] = useState("all")
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState("commissions")
  
  // States for pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCommissions, setTotalCommissions] = useState(0)
  
  // States for withdrawal modal
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false)
  const [withdrawAllModalOpen, setWithdrawAllModalOpen] = useState(false)
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([])
  const [withdrawalRequest, setWithdrawalRequest] = useState<WithdrawalRequest>({
    commission_ids: [],
    country_code: "",
    payment_method: "mobile_money",
    notes: ""
  })
  const [withdrawalLoading, setWithdrawalLoading] = useState(false)
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  // Fetch countries (filtre admin par pays)
  const fetchCountries = async () => {
    try {
      const response = await smartFetch(`${baseUrl}/api/v2/admin/countries/`)
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`)
      }
      const data = await response.json()
      const rows = Array.isArray(data) ? data : data.results || []
      setCountries(rows.filter((c: CountryOption) => c.is_active !== false))
    } catch (err) {
      console.error("Error fetching countries:", err)
      setCountries([])
    }
  }

  const countryLabel = (code?: string) => {
    if (!code) return "—"
    const found = countries.find((c) => c.code === code)
    return found ? `${found.name} (${code})` : code
  }

  // Fetch commissions
  const fetchCommissions = async (query: string = "", page: number = 1, status: string = "", country: string = "all") => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (query) {
        params.append('search', query)
      }
      if (status && status !== "all" && status !== "") {
        params.append('status', status)
      }
      if (country && country !== "all") {
        params.append('country_code', country)
      }
      params.append('page', page.toString())
      params.append('page_size', pageSize.toString())
      
      const url = `${baseUrl}/api/v2/admin/commissions/?${params.toString()}`
      const response = await smartFetch(url)
      
      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      if (data && Array.isArray(data.results)) {
        setCommissions(data.results)
        setTotalCommissions(data.count || data.results.length)
        setTotalPages(Math.ceil((data.count || data.results.length) / pageSize))
      } else {
        setCommissions([])
        setTotalCommissions(0)
        setTotalPages(0)
      }
    } catch (err) {
      console.error("Error fetching commissions:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des commissions"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Fetch unpaid commissions
  const fetchUnpaidCommissions = async (country: string = "all") => {
    try {
      const params = new URLSearchParams()
      if (country && country !== "all") {
        params.append('country_code', country)
      }
      
      const url = `${baseUrl}/api/v2/admin/commissions/unpaid/?${params.toString()}`
      const response = await smartFetch(url)
      
      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      // Handle the new response structure with count and total_amount
      if (data && typeof data === 'object' && 'count' in data && 'total_amount' in data) {
        setUnpaidSummary({
          count: data.count || 0,
          total_amount: data.total_amount || 0,
          by_currency: Array.isArray(data.by_currency) ? data.by_currency : [],
        })
        setUnpaidCommissions(Array.isArray(data.commissions) ? data.commissions : [])
      } else if (Array.isArray(data)) {
        // Fallback for old response format
        setUnpaidCommissions(data)
        setUnpaidSummary({
          count: data.length,
          total_amount: data.reduce((sum: number, c: Commission) => sum + (c.net_amount || 0), 0),
          by_currency: [],
        })
      } else if (data && Array.isArray(data.results)) {
        const results = data.results as Commission[]
        setUnpaidCommissions(results)
        setUnpaidSummary({
          count: results.length,
          total_amount: results.reduce((sum: number, c: Commission) => sum + (c.net_amount || 0), 0),
          by_currency: [],
        })
      } else {
        setUnpaidCommissions([])
        setUnpaidSummary({ count: 0, total_amount: 0, by_currency: [] })
      }
    } catch (err) {
      console.error("Error fetching unpaid commissions:", err)
      setUnpaidCommissions([])
      setUnpaidSummary({ count: 0, total_amount: 0, by_currency: [] })
    }
  }

  // Fetch commission batches
  const fetchCommissionBatches = async () => {
    try {
      const response = await smartFetch(`${baseUrl}/api/v2/admin/commission-batches/`)
      
      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setCommissionBatches(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      console.error("Error fetching commission batches:", err)
    }
  }

  // Create withdrawal commission
  const createWithdrawalCommission = async () => {
    try {
      setWithdrawalLoading(true)
      
      const response = await smartFetch(`${baseUrl}/api/v2/admin/commissions/withdraw/`, {
        method: "POST",
        body: JSON.stringify({
          commission_ids: withdrawalRequest.commission_ids,
          country_code: withdrawalRequest.country_code || null,
          payment_method: withdrawalRequest.payment_method,
          notes: withdrawalRequest.notes,
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
        throw new Error(errorMessage)
      }

      const result = await response.json()
      setWithdrawalModalOpen(false)
      setSelectedCommissions([])
      setWithdrawalRequest({
        commission_ids: [],
        country_code: "",
        payment_method: "mobile_money",
        notes: ""
      })
      
      // Refresh data
      setRefreshKey(prev => prev + 1)
      await fetchUnpaidCommissions(countryFilter)
      await fetchCommissionBatches()
      
    } catch (err) {
      console.error("Error creating withdrawal commission:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création du retrait"
      setError(errorMessage)
    } finally {
      setWithdrawalLoading(false)
    }
  }

  // Export commissions CSV
  const handleExportCSV = async () => {
    try {
      let url = `${baseUrl}/api/v2/admin/reports/export-commissions/`
      const params = new URLSearchParams()
      
      if (searchTerm) {
        params.append('search', searchTerm)
      }
      if (statusFilter && statusFilter !== "all" && statusFilter !== "") {
        params.append('status', statusFilter)
      }
      if (countryFilter && countryFilter !== "all") {
        params.append('country_code', countryFilter)
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const res = await smartFetch(url)
      if (res.ok) {
        const blob = await res.blob()
        const url_blob = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url_blob
        a.download = `commissions-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url_blob)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Erreur lors de l\'export CSV des commissions:', error)
    }
  }

  // Load countries on component mount
  useEffect(() => {
    fetchCountries()
  }, [])

  // Load data on component mount and when filters change
  useEffect(() => {
    const filterValue = statusFilter === "all" ? "" : statusFilter
    fetchCommissions(searchTerm, currentPage, filterValue, countryFilter)
  }, [currentPage, searchTerm, statusFilter, countryFilter, refreshKey])

  // Load unpaid commissions and batches on mount and when country filter changes
  useEffect(() => {
    fetchUnpaidCommissions(countryFilter)
    fetchCommissionBatches()
  }, [countryFilter])

  // Pagination functions
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Handle commission selection for withdrawal
  const handleCommissionSelect = (commissionId: string, checked: boolean, status: string) => {
    // Only allow selection of confirmed commissions
    if (status !== "confirmed") {
      return
    }
    
    if (checked) {
      setSelectedCommissions(prev => [...prev, commissionId])
    } else {
      setSelectedCommissions(prev => prev.filter(id => id !== commissionId))
    }
  }

  // Open withdrawal modal
  const openWithdrawalModal = () => {
    if (selectedCommissions.length === 0) {
      setError("Veuillez sélectionner au moins une commission")
      return
    }
    
    const selectedCommissionsData = commissions.filter(c => selectedCommissions.includes(c.uid))
    const countryCode = selectedCommissionsData[0]?.country_code || ""
    
    setWithdrawalRequest({
      commission_ids: selectedCommissions,
      country_code: countryCode,
      payment_method: "mobile_money",
      notes: ""
    })
    setWithdrawalModalOpen(true)
  }

  // Open withdraw all unpaid commissions modal (optionnellement une devise)
  const openWithdrawAllModal = (currency?: string) => {
    if (unpaidSummary.count === 0) {
      setError("Aucune commission impayée disponible")
      return
    }
    
    setWithdrawalRequest({
      commission_ids: [],
      country_code: countryFilter !== "all" ? countryFilter : "",
      currency: currency || "",
      payment_method: "mobile_money",
      notes: ""
    })
    setWithdrawAllModalOpen(true)
  }

  // Create withdrawal for all unpaid commissions
  const createWithdrawAllCommission = async () => {
    try {
      setWithdrawalLoading(true)
      
      const response = await smartFetch(`${baseUrl}/api/v2/admin/commissions/withdraw/`, {
        method: "POST",
        body: JSON.stringify({
          country_code: withdrawalRequest.country_code || null,
          currency: withdrawalRequest.currency || null,
          payment_method: withdrawalRequest.payment_method,
          notes: withdrawalRequest.notes
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
        throw new Error(errorMessage)
      }

      const result = await response.json()
      setWithdrawAllModalOpen(false)
      setWithdrawalRequest({
        commission_ids: [],
        country_code: "",
        currency: "",
        payment_method: "mobile_money",
        notes: ""
      })
      
      // Refresh data
      setRefreshKey(prev => prev + 1)
      await fetchUnpaidCommissions(countryFilter)
      await fetchCommissionBatches()
      
    } catch (err) {
      console.error("Error creating withdraw all commission:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création du retrait"
      setError(errorMessage)
    } finally {
      setWithdrawalLoading(false)
    }
  }

  const unpaidByCurrency = unpaidSummary.by_currency?.length
    ? unpaidSummary.by_currency
    : unpaidSummary.count > 0
      ? [{ currency: "XOF", total: unpaidSummary.total_amount, count: unpaidSummary.count }]
      : []

  // Pagination component
  const PaginationComponent = () => {
    if (totalPages <= 1) return null

    const getPageNumbers = () => {
      const pages = []
      const maxVisiblePages = 5
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      return pages
    }

    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <span>
            Affichage de {((currentPage - 1) * pageSize) + 1} à {Math.min(currentPage * pageSize, totalCommissions)} sur {totalCommissions} commissions
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {getPageNumbers().map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
              className="h-8 w-8 p-0"
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string | undefined) => {
    if (!status) {
      return <Badge className="bg-gray-100 text-gray-800">N/A</Badge>
    }
    
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmé</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">En Attente</Badge>
      case "paid":
        return <Badge className="bg-blue-100 text-blue-800">Payé</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Annulé</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Gestion des Commissions</h1>
            <p className="text-muted-foreground">Gérez les commissions et les retraits</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
          <Button 
            onClick={openWithdrawalModal}
            disabled={selectedCommissions.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Créer Retrait ({selectedCommissions.length})
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
            </div>
            <div className="flex-1">
              <p className="text-red-800 dark:text-red-200 font-medium">Erreur</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1 break-words">{error}</p>
            </div>
            <div className="flex-shrink-0">
              <Button 
                onClick={() => setError(null)} 
                size="sm"
                variant="outline"
                className="border-red-200 text-red-800 hover:bg-red-100"
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Commissions disponibles par devise */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-red-600" />
                Commissions disponibles
              </CardTitle>
              <CardDescription>
                Somme à retirer par devise — {unpaidSummary.count} commission(s) confirmée(s)
              </CardDescription>
            </div>
            {unpaidSummary.count > 0 && (
              <Button
                size="sm"
                onClick={() => openWithdrawAllModal()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <DollarSign className="h-3 w-3 mr-1" />
                Retirer tout
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {unpaidByCurrency.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune commission disponible.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b">
                    <th className="py-2 pr-4 font-medium">Devise</th>
                    <th className="py-2 pr-4 font-medium text-right">Disponible</th>
                    <th className="py-2 pr-4 font-medium text-right">Nombre</th>
                    <th className="py-2 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {unpaidByCurrency.map((row) => (
                    <tr key={row.currency} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-semibold">{row.currency}</td>
                      <td className="py-3 pr-4 text-right text-lg font-bold text-red-600">
                        {formatMoney(row.total, row.currency)}
                      </td>
                      <td className="py-3 pr-4 text-right">{row.count}</td>
                      <td className="py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openWithdrawAllModal(row.currency)}
                          disabled={moneyNum(row.total) <= 0}
                        >
                          Retirer {row.currency}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-3 pr-4 font-medium text-muted-foreground">Total</td>
                    <td className="py-3 pr-4 text-right text-muted-foreground text-xs">
                      (par devise ci-dessus — pas de somme multi-devises)
                    </td>
                    <td className="py-3 pr-4 text-right font-semibold">{unpaidSummary.count}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="batches">Liste des retraits</TabsTrigger>
        </TabsList>

        {/* Commissions Tab */}
        <TabsContent value="commissions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtres</CardTitle>
              <CardDescription>Filtrez les commissions selon vos critères</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par ID de transaction ou opérateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="confirmed">Confirmé</SelectItem>
                    <SelectItem value="pending">En Attente</SelectItem>
                    <SelectItem value="paid">Payé</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Choisissez le pays" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les pays</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country.uid || country.code} value={country.code}>
                        {country.name} ({country.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Commissions Table */}
          <Card>
        <CardHeader>
          <CardTitle>Commissions</CardTitle>
          <CardDescription>Liste des commissions avec possibilité de sélection pour retrait</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-neutral-600 dark:text-neutral-400">Chargement des commissions...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center max-w-md">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-4">
                  <p className="text-red-800 dark:text-red-200 font-medium mb-2">⚠️ Erreur lors du chargement</p>
                  <p className="text-sm text-red-700 dark:text-red-300 break-words">{error}</p>
                </div>
                <Button 
                  onClick={() => setRefreshKey(prev => prev + 1)} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  🔄 Réessayer
                </Button>
              </div>
            </div>
          ) : commissions.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <DollarSign className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600 dark:text-neutral-400">Aucune commission trouvée</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {commissions.map((commission) => {
                const isConfirmed = commission.status === "confirmed"
                const isSelected = selectedCommissions.includes(commission.uid)
                
                return (
                <div 
                  key={commission.uid || Math.random()} 
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={isSelected}
                      disabled={!isConfirmed}
                      onCheckedChange={(checked) => handleCommissionSelect(commission.uid, checked as boolean, commission.status)}
                    />
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">
                        Commission {commission.uid?.slice(0, 8) || 'N/A'}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Transaction: {commission.transaction_reference || 'N/A'}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {countryLabel(commission.country_code)}
                        </Badge>
                        {getStatusBadge(commission.status)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">
                      {formatMoney(commission.net_amount, commission.currency || 'XOF')}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Opérateur: {formatMoney(commission.operator_fee_amount, commission.currency || 'XOF')} ({commission.operator_fee_rate}%)
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Agrégateur: {formatMoney(commission.aggregator_fee_amount, commission.currency || 'XOF')} ({commission.aggregator_fee_rate}%)
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Total: {formatMoney(commission.total_fees, commission.currency || 'XOF')}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {commission.created_at ? new Date(commission.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                )
              })}
            </div>
          )}
          <PaginationComponent />
        </CardContent>
      </Card>
        </TabsContent>

        {/* Commission Batches Tab */}
        <TabsContent value="batches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Liste des retraits</CardTitle>
              <CardDescription>Historique de mes retraits de commission</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-neutral-600 dark:text-neutral-400">Chargement des lots...</span>
                </div>
              ) : commissionBatches.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <DollarSign className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-600 dark:text-neutral-400">Aucun lot de commission trouvé</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {commissionBatches.map((batch) => (
                    <div 
                      key={batch.uid || batch.id} 
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <p className="font-semibold text-neutral-900 dark:text-white">
                            Lot {batch.uid?.slice(0, 8) || batch.id?.slice(0, 8) || 'N/A'}
                          </p>
                          {getStatusBadge(batch.status)}
                          <Badge variant="outline" className="text-xs">
                            {batch.country_label || countryLabel(batch.country_code)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">Nombre de commissions</p>
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">{batch.commission_count}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">Montant total</p>
                            <p className="text-sm font-medium text-green-600">{formatMoney(batch.total_amount, batch.currency || 'XOF')}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">Créé le</p>
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                              {batch.created_at ? new Date(batch.created_at).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'N/A'}
                            </p>
                          </div>
                          {batch.paid_at && (
                            <div>
                              <p className="text-xs text-neutral-600 dark:text-neutral-400">Payé le</p>
                              <p className="text-sm font-medium text-green-600">
                                {new Date(batch.paid_at).toLocaleDateString('fr-FR', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Withdrawal Modal */}
      <Dialog open={withdrawalModalOpen} onOpenChange={setWithdrawalModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-white flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Créer un Retrait de Commission
            </DialogTitle>
            <DialogDescription className="text-neutral-600 dark:text-neutral-400">
              Créer un retrait pour {selectedCommissions.length} commission(s) sélectionnée(s)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl">
              <p className="font-medium text-neutral-900 dark:text-white">
                Pays: {countryLabel(withdrawalRequest.country_code)}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Commissions sélectionnées: {selectedCommissions.length}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                Méthode de Paiement
              </label>
              <Select 
                value={withdrawalRequest.payment_method} 
                onValueChange={(value) => setWithdrawalRequest(prev => ({ ...prev, payment_method: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une méthode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="bank_transfer">Virement Bancaire</SelectItem>
                  <SelectItem value="cash">Espèces</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                Notes (optionnel)
              </label>
              <Input
                placeholder="Ajouter des notes..."
                value={withdrawalRequest.notes}
                onChange={(e) => setWithdrawalRequest(prev => ({ ...prev, notes: e.target.value }))}
                className="rounded-xl border-slate-200 dark:border-neutral-700"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setWithdrawalModalOpen(false)}
              className="rounded-xl"
            >
              Annuler
            </Button>
            <Button
              onClick={createWithdrawalCommission}
              disabled={withdrawalLoading}
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
            >
              {withdrawalLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Créer le Retrait
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw All Unpaid Commissions Modal */}
      <Dialog open={withdrawAllModalOpen} onOpenChange={setWithdrawAllModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-white flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Retirer Toutes les Commissions Impayées
            </DialogTitle>
            <DialogDescription className="text-neutral-600 dark:text-neutral-400">
              Créer un retrait pour toutes les commissions impayées
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Nombre de commissions</p>
                  <p className="font-medium text-neutral-900 dark:text-white text-lg">{unpaidSummary.count}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Montant total</p>
                  <div className="space-y-1">
                    {(unpaidSummary.by_currency?.length
                      ? unpaidSummary.by_currency.filter((row) =>
                          !withdrawalRequest.currency || row.currency === withdrawalRequest.currency
                        )
                      : [{ currency: "XOF", total: unpaidSummary.total_amount, count: unpaidSummary.count }]
                    ).map((row) => (
                      <p key={row.currency} className="font-medium text-green-600 text-lg">
                        {formatMoney(row.total, row.currency)}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              {withdrawalRequest.currency && (
                <div className="mt-3">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Devise</p>
                  <p className="font-medium text-neutral-900 dark:text-white">{withdrawalRequest.currency}</p>
                </div>
              )}
              {countryFilter !== "all" && (
                <div className="mt-3">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Pays</p>
                  <p className="font-medium text-neutral-900 dark:text-white">{countryLabel(countryFilter)}</p>
                </div>
              )}
            </div>

            {countryFilter === "all" && (
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                  Pays (optionnel)
                </label>
                <Select 
                  value={withdrawalRequest.country_code || "all"} 
                  onValueChange={(value) => setWithdrawalRequest(prev => ({ ...prev, country_code: value === "all" ? "" : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les pays" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les pays</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country.uid || country.code} value={country.code}>
                        {country.name} ({country.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                Méthode de Paiement
              </label>
              <Select 
                value={withdrawalRequest.payment_method} 
                onValueChange={(value) => setWithdrawalRequest(prev => ({ ...prev, payment_method: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une méthode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="bank_transfer">Virement Bancaire</SelectItem>
                  <SelectItem value="cash">Espèces</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                Notes (optionnel)
              </label>
              <Input
                placeholder="Ajouter des notes..."
                value={withdrawalRequest.notes}
                onChange={(e) => setWithdrawalRequest(prev => ({ ...prev, notes: e.target.value }))}
                className="rounded-xl border-slate-200 dark:border-neutral-700"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setWithdrawAllModalOpen(false)}
              className="rounded-xl"
            >
              Annuler
            </Button>
            <Button
              onClick={createWithdrawAllCommission}
              disabled={withdrawalLoading}
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
            >
              {withdrawalLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Retirer Tout
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

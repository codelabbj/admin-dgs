"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Search, Download, ChevronLeft, ChevronRight, Loader2, DollarSign, Users, TrendingUp, CalendarDays } from "lucide-react"
import { useRouter } from "next/navigation"
import { smartFetch } from "@/utils/auth"

// Interfaces for commission data
interface Commission {
  uid: string
  transaction_reference: string
  customer_id: string
  operator_name: string
  operator_code?: string
  type_trans: string
  transaction_amount: number
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
  operator_name: string
  total_amount: number
  commission_count: number
  status: string
  created_at: string
  paid_at?: string
}

interface WithdrawalRequest {
  commission_ids: string[]
  operator_code: string
  payment_method: string
  notes: string
}

export function CommissionManagementContent() {
  const router = useRouter()
  
  // States for data
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [unpaidCommissions, setUnpaidCommissions] = useState<Commission[]>([])
  const [unpaidSummary, setUnpaidSummary] = useState({ count: 0, total_amount: 0 })
  const [commissionBatches, setCommissionBatches] = useState<CommissionBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // States for filters
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [operatorFilter, setOperatorFilter] = useState("all")
  const [refreshKey, setRefreshKey] = useState(0)
  
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
    operator_code: "",
    payment_method: "mobile_money",
    notes: ""
  })
  const [withdrawalLoading, setWithdrawalLoading] = useState(false)
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  // Fetch commissions
  const fetchCommissions = async (query: string = "", page: number = 1, status: string = "", operator: string = "all") => {
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
      if (operator && operator !== "all") {
        params.append('operator_code', operator)
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
  const fetchUnpaidCommissions = async (operator: string = "all") => {
    try {
      const params = new URLSearchParams()
      if (operator && operator !== "all") {
        params.append('operator_code', operator)
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
          total_amount: data.total_amount || 0
        })
        setUnpaidCommissions(Array.isArray(data.commissions) ? data.commissions : [])
      } else if (Array.isArray(data)) {
        // Fallback for old response format
        setUnpaidCommissions(data)
        setUnpaidSummary({
          count: data.length,
          total_amount: data.reduce((sum: number, c: Commission) => sum + (c.net_amount || 0), 0)
        })
      } else if (data && Array.isArray(data.results)) {
        const results = data.results as Commission[]
        setUnpaidCommissions(results)
        setUnpaidSummary({
          count: results.length,
          total_amount: results.reduce((sum: number, c: Commission) => sum + (c.net_amount || 0), 0)
        })
      } else {
        setUnpaidCommissions([])
        setUnpaidSummary({ count: 0, total_amount: 0 })
      }
    } catch (err) {
      console.error("Error fetching unpaid commissions:", err)
      setUnpaidCommissions([])
      setUnpaidSummary({ count: 0, total_amount: 0 })
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
        body: JSON.stringify(withdrawalRequest)
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
        operator_code: "",
        payment_method: "mobile_money",
        notes: ""
      })
      
      // Refresh data
      setRefreshKey(prev => prev + 1)
      await fetchUnpaidCommissions(operatorFilter)
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
      if (operatorFilter && operatorFilter !== "all") {
        params.append('operator_code', operatorFilter)
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

  // Load data on component mount and when filters change
  useEffect(() => {
    const filterValue = statusFilter === "all" ? "" : statusFilter
    fetchCommissions(searchTerm, currentPage, filterValue, operatorFilter)
  }, [currentPage, searchTerm, statusFilter, operatorFilter, refreshKey])

  // Load unpaid commissions and batches on mount and when operator filter changes
  useEffect(() => {
    fetchUnpaidCommissions(operatorFilter)
    fetchCommissionBatches()
  }, [operatorFilter])

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
  const handleCommissionSelect = (commissionId: string, checked: boolean) => {
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
    const operatorCode = selectedCommissionsData[0]?.operator_code || selectedCommissionsData[0]?.operator_name || ""
    
    setWithdrawalRequest({
      commission_ids: selectedCommissions,
      operator_code: operatorCode,
      payment_method: "mobile_money",
      notes: ""
    })
    setWithdrawalModalOpen(true)
  }

  // Open withdraw all unpaid commissions modal
  const openWithdrawAllModal = () => {
    if (unpaidSummary.count === 0 || unpaidSummary.total_amount === 0) {
      setError("Aucune commission impayée disponible")
      return
    }
    
    setWithdrawalRequest({
      commission_ids: [], // Empty array means withdraw all
      operator_code: operatorFilter !== "all" ? operatorFilter : "",
      payment_method: "mobile_money",
      notes: ""
    })
    setWithdrawAllModalOpen(true)
  }

  // Create withdrawal for all unpaid commissions
  const createWithdrawAllCommission = async () => {
    try {
      setWithdrawalLoading(true)
      
      const response = await smartFetch(`${baseUrl}/api/v2/admin/commissions/withdraw-all/`, {
        method: "POST",
        body: JSON.stringify({
          operator_code: withdrawalRequest.operator_code || null,
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
        operator_code: "",
        payment_method: "mobile_money",
        notes: ""
      })
      
      // Refresh data
      setRefreshKey(prev => prev + 1)
      await fetchUnpaidCommissions(operatorFilter)
      await fetchCommissionBatches()
      
    } catch (err) {
      console.error("Error creating withdraw all commission:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création du retrait"
      setError(errorMessage)
    } finally {
      setWithdrawalLoading(false)
    }
  }

  // Calculate stats
  const calculateStats = () => {
    const totalCommissionsAmount = commissions.reduce((sum, c) => sum + c.net_amount, 0)
    const totalOperatorFees = commissions.reduce((sum, c) => sum + c.operator_fee_amount, 0)
    const totalAggregatorFees = commissions.reduce((sum, c) => sum + c.aggregator_fee_amount, 0)
    
    return {
      totalCommissionsAmount,
      totalOperatorFees,
      totalAggregatorFees,
      unpaidAmount: unpaidSummary.total_amount,
      totalCommissions: commissions.length,
      unpaidCount: unpaidSummary.count
    }
  }

  const stats = calculateStats()

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
    <div className="p-6 space-y-6">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Total Commissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCommissionsAmount.toLocaleString()} FCFA</div>
            <p className="text-xs text-muted-foreground">{stats.totalCommissions} commissions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Frais Opérateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalOperatorFees.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Frais Agrégateur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalAggregatorFees.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CalendarDays className="h-4 w-4 mr-2" />
              Commissions Impayées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unpaidSummary.total_amount.toLocaleString()} FCFA</div>
            <p className="text-xs text-muted-foreground">{unpaidSummary.count} commissions</p>
            {unpaidSummary.count > 0 && (
              <Button
                size="sm"
                onClick={openWithdrawAllModal}
                className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <DollarSign className="h-3 w-3 mr-1" />
                Retirer Tout
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

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
            
            <Select value={operatorFilter} onValueChange={setOperatorFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Tous les opérateurs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="wave">Wave</SelectItem>
                <SelectItem value="orange">Orange Money</SelectItem>
                <SelectItem value="mtn">MTN Mobile Money</SelectItem>
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
              {commissions.map((commission) => (
                <div key={commission.uid || Math.random()} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={selectedCommissions.includes(commission.uid)}
                      onCheckedChange={(checked) => handleCommissionSelect(commission.uid, checked as boolean)}
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
                          {commission.operator_name || 'N/A'}
                        </Badge>
                        {getStatusBadge(commission.status)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">
                      {commission.net_amount?.toLocaleString() || '0'} FCFA
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Opérateur: {commission.operator_fee_amount?.toLocaleString() || '0'} FCFA ({commission.operator_fee_rate}%)
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Agrégateur: {commission.aggregator_fee_amount?.toLocaleString() || '0'} FCFA ({commission.aggregator_fee_rate}%)
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Total: {commission.total_fees?.toLocaleString() || '0'} FCFA
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {commission.created_at ? new Date(commission.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <PaginationComponent />
        </CardContent>
      </Card>

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
                Opérateur: {withdrawalRequest.operator_code}
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
                  <p className="font-medium text-green-600 text-lg">{unpaidSummary.total_amount.toLocaleString()} FCFA</p>
                </div>
              </div>
              {operatorFilter !== "all" && (
                <div className="mt-3">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Opérateur</p>
                  <p className="font-medium text-neutral-900 dark:text-white">{operatorFilter}</p>
                </div>
              )}
            </div>

            {operatorFilter === "all" && (
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                  Opérateur (optionnel)
                </label>
                <Select 
                  value={withdrawalRequest.operator_code || "all"} 
                  onValueChange={(value) => setWithdrawalRequest(prev => ({ ...prev, operator_code: value === "all" ? "" : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les opérateurs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les opérateurs</SelectItem>
                    <SelectItem value="wave">Wave</SelectItem>
                    <SelectItem value="orange">Orange Money</SelectItem>
                    <SelectItem value="mtn">MTN Mobile Money</SelectItem>
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
                  Retirer Tout ({unpaidSummary.total_amount.toLocaleString()} FCFA)
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, CreditCard, Eye, Calendar, DollarSign, Loader2, Filter, Search, RefreshCw } from "lucide-react"
import { smartFetch } from "@/utils/auth"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

// Interface pour les transactions
interface Transaction {
  uid: string
  customer_id: string
  amount: number
  type: string
  status: string
  created_at: string
  updated_at: string
  reference?: string
  description?: string
  fees?: number
  balance_before?: number
  balance_after?: number
}

// Interface pour les détails de transaction
interface Commission {
  uid: string
  transaction_reference: string
  customer_id: string
  operator_name: string
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
}

interface WebhookLog {
  uid: string
  transaction_reference: string
  operator_code: string
  webhook_type: string
  webhook_type_display: string
  processing_status: string
  processing_status_display: string
  http_status_code: number | null
  signature_valid: boolean | null
  processing_error: string
  received_at: string
  processed_at: string | null
}

interface TransactionDetails extends Transaction {
  reference?: string
  type_trans?: string
  type_trans_display?: string
  phone?: string
  status_display?: string
  operator_name?: string
  external_id?: string
  commission_amount?: number
  commission_paid?: boolean
  customer_balance_before?: number
  customer_balance_after?: number
  refund_requested?: boolean
  refund_approved_by_admin_id?: string | null
  callback_sent?: boolean
  callback_retry_count?: number
  webhook_count?: number
  error_message?: string
  has_commission?: boolean
  completed_at?: string
  commission?: Commission
  webhook_logs?: WebhookLog[]
}

export default function Transactions({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const customerId = params.id
  
  // États pour la gestion des données
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  
  // États pour les filtres
  const [typeFilter, setTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  
  // États pour les modals
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [bulkSyncLoading, setBulkSyncLoading] = useState(false)
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalTransactions, setTotalTransactions] = useState(0)

  // Fonction pour récupérer les transactions
  const fetchTransactions = async (page: number = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const params = new URLSearchParams()
      params.append('customer_id', customerId)
      if (typeFilter) {
        params.append('type', typeFilter)
      }
      if (statusFilter) {
        params.append('status', statusFilter)
      }
      if (dateFrom) {
        params.append('date_from', dateFrom)
      }
      if (dateTo) {
        params.append('date_to', dateTo)
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }
      params.append('page', page.toString())
      params.append('page_size', pageSize.toString())
      
      const url = `${baseUrl}/api/v2/admin/transactions/?${params.toString()}`
      const response = await smartFetch(url)
      
      if (!response.ok) {
        try {
          const errorData = await response.json()
          const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
          throw new Error(errorMessage)
        } catch (parseError) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`)
        }
      }

      const data = await response.json()
      
      if (data && Array.isArray(data.results)) {
        setTransactions(data.results)
        setTotalTransactions(data.count || data.results.length)
        setTotalPages(Math.ceil((data.count || data.results.length) / pageSize))
      } else {
        setTransactions([])
        setTotalTransactions(0)
        setTotalPages(0)
      }
    } catch (err) {
      console.error("Error fetching transactions:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des transactions"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour récupérer les détails d'une transaction
  const fetchTransactionDetails = async (transactionUid: string) => {
    try {
      setDetailsLoading(true)
      setError(null)
      
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      // Récupérer les détails de la transaction
      const transactionResponse = await smartFetch(`${baseUrl}/api/v2/admin/transactions/${transactionUid}/`)
      
      if (!transactionResponse.ok) {
        throw new Error(`Erreur ${transactionResponse.status}`)
      }

      const transactionData = await transactionResponse.json()

      // Récupérer les logs de webhook si ils ne sont pas déjà inclus
      let webhookLogs = transactionData.webhook_logs || []
      if (!webhookLogs || webhookLogs.length === 0) {
        try {
          const webhookResponse = await smartFetch(`${baseUrl}/api/v2/admin/transactions/${transactionUid}/webhook-logs/`)
          if (webhookResponse.ok) {
            const webhookData = await webhookResponse.json()
            // La réponse est un tableau directement
            webhookLogs = Array.isArray(webhookData) ? webhookData : (webhookData.results || [])
          }
        } catch (webhookError) {
          console.warn("Error fetching webhook logs:", webhookError)
          // Ne pas bloquer l'affichage si les webhook logs échouent
        }
      }

      setSelectedTransaction({
        ...transactionData,
        webhook_logs: webhookLogs
      })
      
    } catch (err) {
      console.error("Error fetching transaction details:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des détails"
      setError(errorMessage)
    } finally {
      setDetailsLoading(false)
    }
  }

  // Fonction pour ouvrir le modal des détails
  const openDetailsModal = async (transaction: Transaction) => {
    await fetchTransactionDetails(transaction.uid)
    setIsDetailsModalOpen(true)
  }

  // Fonction pour appeler l'API bulk-sync
  const handleBulkSync = async () => {
    try {
      setBulkSyncLoading(true)
      
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const response = await smartFetch(`${baseUrl}/admin/transactions/bulk-sync/`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      toast({
        title: "Synchronisation réussie",
        description: data.message || "Les transactions ont été synchronisées avec succès.",
        variant: "default",
      })

      // Rafraîchir les détails de la transaction si elle est ouverte
      if (selectedTransaction) {
        await fetchTransactionDetails(selectedTransaction.uid)
      }
      
    } catch (err) {
      console.error("Error in bulk sync:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la synchronisation"
      toast({
        title: "Erreur de synchronisation",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setBulkSyncLoading(false)
    }
  }

  // Fonction pour gérer la recherche
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
    // Debounce search
    setTimeout(() => {
      fetchTransactions(1)
    }, 300)
  }

  // Fonction pour appliquer les filtres
  const applyFilters = () => {
    setCurrentPage(1)
    fetchTransactions(1)
  }

  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setTypeFilter("")
    setStatusFilter("")
    setDateFrom("")
    setDateTo("")
    setSearchQuery("")
    setCurrentPage(1)
    fetchTransactions(1)
  }

  // Charger les transactions au montage
  useEffect(() => {
    fetchTransactions(1)
  }, [customerId])

  // Charger les transactions quand la page change
  useEffect(() => {
    fetchTransactions(currentPage)
  }, [currentPage])

  // Composant de pagination
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
            Affichage de {((currentPage - 1) * pageSize) + 1} à {Math.min(currentPage * pageSize, totalTransactions)} sur {totalTransactions} transactions
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            ←
          </Button>
          
          {getPageNumbers().map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className="h-8 w-8 p-0"
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            →
          </Button>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
                Transactions
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                Client: {customerId.slice(0, 8)}
              </p>
            </div>
          </div>
        </div>

        {/* Affichage des erreurs */}
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
                  onClick={() => fetchTransactions(currentPage)} 
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Réessayer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Filtres */}
        <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                  Recherche
                </label>
                <Input
                  placeholder="ID, référence..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="rounded-xl border-slate-200 dark:border-neutral-700"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                  Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full p-2 border border-slate-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900"
                >
                  <option value="">Tous les types</option>
                  <option value="payin">Payin</option>
                  <option value="payout">Payout</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                  Statut
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border border-slate-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900"
                >
                  <option value="">Tous les statuts</option>
                  <option value="pending">En Attente</option>
                  <option value="completed">Terminé</option>
                  <option value="failed">Échoué</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
              
              <div className="flex items-end space-x-2">
                <Button
                  onClick={applyFilters}
                  className="bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer
                </Button>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="rounded-xl"
                >
                  Reset
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                  Date de début
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="rounded-xl border-slate-200 dark:border-neutral-700"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                  Date de fin
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="rounded-xl border-slate-200 dark:border-neutral-700"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des transactions */}
        <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
          <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
            <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-crimson-600" />
              Transactions
            </CardTitle>
            <CardDescription className="text-neutral-600 dark:text-neutral-400">
              {totalTransactions} transaction(s) trouvée(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-crimson-600" />
                <span className="ml-2 text-neutral-600 dark:text-neutral-400">Chargement des transactions...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center max-w-md">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-4">
                    <p className="text-red-800 dark:text-red-200 font-medium mb-2">⚠️ Erreur lors du chargement</p>
                    <p className="text-sm text-red-700 dark:text-red-300 break-words">{error}</p>
                  </div>
                  <Button 
                    onClick={() => fetchTransactions(currentPage)} 
                    className="bg-crimson-600 hover:bg-crimson-700 text-white"
                  >
                    🔄 Réessayer
                  </Button>
                </div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <CreditCard className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-400">Aucune transaction trouvée</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.uid} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-slate-200 dark:bg-neutral-700 rounded-xl">
                        <CreditCard className="h-6 w-6 text-crimson-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">
                          Transaction #{transaction.uid.slice(0, 8)}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {transaction.reference && `Réf: ${transaction.reference}`}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={
                            transaction.type === 'payin' ? 'bg-green-100 text-green-800' :
                            transaction.type === 'payout' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {transaction.type === 'payin' ? 'Payin' :
                             transaction.type === 'payout' ? 'Payout' : transaction.type}
                          </Badge>
                          <Badge className={
                            transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                            transaction.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {transaction.status === 'completed' ? 'Terminé' :
                             transaction.status === 'pending' ? 'En Attente' :
                             transaction.status === 'failed' ? 'Échoué' :
                             transaction.status === 'cancelled' ? 'Annulé' : transaction.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="text-right mr-4">
                        <p className="text-lg font-bold text-neutral-900 dark:text-white">
                          {transaction.amount.toLocaleString()} FCFA
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-neutral-500 dark:text-neutral-400">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
                        </div>
                        {transaction.fees && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Frais: {transaction.fees.toLocaleString()} FCFA
                          </p>
                        )}
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => openDetailsModal(transaction)}
                        disabled={detailsLoading}
                      >
                        <Eye className="h-3 w-3" />
                        Détails
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <PaginationComponent />
          </CardContent>
        </Card>

        {/* Modal des détails */}
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh]">
            <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-white flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-crimson-600" />
                  Détails de la Transaction
                </DialogTitle>
                <DialogDescription className="text-neutral-600 dark:text-neutral-400">
                  Informations complètes sur cette transaction
                </DialogDescription>
              </div>
              <Button
                onClick={handleBulkSync}
                disabled={bulkSyncLoading}
                className="bg-black hover:bg-gray-800 text-white shrink-0"
                size="sm"
              >
                {bulkSyncLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Synchronisation...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Synchroniser
                  </>
                )}
              </Button>
            </DialogHeader>
            
            {detailsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-crimson-600" />
                <span className="ml-2 text-neutral-600 dark:text-neutral-400">Chargement des détails...</span>
              </div>
            ) : selectedTransaction ? (
              <div className="space-y-6 max-h-[80vh] overflow-y-auto">
                {/* Informations générales */}
                <div>
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-crimson-600" />
                    Informations Générales
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">UID</label>
                      <p className="text-neutral-900 dark:text-white font-mono text-sm break-all">{selectedTransaction.uid}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Référence</label>
                      <p className="text-neutral-900 dark:text-white font-mono text-sm">{selectedTransaction.reference || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Client ID</label>
                      <p className="text-neutral-900 dark:text-white font-mono text-sm break-all">{selectedTransaction.customer_id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Téléphone</label>
                      <p className="text-neutral-900 dark:text-white text-sm">{selectedTransaction.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Type de Transaction</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={
                          (selectedTransaction.type_trans || selectedTransaction.type) === 'payin' ? 'bg-green-100 text-green-800' :
                          (selectedTransaction.type_trans || selectedTransaction.type) === 'payout' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {selectedTransaction.type_trans_display || selectedTransaction.type || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Statut</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={
                          (selectedTransaction.status === 'success' || selectedTransaction.status === 'completed') ? 'bg-green-100 text-green-800' :
                          selectedTransaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          (selectedTransaction.status === 'failed' || selectedTransaction.status === 'error') ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {selectedTransaction.status_display || selectedTransaction.status || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Opérateur</label>
                      <p className="text-neutral-900 dark:text-white text-sm">{selectedTransaction.operator_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">External ID</label>
                      <p className="text-neutral-900 dark:text-white font-mono text-sm">{selectedTransaction.external_id || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Date de création</label>
                      <p className="text-neutral-900 dark:text-white text-sm">
                        {new Date(selectedTransaction.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    {selectedTransaction.completed_at && (
                      <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Date de complétion</label>
                        <p className="text-neutral-900 dark:text-white text-sm">
                          {new Date(selectedTransaction.completed_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    )}
                    {selectedTransaction.error_message && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Message d'erreur</label>
                        <p className="text-red-600 dark:text-red-400 text-sm">{selectedTransaction.error_message}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Informations financières */}
                <div>
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-crimson-600" />
                    Informations Financières
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Montant</label>
                      <p className="text-neutral-900 dark:text-white text-xl font-bold">{selectedTransaction.amount.toLocaleString()} FCFA</p>
                    </div>
                    {selectedTransaction.customer_balance_before !== undefined && (
                      <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Solde avant</label>
                        <p className="text-neutral-900 dark:text-white text-lg font-semibold">{selectedTransaction.customer_balance_before.toLocaleString()} FCFA</p>
                      </div>
                    )}
                    {selectedTransaction.customer_balance_after !== undefined && (
                      <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Solde après</label>
                        <p className="text-neutral-900 dark:text-white text-lg font-semibold">{selectedTransaction.customer_balance_after.toLocaleString()} FCFA</p>
                      </div>
                    )}
                    {selectedTransaction.commission_amount !== undefined && (
                      <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Montant de commission</label>
                        <p className="text-neutral-900 dark:text-white text-lg font-semibold">{selectedTransaction.commission_amount.toLocaleString()} FCFA</p>
                      </div>
                    )}
                    {selectedTransaction.commission_paid !== undefined && (
                      <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Commission payée</label>
                        <Badge className={selectedTransaction.commission_paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {selectedTransaction.commission_paid ? 'Oui' : 'Non'}
                        </Badge>
                      </div>
                    )}
                    {selectedTransaction.has_commission !== undefined && (
                      <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">A une commission</label>
                        <Badge className={selectedTransaction.has_commission ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {selectedTransaction.has_commission ? 'Oui' : 'Non'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Informations sur les remboursements */}
                {(selectedTransaction.refund_requested !== undefined || selectedTransaction.refund_approved_by_admin_id) && (
                  <div>
                    <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Remboursements</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                      <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Remboursement demandé</label>
                        <Badge className={selectedTransaction.refund_requested ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}>
                          {selectedTransaction.refund_requested ? 'Oui' : 'Non'}
                        </Badge>
                      </div>
                      {selectedTransaction.refund_approved_by_admin_id && (
                        <div>
                          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Approuvé par Admin ID</label>
                          <p className="text-neutral-900 dark:text-white font-mono text-sm">{selectedTransaction.refund_approved_by_admin_id}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Informations sur les callbacks et webhooks */}
                {(selectedTransaction.callback_sent !== undefined || selectedTransaction.webhook_count !== undefined) && (
                  <div>
                    <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Callbacks & Webhooks</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                      {selectedTransaction.callback_sent !== undefined && (
                        <div>
                          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Callback envoyé</label>
                          <Badge className={selectedTransaction.callback_sent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {selectedTransaction.callback_sent ? 'Oui' : 'Non'}
                          </Badge>
                        </div>
                      )}
                      {selectedTransaction.callback_retry_count !== undefined && (
                        <div>
                          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Nombre de tentatives</label>
                          <p className="text-neutral-900 dark:text-white text-sm">{selectedTransaction.callback_retry_count}</p>
                        </div>
                      )}
                      {selectedTransaction.webhook_count !== undefined && (
                        <div>
                          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Nombre de webhooks</label>
                          <p className="text-neutral-900 dark:text-white text-sm">{selectedTransaction.webhook_count}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Détails de la commission */}
                {selectedTransaction.commission && (
                  <div>
                    <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-crimson-600" />
                      Détails de la Commission
                    </h4>
                    <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-lg space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">UID Commission</label>
                          <p className="text-neutral-900 dark:text-white font-mono text-sm break-all">{selectedTransaction.commission.uid}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Référence Transaction</label>
                          <p className="text-neutral-900 dark:text-white font-mono text-sm">{selectedTransaction.commission.transaction_reference}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Opérateur</label>
                          <p className="text-neutral-900 dark:text-white text-sm">{selectedTransaction.commission.operator_name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Type de Transaction</label>
                          <p className="text-neutral-900 dark:text-white text-sm">{selectedTransaction.commission.type_trans}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Montant Transaction</label>
                          <p className="text-neutral-900 dark:text-white text-lg font-semibold">{selectedTransaction.commission.transaction_amount.toLocaleString()} FCFA</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Statut</label>
                          <Badge className={
                            selectedTransaction.commission.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            selectedTransaction.commission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {selectedTransaction.commission.status_display || selectedTransaction.commission.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="border-t border-slate-200 dark:border-neutral-700 pt-4">
                        <h5 className="text-md font-semibold text-neutral-900 dark:text-white mb-3">Détails des Frais</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Taux de frais opérateur</label>
                            <p className="text-neutral-900 dark:text-white text-sm">{selectedTransaction.commission.operator_fee_rate}%</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Montant frais opérateur</label>
                            <p className="text-neutral-900 dark:text-white text-sm font-semibold">{selectedTransaction.commission.operator_fee_amount.toLocaleString()} FCFA</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Taux de frais agrégateur</label>
                            <p className="text-neutral-900 dark:text-white text-sm">{selectedTransaction.commission.aggregator_fee_rate}%</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Montant frais agrégateur</label>
                            <p className="text-neutral-900 dark:text-white text-sm font-semibold">{selectedTransaction.commission.aggregator_fee_amount.toLocaleString()} FCFA</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Total des frais</label>
                            <p className="text-neutral-900 dark:text-white text-lg font-bold">{selectedTransaction.commission.total_fees.toLocaleString()} FCFA</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Montant net</label>
                            <p className="text-neutral-900 dark:text-white text-lg font-bold">{selectedTransaction.commission.net_amount.toLocaleString()} FCFA</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-neutral-700">
                        <div>
                          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Date de création</label>
                          <p className="text-neutral-900 dark:text-white text-sm">
                            {new Date(selectedTransaction.commission.created_at).toLocaleString('fr-FR')}
                          </p>
                        </div>
                        {selectedTransaction.commission.withdrawn_at && (
                          <div>
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Date de retrait</label>
                            <p className="text-neutral-900 dark:text-white text-sm">
                              {new Date(selectedTransaction.commission.withdrawn_at).toLocaleString('fr-FR')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Logs de webhook */}
                {selectedTransaction.webhook_logs && selectedTransaction.webhook_logs.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Logs de Webhook</h4>
                    <div className="space-y-3">
                      {selectedTransaction.webhook_logs.map((log) => (
                        <div key={log.uid} className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-700">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Badge className={
                                log.processing_status === 'processed' ? 'bg-green-100 text-green-800' :
                                log.processing_status === 'failed' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }>
                                {log.processing_status_display || log.processing_status}
                              </Badge>
                              <Badge variant="outline">
                                {log.webhook_type_display || log.webhook_type}
                              </Badge>
                            </div>
                            <span className="text-xs text-neutral-600 dark:text-neutral-400">
                              {new Date(log.received_at).toLocaleString('fr-FR')}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">UID</label>
                              <p className="text-neutral-900 dark:text-white font-mono text-xs break-all">{log.uid}</p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Code Opérateur</label>
                              <p className="text-neutral-900 dark:text-white text-xs">{log.operator_code}</p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Référence Transaction</label>
                              <p className="text-neutral-900 dark:text-white font-mono text-xs">{log.transaction_reference}</p>
                            </div>
                            {log.http_status_code !== null && (
                              <div>
                                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Code HTTP</label>
                                <Badge className={
                                  log.http_status_code >= 200 && log.http_status_code < 300 ? 'bg-green-100 text-green-800' :
                                  log.http_status_code >= 400 ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }>
                                  {log.http_status_code}
                                </Badge>
                              </div>
                            )}
                            {log.signature_valid !== null && (
                              <div>
                                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Signature valide</label>
                                <Badge className={log.signature_valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                  {log.signature_valid ? 'Oui' : 'Non'}
                                </Badge>
                              </div>
                            )}
                            <div>
                              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Reçu à</label>
                              <p className="text-neutral-900 dark:text-white text-xs">
                                {new Date(log.received_at).toLocaleString('fr-FR')}
                              </p>
                            </div>
                            {log.processed_at && (
                              <div>
                                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Traité à</label>
                                <p className="text-neutral-900 dark:text-white text-xs">
                                  {new Date(log.processed_at).toLocaleString('fr-FR')}
                                </p>
                              </div>
                            )}
                            {log.processing_error && (
                              <div className="md:col-span-2">
                                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Erreur de traitement</label>
                                <p className="text-red-600 dark:text-red-400 text-xs">{log.processing_error}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, CreditCard, Eye, Calendar, DollarSign, Loader2, Filter, Search } from "lucide-react"
import { smartFetch } from "@/utils/auth"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

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
interface TransactionDetails extends Transaction {
  webhook_logs?: {
    uid: string
    url: string
    status: string
    response: string
    created_at: string
  }[]
}

export default function Transactions({ params }: { params: { id: string } }) {
  const router = useRouter()
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

      // Récupérer les logs de webhook
      const webhookResponse = await smartFetch(`${baseUrl}/api/v2/admin/transactions/${transactionUid}/webhook-logs/`)
      
      let webhookLogs = []
      if (webhookResponse.ok) {
        const webhookData = await webhookResponse.json()
        webhookLogs = webhookData.results || webhookData
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
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-white flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-crimson-600" />
                Détails de la Transaction
              </DialogTitle>
              <DialogDescription className="text-neutral-600 dark:text-neutral-400">
                Informations complètes sur cette transaction
              </DialogDescription>
            </DialogHeader>
            
            {detailsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-crimson-600" />
                <span className="ml-2 text-neutral-600 dark:text-neutral-400">Chargement des détails...</span>
              </div>
            ) : selectedTransaction ? (
              <div className="space-y-6">
                {/* Informations générales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">UID</label>
                    <p className="text-neutral-900 dark:text-white font-mono text-sm">{selectedTransaction.uid}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Client ID</label>
                    <p className="text-neutral-900 dark:text-white font-mono text-sm">{selectedTransaction.customer_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Montant</label>
                    <p className="text-neutral-900 dark:text-white text-lg font-bold">{selectedTransaction.amount.toLocaleString()} FCFA</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Type</label>
                    <Badge className={
                      selectedTransaction.type === 'payin' ? 'bg-green-100 text-green-800' :
                      selectedTransaction.type === 'payout' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {selectedTransaction.type}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Statut</label>
                    <Badge className={
                      selectedTransaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                      selectedTransaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedTransaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {selectedTransaction.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Date de création</label>
                    <p className="text-neutral-900 dark:text-white text-sm">
                      {new Date(selectedTransaction.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  {selectedTransaction.reference && (
                    <div>
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Référence</label>
                      <p className="text-neutral-900 dark:text-white font-mono text-sm">{selectedTransaction.reference}</p>
                    </div>
                  )}
                  {selectedTransaction.description && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Description</label>
                      <p className="text-neutral-900 dark:text-white text-sm">{selectedTransaction.description}</p>
                    </div>
                  )}
                </div>

                {/* Informations financières */}
                {(selectedTransaction.fees || selectedTransaction.balance_before || selectedTransaction.balance_after) && (
                  <div>
                    <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Informations Financières</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedTransaction.fees && (
                        <div>
                          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Frais</label>
                          <p className="text-neutral-900 dark:text-white text-lg font-semibold">{selectedTransaction.fees.toLocaleString()} FCFA</p>
                        </div>
                      )}
                      {selectedTransaction.balance_before !== undefined && (
                        <div>
                          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Solde avant</label>
                          <p className="text-neutral-900 dark:text-white text-lg font-semibold">{selectedTransaction.balance_before.toLocaleString()} FCFA</p>
                        </div>
                      )}
                      {selectedTransaction.balance_after !== undefined && (
                        <div>
                          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Solde après</label>
                          <p className="text-neutral-900 dark:text-white text-lg font-semibold">{selectedTransaction.balance_after.toLocaleString()} FCFA</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Logs de webhook */}
                {selectedTransaction.webhook_logs && selectedTransaction.webhook_logs.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Logs de Webhook</h4>
                    <div className="space-y-3">
                      {selectedTransaction.webhook_logs.map((log) => (
                        <div key={log.uid} className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Badge className={
                                log.status === 'success' ? 'bg-green-100 text-green-800' :
                                log.status === 'failed' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }>
                                {log.status}
                              </Badge>
                              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                {new Date(log.created_at).toLocaleString('fr-FR')}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">URL</label>
                              <p className="text-sm text-neutral-900 dark:text-white font-mono break-all">{log.url}</p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Réponse</label>
                              <pre className="text-xs text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-900 p-2 rounded border overflow-x-auto">
                                {log.response}
                              </pre>
                            </div>
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

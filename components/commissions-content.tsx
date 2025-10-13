"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, RefreshCw, DollarSign, Eye, Loader2, ChevronLeft, ChevronRight, Download, ArrowLeft } from "lucide-react"
import { smartFetch } from "@/utils/auth"
import { useRouter } from "next/navigation"

// Interface pour les données de commission
interface Commission {
  id: string
  operator_code: string
  operator_name: string
  transaction_id: string
  amount: number
  commission_rate: number
  commission_amount: number
  status: string
  created_at: string
  paid_at?: string
  transaction_details?: {
    reference: string
    customer_email?: string
    customer_name?: string
  }
}

// Interface pour les lots de commission
interface CommissionBatch {
  id: string
  operator_code: string
  total_amount: number
  commission_count: number
  status: string
  created_at: string
  processed_at?: string
}

// Interface pour les opérateurs
interface Operator {
  code: string
  name: string
  is_active: boolean
}

export function CommissionsContent() {
  const router = useRouter()
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [unpaidCommissions, setUnpaidCommissions] = useState<Commission[]>([])
  const [commissionBatches, setCommissionBatches] = useState<CommissionBatch[]>([])
  const [operators, setOperators] = useState<Operator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [operatorFilter, setOperatorFilter] = useState("all")
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState("")
  
  // États pour les modals
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null)
  const [withdrawalData, setWithdrawalData] = useState({
    operator_code: "",
    payment_method: "mobile_money",
    notes: ""
  })
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCommissions, setTotalCommissions] = useState(0)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  // Fonction pour récupérer les commissions
  const fetchCommissions = async (query: string = "", page: number = 1, status: string = "confirmed", operator: string = "") => {
    try {
      setLoading(true)
      setError(null)
      
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const params = new URLSearchParams()
      if (query) {
        params.append('search', query)
      }
      if (status) {
        params.append('status', status)
      }
      if (operator) {
        params.append('operator_code', operator)
      }
      params.append('page', page.toString())
      params.append('page_size', pageSize.toString())
      
      const url = `${baseUrl}/api/v2/admin/commissions/?${params.toString()}`
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
        setCommissions(data.results)
        setTotalCommissions(data.count || data.results.length)
        setTotalPages(Math.ceil((data.count || data.results.length) / pageSize))
      } else if (Array.isArray(data)) {
        setCommissions(data)
        setTotalCommissions(data.length)
        setTotalPages(Math.ceil(data.length / pageSize))
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

  // Fonction pour récupérer les commissions impayées
  const fetchUnpaidCommissions = async (operator: string = "") => {
    try {
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const params = new URLSearchParams()
      if (operator) {
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
      setUnpaidCommissions(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      console.error("Error fetching unpaid commissions:", err)
    }
  }

  // Fonction pour récupérer les lots de commission
  const fetchCommissionBatches = async () => {
    try {
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

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

  // Fonction pour récupérer les opérateurs
  const fetchOperators = async () => {
    try {
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const response = await smartFetch(`${baseUrl}/api/v2/admin/operators/`)
      
      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setOperators(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      console.error("Error fetching operators:", err)
    }
  }

  // Fonction pour créer un retrait de commission
  const createWithdrawal = async (commissionIds: string[], operatorCode: string, paymentMethod: string, notes: string) => {
    try {
      setActionLoading(true)
      setActionMessage("")
      
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const response = await smartFetch(`${baseUrl}/api/v2/admin/commissions/withdraw/`, {
        method: "POST",
        body: JSON.stringify({
          commission_ids: commissionIds,
          operator_code: operatorCode,
          payment_method: paymentMethod,
          notes: notes
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
        throw new Error(errorMessage)
      }

      const result = await response.json()
      setActionMessage(result.message || "Retrait de commission créé avec succès")
      
      // Rafraîchir les données
      await fetchCommissions(searchTerm, currentPage, statusFilter, operatorFilter)
      await fetchUnpaidCommissions(operatorFilter)
      await fetchCommissionBatches()
      
    } catch (err) {
      console.error("Error creating withdrawal:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création du retrait"
      setError(errorMessage)
    } finally {
      setActionLoading(false)
    }
  }

  // Charger les données au montage du composant
  useEffect(() => {
    fetchCommissions("", 1, "confirmed", "")
    fetchUnpaidCommissions("")
    fetchCommissionBatches()
    fetchOperators()
  }, [])

  // Charger les commissions quand la page change
  useEffect(() => {
    fetchCommissions(searchTerm, currentPage, statusFilter, operatorFilter)
  }, [currentPage])

  // Fonction pour gérer la recherche avec debounce
  const handleSearch = (query: string) => {
    setSearchTerm(query)
    setCurrentPage(1)
    fetchCommissions(query, 1, statusFilter, operatorFilter)
  }

  // Fonction pour gérer le filtre de statut
  const handleStatusFilter = (status: string) => {
    const filterValue = status === "all" ? "confirmed" : status
    setStatusFilter(status)
    setCurrentPage(1)
    fetchCommissions(searchTerm, 1, filterValue, operatorFilter)
  }

  // Fonction pour gérer le filtre d'opérateur
  const handleOperatorFilter = (operator: string) => {
    const filterValue = operator === "all" ? "" : operator
    setOperatorFilter(operator)
    setCurrentPage(1)
    fetchCommissions(searchTerm, 1, statusFilter, filterValue)
    fetchUnpaidCommissions(filterValue)
  }

  // Fonctions de pagination
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

  // Gestion de la sélection des commissions
  const handleSelectCommission = (commissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedCommissions([...selectedCommissions, commissionId])
    } else {
      setSelectedCommissions(selectedCommissions.filter(id => id !== commissionId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCommissions(commissions.map(c => c.id))
    } else {
      setSelectedCommissions([])
    }
  }

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Confirmé</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">En Attente</Badge>
      case "paid":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Payé</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Annulé</Badge>
      default:
        return <Badge variant="secondary" className="bg-slate-100 text-slate-800 hover:bg-slate-100 border-slate-200">{status}</Badge>
    }
  }

  // Calculer les statistiques
  const stats = {
    total: commissions.length,
    confirmed: commissions.filter(c => c.status === "confirmed").length,
    paid: commissions.filter(c => c.status === "paid").length,
    pending: commissions.filter(c => c.status === "pending").length,
    totalAmount: commissions.reduce((sum, c) => sum + c.commission_amount, 0),
    unpaidAmount: unpaidCommissions.reduce((sum, c) => sum + c.commission_amount, 0)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
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
            <h1 className="text-3xl font-bold">Gestion des Commissions</h1>
            <p className="text-muted-foreground">Gérez les commissions des opérateurs</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => fetchCommissions(searchTerm, currentPage, statusFilter, operatorFilter)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          {selectedCommissions.length > 0 && (
            <Button 
              onClick={() => setWithdrawalModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Créer Retrait ({selectedCommissions.length})
            </Button>
          )}
        </div>
      </div>

      {/* Affichage des erreurs globales */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
            </div>
            <div className="flex-1">
              <p className="text-red-800 dark:text-red-200 font-medium">Erreur de chargement des données</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1 break-words">{error}</p>
            </div>
            <div className="flex-shrink-0">
              <Button 
                onClick={() => fetchCommissions(searchTerm, currentPage, statusFilter, operatorFilter)} 
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Affichage des messages d'action */}
      {actionMessage && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <span className="text-green-600 dark:text-green-400 text-xl">✅</span>
            </div>
            <div className="flex-1">
              <p className="text-green-800 dark:text-green-200 font-medium">Action réussie</p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">{actionMessage}</p>
            </div>
            <div className="flex-shrink-0">
              <Button 
                onClick={() => setActionMessage("")} 
                size="sm"
                variant="outline"
                className="border-green-200 text-green-800 hover:bg-green-100"
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confirmées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Payées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.paid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Montant Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAmount.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Impayées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.unpaidAmount.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Rechercher par ID transaction ou opérateur..."
                className="pl-10 rounded-xl border-slate-200 dark:border-neutral-700 h-12"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="confirmed">Confirmé</SelectItem>
                <SelectItem value="pending">En Attente</SelectItem>
                <SelectItem value="paid">Payé</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={operatorFilter} onValueChange={handleOperatorFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Tous les opérateurs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les opérateurs</SelectItem>
                {operators.map((operator) => (
                  <SelectItem key={operator.code} value={operator.code}>
                    {operator.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des Commissions */}
      <Card>
        <CardHeader>
          <CardTitle>Commissions</CardTitle>
          <CardDescription>
            Liste des commissions ({totalCommissions} au total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedCommissions.length === commissions.length && commissions.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Opérateur</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Montant Transaction</TableHead>
                  <TableHead>Taux</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-2 text-neutral-600 dark:text-neutral-400">Chargement des commissions...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : commissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="text-center">
                        <DollarSign className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                        <p className="text-neutral-600 dark:text-neutral-400">Aucune commission trouvée</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedCommissions.includes(commission.id)}
                          onCheckedChange={(checked) => handleSelectCommission(commission.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{commission.operator_name}</div>
                          <div className="text-sm text-muted-foreground">{commission.operator_code}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {commission.transaction_id.slice(0, 8)}...
                        </div>
                        {commission.transaction_details?.reference && (
                          <div className="text-xs text-muted-foreground">
                            Ref: {commission.transaction_details.reference}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {commission.amount.toLocaleString()} FCFA
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {commission.commission_rate}%
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {commission.commission_amount.toLocaleString()} FCFA
                      </TableCell>
                      <TableCell>{getStatusBadge(commission.status)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{new Date(commission.created_at).toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">{new Date(commission.created_at).toLocaleTimeString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCommission(commission)
                            setDetailsModalOpen(true)
                          }}
                          className="flex items-center space-x-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Détails</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <PaginationComponent />
        </CardContent>
      </Card>

      {/* Modal de Retrait */}
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
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Commissions sélectionnées:</p>
              <p className="font-medium">{selectedCommissions.length} commission(s)</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Montant total: {commissions
                  .filter(c => selectedCommissions.includes(c.id))
                  .reduce((sum, c) => sum + c.commission_amount, 0)
                  .toLocaleString()} FCFA
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                Opérateur
              </label>
              <Select value={withdrawalData.operator_code} onValueChange={(value) => setWithdrawalData({...withdrawalData, operator_code: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un opérateur" />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((operator) => (
                    <SelectItem key={operator.code} value={operator.code}>
                      {operator.name} ({operator.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                Méthode de Paiement
              </label>
              <Select value={withdrawalData.payment_method} onValueChange={(value) => setWithdrawalData({...withdrawalData, payment_method: value})}>
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
                Notes
              </label>
              <Input
                placeholder="Notes optionnelles..."
                value={withdrawalData.notes}
                onChange={(e) => setWithdrawalData({...withdrawalData, notes: e.target.value})}
                className="rounded-xl border-slate-200 dark:border-neutral-700"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setWithdrawalModalOpen(false)
                  setWithdrawalData({ operator_code: "", payment_method: "mobile_money", notes: "" })
                }}
                className="rounded-xl"
              >
                Annuler
              </Button>
              <Button
                onClick={() => {
                  createWithdrawal(
                    selectedCommissions,
                    withdrawalData.operator_code,
                    withdrawalData.payment_method,
                    withdrawalData.notes
                  )
                  setWithdrawalModalOpen(false)
                  setWithdrawalData({ operator_code: "", payment_method: "mobile_money", notes: "" })
                  setSelectedCommissions([])
                }}
                disabled={actionLoading || !withdrawalData.operator_code}
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Créer Retrait
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Détails */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la Commission</DialogTitle>
            <DialogDescription>
              Informations complètes de la commission
            </DialogDescription>
          </DialogHeader>
          
          {selectedCommission && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID Commission</label>
                  <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded">{selectedCommission.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID Transaction</label>
                  <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded">{selectedCommission.transaction_id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Opérateur</label>
                  <p className="text-sm">{selectedCommission.operator_name} ({selectedCommission.operator_code})</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Statut</label>
                  <div className="mt-1">{getStatusBadge(selectedCommission.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Montant Transaction</label>
                  <p className="text-lg font-semibold">{selectedCommission.amount.toLocaleString()} FCFA</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Taux Commission</label>
                  <p className="text-lg font-semibold">{selectedCommission.commission_rate}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Montant Commission</label>
                  <p className="text-lg font-semibold text-green-600">{selectedCommission.commission_amount.toLocaleString()} FCFA</p>
                </div>
              </div>

              {selectedCommission.transaction_details && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">Détails de la Transaction</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Référence</label>
                      <p className="text-sm font-mono">{selectedCommission.transaction_details.reference || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Client</label>
                      <p className="text-sm">{selectedCommission.transaction_details.customer_name || selectedCommission.transaction_details.customer_email || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">Dates</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date de Création</label>
                    <p className="text-sm">{new Date(selectedCommission.created_at).toLocaleString()}</p>
                  </div>
                  {selectedCommission.paid_at && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Date de Paiement</label>
                      <p className="text-sm">{new Date(selectedCommission.paid_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailsModalOpen(false)}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

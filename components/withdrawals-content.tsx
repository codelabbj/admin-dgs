"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, RefreshCw, CheckCircle, XCircle, Eye, Loader2, ChevronLeft, ChevronRight, Zap, ArrowLeft } from "lucide-react"
import { smartFetch } from "@/utils/auth"
import { useRouter } from "next/navigation"

// Interface pour les données de retrait
interface Withdrawal {
  uid: string
  reference: string
  amount: number
  phone: string
  operator_code: string
  status: string
  status_display: string
  code: string | null
  admin_notes: string
  rejection_reason: string
  created_at: string
  approved_at: string | null
  processed_at: string | null
}

export function WithdrawalsContent() {
  const router = useRouter()
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState("")
  
  // États pour les modals
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [approvalNotes, setApprovalNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalWithdrawals, setTotalWithdrawals] = useState(0)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  // Fonction pour récupérer les retraits
  const fetchWithdrawals = async (query: string = "", page: number = 1, status: string = "") => {
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
      params.append('page', page.toString())
      params.append('page_size', pageSize.toString())
      
      const url = `${baseUrl}/api/v2/admin/withdrawals/?${params.toString()}`
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
        setWithdrawals(data.results)
        setTotalWithdrawals(data.count || data.results.length)
        setTotalPages(Math.ceil((data.count || data.results.length) / pageSize))
      } else if (Array.isArray(data)) {
        setWithdrawals(data)
        setTotalWithdrawals(data.length)
        setTotalPages(Math.ceil(data.length / pageSize))
      } else {
        setWithdrawals([])
        setTotalWithdrawals(0)
        setTotalPages(0)
      }
    } catch (err) {
      console.error("Error fetching withdrawals:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des retraits"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour approuver un retrait
  const approveWithdrawal = async (withdrawalUid: string, notes: string) => {
    try {
      setActionLoading(true)
      setActionMessage("")
      
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const response = await smartFetch(`${baseUrl}/api/v2/admin/withdrawals/${withdrawalUid}/approve/`, {
        method: "POST",
        body: JSON.stringify({ notes })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
        throw new Error(errorMessage)
      }

      const result = await response.json()
      setActionMessage(result.message || "Retrait approuvé avec succès")
      
      // Rafraîchir la liste des retraits
      await fetchWithdrawals(searchTerm, currentPage, statusFilter)
      
    } catch (err) {
      console.error("Error approving withdrawal:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'approbation"
      setError(errorMessage)
    } finally {
      setActionLoading(false)
    }
  }

  // Fonction pour rejeter un retrait
  const rejectWithdrawal = async (withdrawalUid: string, reason: string) => {
    try {
      setActionLoading(true)
      setActionMessage("")
      
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const response = await smartFetch(`${baseUrl}/api/v2/admin/withdrawals/${withdrawalUid}/reject/`, {
        method: "POST",
        body: JSON.stringify({ rejection_reason: reason })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
        throw new Error(errorMessage)
      }

      const result = await response.json()
      setActionMessage(result.message || "Retrait rejeté avec succès")
      
      // Rafraîchir la liste des retraits
      await fetchWithdrawals(searchTerm, currentPage, statusFilter)
      
    } catch (err) {
      console.error("Error rejecting withdrawal:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du rejet"
      setError(errorMessage)
    } finally {
      setActionLoading(false)
    }
  }

  // Charger les retraits au montage du composant
  useEffect(() => {
    fetchWithdrawals("", 1, "")
  }, [])

  // Charger les retraits quand la page change
  useEffect(() => {
    fetchWithdrawals(searchTerm, currentPage, statusFilter)
  }, [currentPage])

  // Fonction pour gérer la recherche avec debounce
  const handleSearch = (query: string) => {
    setSearchTerm(query)
    setCurrentPage(1)
    fetchWithdrawals(query, 1, statusFilter)
  }

  // Fonction pour gérer le filtre de statut
  const handleStatusFilter = (status: string) => {
    const filterValue = status === "all" ? "" : status
    setStatusFilter(status)
    setCurrentPage(1)
    fetchWithdrawals(searchTerm, 1, filterValue)
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
            Affichage de {((currentPage - 1) * pageSize) + 1} à {Math.min(currentPage * pageSize, totalWithdrawals)} sur {totalWithdrawals} retraits
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
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">En Attente</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Approuvé</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Rejeté</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Terminé</Badge>
      case "processing":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200">En Cours</Badge>
      default:
        return <Badge variant="secondary" className="bg-slate-100 text-slate-800 hover:bg-slate-100 border-slate-200">{status}</Badge>
    }
  }

  // Calculer les statistiques
  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter(w => w.status === "pending").length,
    approved: withdrawals.filter(w => w.status === "approved").length,
    rejected: withdrawals.filter(w => w.status === "rejected").length,
    totalAmount: withdrawals.reduce((sum, w) => sum + w.amount, 0),
    pendingAmount: withdrawals.filter(w => w.status === "pending").reduce((sum, w) => sum + w.amount, 0)
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
            <h1 className="text-3xl font-bold">Gestion des Retraits</h1>
            <p className="text-muted-foreground">Gérez les demandes de retrait des clients</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => fetchWithdrawals(searchTerm, currentPage, statusFilter)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
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
                onClick={() => fetchWithdrawals(searchTerm, currentPage, statusFilter)} 
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
            <CardTitle className="text-sm font-medium">Total Retraits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
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
            <CardTitle className="text-sm font-medium">Approuvés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejetés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
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
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingAmount.toLocaleString()} FCFA</div>
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
                placeholder="Rechercher par référence, téléphone ou montant..."
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
                <SelectItem value="pending">En Attente</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="processing">En Cours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des Retraits */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes de Retrait</CardTitle>
          <CardDescription>
            Liste des demandes de retrait ({totalWithdrawals} au total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Opérateur</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-2 text-neutral-600 dark:text-neutral-400">Chargement des retraits...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : withdrawals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-center">
                        <Zap className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                        <p className="text-neutral-600 dark:text-neutral-400">Aucune demande de retrait trouvée</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  withdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.uid}>
                      <TableCell className="font-medium">
                        <div className="font-mono text-sm">
                          {withdrawal.reference}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-red-600">
                        {withdrawal.amount.toLocaleString()} FCFA
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {withdrawal.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium uppercase">
                          {withdrawal.operator_code}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{new Date(withdrawal.created_at).toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">{new Date(withdrawal.created_at).toLocaleTimeString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedWithdrawal(withdrawal)
                              setDetailsModalOpen(true)
                            }}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Détails</span>
                          </Button>
                          
                          {withdrawal.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => {
                                  setSelectedWithdrawal(withdrawal)
                                  setApproveModalOpen(true)
                                }}
                                disabled={actionLoading}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approuver
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedWithdrawal(withdrawal)
                                  setRejectModalOpen(true)
                                }}
                                disabled={actionLoading}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Rejeter
                              </Button>
                            </>
                          )}
                        </div>
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

      {/* Modal d'Approbation */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-white flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Approuver le Retrait
            </DialogTitle>
            <DialogDescription className="text-neutral-600 dark:text-neutral-400">
              Approuver ce retrait avec des notes optionnelles
            </DialogDescription>
          </DialogHeader>
          
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Référence</p>
                    <p className="font-medium">{selectedWithdrawal.reference}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Montant</p>
                    <p className="font-medium text-red-600">{selectedWithdrawal.amount.toLocaleString()} FCFA</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Téléphone</p>
                  <p className="text-sm font-mono">{selectedWithdrawal.phone}</p>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Opérateur</p>
                  <p className="text-sm font-medium uppercase">{selectedWithdrawal.operator_code}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                  Notes d'approbation (optionnel)
                </label>
                <Input
                  placeholder="Entrez des notes d'approbation..."
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="rounded-xl border-slate-200 dark:border-neutral-700"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setApproveModalOpen(false)
                    setApprovalNotes("")
                  }}
                  className="rounded-xl"
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => {
                    approveWithdrawal(selectedWithdrawal.uid, approvalNotes)
                    setApproveModalOpen(false)
                    setApprovalNotes("")
                  }}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Approbation...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approuver
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Rejet */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-white flex items-center">
              <XCircle className="h-5 w-5 mr-2 text-red-600" />
              Rejeter le Retrait
            </DialogTitle>
            <DialogDescription className="text-neutral-600 dark:text-neutral-400">
              Veuillez fournir une raison pour le rejet de ce retrait
            </DialogDescription>
          </DialogHeader>
          
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Référence</p>
                    <p className="font-medium">{selectedWithdrawal.reference}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Montant</p>
                    <p className="font-medium text-red-600">{selectedWithdrawal.amount.toLocaleString()} FCFA</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Téléphone</p>
                  <p className="text-sm font-mono">{selectedWithdrawal.phone}</p>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Opérateur</p>
                  <p className="text-sm font-medium uppercase">{selectedWithdrawal.operator_code}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                  Raison du rejet
                </label>
                <Input
                  placeholder="Entrez la raison du rejet..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="rounded-xl border-slate-200 dark:border-neutral-700"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectModalOpen(false)
                    setRejectionReason("")
                  }}
                  className="rounded-xl"
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => {
                    rejectWithdrawal(selectedWithdrawal.uid, rejectionReason)
                    setRejectModalOpen(false)
                    setRejectionReason("")
                  }}
                  disabled={actionLoading || !rejectionReason.trim()}
                  variant="destructive"
                  className="rounded-xl"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Rejet...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeter
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Détails */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du Retrait</DialogTitle>
            <DialogDescription>
              Informations complètes de la demande de retrait
            </DialogDescription>
          </DialogHeader>
          
          {selectedWithdrawal && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">UID</label>
                  <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded">{selectedWithdrawal.uid}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Référence</label>
                  <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded">{selectedWithdrawal.reference}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Montant</label>
                  <p className="text-lg font-semibold text-red-600">{selectedWithdrawal.amount.toLocaleString()} FCFA</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Statut</label>
                  <div className="mt-1">{getStatusBadge(selectedWithdrawal.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                  <p className="text-sm font-mono">{selectedWithdrawal.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Opérateur</label>
                  <p className="text-sm font-medium uppercase">{selectedWithdrawal.operator_code}</p>
                </div>
              </div>

              {selectedWithdrawal.code && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Code</label>
                  <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded">{selectedWithdrawal.code}</p>
                </div>
              )}

              {selectedWithdrawal.admin_notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notes Admin</label>
                  <p className="text-sm bg-slate-100 dark:bg-slate-800 p-3 rounded">{selectedWithdrawal.admin_notes}</p>
                </div>
              )}

              {selectedWithdrawal.rejection_reason && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Raison du Rejet</label>
                  <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded">{selectedWithdrawal.rejection_reason}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">Dates</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date de Création</label>
                    <p className="text-sm">{new Date(selectedWithdrawal.created_at).toLocaleString()}</p>
                  </div>
                  {selectedWithdrawal.approved_at && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Date d'Approbation</label>
                      <p className="text-sm">{new Date(selectedWithdrawal.approved_at).toLocaleString()}</p>
                    </div>
                  )}
                  {selectedWithdrawal.processed_at && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Date de Traitement</label>
                      <p className="text-sm">{new Date(selectedWithdrawal.processed_at).toLocaleString()}</p>
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

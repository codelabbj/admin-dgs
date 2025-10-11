"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, RefreshCw, CheckCircle, XCircle, Eye, Loader2, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react"
import { smartFetch } from "@/utils/auth"
import { useRouter } from "next/navigation"

// Interface pour les données de remboursement
interface RefundRequest {
  transaction_uid: string
  customer_id: string
  amount: number
  reason: string
  status: string
  created_at: string
  updated_at: string
  transaction_details?: {
    reference: string
    type: string
    customer_email?: string
    customer_name?: string
  }
}

export function RefundsContent() {
  const router = useRouter()
  const [refunds, setRefunds] = useState<RefundRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState("")
  
  // États pour les modals
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalRefunds, setTotalRefunds] = useState(0)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  // Fonction pour récupérer les demandes de remboursement
  const fetchRefunds = async (query: string = "", page: number = 1) => {
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
      params.append('pending_only', 'true')
      params.append('page', page.toString())
      params.append('page_size', pageSize.toString())
      
      const url = `${baseUrl}/api/v2/admin/refund-requests/?${params.toString()}`
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
        setRefunds(data.results)
        setTotalRefunds(data.count || data.results.length)
        setTotalPages(Math.ceil((data.count || data.results.length) / pageSize))
      } else if (Array.isArray(data)) {
        setRefunds(data)
        setTotalRefunds(data.length)
        setTotalPages(Math.ceil(data.length / pageSize))
      } else {
        setRefunds([])
        setTotalRefunds(0)
        setTotalPages(0)
      }
    } catch (err) {
      console.error("Error fetching refunds:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des remboursements"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour approuver un remboursement
  const approveRefund = async (transactionUid: string) => {
    try {
      setActionLoading(true)
      setActionMessage("")
      
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const response = await smartFetch(`${baseUrl}/api/v2/admin/refund-requests/${transactionUid}/approve/`, {
        method: "POST"
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
        throw new Error(errorMessage)
      }

      const result = await response.json()
      setActionMessage(result.message || "Remboursement approuvé avec succès")
      
      // Rafraîchir la liste des remboursements
      await fetchRefunds(searchTerm, currentPage)
      
    } catch (err) {
      console.error("Error approving refund:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'approbation"
      setError(errorMessage)
    } finally {
      setActionLoading(false)
    }
  }

  // Fonction pour rejeter un remboursement
  const rejectRefund = async (transactionUid: string, reason: string) => {
    try {
      setActionLoading(true)
      setActionMessage("")
      
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const response = await smartFetch(`${baseUrl}/api/v2/admin/refund-requests/${transactionUid}/reject/`, {
        method: "POST",
        body: JSON.stringify({ rejection_reason: reason })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
        throw new Error(errorMessage)
      }

      const result = await response.json()
      setActionMessage(result.message || "Remboursement rejeté avec succès")
      
      // Rafraîchir la liste des remboursements
      await fetchRefunds(searchTerm, currentPage)
      
    } catch (err) {
      console.error("Error rejecting refund:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du rejet"
      setError(errorMessage)
    } finally {
      setActionLoading(false)
    }
  }

  // Charger les remboursements au montage du composant
  useEffect(() => {
    fetchRefunds("", 1)
  }, [])

  // Charger les remboursements quand la page change
  useEffect(() => {
    fetchRefunds(searchTerm, currentPage)
  }, [currentPage])

  // Fonction pour gérer la recherche avec debounce
  const handleSearch = (query: string) => {
    setSearchTerm(query)
    setCurrentPage(1)
    fetchRefunds(query, 1)
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
            Affichage de {((currentPage - 1) * pageSize) + 1} à {Math.min(currentPage * pageSize, totalRefunds)} sur {totalRefunds} remboursements
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
      case "processed":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Traité</Badge>
      default:
        return <Badge variant="secondary" className="bg-slate-100 text-slate-800 hover:bg-slate-100 border-slate-200">{status}</Badge>
    }
  }

  // Calculer les statistiques
  const stats = {
    total: refunds.length,
    pending: refunds.filter(r => r.status === "pending").length,
    approved: refunds.filter(r => r.status === "approved").length,
    rejected: refunds.filter(r => r.status === "rejected").length,
    totalAmount: refunds.reduce((sum, r) => sum + r.amount, 0)
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
            <h1 className="text-3xl font-bold">Gestion des Remboursements</h1>
            <p className="text-muted-foreground">Gérez les demandes de remboursement des clients</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => fetchRefunds(searchTerm, currentPage)}>
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
                onClick={() => fetchRefunds(searchTerm, currentPage)} 
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Demandes</CardTitle>
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
      </div>

      {/* Recherche */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Rechercher par ID transaction ou client..."
                className="pl-10 rounded-xl border-slate-200 dark:border-neutral-700 h-12"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des Remboursements */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes de Remboursement</CardTitle>
          <CardDescription>
            Liste des demandes de remboursement en attente ({totalRefunds} au total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Transaction</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Raison</TableHead>
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
                        <span className="ml-2 text-neutral-600 dark:text-neutral-400">Chargement des remboursements...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : refunds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-center">
                        <RefreshCw className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                        <p className="text-neutral-600 dark:text-neutral-400">Aucune demande de remboursement trouvée</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  refunds.map((refund) => (
                    <TableRow key={refund.transaction_uid}>
                      <TableCell className="font-medium">
                        <div className="font-mono text-sm">
                          {refund.transaction_uid.slice(0, 8)}...
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{refund.transaction_details?.customer_name || "N/A"}</div>
                          <div className="text-sm text-muted-foreground">{refund.transaction_details?.customer_email || refund.customer_id}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {refund.amount.toLocaleString()} FCFA
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={refund.reason}>
                          {refund.reason}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(refund.status)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{new Date(refund.created_at).toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">{new Date(refund.created_at).toLocaleTimeString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRefund(refund)
                              setDetailsModalOpen(true)
                            }}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Détails</span>
                          </Button>
                          
                          {refund.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => {
                                  setSelectedRefund(refund)
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
                                  setSelectedRefund(refund)
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
              Approuver le Remboursement
            </DialogTitle>
            <DialogDescription className="text-neutral-600 dark:text-neutral-400">
              Êtes-vous sûr de vouloir approuver ce remboursement ?
            </DialogDescription>
          </DialogHeader>
          
          {selectedRefund && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Transaction ID</p>
                    <p className="font-medium">{selectedRefund.transaction_uid.slice(0, 8)}...</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Montant</p>
                    <p className="font-medium text-green-600">{selectedRefund.amount.toLocaleString()} FCFA</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Raison</p>
                  <p className="text-sm">{selectedRefund.reason}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setApproveModalOpen(false)}
                  className="rounded-xl"
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => {
                    approveRefund(selectedRefund.transaction_uid)
                    setApproveModalOpen(false)
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
              Rejeter le Remboursement
            </DialogTitle>
            <DialogDescription className="text-neutral-600 dark:text-neutral-400">
              Veuillez fournir une raison pour le rejet de ce remboursement
            </DialogDescription>
          </DialogHeader>
          
          {selectedRefund && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Transaction ID</p>
                    <p className="font-medium">{selectedRefund.transaction_uid.slice(0, 8)}...</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Montant</p>
                    <p className="font-medium text-green-600">{selectedRefund.amount.toLocaleString()} FCFA</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Raison du client</p>
                  <p className="text-sm">{selectedRefund.reason}</p>
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
                    rejectRefund(selectedRefund.transaction_uid, rejectionReason)
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
            <DialogTitle>Détails du Remboursement</DialogTitle>
            <DialogDescription>
              Informations complètes de la demande de remboursement
            </DialogDescription>
          </DialogHeader>
          
          {selectedRefund && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID Transaction</label>
                  <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded">{selectedRefund.transaction_uid}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID Client</label>
                  <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded">{selectedRefund.customer_id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Montant</label>
                  <p className="text-lg font-semibold text-green-600">{selectedRefund.amount.toLocaleString()} FCFA</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Statut</label>
                  <div className="mt-1">{getStatusBadge(selectedRefund.status)}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Raison du Remboursement</label>
                <p className="text-sm bg-slate-100 dark:bg-slate-800 p-3 rounded">{selectedRefund.reason}</p>
              </div>

              {selectedRefund.transaction_details && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">Détails de la Transaction</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Référence</label>
                      <p className="text-sm font-mono">{selectedRefund.transaction_details.reference || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Type</label>
                      <p className="text-sm">{selectedRefund.transaction_details.type || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">Dates</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date de Création</label>
                    <p className="text-sm">{new Date(selectedRefund.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Dernière Mise à Jour</label>
                    <p className="text-sm">{new Date(selectedRefund.updated_at).toLocaleString()}</p>
                  </div>
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

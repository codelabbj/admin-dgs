"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, AlertCircle, CheckCircle, XCircle, Loader2, Calendar, DollarSign, User } from "lucide-react"
import { smartFetch } from "@/utils/auth"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// Interface pour les demandes de remboursement
interface RefundRequest {
  uid: string
  transaction_uid: string
  customer_id: string
  amount: number
  reason: string
  status: string
  created_at: string
  updated_at: string
  transaction_details?: {
    uid: string
    amount: number
    type: string
    status: string
    created_at: string
  }
}

export default function RefundRequests({ params }: { params: { id: string } }) {
  const router = useRouter()
  const customerId = params.id
  
  // États pour la gestion des données
  const [refunds, setRefunds] = useState<RefundRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [pendingOnly, setPendingOnly] = useState(true)
  
  // États pour les modals
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  
  // États pour les actions
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState("")

  // Fonction pour récupérer les demandes de remboursement
  const fetchRefunds = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const params = new URLSearchParams()
      if (pendingOnly) {
        params.append('pending_only', 'true')
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }
      
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
      
      // Filtrer par customer_id si spécifié
      let filteredRefunds = data.results || data
      if (customerId) {
        filteredRefunds = filteredRefunds.filter((refund: RefundRequest) => 
          refund.customer_id === customerId
        )
      }
      
      setRefunds(filteredRefunds)
    } catch (err) {
      console.error("Error fetching refunds:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des demandes de remboursement"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour approuver une demande de remboursement
  const approveRefund = async (transactionUid: string) => {
    try {
      setActionLoading(true)
      setActionMessage("")
      
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
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
      setActionMessage("Demande de remboursement approuvée avec succès")
      
      // Rafraîchir la liste
      await fetchRefunds()
      
    } catch (err) {
      console.error("Error approving refund:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'approbation"
      setError(errorMessage)
    } finally {
      setActionLoading(false)
    }
  }

  // Fonction pour rejeter une demande de remboursement
  const rejectRefund = async (transactionUid: string, reason: string) => {
    try {
      setActionLoading(true)
      setActionMessage("")
      
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
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
      setActionMessage("Demande de remboursement rejetée avec succès")
      
      // Rafraîchir la liste
      await fetchRefunds()
      
    } catch (err) {
      console.error("Error rejecting refund:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du rejet"
      setError(errorMessage)
    } finally {
      setActionLoading(false)
    }
  }

  // Fonction pour ouvrir le modal d'approbation
  const openApproveModal = (refund: RefundRequest) => {
    setSelectedRefund(refund)
    setIsApproveModalOpen(true)
  }

  // Fonction pour ouvrir le modal de rejet
  const openRejectModal = (refund: RefundRequest) => {
    setSelectedRefund(refund)
    setRejectionReason("")
    setIsRejectModalOpen(true)
  }

  // Charger les demandes au montage
  useEffect(() => {
    fetchRefunds()
  }, [customerId, pendingOnly])

  // Fonction pour gérer la recherche
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // Debounce search
    setTimeout(() => {
      fetchRefunds()
    }, 300)
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
                Demandes de Remboursement
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                {customerId ? `Client: ${customerId.slice(0, 8)}` : "Toutes les demandes"}
              </p>
            </div>
          </div>
        </div>

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
                  onClick={() => fetchRefunds()} 
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Réessayer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Recherche et filtres */}
        <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Input
                  placeholder="Rechercher par ID de transaction ou raison..."
                  className="rounded-xl border-slate-200 dark:border-neutral-700 h-12"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant={pendingOnly ? "default" : "outline"} 
                  className="rounded-xl h-12 px-4"
                  onClick={() => {
                    setPendingOnly(true)
                    fetchRefunds()
                  }}
                >
                  En Attente
                </Button>
                <Button 
                  variant={!pendingOnly ? "default" : "outline"} 
                  className="rounded-xl h-12 px-4"
                  onClick={() => {
                    setPendingOnly(false)
                    fetchRefunds()
                  }}
                >
                  Toutes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des demandes de remboursement */}
        <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
          <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
            <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-crimson-600" />
              Demandes de Remboursement
            </CardTitle>
            <CardDescription className="text-neutral-600 dark:text-neutral-400">
              {refunds.length} demande(s) trouvée(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-crimson-600" />
                <span className="ml-2 text-neutral-600 dark:text-neutral-400">Chargement des demandes...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center max-w-md">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-4">
                    <p className="text-red-800 dark:text-red-200 font-medium mb-2">⚠️ Erreur lors du chargement</p>
                    <p className="text-sm text-red-700 dark:text-red-300 break-words">{error}</p>
                  </div>
                  <Button 
                    onClick={() => fetchRefunds()} 
                    className="bg-crimson-600 hover:bg-crimson-700 text-white"
                  >
                    🔄 Réessayer
                  </Button>
                </div>
              </div>
            ) : refunds.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-400">Aucune demande de remboursement trouvée</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {refunds.map((refund) => (
                  <div key={refund.uid} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-slate-200 dark:bg-neutral-700 rounded-xl">
                        <AlertCircle className="h-6 w-6 text-crimson-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">
                          Demande #{refund.uid.slice(0, 8)}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Transaction: {refund.transaction_uid.slice(0, 8)}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Client: {refund.customer_id.slice(0, 8)}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className="bg-blue-100 text-blue-800">
                            {refund.amount.toLocaleString()} FCFA
                          </Badge>
                          <Badge className={
                            refund.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            refund.status === 'approved' ? 'bg-green-100 text-green-800' :
                            refund.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {refund.status === 'pending' ? 'En Attente' :
                             refund.status === 'approved' ? 'Approuvé' :
                             refund.status === 'rejected' ? 'Rejeté' : refund.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="text-right mr-4">
                        <div className="flex items-center space-x-2 text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(refund.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {refund.reason}
                        </p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {refund.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
                              onClick={() => openApproveModal(refund)}
                              disabled={actionLoading}
                            >
                              <CheckCircle className="h-3 w-3" />
                              Approuver
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              className="rounded-lg"
                              onClick={() => openRejectModal(refund)}
                              disabled={actionLoading}
                            >
                              <XCircle className="h-3 w-3" />
                              Rejeter
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal d'approbation */}
        <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-white flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Approuver la Demande
              </DialogTitle>
              <DialogDescription className="text-neutral-600 dark:text-neutral-400">
                Êtes-vous sûr de vouloir approuver cette demande de remboursement ?
              </DialogDescription>
            </DialogHeader>
            
            {selectedRefund && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl">
                  <p className="font-medium text-neutral-900 dark:text-white">
                    Demande #{selectedRefund.uid.slice(0, 8)}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Montant: {selectedRefund.amount.toLocaleString()} FCFA
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Raison: {selectedRefund.reason}
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsApproveModalOpen(false)}
                    className="rounded-xl"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => {
                      approveRefund(selectedRefund.transaction_uid)
                      setIsApproveModalOpen(false)
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

        {/* Modal de rejet */}
        <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-white flex items-center">
                <XCircle className="h-5 w-5 mr-2 text-red-600" />
                Rejeter la Demande
              </DialogTitle>
              <DialogDescription className="text-neutral-600 dark:text-neutral-400">
                Veuillez fournir une raison pour le rejet de cette demande
              </DialogDescription>
            </DialogHeader>
            
            {selectedRefund && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl">
                  <p className="font-medium text-neutral-900 dark:text-white">
                    Demande #{selectedRefund.uid.slice(0, 8)}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Montant: {selectedRefund.amount.toLocaleString()} FCFA
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Raison: {selectedRefund.reason}
                  </p>
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
                    onClick={() => setIsRejectModalOpen(false)}
                    className="rounded-xl"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => {
                      rejectRefund(selectedRefund.transaction_uid, rejectionReason)
                      setIsRejectModalOpen(false)
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
      </div>
    </DashboardLayout>
  )
}

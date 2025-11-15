"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Plus, ArrowLeft, Loader2, Send, Zap, CheckCircle, XCircle, Clock } from "lucide-react"
import { smartFetch } from "@/utils/auth"
import { useRouter } from "next/navigation"

// Interface pour les données de webhook
interface WebhookData {
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

// Interface pour la réponse de création de webhook
interface WebhookResponse {
  success: boolean
  message: string
  transaction_id?: string
  status?: string
  amount?: number
  phone?: string
}

export function WebhooksContent() {
  const router = useRouter()
  
  // États pour la gestion des données
  const [webhooks, setWebhooks] = useState<WebhookData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  
  // États pour le modal de création
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  
  // États pour le formulaire
  const [transactionId, setTransactionId] = useState("")
  const [status, setStatus] = useState("")
  const [amount, setAmount] = useState("")
  const [phone, setPhone] = useState("")
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalWebhooks, setTotalWebhooks] = useState(0)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  // Fonction pour récupérer les webhooks
  const fetchWebhooks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const params = new URLSearchParams()
      params.append('page', currentPage.toString())
      params.append('page_size', pageSize.toString())
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await smartFetch(`${baseUrl}/api/v2/admin/webhook-logs/?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      // Handle paginated response
      if (data.results && Array.isArray(data.results)) {
        setWebhooks(data.results)
        setTotalWebhooks(data.count || data.results.length)
        setTotalPages(Math.ceil((data.count || data.results.length) / pageSize))
      } else if (Array.isArray(data)) {
        setWebhooks(data)
        setTotalWebhooks(data.length)
        setTotalPages(Math.ceil(data.length / pageSize))
      } else {
        setWebhooks([])
        setTotalWebhooks(0)
        setTotalPages(0)
      }
    } catch (err) {
      console.error("Error fetching webhooks:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la récupération des webhooks"
      setError(errorMessage)
      setWebhooks([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch webhooks on mount and when dependencies change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchWebhooks()
    }, searchTerm ? 500 : 0) // Debounce search by 500ms

    return () => clearTimeout(timeoutId)
  }, [currentPage, searchTerm])

  // Fonction pour créer un webhook Wave
  const createWaveWebhook = async () => {
    try {
      setCreateLoading(true)
      setError(null)
      setSuccess(null)
      
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const payload = {
        transaction_id: transactionId,
        status: status,
        amount: parseInt(amount),
        phone: phone
      }

      const response = await smartFetch(`${baseUrl}/api/v2/webhooks/wave/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
        throw new Error(errorMessage)
      }

      const result: WebhookResponse = await response.json()
      setSuccess(result.message || "Webhook créé avec succès")
      
      // Fermer le modal et réinitialiser le formulaire
      setCreateModalOpen(false)
      resetForm()
      
      // Refresh webhooks list
      await fetchWebhooks()
      
    } catch (err) {
      console.error("Error creating webhook:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création du webhook"
      setError(errorMessage)
    } finally {
      setCreateLoading(false)
    }
  }

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    setTransactionId("")
    setStatus("")
    setAmount("")
    setPhone("")
  }

  // Fonction pour ouvrir le modal de création
  const openCreateModal = () => {
    resetForm()
    setCreateModalOpen(true)
  }

  // Fonction pour obtenir le badge de statut de traitement
  const getProcessingStatusBadge = (status: string | undefined) => {
    if (!status) {
      return <Badge variant="secondary" className="bg-slate-100 text-slate-800 hover:bg-slate-100 border-slate-200">N/A</Badge>
    }
    
    switch (status.toLowerCase()) {
      case "processed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Traité</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">En Attente</Badge>
      case "failed":
      case "error":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Échec</Badge>
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">En Cours</Badge>
      default:
        return <Badge variant="secondary" className="bg-slate-100 text-slate-800 hover:bg-slate-100 border-slate-200">{status}</Badge>
    }
  }

  // Fonction pour obtenir le badge de type de webhook
  const getWebhookTypeBadge = (type: string | undefined) => {
    if (!type) {
      return <Badge variant="outline">N/A</Badge>
    }
    
    switch (type.toLowerCase()) {
      case "incoming":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Entrant</Badge>
      case "outgoing":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200">Sortant</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  // Note: Filtering is now handled server-side via the search parameter
  // Keeping filteredWebhooks for backward compatibility with the UI
  const filteredWebhooks = webhooks

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
            Affichage de {((currentPage - 1) * pageSize) + 1} à {Math.min(currentPage * pageSize, totalWebhooks)} sur {totalWebhooks} webhooks
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
            <h1 className="text-3xl font-bold">Gestion des Webhooks</h1>
            <p className="text-muted-foreground">Consultez les logs des webhooks entrants et sortants</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {/* <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Créer un Webhook
          </Button> */}
        </div>
      </div>

      {/* Messages d'erreur et de succès */}
      {error && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Webhooks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWebhooks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Traités</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {webhooks.filter(w => w.processing_status && w.processing_status.toLowerCase() === 'processed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {webhooks.filter(w => w.processing_status && w.processing_status.toLowerCase() === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Échecs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {webhooks.filter(w => w.processing_status && (w.processing_status.toLowerCase() === 'failed' || w.processing_status.toLowerCase() === 'error')).length}
            </div>
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
                placeholder="Rechercher par référence transaction, opérateur ou statut..."
                className="pl-10 rounded-xl border-slate-200 dark:border-neutral-700 h-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle>Logs des Webhooks</CardTitle>
          <CardDescription>
            Liste des webhooks ({filteredWebhooks.length} au total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence Transaction</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Opérateur</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Code HTTP</TableHead>
                  <TableHead>Reçu le</TableHead>
                  <TableHead>Traité le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-neutral-400 mr-2" />
                        <p className="text-neutral-600 dark:text-neutral-400">Chargement...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredWebhooks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <Zap className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                          <p className="text-neutral-600 dark:text-neutral-400">Aucun webhook trouvé</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWebhooks.map((webhook) => (
                    <TableRow key={webhook.uid}>
                      <TableCell className="font-medium font-mono">
                        {webhook.transaction_reference || 'N/A'}
                      </TableCell>
                      <TableCell>{getWebhookTypeBadge(webhook.webhook_type)}</TableCell>
                      <TableCell className="font-medium">
                        <Badge variant="outline">{webhook.operator_code || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>{getProcessingStatusBadge(webhook.processing_status)}</TableCell>
                      <TableCell>
                        {webhook.http_status_code ? (
                          <Badge 
                            className={
                              webhook.http_status_code >= 200 && webhook.http_status_code < 300 
                                ? "bg-green-100 text-green-800" 
                                : webhook.http_status_code >= 400 
                                ? "bg-red-100 text-red-800" 
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {webhook.http_status_code}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {webhook.received_at ? new Date(webhook.received_at).toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {webhook.processed_at ? new Date(webhook.processed_at).toLocaleString() : '-'}
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

      {/* Modal de Création de Webhook */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-white flex items-center">
              <Zap className="h-5 w-5 mr-2 text-blue-600" />
              Créer un Webhook Wave
            </DialogTitle>
            <DialogDescription className="text-neutral-600 dark:text-neutral-400">
              Créez un nouveau webhook Wave avec les détails de la transaction
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="transactionId" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                ID de Transaction
              </Label>
              <Input
                id="transactionId"
                placeholder="wave-txn-123"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="rounded-xl border-slate-200 dark:border-neutral-700 mt-1"
              />
            </div>

            <div>
              <Label htmlFor="status" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Statut
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="rounded-xl border-slate-200 dark:border-neutral-700 mt-1">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="pending">En Attente</SelectItem>
                  <SelectItem value="failed">Échec</SelectItem>
                  <SelectItem value="processing">En Cours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Montant (FCFA)
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-xl border-slate-200 dark:border-neutral-700 mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Téléphone
              </Label>
              <Input
                id="phone"
                placeholder="+22997123456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl border-slate-200 dark:border-neutral-700 mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateModalOpen(false)}
              className="rounded-xl"
              disabled={createLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={createWaveWebhook}
              disabled={createLoading || !transactionId || !status || !amount || !phone}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              {createLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Créer le Webhook
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

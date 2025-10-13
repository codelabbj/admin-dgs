"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, User, CreditCard, Settings, Shield, Globe, Calendar, DollarSign, Loader2, AlertCircle } from "lucide-react"
import { smartFetch } from "@/utils/auth"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// Interface pour les données client détaillées
interface CustomerDetails {
  customer_id: string
  uid: string
  is_active: boolean
  webhook_url: string | null
  payin_fee_rate: string
  payout_fee_rate: string
  use_fixed_fees: boolean
  payin_fee_fixed: string | null
  payout_fee_fixed: string | null
  daily_payin_limit: string | null
  daily_payout_limit: string | null
  monthly_payin_limit: string | null
  monthly_payout_limit: string | null
  ip_whitelist: string[]
  require_ip_whitelist: boolean
  notes: string
  created_at: string
  grpc_info: {
  email: string
    entreprise_name: string
    phone: string
    is_verify: boolean
    is_block: boolean
  account_status: string
  }
  account: {
    balance: number
    total_payin: number
    total_payout: number
    total_fees_paid: number
  }
}

export default function CustomerDetails({ params }: { params: { id: string } }) {
  const router = useRouter()
  const customerId = params.id
  
  // États pour la gestion des données
  const [customer, setCustomer] = useState<CustomerDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  
  // États pour le formulaire d'édition
  const [editForm, setEditForm] = useState({
    is_active: false,
    webhook_url: "",
    payin_fee_rate: "",
    payout_fee_rate: "",
    use_fixed_fees: false,
    ip_whitelist: [] as string[],
    require_ip_whitelist: false,
    notes: ""
  })
  const [ipInput, setIpInput] = useState("")

  // Fonction pour récupérer les détails du client
  const fetchCustomerDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const response = await smartFetch(`${baseUrl}/api/v2/admin/customers-config/${customerId}/`)
      
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
      setCustomer(data)
      
      // Initialiser le formulaire d'édition
      setEditForm({
        is_active: data.is_active,
        webhook_url: data.webhook_url || "",
        payin_fee_rate: data.payin_fee_rate,
        payout_fee_rate: data.payout_fee_rate,
        use_fixed_fees: data.use_fixed_fees,
        ip_whitelist: data.ip_whitelist || [],
        require_ip_whitelist: data.require_ip_whitelist,
        notes: data.notes || ""
      })
    } catch (err) {
      console.error("Error fetching customer details:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des détails du client"
      setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

  // Fonction pour mettre à jour les informations du client
  const updateCustomer = async () => {
    try {
      setEditLoading(true)
      setError(null)

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const payload = {
        customer_id: customerId,
        is_active: editForm.is_active,
        webhook_url: editForm.webhook_url || null,
        payin_fee_rate: editForm.payin_fee_rate,
        payout_fee_rate: editForm.payout_fee_rate,
        use_fixed_fees: editForm.use_fixed_fees,
        ip_whitelist: editForm.ip_whitelist,
        require_ip_whitelist: editForm.require_ip_whitelist,
        notes: editForm.notes
      }

      const response = await smartFetch(`${baseUrl}/api/v2/admin/customers-config/${customerId}/config/`, {
        method: "PUT",
        body: JSON.stringify(payload)
      })

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
      setCustomer(data)
      setIsEditModalOpen(false)

    } catch (err) {
      console.error("Error updating customer:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      setError(errorMessage)
    } finally {
      setEditLoading(false)
    }
  }

  // Fonction pour ajouter une IP à la whitelist
  const addIpToWhitelist = () => {
    if (ipInput.trim() && !editForm.ip_whitelist.includes(ipInput.trim())) {
      setEditForm(prev => ({
        ...prev,
        ip_whitelist: [...prev.ip_whitelist, ipInput.trim()]
      }))
      setIpInput("")
    }
  }

  // Fonction pour supprimer une IP de la whitelist
  const removeIpFromWhitelist = (ip: string) => {
    setEditForm(prev => ({
      ...prev,
      ip_whitelist: prev.ip_whitelist.filter(i => i !== ip)
    }))
  }

  // Charger les détails du client au montage
  useEffect(() => {
    fetchCustomerDetails()
  }, [customerId])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-crimson-600" />
          <span className="ml-2 text-neutral-600 dark:text-neutral-400">Chargement des détails du client...</span>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-8">
          <div className="text-center max-w-md">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-4">
              <p className="text-red-800 dark:text-red-200 font-medium mb-2">⚠️ Erreur lors du chargement</p>
              <p className="text-sm text-red-700 dark:text-red-300 break-words">{error}</p>
            </div>
            <Button 
              onClick={fetchCustomerDetails} 
              className="bg-crimson-600 hover:bg-crimson-700 text-white"
            >
              🔄 Réessayer
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">Client non trouvé</p>
          </div>
        </div>
      </DashboardLayout>
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
                Détails du Client
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                ID: {customer.customer_id}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl"
            >
              <Settings className="h-4 w-4 mr-2" />
              Modifier
            </Button>
                </div>
              </div>

        {/* Informations générales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations du client */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                  <User className="h-5 w-5 mr-2 text-crimson-600" />
                  Informations du Client
                </CardTitle>
               </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">ID Client</label>
                    <p className="text-neutral-900 dark:text-white font-mono text-sm">{customer.customer_id}</p>
                 </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">UID</label>
                    <p className="text-neutral-900 dark:text-white font-mono text-sm">{customer.uid}</p>
                     </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Statut</label>
                    <div className="mt-1">
                      <Badge className={customer.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {customer.is_active ? "Actif" : "Inactif"}
                  </Badge>
                  </div>
              </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Date de création</label>
                    <p className="text-neutral-900 dark:text-white text-sm">
                      {new Date(customer.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
            </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Webhook URL</label>
                    <p className="text-neutral-900 dark:text-white text-sm break-all">
                      {customer.webhook_url || "Non configuré"}
                    </p>
                </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Notes</label>
                    <p className="text-neutral-900 dark:text-white text-sm whitespace-pre-wrap">
                      {customer.notes || "Aucune note"}
                    </p>
                  </div>
            </div>
          </CardContent>
        </Card>

            {/* Informations GRPC */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-crimson-600" />
                  Informations GRPC
                </CardTitle>
            </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Email</label>
                    <p className="text-neutral-900 dark:text-white text-sm">{customer.grpc_info?.email || "Non spécifié"}</p>
                </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Entreprise</label>
                    <p className="text-neutral-900 dark:text-white text-sm">
                      {customer.grpc_info?.entreprise_name || "Non spécifié"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Téléphone</label>
                    <p className="text-neutral-900 dark:text-white text-sm">
                      {customer.grpc_info?.phone || "Non spécifié"}
                    </p>
                  </div>
                   <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Statut du compte</label>
                    <div className="mt-1">
                      <Badge className={
                        customer.grpc_info?.account_status === 'VERIFY' ? "bg-green-100 text-green-800" :
                        customer.grpc_info?.account_status === 'PENDING' ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }>
                        {customer.grpc_info?.account_status || "Non spécifié"}
                      </Badge>
                   </div>
                 </div>
                   <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Vérifié</label>
                    <div className="mt-1">
                      <Badge className={customer.grpc_info?.is_verify ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {customer.grpc_info?.is_verify ? "Oui" : "Non"}
                      </Badge>
                   </div>
                 </div>
                   <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Bloqué</label>
                    <div className="mt-1">
                      <Badge className={customer.grpc_info?.is_block ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                        {customer.grpc_info?.is_block ? "Oui" : "Non"}
                      </Badge>
                   </div>
                 </div>
                   </div>
            </CardContent>
          </Card>

            {/* Configuration des frais */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-crimson-600" />
                  Configuration des Frais
                </CardTitle>
             </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Taux de frais Payin</label>
                    <p className="text-neutral-900 dark:text-white text-sm">{customer.payin_fee_rate}%</p>
                   </div>
                   <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Taux de frais Payout</label>
                    <p className="text-neutral-900 dark:text-white text-sm">{customer.payout_fee_rate}%</p>
                   </div>
                 <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Frais fixes Payin</label>
                    <p className="text-neutral-900 dark:text-white text-sm">
                      {customer.payin_fee_fixed || "Non configuré"}
                   </p>
                 </div>
                 <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Frais fixes Payout</label>
                    <p className="text-neutral-900 dark:text-white text-sm">
                      {customer.payout_fee_fixed || "Non configuré"}
                   </p>
                 </div>
                 <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Type de frais</label>
                    <div className="mt-1">
                      <Badge className={customer.use_fixed_fees ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}>
                        {customer.use_fixed_fees ? "Frais fixes" : "Frais variables"}
                     </Badge>
                   </div>
                 </div>
               </div>
              </CardContent>
            </Card>

            {/* Limites */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-crimson-600" />
                  Limites
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Limite quotidienne Payin</label>
                    <p className="text-neutral-900 dark:text-white text-sm">
                      {customer.daily_payin_limit || "Non configuré"}
                    </p>
                   </div>
                 <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Limite quotidienne Payout</label>
                    <p className="text-neutral-900 dark:text-white text-sm">
                      {customer.daily_payout_limit || "Non configuré"}
                    </p>
                   </div>
                   <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Limite mensuelle Payin</label>
                    <p className="text-neutral-900 dark:text-white text-sm">
                      {customer.monthly_payin_limit || "Non configuré"}
                    </p>
                   </div>
                   <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Limite mensuelle Payout</label>
                    <p className="text-neutral-900 dark:text-white text-sm">
                      {customer.monthly_payout_limit || "Non configuré"}
                    </p>
                   </div>
                 </div>
             </CardContent>
           </Card>

            {/* IP Whitelist */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-crimson-600" />
                  IP Whitelist
                </CardTitle>
           </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">IP Whitelist requise</label>
                    <div className="mt-1">
                      <Badge className={customer.require_ip_whitelist ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {customer.require_ip_whitelist ? "Oui" : "Non"}
                      </Badge>
                 </div>
               </div>
                             <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Adresses IP autorisées</label>
                    <div className="mt-2 space-y-2">
                      {customer.ip_whitelist.length === 0 ? (
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Aucune IP configurée</p>
                      ) : (
                        customer.ip_whitelist.map((ip, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                            <span className="text-neutral-900 dark:text-white font-mono text-sm">{ip}</span>
                               </div>
                        ))
                      )}
                               </div>
                             </div>
                             </div>
           </CardContent>
         </Card>
          </div>

          {/* Compte et statistiques */}
          <div className="space-y-6">
            {/* Informations du compte */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-crimson-600" />
                  Compte
             </CardTitle>
           </CardHeader>
              <CardContent className="p-6">
               <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Solde actuel</label>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                      {customer.account?.balance?.toLocaleString() || "0"} FCFA
                    </p>
                       </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Total Payin</label>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {customer.account?.total_payin?.toLocaleString() || "0"} FCFA
                    </p>
                       </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Total Payout</label>
                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {customer.account?.total_payout?.toLocaleString() || "0"} FCFA
                    </p>
                       </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Total des frais payés</label>
                    <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                      {customer.account?.total_fees_paid?.toLocaleString() || "0"} FCFA
                    </p>
                       </div>
                       </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white">
                  Actions Rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700"
                  onClick={() => router.push(`/customers/${customerId}/transactions`)}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Voir les Transactions
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700"
                  onClick={() => router.push(`/customers/${customerId}/permissions`)}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Gérer les Permissions
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700"
                  onClick={() => router.push(`/customers/${customerId}/refunds`)}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Demandes de Remboursement
                </Button>
              </CardContent>
            </Card>
                     </div>
                   </div>

        {/* Modal d'édition */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-white flex items-center">
                <Settings className="h-5 w-5 mr-2 text-crimson-600" />
                Modifier les Informations du Client
              </DialogTitle>
              <DialogDescription className="text-neutral-600 dark:text-neutral-400">
                Modifiez les informations de configuration de ce client
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Statut actif */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-slate-300 text-crimson-600 focus:ring-crimson-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Client actif
                </label>
                   </div>

              {/* Webhook URL */}
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                  Webhook URL
                </label>
                <Input
                  placeholder="https://example.com/webhook"
                  value={editForm.webhook_url}
                  onChange={(e) => setEditForm(prev => ({ ...prev, webhook_url: e.target.value }))}
                  className="rounded-xl border-slate-200 dark:border-neutral-700"
                />
                   </div>

              {/* Frais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                    Taux de frais Payin (%)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="1.50"
                    value={editForm.payin_fee_rate}
                    onChange={(e) => setEditForm(prev => ({ ...prev, payin_fee_rate: e.target.value }))}
                    className="rounded-xl border-slate-200 dark:border-neutral-700"
                  />
                       </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                    Taux de frais Payout (%)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="1.70"
                    value={editForm.payout_fee_rate}
                    onChange={(e) => setEditForm(prev => ({ ...prev, payout_fee_rate: e.target.value }))}
                    className="rounded-xl border-slate-200 dark:border-neutral-700"
                  />
                     </div>
                   </div>

              {/* Frais fixes */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="use_fixed_fees"
                  checked={editForm.use_fixed_fees}
                  onChange={(e) => setEditForm(prev => ({ ...prev, use_fixed_fees: e.target.checked }))}
                  className="rounded border-slate-300 text-crimson-600 focus:ring-crimson-500"
                />
                <label htmlFor="use_fixed_fees" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Utiliser des frais fixes
                </label>
               </div>

              {/* IP Whitelist */}
                 <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="require_ip_whitelist"
                    checked={editForm.require_ip_whitelist}
                    onChange={(e) => setEditForm(prev => ({ ...prev, require_ip_whitelist: e.target.checked }))}
                    className="rounded border-slate-300 text-crimson-600 focus:ring-crimson-500"
                  />
                  <label htmlFor="require_ip_whitelist" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    IP Whitelist requise
                  </label>
                         </div>

                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                    Adresses IP autorisées
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <Input
                      placeholder="192.168.1.1"
                      value={ipInput}
                      onChange={(e) => setIpInput(e.target.value)}
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                      onKeyPress={(e) => e.key === 'Enter' && addIpToWhitelist()}
                    />
                    <Button
                      onClick={addIpToWhitelist}
                      disabled={!ipInput.trim()}
                      className="bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl"
                    >
                      Ajouter
                    </Button>
                     </div>
                     <div className="space-y-2">
                    {editForm.ip_whitelist.map((ip, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                        <span className="text-neutral-900 dark:text-white font-mono text-sm">{ip}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeIpFromWhitelist(ip)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Supprimer
                        </Button>
                           </div>
                         ))}
                       </div>
                     </div>
                           </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                  Notes
                </label>
                <textarea
                  placeholder="Notes sur ce client..."
                  value={editForm.notes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 border border-slate-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                  rows={4}
                />
                       </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={editLoading}
                  className="rounded-xl"
                >
                  Annuler
                </Button>
                <Button
                  onClick={updateCustomer}
                  disabled={editLoading}
                  className="bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl"
                >
                  {editLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Mettre à jour
                    </>
                  )}
                </Button>
             </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
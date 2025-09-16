"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Users, TrendingUp, DollarSign, CreditCard, MapPin, Building, Globe, Phone, Mail, Calendar, Loader2, FileText, ExternalLink, ChevronLeft, ChevronRight, Percent, Edit, Save, X } from "lucide-react"
import { smartFetch } from "@/utils/auth"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

// Interface pour les données utilisateur
interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  country: string | null
  entreprise_name: string | null
  website: string | null
  logo: string | null
  otp: string | null
  otp_created_at: string | null
  ip_adress: string | null
  success_url: string | null
  cancel_url: string | null
  callback_url: string | null
  reason_for_rejection: string | null
  account_status: string
  customer_pay_fee: boolean
  created_at: string
  updated_at: string
  fullname: string
  is_active: boolean
  is_partner: boolean
  trade_commerce: string | null
  gerant_doc: string | null
  entreprise_number: string | null
  is_staff: boolean
  payin_fee: number | null
  payout_fee: number | null
  payin_fee_fixed: number | null
  payout_fee_fixed: number | null
  payout_fee_limite: number | null
  payin_fee_limite: number | null
  custome_fee: boolean
}

// Interface pour les statistiques utilisateur
interface UserStats {
  availavailable_fund: number
  all_operation_amount: number
  payment_methode: {
    [key: string]: number
  }
  country_payment: {
    [key: string]: number
  }
}

// Interface pour les transactions
interface Transaction {
  id: string
  amount: number
  currency: string
  status: string
  created_at: string
  reference: string
  network: string
  type_trans: string
  customer: {
    email: string
    username: string
  }
}

export default function UserDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const userId = params.id
  
  // États pour la gestion des données
  const [user, setUser] = useState<User | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  
  // États pour la mise à jour des frais
  const [isEditingFees, setIsEditingFees] = useState(false)
  const [feeFormData, setFeeFormData] = useState({
    payin_fee: '',
    payout_fee: '',
    payin_fee_fixed: '',
    payout_fee_fixed: '',
    payout_fee_limite: '',
    payin_fee_limite: ''
  })
  const [feeUpdateLoading, setFeeUpdateLoading] = useState(false)
  const [feeUpdateError, setFeeUpdateError] = useState<string | null>(null)
  const [feeUpdateSuccess, setFeeUpdateSuccess] = useState(false)

  // Fonction pour récupérer les détails de l'utilisateur
  const fetchUserDetails = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const response = await smartFetch(`${baseUrl}/v1/api/user-details?user_id=${userId}`)
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setUser(data)
    } catch (err) {
      console.error("Error fetching user details:", err)
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des détails utilisateur")
    }
  }

  // Fonction pour récupérer les statistiques de l'utilisateur
  const fetchUserStats = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const response = await smartFetch(`${baseUrl}/prod/v1/api/statistic?user_id=${userId}`)
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setUserStats(data)
    } catch (err) {
      console.error("Error fetching user stats:", err)
      // Ne pas définir d'erreur pour les stats car elles peuvent ne pas être disponibles
    }
  }

  // Fonction pour récupérer les transactions de l'utilisateur
  const fetchUserTransactions = async (page: number = 1) => {
    try {
      setTransactionsLoading(true)
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const response = await smartFetch(`${baseUrl}/prod/v1/api/transaction?user_id=${userId}&page=${page}&page_size=${pageSize}`)
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      // Gérer différentes structures de réponse
      if (Array.isArray(data)) {
        setTransactions(data)
        setTotalTransactions(data.length)
        setTotalPages(Math.ceil(data.length / pageSize))
      } else if (data && Array.isArray(data.data)) {
        setTransactions(data.data)
        setTotalTransactions(data.total || data.data.length)
        setTotalPages(data.total_pages || Math.ceil((data.total || data.data.length) / pageSize))
      } else if (data && Array.isArray(data.results)) {
        setTransactions(data.results)
        setTotalTransactions(data.count || data.results.length)
        setTotalPages(Math.ceil((data.count || data.results.length) / pageSize))
      } else {
        setTransactions([])
        setTotalTransactions(0)
        setTotalPages(0)
      }
    } catch (err) {
      console.error("Error fetching user transactions:", err)
      // Ne pas définir d'erreur pour les transactions car elles peuvent ne pas être disponibles
    } finally {
      setTransactionsLoading(false)
    }
  }

  // Charger toutes les données
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await Promise.all([
          fetchUserDetails(),
          fetchUserStats(),
          fetchUserTransactions(1)
        ])
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      loadData()
    }
  }, [userId])

  // Charger les transactions quand la page change
  useEffect(() => {
    if (userId) {
      fetchUserTransactions(currentPage)
    }
  }, [currentPage, userId])

  // Initialiser le formulaire de frais quand les données utilisateur sont chargées
  useEffect(() => {
    if (user) {
      initializeFeeForm()
    }
  }, [user])

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

  // Fonction pour obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "success":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Succès</Badge>
      case "pending":
      case "pening":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">En Attente</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Échec</Badge>
      case "expired":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200">Expiré</Badge>
      case "refund":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Remboursement</Badge>
      default:
        return <Badge variant="secondary" className="bg-slate-100 text-slate-800 hover:bg-slate-100 border-slate-200">{status}</Badge>
    }
  }

  // Fonction pour obtenir le badge de type de transaction
  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case "payin":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Entrée</Badge>
      case "payout":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Sortie</Badge>
      case "withdrawal":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200">Retrait</Badge>
      default:
        return <Badge variant="outline" className="capitalize">{type || "-"}</Badge>
    }
  }

  // Fonction pour ouvrir un document dans un nouvel onglet
  const openDocument = (url: string, title: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Fonction pour initialiser le formulaire de frais avec les données actuelles
  const initializeFeeForm = () => {
    if (user) {
      setFeeFormData({
        payin_fee: user.payin_fee?.toString() || '',
        payout_fee: user.payout_fee?.toString() || '',
        payin_fee_fixed: user.payin_fee_fixed?.toString() || '',
        payout_fee_fixed: user.payout_fee_fixed?.toString() || '',
        payout_fee_limite: user.payout_fee_limite?.toString() || '',
        payin_fee_limite: user.payin_fee_limite?.toString() || ''
      })
    }
  }

  // Fonction pour mettre à jour les frais du client
  const updateCustomerFees = async () => {
    try {
      setFeeUpdateLoading(true)
      setFeeUpdateError(null)
      setFeeUpdateSuccess(false)

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      // Préparer les données du payload
      const payload: any = {
        id: userId
      }

      // Convertir les valeurs vides en null et les autres en nombres
      const feeFields = ['payin_fee', 'payout_fee', 'payin_fee_fixed', 'payout_fee_fixed', 'payout_fee_limite', 'payin_fee_limite']
      
      feeFields.forEach(field => {
        const value = feeFormData[field as keyof typeof feeFormData]
        payload[field] = value === '' ? null : parseFloat(value)
      })

      // Déterminer si custome_fee doit être true ou false
      const hasAnyFeeValue = feeFields.some(field => {
        const value = feeFormData[field as keyof typeof feeFormData]
        return value !== '' && value !== null
      })
      
      payload.custome_fee = hasAnyFeeValue

      const response = await smartFetch(`${baseUrl}/v1/api/define-customer-fee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      // Mettre à jour les données utilisateur localement
      if (user) {
        setUser({
          ...user,
          payin_fee: payload.payin_fee,
          payout_fee: payload.payout_fee,
          payin_fee_fixed: payload.payin_fee_fixed,
          payout_fee_fixed: payload.payout_fee_fixed,
          payout_fee_limite: payload.payout_fee_limite,
          payin_fee_limite: payload.payin_fee_limite,
          custome_fee: payload.custome_fee
        })
      }

      setFeeUpdateSuccess(true)
      setIsEditingFees(false)
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => {
        setFeeUpdateSuccess(false)
      }, 3000)

    } catch (err) {
      console.error("Error updating customer fees:", err)
      setFeeUpdateError(err instanceof Error ? err.message : "Erreur lors de la mise à jour des frais")
    } finally {
      setFeeUpdateLoading(false)
    }
  }

  // Fonction pour annuler l'édition des frais
  const cancelFeeEdit = () => {
    setIsEditingFees(false)
    setFeeUpdateError(null)
    setFeeUpdateSuccess(false)
    initializeFeeForm()
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
            Affichage de {((currentPage - 1) * pageSize) + 1} à {Math.min(currentPage * pageSize, totalTransactions)} sur {totalTransactions} transactions
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Chargement des détails utilisateur...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Utilisateur non trouvé</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header avec bouton retour */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Détails de l'Utilisateur</h1>
            <p className="text-muted-foreground">Informations complètes sur {user.fullname}</p>
          </div>
        </div>

        {/* Informations utilisateur */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Personnelles</CardTitle>
            <CardDescription>Détails du profil utilisateur</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.logo || undefined} />
                <AvatarFallback className="bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-slate-300 text-xl">
                  {user.fullname.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white">
                  {user.fullname}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-lg">{user.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge 
                    className={`text-sm ${
                      user.account_status === 'verify' ? 'bg-emerald-100 text-emerald-800' :
                      user.account_status === 'active' ? 'bg-blue-100 text-blue-800' :
                      user.account_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.account_status === 'verify' ? 'Vérifié' : 
                     user.account_status === 'active' ? 'Actif' : 
                     user.account_status}
                  </Badge>
                  {user.is_partner && (
                    <Badge variant="outline" className="text-sm border-amber-200 text-amber-700">
                      Partenaire
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

         {/* Statistiques utilisateur */}
         {userStats && (
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <Card>
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-medium">Fonds Disponibles</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold text-green-600">
                   {(userStats.availavailable_fund || 0).toLocaleString()} FCFA
                 </div>
               </CardContent>
             </Card>
             <Card>
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-medium">Montant Total des Opérations</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold text-blue-600">
                   {(userStats.all_operation_amount || 0).toLocaleString()} FCFA
                 </div>
               </CardContent>
             </Card>
             <Card>
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-medium">Méthodes de Paiement</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="space-y-1">
                   {Object.entries(userStats.payment_methode || {}).map(([method, amount]) => (
                     <div key={method} className="flex justify-between text-sm">
                       <span className="capitalize">{method}:</span>
                       <span className="font-medium">{amount.toLocaleString()} FCFA</span>
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>
             <Card>
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-medium">Paiements par Pays</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="space-y-1">
                   {Object.entries(userStats.country_payment || {}).map(([country, amount]) => (
                     <div key={country} className="flex justify-between text-sm">
                       <span>{country}:</span>
                       <span className="font-medium">{amount.toLocaleString()} FCFA</span>
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>
           </div>
         )}

        {/* Informations sur les frais */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Percent className="h-5 w-5" />
                <span className="text-lg font-bold">Informations sur les Frais</span>
              </div>
              <div className="flex items-center space-x-2">
                {feeUpdateSuccess && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Frais mis à jour avec succès
                  </Badge>
                )}
                {!isEditingFees ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingFees(true)}
                    className="flex items-center space-x-1"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Modifier</span>
                  </Button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelFeeEdit}
                      className="flex items-center space-x-1"
                    >
                      <X className="h-4 w-4" />
                      <span>Annuler</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={updateCustomerFees}
                      disabled={feeUpdateLoading}
                      className="flex items-center space-x-1"
                    >
                      {feeUpdateLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span>Sauvegarder</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <CardDescription>
              Configuration des frais pour cet utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feeUpdateError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{feeUpdateError}</p>
                </div>
              )}

              {isEditingFees ? (
                // Formulaire d'édition des frais
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="payin_fee" className="text-sm font-medium">
                        Frais d'Entrée (%)
                      </Label>
                      <Input
                        id="payin_fee"
                        type="number"
                        step="0.01"
                        placeholder="Ex: 1.5"
                        value={feeFormData.payin_fee}
                        onChange={(e) => setFeeFormData(prev => ({ ...prev, payin_fee: e.target.value }))}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payout_fee" className="text-sm font-medium">
                        Frais de Sortie (%)
                      </Label>
                      <Input
                        id="payout_fee"
                        type="number"
                        step="0.01"
                        placeholder="Ex: 2.0"
                        value={feeFormData.payout_fee}
                        onChange={(e) => setFeeFormData(prev => ({ ...prev, payout_fee: e.target.value }))}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payin_fee_fixed" className="text-sm font-medium">
                        Frais Fixe Entrée (FCFA)
                      </Label>
                      <Input
                        id="payin_fee_fixed"
                        type="number"
                        step="0.01"
                        placeholder="Ex: 100"
                        value={feeFormData.payin_fee_fixed}
                        onChange={(e) => setFeeFormData(prev => ({ ...prev, payin_fee_fixed: e.target.value }))}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payout_fee_fixed" className="text-sm font-medium">
                        Frais Fixe Sortie (FCFA)
                      </Label>
                      <Input
                        id="payout_fee_fixed"
                        type="number"
                        step="0.01"
                        placeholder="Ex: 150"
                        value={feeFormData.payout_fee_fixed}
                        onChange={(e) => setFeeFormData(prev => ({ ...prev, payout_fee_fixed: e.target.value }))}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payin_fee_limite" className="text-sm font-medium">
                        Limite Frais Entrée (FCFA)
                      </Label>
                      <Input
                        id="payin_fee_limite"
                        type="number"
                        step="0.01"
                        placeholder="Ex: 1000"
                        value={feeFormData.payin_fee_limite}
                        onChange={(e) => setFeeFormData(prev => ({ ...prev, payin_fee_limite: e.target.value }))}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payout_fee_limite" className="text-sm font-medium">
                        Limite Frais Sortie (FCFA)
                      </Label>
                      <Input
                        id="payout_fee_limite"
                        type="number"
                        step="0.01"
                        placeholder="Ex: 2000"
                        value={feeFormData.payout_fee_limite}
                        onChange={(e) => setFeeFormData(prev => ({ ...prev, payout_fee_limite: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      <strong>Note:</strong> Laissez les champs vides pour définir la valeur à null. 
                      Si au moins un champ est rempli, les frais personnalisés seront activés.
                    </p>
                  </div>
                </div>
              ) : (
                // Affichage des frais actuels
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      className={`${
                        user.custome_fee 
                          ? 'bg-blue-100 text-blue-800 border-blue-200' 
                          : 'bg-green-100 text-green-800 border-green-200'
                      }`}
                    >
                      {user.custome_fee ? 'Frais Personnalisés' : 'Frais Standard'}
                    </Badge>
                  </div>
                  
                  {user.custome_fee ? (
                    // Afficher seulement payin_fee et payout_fee quand custome_fee est true
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user.payin_fee !== null && (
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-900">Frais d'Entrée</span>
                          </div>
                          <span className="font-bold text-blue-900">
                            {user.payin_fee}%
                          </span>
                        </div>
                      )}
                      {user.payout_fee !== null && (
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-900">Frais de Sortie</span>
                          </div>
                          <span className="font-bold text-green-900">
                            {user.payout_fee}%
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Afficher tous les frais non-null quand custome_fee est false
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {user.payin_fee !== null && (
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-900">Frais d'Entrée</span>
                          </div>
                          <span className="font-bold text-blue-900">
                            {user.payin_fee}%
                          </span>
                        </div>
                      )}
                      {user.payout_fee !== null && (
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-900">Frais de Sortie</span>
                          </div>
                          <span className="font-bold text-green-900">
                            {user.payout_fee}%
                          </span>
                        </div>
                      )}
                      {user.payin_fee_fixed !== null && (
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-purple-600" />
                            <span className="font-medium text-purple-900">Frais Fixe Entrée</span>
                          </div>
                          <span className="font-bold text-purple-900">
                            {user.payin_fee_fixed} FCFA
                          </span>
                        </div>
                      )}
                      {user.payout_fee_fixed !== null && (
                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-orange-600" />
                            <span className="font-medium text-orange-900">Frais Fixe Sortie</span>
                          </div>
                          <span className="font-bold text-orange-900">
                            {user.payout_fee_fixed} FCFA
                          </span>
                        </div>
                      )}
                      {user.payin_fee_limite !== null && (
                        <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="h-4 w-4 text-indigo-600" />
                            <span className="font-medium text-indigo-900">Limite Frais Entrée</span>
                          </div>
                          <span className="font-bold text-indigo-900">
                            {user.payin_fee_limite} FCFA
                          </span>
                        </div>
                      )}
                      {user.payout_fee_limite !== null && (
                        <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="h-4 w-4 text-pink-600" />
                            <span className="font-medium text-pink-900">Limite Frais Sortie</span>
                          </div>
                          <span className="font-bold text-pink-900">
                            {user.payout_fee_limite} FCFA
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {(!user.custome_fee && 
                    user.payin_fee === null && 
                    user.payout_fee === null && 
                    user.payin_fee_fixed === null && 
                    user.payout_fee_fixed === null && 
                    user.payin_fee_limite === null && 
                    user.payout_fee_limite === null) && (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">Aucun frais configuré</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Détails complets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              {user.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Téléphone</p>
                    <p className="text-sm text-muted-foreground">{user.phone}</p>
                  </div>
                </div>
              )}
              {user.country && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Pays</p>
                    <p className="text-sm text-muted-foreground">{user.country}</p>
                  </div>
                </div>
              )}
               {user.website && (
                 <div className="flex items-center space-x-3">
                   <Globe className="h-5 w-5 text-muted-foreground" />
                   <div>
                     <p className="text-sm font-medium">Site Web</p>
                     <p className="text-sm text-muted-foreground">{user.website}</p>
                   </div>
                 </div>
               )}
               {user.success_url && (
                 <div className="flex items-center space-x-3">
                   <Globe className="h-5 w-5 text-muted-foreground" />
                   <div>
                     <p className="text-sm font-medium">URL de Succès</p>
                     <p className="text-sm text-muted-foreground break-all">{user.success_url}</p>
                   </div>
                 </div>
               )}
               {user.cancel_url && (
                 <div className="flex items-center space-x-3">
                   <Globe className="h-5 w-5 text-muted-foreground" />
                   <div>
                     <p className="text-sm font-medium">URL d'Annulation</p>
                     <p className="text-sm text-muted-foreground break-all">{user.cancel_url}</p>
                   </div>
                 </div>
               )}
               {user.callback_url && (
                 <div className="flex items-center space-x-3">
                   <Globe className="h-5 w-5 text-muted-foreground" />
                   <div>
                     <p className="text-sm font-medium">URL de Callback</p>
                     <p className="text-sm text-muted-foreground break-all">{user.callback_url}</p>
                   </div>
                 </div>
               )}
               {user.ip_adress && (
                 <div className="flex items-center space-x-3">
                   <Globe className="h-5 w-5 text-muted-foreground" />
                   <div>
                     <p className="text-sm font-medium">Adresse IP</p>
                     <p className="text-sm text-muted-foreground font-mono">{user.ip_adress}</p>
                   </div>
                 </div>
               )}
            </CardContent>
          </Card>

           <Card>
             <CardHeader>
               <CardTitle>Informations Entreprise</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               {user.entreprise_name && (
                 <div className="flex items-center space-x-3">
                   <Building className="h-5 w-5 text-muted-foreground" />
                   <div>
                     <p className="text-sm font-medium">Nom de l'Entreprise</p>
                     <p className="text-sm text-muted-foreground">{user.entreprise_name}</p>
                   </div>
                 </div>
               )}
               {user.entreprise_number && (
                 <div className="flex items-center space-x-3">
                   <CreditCard className="h-5 w-5 text-muted-foreground" />
                   <div>
                     <p className="text-sm font-medium">Numéro d'Entreprise</p>
                     <p className="text-sm text-muted-foreground">{user.entreprise_number}</p>
                   </div>
                 </div>
               )}
               {user.trade_commerce && (
                 <div className="flex items-center space-x-3">
                   <FileText className="h-5 w-5 text-muted-foreground" />
                   <div className="flex-1">
                     <p className="text-sm font-medium">Document de Commerce</p>
                     <Button
                       variant="outline"
                       size="sm"
                       className="mt-1 text-xs"
                       onClick={() => {
                         if (user.trade_commerce) {
                           openDocument(user.trade_commerce, "Document de Commerce")
                         }
                       }}
                     >
                       <ExternalLink className="h-3 w-3 mr-1" />
                       Voir le Document
                     </Button>
                   </div>
                 </div>
               )}
               {user.gerant_doc && (
                 <div className="flex items-center space-x-3">
                   <FileText className="h-5 w-5 text-muted-foreground" />
                   <div className="flex-1">
                     <p className="text-sm font-medium">Document du Gérant</p>
                     <Button
                       variant="outline"
                       size="sm"
                       className="mt-1 text-xs"
                       onClick={() => {
                         if (user.gerant_doc) {
                           openDocument(user.gerant_doc, "Document du Gérant")
                         }
                       }}
                     >
                       <ExternalLink className="h-3 w-3 mr-1" />
                       Voir le Document
                     </Button>
                   </div>
                 </div>
               )}
               <div className="flex items-center space-x-3">
                 <Calendar className="h-5 w-5 text-muted-foreground" />
                 <div>
                   <p className="text-sm font-medium">Membre depuis</p>
                   <p className="text-sm text-muted-foreground">
                     {new Date(user.created_at).toLocaleDateString('fr-FR')}
                   </p>
                 </div>
               </div>
               <div className="flex items-center space-x-3">
                 <Calendar className="h-5 w-5 text-muted-foreground" />
                 <div>
                   <p className="text-sm font-medium">Dernière mise à jour</p>
                   <p className="text-sm text-muted-foreground">
                     {new Date(user.updated_at).toLocaleDateString('fr-FR')}
                   </p>
                 </div>
               </div>
               <div className="flex items-center space-x-3">
                 <Users className="h-5 w-5 text-muted-foreground" />
                 <div>
                   <p className="text-sm font-medium">Nom complet</p>
                   <p className="text-sm text-muted-foreground">
                     {user.first_name} {user.last_name}
                   </p>
                 </div>
               </div>
               <div className="flex items-center space-x-3">
                 <Users className="h-5 w-5 text-muted-foreground" />
                 <div>
                   <p className="text-sm font-medium">Statut d'activité</p>
                   <div className="flex items-center space-x-2 mt-1">
                     <Badge 
                       className={`text-xs ${
                         user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                       }`}
                     >
                       {user.is_active ? 'Actif' : 'Inactif'}
                     </Badge>
                   </div>
                 </div>
               </div>
               <div className="flex items-center space-x-3">
                 <DollarSign className="h-5 w-5 text-muted-foreground" />
                 <div>
                   <p className="text-sm font-medium">Client paye les frais</p>
                   <div className="flex items-center space-x-2 mt-1">
                     <Badge 
                       className={`text-xs ${
                         user.customer_pay_fee ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                       }`}
                     >
                       {user.customer_pay_fee ? 'Oui' : 'Non'}
                     </Badge>
                   </div>
                 </div>
               </div>
               <div className="flex items-center space-x-3">
                 <Users className="h-5 w-5 text-muted-foreground" />
                 <div>
                   <p className="text-sm font-medium">Statut du Compte</p>
                   <div className="flex items-center space-x-2 mt-1">
                     <Badge 
                       className={`text-xs ${
                         user.account_status === 'verify' ? 'bg-emerald-100 text-emerald-800' :
                         user.account_status === 'active' ? 'bg-blue-100 text-blue-800' :
                         user.account_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                         'bg-red-100 text-red-800'
                       }`}
                     >
                       {user.account_status === 'verify' ? 'Vérifié' : 
                        user.account_status === 'active' ? 'Actif' : 
                        user.account_status}
                     </Badge>
                     {user.is_staff && (
                       <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                         Staff
                       </Badge>
                     )}
                   </div>
                 </div>
               </div>
               {user.reason_for_rejection && (
                 <div className="flex items-center space-x-3">
                   <div className="h-5 w-5 text-red-500">⚠️</div>
                   <div>
                     <p className="text-sm font-medium text-red-600">Raison du Rejet</p>
                     <p className="text-sm text-red-500">{user.reason_for_rejection}</p>
                   </div>
                 </div>
               )}
               {user.otp && (
                 <div className="flex items-center space-x-3">
                   <div className="h-5 w-5 text-blue-500">🔐</div>
                   <div>
                     <p className="text-sm font-medium text-blue-600">Code OTP</p>
                     <p className="text-sm text-blue-500 font-mono">{user.otp}</p>
                     {user.otp_created_at && (
                       <p className="text-xs text-gray-500">
                         Créé le: {new Date(user.otp_created_at).toLocaleString('fr-FR')}
                       </p>
                     )}
                   </div>
                 </div>
               )}
             </CardContent>
           </Card>
        </div>

         {/* Liste des transactions */}
         <Card>
           <CardHeader>
             <CardTitle>Historique des Transactions</CardTitle>
             <CardDescription>Liste des transactions de cet utilisateur</CardDescription>
           </CardHeader>
           <CardContent>
             {transactionsLoading ? (
               <div className="flex items-center justify-center py-8">
                 <div className="flex items-center space-x-2">
                   <Loader2 className="h-5 w-5 animate-spin" />
                   <span>Chargement des transactions...</span>
                 </div>
               </div>
             ) : transactions.length === 0 ? (
               <div className="text-center py-8">
                 <p className="text-muted-foreground">Aucune transaction trouvée</p>
               </div>
             ) : (
               <>
                 <div className="rounded-md border">
                   <Table>
                     <TableHeader>
                       <TableRow>
                         <TableHead>ID Transaction</TableHead>
                         <TableHead>Date</TableHead>
                         <TableHead>Montant</TableHead>
                         <TableHead>Type</TableHead>
                         <TableHead>Méthode</TableHead>
                         <TableHead>Statut</TableHead>
                         <TableHead>Référence</TableHead>
                         <TableHead>Client</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {transactions.map((transaction) => (
                         <TableRow key={transaction.id}>
                           <TableCell className="font-medium">{transaction.id}</TableCell>
                           <TableCell>
                             <div>
                               <div className="font-medium">
                                 {new Date(transaction.created_at).toLocaleDateString('fr-FR')}
                               </div>
                               <div className="text-sm text-muted-foreground">
                                 {new Date(transaction.created_at).toLocaleTimeString('fr-FR')}
                               </div>
                             </div>
                           </TableCell>
                           <TableCell className="font-medium">
                             {transaction.amount?.toLocaleString?.() || transaction.amount || "-"} {transaction.currency || ""}
                           </TableCell>
                           <TableCell>
                             {getTransactionTypeBadge(transaction.type_trans)}
                           </TableCell>
                           <TableCell>{transaction.network || "-"}</TableCell>
                           <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                           <TableCell className="font-mono text-sm">{transaction.reference || "-"}</TableCell>
                           <TableCell>
                             <div className="space-y-1">
                               <div className="text-sm font-medium">{transaction.customer.email}</div>
                               <div className="text-xs text-muted-foreground">{transaction.customer.username}</div>
                             </div>
                           </TableCell>
                         </TableRow>
                       ))}
                     </TableBody>
                   </Table>
                 </div>
                 <PaginationComponent />
               </>
             )}
           </CardContent>
         </Card>

         {/* Complete API Data Summary */}
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center space-x-2">
               <FileText className="h-5 w-5" />
               <span>Résumé Complet des Données API</span>
             </CardTitle>
             <CardDescription>
               Toutes les données récupérées des APIs pour cet utilisateur
             </CardDescription>
           </CardHeader>
           <CardContent>
             <div className="space-y-6">
               {/* User Details API Data */}
               <div className="space-y-4">
                 <h4 className="font-semibold text-blue-900 dark:text-blue-100 border-b border-blue-200 pb-2">
                   Données Utilisateur (user-details API)
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   <div className="space-y-2">
                     <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Informations de Base</h5>
                     <div className="space-y-1 text-xs">
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">ID:</span>
                         <span className="font-mono">{user.id}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Email:</span>
                         <span className="font-medium">{user.email}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Prénom:</span>
                         <span className="font-medium">{user.first_name}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Nom:</span>
                         <span className="font-medium">{user.last_name}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Nom complet:</span>
                         <span className="font-medium">{user.fullname}</span>
                       </div>
                     </div>
                   </div>

                   <div className="space-y-2">
                     <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact & Localisation</h5>
                     <div className="space-y-1 text-xs">
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Téléphone:</span>
                         <span className="font-medium">{user.phone || "Non renseigné"}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Pays:</span>
                         <span className="font-medium">{user.country || "Non renseigné"}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Site web:</span>
                         <span className="font-medium">{user.website || "Non renseigné"}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Adresse IP:</span>
                         <span className="font-mono">{user.ip_adress || "Non renseigné"}</span>
                       </div>
                     </div>
                   </div>

                   <div className="space-y-2">
                     <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Statuts & Permissions</h5>
                     <div className="space-y-1 text-xs">
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Statut compte:</span>
                         <Badge className="text-xs">{user.account_status}</Badge>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Actif:</span>
                         <Badge className={`text-xs ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                           {user.is_active ? 'Oui' : 'Non'}
                         </Badge>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Partenaire:</span>
                         <Badge className={`text-xs ${user.is_partner ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                           {user.is_partner ? 'Oui' : 'Non'}
                         </Badge>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Staff:</span>
                         <Badge className={`text-xs ${user.is_staff ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                           {user.is_staff ? 'Oui' : 'Non'}
                         </Badge>
                       </div>
                     </div>
                   </div>

                   <div className="space-y-2">
                     <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Entreprise</h5>
                     <div className="space-y-1 text-xs">
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Nom entreprise:</span>
                         <span className="font-medium">{user.entreprise_name || "Non renseigné"}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Numéro entreprise:</span>
                         <span className="font-medium">{user.entreprise_number || "Non renseigné"}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Document commerce:</span>
                         <span className="font-medium">{user.trade_commerce ? "Disponible" : "Non renseigné"}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Document gérant:</span>
                         <span className="font-medium">{user.gerant_doc ? "Disponible" : "Non renseigné"}</span>
                       </div>
                     </div>
                   </div>

                   <div className="space-y-2">
                     <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">URLs & Callbacks</h5>
                     <div className="space-y-1 text-xs">
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">URL succès:</span>
                         <span className="font-medium">{user.success_url ? "Définie" : "Non définie"}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">URL annulation:</span>
                         <span className="font-medium">{user.cancel_url ? "Définie" : "Non définie"}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">URL callback:</span>
                         <span className="font-medium">{user.callback_url ? "Définie" : "Non définie"}</span>
                       </div>
                     </div>
                   </div>

                   <div className="space-y-2">
                     <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Frais & Configuration</h5>
                     <div className="space-y-1 text-xs">
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Client paye frais:</span>
                         <Badge className={`text-xs ${user.customer_pay_fee ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                           {user.customer_pay_fee ? 'Oui' : 'Non'}
                         </Badge>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Frais personnalisés:</span>
                         <Badge className={`text-xs ${user.custome_fee ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                           {user.custome_fee ? 'Oui' : 'Non'}
                         </Badge>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Frais entrée:</span>
                         <span className="font-medium">{user.payin_fee ? `${user.payin_fee}%` : "Non défini"}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Frais sortie:</span>
                         <span className="font-medium">{user.payout_fee ? `${user.payout_fee}%` : "Non défini"}</span>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

               {/* User Stats API Data */}
               {userStats && (
                 <div className="space-y-4">
                   <h4 className="font-semibold text-green-900 dark:text-green-100 border-b border-green-200 pb-2">
                     Statistiques Utilisateur (statistic API)
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Données Financières</h5>
                       <div className="space-y-1 text-xs">
                         <div className="flex justify-between">
                           <span className="text-gray-600 dark:text-gray-400">Fonds disponibles:</span>
                           <span className="font-medium">{(userStats.availavailable_fund || 0).toLocaleString()} FCFA</span>
                         </div>
                         <div className="flex justify-between">
                           <span className="text-gray-600 dark:text-gray-400">Montant opérations:</span>
                           <span className="font-medium">{(userStats.all_operation_amount || 0).toLocaleString()} FCFA</span>
                         </div>
                       </div>
                     </div>
                     <div className="space-y-2">
                       <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Méthodes de Paiement</h5>
                       <div className="space-y-1 text-xs">
                         {Object.entries(userStats.payment_methode || {}).map(([method, amount]) => (
                           <div key={method} className="flex justify-between">
                             <span className="text-gray-600 dark:text-gray-400">{method}:</span>
                             <span className="font-medium">{(amount || 0).toLocaleString()} FCFA</span>
                           </div>
                         ))}
                       </div>
                     </div>
                     <div className="space-y-2">
                       <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Paiements par Pays</h5>
                       <div className="space-y-1 text-xs">
                         {Object.entries(userStats.country_payment || {}).map(([country, amount]) => (
                           <div key={country} className="flex justify-between">
                             <span className="text-gray-600 dark:text-gray-400">{country}:</span>
                             <span className="font-medium">{(amount || 0).toLocaleString()} FCFA</span>
                           </div>
                         ))}
                       </div>
                     </div>
                   </div>
                 </div>
               )}

               {/* Transaction API Data */}
               {transactions.length > 0 && (
                 <div className="space-y-4">
                   <h4 className="font-semibold text-purple-900 dark:text-purple-100 border-b border-purple-200 pb-2">
                     Données Transactions (transaction API)
                   </h4>
                   <div className="space-y-2">
                     <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Résumé des Transactions</h5>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Total transactions:</span>
                         <span className="font-medium">{transactions.length}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Montant total:</span>
                         <span className="font-medium">
                           {transactions.reduce((sum, t) => sum + (t.amount || 0), 0).toLocaleString()} FCFA
                         </span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Types uniques:</span>
                         <span className="font-medium">
                           {[...new Set(transactions.map(t => t.type_trans))].length}
                         </span>
                       </div>
                     </div>
                   </div>
                 </div>
               )}
             </div>
           </CardContent>
         </Card>
      </div>
    </DashboardLayout>
  )
}

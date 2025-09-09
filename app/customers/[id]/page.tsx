"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Users, TrendingUp, DollarSign, CreditCard, MapPin, Building, Globe, Phone, Mail, Calendar, Loader2, FileText, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
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

  // Fonction pour ouvrir un document dans un nouvel onglet
  const openDocument = (url: string, title: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
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
                      user.account_status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                      user.account_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.account_status}
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
                 <Users className="h-5 w-5 text-muted-foreground" />
                 <div>
                   <p className="text-sm font-medium">Statut du Compte</p>
                   <div className="flex items-center space-x-2 mt-1">
                     <Badge 
                       className={`text-xs ${
                         user.account_status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                         user.account_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                         'bg-red-100 text-red-800'
                       }`}
                     >
                       {user.account_status}
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
                         <TableHead>Méthode</TableHead>
                         <TableHead>Statut</TableHead>
                         <TableHead>Référence</TableHead>
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
                           <TableCell>{transaction.network || "-"}</TableCell>
                           <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                           <TableCell className="font-mono text-sm">{transaction.reference || "-"}</TableCell>
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
      </div>
    </DashboardLayout>
  )
}

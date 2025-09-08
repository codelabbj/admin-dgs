"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Filter, Plus, Users, UserCheck, UserX, TrendingUp, MapPin, Building, Globe, Loader2, Shield } from "lucide-react"
import { smartFetch } from "@/utils/auth"
import { useState, useEffect, useCallback } from "react"

// Interface pour les données utilisateur de l'API
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
}

export default function Customers() {
  // États pour la gestion des données
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verificationMessage, setVerificationMessage] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalUser, setModalUser] = useState<User | null>(null)
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false)
  const [verificationUser, setVerificationUser] = useState<User | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<"approved" | "rejected">("approved")
  const [verificationReason, setVerificationReason] = useState("")

  // Fonction pour récupérer les utilisateurs depuis l'API
  const fetchUsers = async (query: string = "") => {
    try {
      setLoading(true)
      setError(null)
      
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const url = query ? `${baseUrl}/v1/api/users?q=${encodeURIComponent(query)}` : `${baseUrl}/v1/api/users`
      const response = await smartFetch(url)
      
      if (!response.ok) {
        // Essayer de récupérer le message d'erreur du backend
        try {
          const errorData = await response.json()
          const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
          throw new Error(errorMessage)
        } catch (parseError) {
          // Si on ne peut pas parser le JSON, utiliser le message par défaut
          throw new Error(`Erreur ${response.status}: ${response.statusText}`)
        }
      }

      const data = await response.json()
      setUsers(data)
    } catch (err) {
      console.error("Error fetching users:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des utilisateurs"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour récupérer les détails d'un utilisateur
  const fetchUserDetails = async (userId: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const response = await smartFetch(`${baseUrl}/v1/api/user-details`)
      
      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
        throw new Error(errorMessage)
      }

      const userDetails = await response.json()
      setSelectedUser(userDetails)
    } catch (err) {
      console.error("Error fetching user details:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des détails utilisateur"
      setError(errorMessage)
    }
  }

  // Fonction pour vérifier un compte utilisateur
  const verifyAccount = async (userId: string, status: "approved" | "rejected", reason?: string) => {
    try {
      setVerifying(true)
      setVerificationMessage("")
      
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const payload = {
        status: status,
        customer_id: userId,
        reason_for_block: reason || (status === "rejected" ? "BLOCK" : undefined)
      }

      const response = await smartFetch(`${baseUrl}/v1/api/verify-account`, {
        method: "POST",
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
        throw new Error(errorMessage)
      }

      const result = await response.json()
      setVerificationMessage(result.message || "Vérification effectuée avec succès")
      
      // Rafraîchir la liste des utilisateurs
      await fetchUsers(searchQuery)
      
    } catch (err) {
      console.error("Error verifying account:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la vérification"
      setError(errorMessage)
    } finally {
      setVerifying(false)
    }
  }

  // Fonction pour ouvrir le modal avec les détails d'un utilisateur
  const openUserDetailsModal = (user: User) => {
    setModalUser(user)
    setIsModalOpen(true)
  }

  // Fonction pour ouvrir le modal de vérification
  const openVerificationModal = (user: User) => {
    setVerificationUser(user)
    setVerificationStatus("approved")
    setVerificationReason("")
    setIsVerificationModalOpen(true)
  }

  // Fonction pour soumettre la vérification depuis le modal
  const submitVerificationFromModal = async () => {
    if (!verificationUser) return
    
    try {
      setVerifying(true)
      setVerificationMessage("")
      
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const payload = {
        status: verificationStatus,
        customer_id: verificationUser.id,
        reason_for_block: verificationReason || (verificationStatus === "rejected" ? "BLOCK" : undefined)
      }

      console.log("Verification payload:", payload)

      const response = await smartFetch(`${baseUrl}/v1/api/verify-account`, {
        method: "POST",
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
        throw new Error(errorMessage)
      }

      const result = await response.json()
      setVerificationMessage(result.message || "Vérification effectuée avec succès")
      
      // Fermer le modal et rafraîchir la liste
      setIsVerificationModalOpen(false)
      await fetchUsers(searchQuery)
      
    } catch (err) {
      console.error("Error verifying account:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la vérification"
      setError(errorMessage)
    } finally {
      setVerifying(false)
    }
  }

  // Charger les utilisateurs au montage du composant
  useEffect(() => {
    fetchUsers()
  }, [])

  // Fonction pour gérer la recherche avec debounce
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (query: string) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          fetchUsers(query)
        }, 300) // Attendre 300ms après la dernière frappe
      }
    })(),
    []
  )

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    debouncedSearch(query)
  }

  // Calculer les statistiques à partir des données réelles
  const calculateStats = () => {
    const totalUsers = users.length
    const activeUsers = users.filter(user => user.is_active).length
    const partners = users.filter(user => user.is_partner).length
    
    // Calculer les nouveaux utilisateurs ce mois-ci
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const newThisMonth = users.filter(user => {
      const createdDate = new Date(user.created_at)
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
    }).length

    return {
      totalUsers,
      activeUsers,
      newThisMonth,
      partners
    }
  }

  // Calculer les meilleures localisations
  const calculateTopLocations = () => {
    const countryCount: { [key: string]: number } = {}
    
    users.forEach(user => {
      const country = user.country || 'Non spécifié'
      if (country) {
        countryCount[country] = (countryCount[country] || 0) + 1
      }
    })

    const totalUsers = users.length
    return Object.entries(countryCount)
      .map(([country, count]) => ({
        country,
        customers: count,
        percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0
      }))
      .sort((a, b) => b.customers - a.customers)
      .slice(0, 5)
  }

  const stats = calculateStats()
  const topLocations = calculateTopLocations()

  // Statistiques des clients calculées dynamiquement
  const customerStats = [
    { label: "Total Clients", value: stats.totalUsers.toLocaleString(), change: "+12%", icon: Users, color: "blue" },
    { label: "Clients Actifs", value: stats.activeUsers.toLocaleString(), change: "+8%", icon: UserCheck, color: "green" },
    { label: "Nouveaux ce Mois", value: stats.newThisMonth.toLocaleString(), change: "+23%", icon: TrendingUp, color: "purple" },
    { label: "Partenaires", value: stats.partners.toLocaleString(), change: "+15%", icon: Building, color: "amber" },
  ]

  // Clients récents (les 4 plus récents)
  const recentCustomers = users
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4)
    .map(user => {
      const status = user.account_status === 'active' ? 'Actif' : 
                    user.account_status === 'pending' ? 'En Attente' : 
                    user.account_status === 'rejected' ? 'Rejeté' : 'Inactif'
      
      console.log(`User ${user.fullname} - account_status: ${user.account_status}, mapped status: ${status}`)
      
      return {
        id: user.id,
        name: user.fullname,
        email: user.email,
        status: status,
        location: user.country,
        type: user.is_partner ? "Partenaire" : "Standard",
        avatar: user.logo || "/placeholder-user.jpg",
        user: user // Ajouter l'objet user original
      }
    })

  return (
    <DashboardLayout>
      <div className="space-y-8">

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
                  onClick={() => fetchUsers(searchQuery)} 
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Réessayer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Affichage des messages de vérification */}
        {verificationMessage && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <span className="text-green-600 dark:text-green-400 text-xl">✅</span>
              </div>
              <div className="flex-1">
                <p className="text-green-800 dark:text-green-200 font-medium">Vérification réussie</p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">{verificationMessage}</p>
              </div>
              <div className="flex-shrink-0">
                <Button 
                  onClick={() => setVerificationMessage("")} 
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

        {/* En-tête Amélioré */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">Gestion des Clients</h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">Gérez et analysez votre base de clients</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button> */}
            <Button className="bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un Client
            </Button>
          </div>
        </div>

        {/* Statistiques des Clients */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            // Afficher des cartes de chargement pour les statistiques
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-lg rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-slate-200 dark:bg-neutral-700 rounded-xl animate-pulse">
                      <div className="h-6 w-6 bg-slate-300 dark:bg-neutral-600 rounded"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-8 w-16 bg-slate-200 dark:bg-neutral-700 rounded animate-pulse mb-2"></div>
                      <div className="h-4 w-20 bg-slate-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="h-6 w-12 bg-slate-200 dark:bg-neutral-700 rounded-full animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            // Afficher un message d'erreur pour les statistiques
            <div className="col-span-full">
              <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 rounded-2xl">
                <CardContent className="p-6 text-center">
                  <p className="text-red-600 dark:text-red-400">⚠️ Impossible de charger les statistiques</p>
                  <p className="text-sm text-red-500 dark:text-red-300 mt-1">{error}</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            customerStats.map((stat, index) => (
            <Card key={index} className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-3 bg-${stat.color}-600 rounded-xl shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{stat.label}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Badge className={`bg-${stat.color}-100 text-${stat.color}-800 hover:bg-${stat.color}-100 rounded-full text-xs`}>
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            ))
          )}
        </div>

        {/* Recherche et Filtres */}
        <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Rechercher des clients par nom, email ou localisation..."
                  className="pl-10 rounded-xl border-slate-200 dark:border-neutral-700 h-12"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700 h-12 px-6">
                <Filter className="h-4 w-4 mr-2" />
                Filtres Avancés
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Clients Récents */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                                  <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                    <Users className="h-5 w-5 mr-2 text-crimson-600" />
                    Clients Récents
                  </CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">
                    Dernières inscriptions et activités des clients
                  </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-crimson-600" />
                    <span className="ml-2 text-neutral-600 dark:text-neutral-400">Chargement des clients...</span>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center max-w-md">
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-4">
                        <p className="text-red-800 dark:text-red-200 font-medium mb-2">⚠️ Erreur lors du chargement</p>
                        <p className="text-sm text-red-700 dark:text-red-300 break-words">{error}</p>
                      </div>
                      <Button 
                        onClick={() => fetchUsers(searchQuery)} 
                        className="bg-crimson-600 hover:bg-crimson-700 text-white"
                      >
                        🔄 Réessayer
                      </Button>
                    </div>
                  </div>
                ) : recentCustomers.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Users className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                      <p className="text-neutral-600 dark:text-neutral-400">Aucun client trouvé</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentCustomers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={customer.avatar} />
                          <AvatarFallback className="bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-slate-300">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">{customer.name}</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">{customer.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                customer.type === 'Premium' ? 'border-amber-200 text-amber-700' : 'border-slate-200 text-slate-700'
                              }`}
                            >
                              {customer.type}
                            </Badge>
                            <Badge 
                              className={`text-xs ${
                                customer.status === 'Actif' ? 'bg-emerald-100 text-emerald-800' :
                                customer.status === 'En Attente' ? 'bg-yellow-100 text-yellow-800' :
                                customer.status === 'Rejeté' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {customer.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-right mr-4">
                          <div className="flex items-center space-x-2 text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                            <MapPin className="h-3 w-3" />
                            <span>{customer.location}</span>
                          </div>
                        </div>
                        
                        {/* Verification Actions */}
                        <div className="flex items-center space-x-2">
                          {customer.status === 'En Attente' && (
                            <>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
                                onClick={() => verifyAccount(customer.user.id, "approved")}
                                disabled={verifying}
                              >
                                {verifying ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserCheck className="h-3 w-3" />}
                                Approuver
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                className="rounded-lg"
                                onClick={() => verifyAccount(customer.user.id, "rejected")}
                                disabled={verifying}
                              >
                                {verifying ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserX className="h-3 w-3" />}
                                Rejeter
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                onClick={() => openVerificationModal(customer.user)}
                                disabled={verifying}
                              >
                                <Shield className="h-3 w-3" />
                                Vérifier
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-lg text-crimson-600 hover:text-crimson-700"
                            onClick={() => openUserDetailsModal(customer.user)}
                          >
                            Voir les Détails
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Aperçu des Clients */}
          <div className="space-y-6">
            {/* Meilleures Localisations */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                                  <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-crimson-600" />
                    Meilleures Localisations
                  </CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">
                    Répartition des clients par pays
                  </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {topLocations.map((location, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-slate-100 dark:bg-neutral-800 rounded-lg">
                          <MapPin className="h-4 w-4 text-crimson-600" />
                        </div>
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{location.country}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-20 bg-slate-200 dark:bg-neutral-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-crimson-500 to-crimson-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${location.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300 w-8">
                          {location.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions Rapides */}
            {/* <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white">Actions Rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <Users className="h-4 w-4 mr-2" />
                  Exporter la Liste des Clients
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Voir les Analyses
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Support Client
                </Button>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>

      {/* Modal pour les détails utilisateur */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-white">
              Détails du Client
            </DialogTitle>
            <DialogDescription className="text-neutral-600 dark:text-neutral-400">
              Informations complètes du profil client
            </DialogDescription>
          </DialogHeader>
          
          {modalUser && (
            <div className="space-y-6">
              {/* En-tête du profil */}
              <div className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={modalUser.logo || undefined} />
                  <AvatarFallback className="bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-slate-300 text-lg">
                    {modalUser.fullname.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {modalUser.fullname}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">{modalUser.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge 
                      className={`text-xs ${
                        modalUser.account_status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                        modalUser.account_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {modalUser.account_status}
                    </Badge>
                    {modalUser.is_partner && (
                      <Badge variant="outline" className="text-xs border-amber-200 text-amber-700">
                        Partenaire
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Informations personnelles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center">
                      <Users className="h-4 w-4 mr-2 text-crimson-600" />
                      Informations Personnelles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Prénom</label>
                      <p className="text-sm text-neutral-900 dark:text-white">{modalUser.first_name || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Nom</label>
                      <p className="text-sm text-neutral-900 dark:text-white">{modalUser.last_name || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Téléphone</label>
                      <p className="text-sm text-neutral-900 dark:text-white">{modalUser.phone || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Pays</label>
                      <p className="text-sm text-neutral-900 dark:text-white">{modalUser.country || 'Non spécifié'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center">
                      <Building className="h-4 w-4 mr-2 text-crimson-600" />
                      Informations Entreprise
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Nom de l'entreprise</label>
                      <p className="text-sm text-neutral-900 dark:text-white">{modalUser.entreprise_name || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Site web</label>
                      <p className="text-sm text-neutral-900 dark:text-white">
                        {modalUser.website ? (
                          <a href={modalUser.website} target="_blank" rel="noopener noreferrer" className="text-crimson-600 hover:text-crimson-700">
                            {modalUser.website}
                          </a>
                        ) : 'Non spécifié'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Numéro d'entreprise</label>
                      <p className="text-sm text-neutral-900 dark:text-white">{modalUser.entreprise_number || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Frais client</label>
                      <p className="text-sm text-neutral-900 dark:text-white">
                        {modalUser.customer_pay_fee ? 'Oui' : 'Non'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Informations système */}
              <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-crimson-600" />
                    Informations Système
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">ID Utilisateur</label>
                      <p className="text-sm text-neutral-900 dark:text-white font-mono">{modalUser.id}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Statut du compte</label>
                      <p className="text-sm text-neutral-900 dark:text-white">{modalUser.account_status}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Compte actif</label>
                      <p className="text-sm text-neutral-900 dark:text-white">{modalUser.is_active ? 'Oui' : 'Non'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Date de création</label>
                      <p className="text-sm text-neutral-900 dark:text-white">
                        {new Date(modalUser.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Dernière mise à jour</label>
                      <p className="text-sm text-neutral-900 dark:text-white">
                        {new Date(modalUser.updated_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {modalUser.reason_for_rejection && (
                      <div className="md:col-span-2">
                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Raison du rejet</label>
                        <p className="text-sm text-red-600 dark:text-red-400">{modalUser.reason_for_rejection}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de vérification */}
      <Dialog open={isVerificationModalOpen} onOpenChange={setIsVerificationModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-white flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              Vérification du Compte
            </DialogTitle>
            <DialogDescription className="text-neutral-600 dark:text-neutral-400">
              Vérifiez le compte utilisateur avec les détails personnalisés
            </DialogDescription>
          </DialogHeader>
          
          {verificationUser && (
            <div className="space-y-6">
              {/* Informations utilisateur */}
              <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={verificationUser.logo || undefined} />
                    <AvatarFallback className="bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-slate-300">
                      {verificationUser.fullname.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                      {verificationUser.fullname}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{verificationUser.email}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">ID: {verificationUser.id}</p>
                  </div>
                </div>
              </div>

              {/* Formulaire de vérification */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                    Statut de vérification
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="status"
                        value="approved"
                        checked={verificationStatus === "approved"}
                        onChange={(e) => setVerificationStatus(e.target.value as "approved" | "rejected")}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">Approuver</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="status"
                        value="rejected"
                        checked={verificationStatus === "rejected"}
                        onChange={(e) => setVerificationStatus(e.target.value as "approved" | "rejected")}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">Rejeter</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                    Raison (optionnel)
                  </label>
                  <Input
                    placeholder="Entrez une raison pour le rejet..."
                    value={verificationReason}
                    onChange={(e) => setVerificationReason(e.target.value)}
                    className="rounded-xl border-slate-200 dark:border-neutral-700"
                  />
                </div>
              </div>

              {/* Payload preview */}
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Payload à envoyer:
                </h4>
                <pre className="text-xs text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-900 p-3 rounded-lg overflow-x-auto">
{JSON.stringify({
  status: verificationStatus,
  customer_id: verificationUser.id,
  reason_for_block: verificationReason || (verificationStatus === "rejected" ? "BLOCK" : undefined)
}, null, 2)}
                </pre>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsVerificationModalOpen(false)}
                  disabled={verifying}
                  className="rounded-xl"
                >
                  Annuler
                </Button>
                <Button
                  onClick={submitVerificationFromModal}
                  disabled={verifying}
                  className={`rounded-xl ${
                    verificationStatus === "approved" 
                      ? "bg-green-600 hover:bg-green-700" 
                      : "bg-red-600 hover:bg-red-700"
                  } text-white`}
                >
                  {verifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      {verificationStatus === "approved" ? "Approuver" : "Rejeter"}
                    </>
                  )}
                </Button>
        </div>
      </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

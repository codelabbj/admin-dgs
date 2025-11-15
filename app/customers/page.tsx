
// import { DashboardLayout } from "@/components/dashboard-layout"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Input } from "@/components/ui/input"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { Search, Filter, Plus, Users, UserCheck, UserX, TrendingUp, MapPin, Building, Loader2, Shield, ChevronLeft, ChevronRight } from "lucide-react"
// import { smartFetch } from "@/utils/auth"
// import { useState, useEffect, useCallback } from "react"
// import { useRouter } from "next/navigation"

// // Interface pour les données client de l'API
// interface Customer {
//   customer_id: string
//   uid: string
//   is_active: boolean
//   webhook_url: string | null
//   payin_fee_rate: string
//   payout_fee_rate: string
//   use_fixed_fees: boolean
//   payin_fee_fixed: string | null
//   payout_fee_fixed: string | null
//   daily_payin_limit: string | null
//   daily_payout_limit: string | null
//   monthly_payin_limit: string | null
//   monthly_payout_limit: string | null
//   ip_whitelist: string[] | null
//   require_ip_whitelist: boolean
//   notes: string
//   created_at: string
// }

// interface CustomerPermission {
//   uid: string
//   customer_id: string
//   operator_config: string
//   operator_name: string
//   operator_code: string
//   is_active: boolean
//   activated_at: string
//   deactivated_at: string | null
//   notes: string
// }

// interface Operator {
//   uid: string
//   name: string
//   code: string
//   is_active: boolean
// }

// export default function Customers() {
//   const router = useRouter()
  
//   // États pour la gestion des données
//   const [customers, setCustomers] = useState<Customer[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [searchQuery, setSearchQuery] = useState("")
//   const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
//   const [isActiveFilter, setIsActiveFilter] = useState<string>("")
  
//   // États pour les modals
//   const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false)
//   const [isActivateModalOpen, setIsActivateModalOpen] = useState(false)
//   const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false)
//   const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false)
//   const [isUnfreezeModalOpen, setIsUnfreezeModalOpen] = useState(false)
//   const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false)
  
//   // États pour les actions
//   const [actionLoading, setActionLoading] = useState(false)
//   const [actionMessage, setActionMessage] = useState("")
//   const [selectedCustomerForAction, setSelectedCustomerForAction] = useState<Customer | null>(null)
  
//   // États pour les permissions
//   const [customerPermissions, setCustomerPermissions] = useState<CustomerPermission[]>([])
//   const [operators, setOperators] = useState<Operator[]>([])
//   const [selectedOperator, setSelectedOperator] = useState<string>("")
  
//   // États pour les formulaires
//   const [freezeReason, setFreezeReason] = useState("")
//   const [balanceAmount, setBalanceAmount] = useState("")
//   const [balanceType, setBalanceType] = useState<"credit" | "debit">("credit")
//   const [balanceReason, setBalanceReason] = useState("")
  
//   // États pour la pagination
//   const [currentPage, setCurrentPage] = useState(1)
//   const [pageSize] = useState(10)
//   const [totalPages, setTotalPages] = useState(0)
//   const [totalCustomers, setTotalCustomers] = useState(0)

//   // Fonction pour récupérer les clients depuis l'API
//   const fetchCustomers = async (query: string = "", page: number = 1, isActive: string = "") => {
//     try {
//       setLoading(true)
//       setError(null)
      
//       const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
//       if (!baseUrl) {
//         throw new Error("Base URL not configured")
//       }

//       // Construire l'URL avec les paramètres de pagination et de recherche
//       const params = new URLSearchParams()
//       if (query) {
//         params.append('search', query)
//       }
//       if (isActive) {
//         params.append('is_active', isActive)
//       }
//       params.append('page', page.toString())
//       params.append('page_size', pageSize.toString())
      
//       const url = `${baseUrl}/api/v2/admin/customers-config/?${params.toString()}`
//       const response = await smartFetch(url)
      
//       if (!response.ok) {
//         try {
//           const errorData = await response.json()
//           const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
//           throw new Error(errorMessage)
//         } catch (parseError) {
//           throw new Error(`Erreur ${response.status}: ${response.statusText}`)
//         }
//       }

//       const data = await response.json()
      
//       if (data && Array.isArray(data.results)) {
//         setCustomers(data.results)
//         setTotalCustomers(data.count || data.results.length)
//         setTotalPages(Math.ceil((data.count || data.results.length) / pageSize))
//       } else {
//         setCustomers([])
//         setTotalCustomers(0)
//         setTotalPages(0)
//       }
//     } catch (err) {
//       console.error("Error fetching customers:", err)
//       const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des clients"
//       setError(errorMessage)
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Fonction pour récupérer les permissions d'un client
//   const fetchCustomerPermissions = async (customerId: string) => {
//     try {
//       const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
//       if (!baseUrl) {
//         throw new Error("Base URL not configured")
//       }

//       const response = await smartFetch(`${baseUrl}/api/v2/admin/customers-config/${customerId}/permissions/`)
      
//       if (!response.ok) {
//         const errorData = await response.json()
//         const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
//         throw new Error(errorMessage)
//       }

//       const permissions = await response.json()
//       setCustomerPermissions(permissions)
//     } catch (err) {
//       console.error("Error fetching customer permissions:", err)
//       const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des permissions"
//       setError(errorMessage)
//     }
//   }

//   // Fonction pour récupérer les opérateurs
//   const fetchOperators = async () => {
//     try {
//       const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
//       if (!baseUrl) {
//         throw new Error("Base URL not configured")
//       }

//       const response = await smartFetch(`${baseUrl}/api/v2/admin/operators/`)
      
//       if (!response.ok) {
//         const errorData = await response.json()
//         const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
//         throw new Error(errorMessage)
//       }

//       const operatorsData = await response.json()
//       setOperators(operatorsData.results || operatorsData)
//     } catch (err) {
//       console.error("Error fetching operators:", err)
//       const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des opérateurs"
//       setError(errorMessage)
//     }
//   }

//   // Fonction pour activer un client
//   const activateCustomer = async (customerId: string) => {
//     try {
//       setActionLoading(true)
//       setActionMessage("")
      
//       const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
//       if (!baseUrl) {
//         throw new Error("Base URL not configured")
//       }

//       const response = await smartFetch(`${baseUrl}/api/v2/admin/customers-config/${customerId}/activate/`, {
//         method: "POST"
//       })
      
//       if (!response.ok) {
//         const errorData = await response.json()
//         const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
//         throw new Error(errorMessage)
//       }

//       const result = await response.json()
//       setActionMessage(result.message || "Client activé avec succès")
      
//       // Rafraîchir la liste des clients
//       await fetchCustomers(searchQuery, currentPage, isActiveFilter)
      
//     } catch (err) {
//       console.error("Error activating customer:", err)
//       const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'activation"
//       setError(errorMessage)
//     } finally {
//       setActionLoading(false)
//     }
//   }

//   // Fonction pour désactiver un client
//   const deactivateCustomer = async (customerId: string) => {
//     try {
//       setActionLoading(true)
//       setActionMessage("")
      
//       const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
//       if (!baseUrl) {
//         throw new Error("Base URL not configured")
//       }

//       const response = await smartFetch(`${baseUrl}/api/v2/admin/customers-config/${customerId}/deactivate/`, {
//         method: "DELETE"
//       })
      
//       if (!response.ok) {
//         const errorData = await response.json()
//         const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
//         throw new Error(errorMessage)
//       }

//       const result = await response.json()
//       setActionMessage(result.message || "Client désactivé avec succès")
      
//       // Rafraîchir la liste des clients
//       await fetchCustomers(searchQuery, currentPage, isActiveFilter)
      
//     } catch (err) {
//       console.error("Error deactivating customer:", err)
//       const errorMessage = err instanceof Error ? err.message : "Erreur lors de la désactivation"
//       setError(errorMessage)
//     } finally {
//       setActionLoading(false)
//     }
//   }

//   // Fonction pour geler un compte
//   const freezeAccount = async (customerId: string, reason: string) => {
//     try {
//       setActionLoading(true)
//       setActionMessage("")
      
//       const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
//       if (!baseUrl) {
//         throw new Error("Base URL not configured")
//       }

//       const response = await smartFetch(`${baseUrl}/api/v2/admin/customers-config/${customerId}/freeze/`, {
//         method: "POST",
//         body: JSON.stringify({ reason })
//       })
      
//       if (!response.ok) {
//         const errorData = await response.json()
//         const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
//         throw new Error(errorMessage)
//       }

//       const result = await response.json()
//       setActionMessage(result.message || "Compte gelé avec succès")
      
//       // Rafraîchir la liste des clients
//       await fetchCustomers(searchQuery, currentPage, isActiveFilter)
      
//     } catch (err) {
//       console.error("Error freezing account:", err)
//       const errorMessage = err instanceof Error ? err.message : "Erreur lors du gel du compte"
//       setError(errorMessage)
//     } finally {
//       setActionLoading(false)
//     }
//   }

//   // Fonction pour dégeler un compte
//   const unfreezeAccount = async (customerId: string) => {
//     try {
//       setActionLoading(true)
//       setActionMessage("")
      
//       const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
//       if (!baseUrl) {
//         throw new Error("Base URL not configured")
//       }

//       const response = await smartFetch(`${baseUrl}/api/v2/admin/customers-config/${customerId}/unfreeze/`, {
//         method: "POST"
//       })
      
//       if (!response.ok) {
//         const errorData = await response.json()
//         const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
//         throw new Error(errorMessage)
//       }

//       const result = await response.json()
//       setActionMessage(result.message || "Compte dégelé avec succès")
      
//       // Rafraîchir la liste des clients
//       await fetchCustomers(searchQuery, currentPage, isActiveFilter)
      
//     } catch (err) {
//       console.error("Error unfreezing account:", err)
//       const errorMessage = err instanceof Error ? err.message : "Erreur lors du dégel du compte"
//       setError(errorMessage)
//     } finally {
//       setActionLoading(false)
//     }
//   }

//   // Fonction pour ajuster le solde
//   const adjustBalance = async (customerId: string, amount: string, type: "credit" | "debit", reason: string) => {
//     try {
//       setActionLoading(true)
//       setActionMessage("")
      
//       const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
//       if (!baseUrl) {
//         throw new Error("Base URL not configured")
//       }

//       const response = await smartFetch(`${baseUrl}/api/v2/admin/customers-config/${customerId}/adjust-balance/`, {
//         method: "POST",
//         body: JSON.stringify({ 
//           amount: parseInt(amount), 
//           type, 
//           reason 
//         })
//       })
      
//       if (!response.ok) {
//         const errorData = await response.json()
//         const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
//         throw new Error(errorMessage)
//       }

//       const result = await response.json()
//       setActionMessage(result.message || "Solde ajusté avec succès")
      
//       // Rafraîchir la liste des clients
//       await fetchCustomers(searchQuery, currentPage, isActiveFilter)
      
//     } catch (err) {
//       console.error("Error adjusting balance:", err)
//       const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'ajustement du solde"
//       setError(errorMessage)
//     } finally {
//       setActionLoading(false)
//     }
//   }

//   // Fonction pour accorder une permission
//   const grantPermission = async (customerId: string, operatorUid: string) => {
//     try {
//       setActionLoading(true)
//       setActionMessage("")
      
//       const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
//       if (!baseUrl) {
//         throw new Error("Base URL not configured")
//       }

//       const response = await smartFetch(`${baseUrl}/api/v2/admin/customers/${customerId}/permissions/`, {
//         method: "POST",
//         body: JSON.stringify({ operator_uid: operatorUid })
//       })
      
//       if (!response.ok) {
//         const errorData = await response.json()
//         const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
//         throw new Error(errorMessage)
//       }

//       const result = await response.json()
//       setActionMessage("Permission accordée avec succès")
      
//       // Rafraîchir les permissions
//       await fetchCustomerPermissions(customerId)
      
//     } catch (err) {
//       console.error("Error granting permission:", err)
//       const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'octroi de permission"
//       setError(errorMessage)
//     } finally {
//       setActionLoading(false)
//     }
//   }

//   // Fonction pour révoquer une permission
//   const revokePermission = async (permissionUid: string) => {
//     try {
//       setActionLoading(true)
//       setActionMessage("")
      
//       const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
//       if (!baseUrl) {
//         throw new Error("Base URL not configured")
//       }

//       const response = await smartFetch(`${baseUrl}/api/v2/admin/permissions/${permissionUid}/`, {
//         method: "DELETE"
//       })
      
//       if (!response.ok) {
//         const errorData = await response.json()
//         const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
//         throw new Error(errorMessage)
//       }

//       const result = await response.json()
//       setActionMessage(result.message || "Permission révoquée avec succès")
      
//       // Rafraîchir les permissions si un client est sélectionné
//       if (selectedCustomerForAction) {
//         await fetchCustomerPermissions(selectedCustomerForAction.customer_id)
//       }
      
//     } catch (err) {
//       console.error("Error revoking permission:", err)
//       const errorMessage = err instanceof Error ? err.message : "Erreur lors de la révocation de permission"
//       setError(errorMessage)
//     } finally {
//       setActionLoading(false)
//     }
//   }


//   // Fonction pour ouvrir le modal des permissions
//   const openPermissionsModal = async (customer: Customer) => {
//     setSelectedCustomerForAction(customer)
//     await fetchCustomerPermissions(customer.customer_id)
//     await fetchOperators()
//     setIsPermissionsModalOpen(true)
//   }

//   // Fonction pour ouvrir le modal d'activation
//   const openActivateModal = (customer: Customer) => {
//     setSelectedCustomerForAction(customer)
//     setIsActivateModalOpen(true)
//   }

//   // Fonction pour ouvrir le modal de désactivation
//   const openDeactivateModal = (customer: Customer) => {
//     setSelectedCustomerForAction(customer)
//     setIsDeactivateModalOpen(true)
//   }

//   // Fonction pour ouvrir le modal de gel
//   const openFreezeModal = (customer: Customer) => {
//     setSelectedCustomerForAction(customer)
//     setFreezeReason("")
//     setIsFreezeModalOpen(true)
//   }

//   // Fonction pour ouvrir le modal de dégel
//   const openUnfreezeModal = (customer: Customer) => {
//     setSelectedCustomerForAction(customer)
//     setIsUnfreezeModalOpen(true)
//   }

//   // Fonction pour ouvrir le modal d'ajustement de solde
//   const openBalanceModal = (customer: Customer) => {
//     setSelectedCustomerForAction(customer)
//     setBalanceAmount("")
//     setBalanceType("credit")
//     setBalanceReason("")
//     setIsBalanceModalOpen(true)
//   }

//   // Charger les clients au montage du composant
//   useEffect(() => {
//     fetchCustomers("", 1, "")
//   }, [])

//   // Charger les clients quand la page change
//   useEffect(() => {
//     fetchCustomers(searchQuery, currentPage, isActiveFilter)
//   }, [currentPage])

//   // Fonction pour gérer la recherche avec debounce
//   const debouncedSearch = useCallback(
//     (() => {
//       let timeoutId: NodeJS.Timeout
//       return (query: string) => {
//         clearTimeout(timeoutId)
//         timeoutId = setTimeout(() => {
//           fetchCustomers(query, 1, isActiveFilter) // Reset to first page when searching
//         }, 300) // Attendre 300ms après la dernière frappe
//       }
//     })(),
//     [isActiveFilter]
//   )

//   const handleSearch = (query: string) => {
//     setSearchQuery(query)
//     setCurrentPage(1) // Reset to first page when searching
//     debouncedSearch(query)
//   }

//   const handleActiveFilter = (filter: string) => {
//     setIsActiveFilter(filter)
//     setCurrentPage(1)
//     fetchCustomers(searchQuery, 1, filter)
//   }

//   // Fonctions de pagination
//   const handlePageChange = (page: number) => {
//     setCurrentPage(page)
//   }

//   const handlePreviousPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1)
//     }
//   }

//   const handleNextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage(currentPage + 1)
//     }
//   }

//   // Composant de pagination
//   const PaginationComponent = () => {
//     if (totalPages <= 1) return null

//     const getPageNumbers = () => {
//       const pages = []
//       const maxVisiblePages = 5
//       let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
//       let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

//       if (endPage - startPage + 1 < maxVisiblePages) {
//         startPage = Math.max(1, endPage - maxVisiblePages + 1)
//       }

//       for (let i = startPage; i <= endPage; i++) {
//         pages.push(i)
//       }
//       return pages
//     }

//     return (
//       <div className="flex items-center justify-between px-2 py-4">
//         <div className="flex items-center text-sm text-muted-foreground">
//           <span>
//             Affichage de {((currentPage - 1) * pageSize) + 1} à {Math.min(currentPage * pageSize, totalCustomers)} sur {totalCustomers} clients
//           </span>
//         </div>
        
//         <div className="flex items-center space-x-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={handlePreviousPage}
//             disabled={currentPage === 1}
//             className="h-8 w-8 p-0"
//           >
//             <ChevronLeft className="h-4 w-4" />
//           </Button>
          
//           {getPageNumbers().map((page) => (
//             <Button
//               key={page}
//               variant={currentPage === page ? "default" : "outline"}
//               size="sm"
//               onClick={() => handlePageChange(page)}
//               className="h-8 w-8 p-0"
//             >
//               {page}
//             </Button>
//           ))}
          
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={handleNextPage}
//             disabled={currentPage === totalPages}
//             className="h-8 w-8 p-0"
//           >
//             <ChevronRight className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>
//     )
//   }

//   // Calculer les statistiques à partir des données réelles
//   const calculateStats = () => {
//     const totalCustomers = customers.length
//     const activeCustomers = customers.filter(customer => customer.is_active).length
    
//     // Calculer les nouveaux clients ce mois-ci
//     const currentMonth = new Date().getMonth()
//     const currentYear = new Date().getFullYear()
//     const newThisMonth = customers.filter(customer => {
//       const createdDate = new Date(customer.created_at)
//       return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
//     }).length

//     // Calculer les clients avec IP whitelist
//     const withWhitelist = customers.filter(customer => customer.require_ip_whitelist).length

//     return {
//       totalCustomers,
//       activeCustomers,
//       newThisMonth,
//       withWhitelist
//     }
//   }

//   const stats = calculateStats()

//   // Statistiques des clients calculées dynamiquement
//   const customerStats = [
//     { label: "Total Clients", value: stats.totalCustomers.toLocaleString(), change: "+12%", icon: Users, color: "blue" },
//     { label: "Clients Actifs", value: stats.activeCustomers.toLocaleString(), change: "+8%", icon: UserCheck, color: "green" },
//     { label: "Nouveaux ce Mois", value: stats.newThisMonth.toLocaleString(), change: "+23%", icon: TrendingUp, color: "purple" },
//     { label: "Avec IP Whitelist", value: stats.withWhitelist.toLocaleString(), change: "+15%", icon: Shield, color: "amber" },
//   ]

//   // Tous les clients (les clients sont déjà paginés par l'API)
//   // Le state 'customers' contient déjà les résultats de la page courante
//   const allCustomers = customers
//     .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
//     .map(customer => {
//       const status = customer.is_active ? 'Actif' : 'Inactif'
      
//       return {
//         id: customer.customer_id,
//         uid: customer.uid,
//         name: `Client ${customer.customer_id.slice(0, 8)}`,
//         email: customer.webhook_url || "N/A",
//         status: status,
//         location: customer.ip_whitelist && Array.isArray(customer.ip_whitelist) && customer.ip_whitelist.length > 0 ? `${customer.ip_whitelist.length} IPs` : "Aucune IP",
//         type: customer.use_fixed_fees ? "Frais Fixes" : "Frais Variables",
//         avatar: "/placeholder-user.jpg",
//         customer: customer // Ajouter l'objet customer original
//       }
//     })

//   return (
//     <DashboardLayout>
//       <div className="space-y-8">

//         {/* Affichage des erreurs globales */}
//         {error && (
//           <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
//             <div className="flex items-center space-x-3">
//               <div className="flex-shrink-0">
//                 <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
//               </div>
//               <div className="flex-1">
//                 <p className="text-red-800 dark:text-red-200 font-medium">Erreur de chargement des données</p>
//                 <p className="text-sm text-red-700 dark:text-red-300 mt-1 break-words">{error}</p>
//               </div>
//               <div className="flex-shrink-0">
//                 <Button 
//                   onClick={() => fetchCustomers(searchQuery, currentPage, isActiveFilter)} 
//                   size="sm"
//                   className="bg-red-600 hover:bg-red-700 text-white"
//                 >
//                   Réessayer
//                 </Button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Affichage des messages d'action */}
//         {actionMessage && (
//           <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
//             <div className="flex items-center space-x-3">
//               <div className="flex-shrink-0">
//                 <span className="text-green-600 dark:text-green-400 text-xl">✅</span>
//               </div>
//               <div className="flex-1">
//                 <p className="text-green-800 dark:text-green-200 font-medium">Action réussie</p>
//                 <p className="text-sm text-green-700 dark:text-green-300 mt-1">{actionMessage}</p>
//               </div>
//               <div className="flex-shrink-0">
//                 <Button 
//                   onClick={() => setActionMessage("")} 
//                   size="sm"
//                   variant="outline"
//                   className="border-green-200 text-green-800 hover:bg-green-100"
//                 >
//                   Fermer
//                 </Button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* En-tête Amélioré */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">Gestion des Clients</h1>
//             <p className="text-neutral-600 dark:text-neutral-400 text-lg">Gérez et analysez votre base de clients</p>
//           </div>
//           <div className="flex items-center space-x-4">
//             {/* <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700">
//               <Filter className="h-4 w-4 mr-2" />
//               Filtres
//             </Button> */}
//             <Button className="bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl">
//               <Plus className="h-4 w-4 mr-2" />
//               Ajouter un Client
//             </Button>
//           </div>
//         </div>

//         {/* Statistiques des Clients */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {loading ? (
//             // Afficher des cartes de chargement pour les statistiques
//             Array.from({ length: 4 }).map((_, index) => (
//               <Card key={index} className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-lg rounded-2xl overflow-hidden">
//                 <CardContent className="p-6">
//                   <div className="flex items-center justify-between">
//                     <div className="p-3 bg-slate-200 dark:bg-neutral-700 rounded-xl animate-pulse">
//                       <div className="h-6 w-6 bg-slate-300 dark:bg-neutral-600 rounded"></div>
//                     </div>
//                     <div className="text-right">
//                       <div className="h-8 w-16 bg-slate-200 dark:bg-neutral-700 rounded animate-pulse mb-2"></div>
//                       <div className="h-4 w-20 bg-slate-200 dark:bg-neutral-700 rounded animate-pulse"></div>
//                     </div>
//                   </div>
//                   <div className="mt-4">
//                     <div className="h-6 w-12 bg-slate-200 dark:bg-neutral-700 rounded-full animate-pulse"></div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))
//           ) : error ? (
//             // Afficher un message d'erreur pour les statistiques
//             <div className="col-span-full">
//               <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 rounded-2xl">
//                 <CardContent className="p-6 text-center">
//                   <p className="text-red-600 dark:text-red-400">⚠️ Impossible de charger les statistiques</p>
//                   <p className="text-sm text-red-500 dark:text-red-300 mt-1">{error}</p>
//                 </CardContent>
//               </Card>
//             </div>
//           ) : (
//             customerStats.map((stat, index) => (
//             <Card key={index} className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between">
//                   <div className={`p-3 bg-${stat.color}-600 rounded-xl shadow-lg`}>
//                     <stat.icon className="h-6 w-6 text-white" />
//                   </div>
//                   <div className="text-right">
//                     <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
//                     <p className="text-sm text-neutral-600 dark:text-neutral-400">{stat.label}</p>
//                   </div>
//                 </div>
//                 <div className="mt-4">
//                   <Badge className={`bg-${stat.color}-100 text-${stat.color}-800 hover:bg-${stat.color}-100 rounded-full text-xs`}>
//                     {stat.change}
//                   </Badge>
//                 </div>
//               </CardContent>
//             </Card>
//             ))
//           )}
//         </div>

//         {/* Recherche et Filtres */}
//         <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
//           <CardContent className="p-6">
//             <div className="flex items-center space-x-4">
//               <div className="relative flex-1">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
//                 <Input
//                   placeholder="Rechercher des clients par ID ou webhook..."
//                   className="pl-10 rounded-xl border-slate-200 dark:border-neutral-700 h-12"
//                   value={searchQuery}
//                   onChange={(e) => handleSearch(e.target.value)}
//                 />
//               </div>
//               <div className="flex items-center space-x-2">
//                 <Button 
//                   variant={isActiveFilter === "" ? "default" : "outline"} 
//                   className="rounded-xl h-12 px-4"
//                   onClick={() => handleActiveFilter("")}
//                 >
//                   Tous
//                 </Button>
//                 <Button 
//                   variant={isActiveFilter === "true" ? "default" : "outline"} 
//                   className="rounded-xl h-12 px-4"
//                   onClick={() => handleActiveFilter("true")}
//                 >
//                   Actifs
//                 </Button>
//                 <Button 
//                   variant={isActiveFilter === "false" ? "default" : "outline"} 
//                   className="rounded-xl h-12 px-4"
//                   onClick={() => handleActiveFilter("false")}
//                 >
//                   Inactifs
//                 </Button>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <div className="w-full">
//           {/* Tous les Clients */}
//           <div className="w-full">
//             <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
//               <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
//                                   <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
//                     <Users className="h-5 w-5 mr-2 text-crimson-600" />
//                     Tous les Clients
//                   </CardTitle>
//                   <CardDescription className="text-neutral-600 dark:text-neutral-400">
//                     Liste complète de tous les clients ({totalCustomers} au total)
//                   </CardDescription>
//               </CardHeader>
//               <CardContent className="p-6">
//                 {loading ? (
//                   <div className="flex items-center justify-center py-8">
//                     <Loader2 className="h-8 w-8 animate-spin text-crimson-600" />
//                     <span className="ml-2 text-neutral-600 dark:text-neutral-400">Chargement des clients...</span>
//                   </div>
//                 ) : error ? (
//                   <div className="flex items-center justify-center py-8">
//                     <div className="text-center max-w-md">
//                       <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-4">
//                         <p className="text-red-800 dark:text-red-200 font-medium mb-2">⚠️ Erreur lors du chargement</p>
//                         <p className="text-sm text-red-700 dark:text-red-300 break-words">{error}</p>
//                       </div>
//                       <Button 
//                         onClick={() => fetchCustomers(searchQuery, currentPage, isActiveFilter)} 
//                         className="bg-crimson-600 hover:bg-crimson-700 text-white"
//                       >
//                         🔄 Réessayer
//                       </Button>
//                     </div>
//                   </div>
//                 ) : allCustomers.length === 0 ? (
//                   <div className="flex items-center justify-center py-8">
//                     <div className="text-center">
//                       <Users className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
//                       <p className="text-neutral-600 dark:text-neutral-400">Aucun client trouvé</p>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {allCustomers.map((customer) => (
//                       <div key={customer.id} className="p-6 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600 hover:shadow-md transition-shadow">
//                         {/* Customer Header */}
//                         <div className="flex items-center justify-between mb-4">
//                           <div className="flex items-center space-x-4">
//                             <Avatar className="h-16 w-16">
//                               <AvatarImage src={customer.avatar} />
//                               <AvatarFallback className="bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-slate-300 text-lg">
//                                 {customer.name.split(' ').map(n => n[0]).join('')}
//                               </AvatarFallback>
//                             </Avatar>
//                             <div>
//                               <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{customer.name}</h3>
//                               <p className="text-sm text-neutral-600 dark:text-neutral-400">ID: {customer.id}</p>
//                               <div className="flex items-center space-x-2 mt-2">
//                                 <Badge 
//                                   className={`text-xs ${
//                                     customer.status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
//                                   }`}
//                                 >
//                                   {customer.status}
//                                 </Badge>
//                                 <Badge 
//                                   variant="outline" 
//                                   className={`text-xs ${
//                                     customer.type === 'Frais Fixes' ? 'border-amber-200 text-amber-700' : 'border-slate-200 text-slate-700'
//                                   }`}
//                                 >
//                                   {customer.type}
//                                 </Badge>
//                               </div>
//                             </div>
//                           </div>
//                           <Button 
//                             variant="outline" 
//                             size="sm" 
//                             className="text-crimson-600 hover:text-crimson-700 border-crimson-200 hover:border-crimson-300"
//                             onClick={() => router.push(`/customers/${customer.id}`)}
//                           >
//                             Voir Détails
//                           </Button>
//                         </div>

//                         {/* Customer Details */}
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//                           <div className="p-3 bg-white dark:bg-neutral-700 rounded-lg">
//                             <div className="flex items-center space-x-2">
//                               <MapPin className="h-4 w-4 text-neutral-500" />
//                               <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Localisation</span>
//                             </div>
//                             <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{customer.location}</p>
//                           </div>
//                           <div className="p-3 bg-white dark:bg-neutral-700 rounded-lg">
//                             <div className="flex items-center space-x-2">
//                               <Building className="h-4 w-4 text-neutral-500" />
//                               <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Webhook</span>
//                             </div>
//                             <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 truncate">{customer.email}</p>
//                           </div>
//                           <div className="p-3 bg-white dark:bg-neutral-700 rounded-lg">
//                             <div className="flex items-center space-x-2">
//                               <Shield className="h-4 w-4 text-neutral-500" />
//                               <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Permissions</span>
//                             </div>
//                             <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Gérer les accès</p>
//                           </div>
//                         </div>

//                         {/* Actions */}
//                         <div className="flex flex-wrap items-center gap-2">
//                           <Button 
//                             size="sm" 
//                             className="bg-blue-600 hover:bg-blue-700 text-white"
//                             onClick={() => openPermissionsModal(customer.customer)}
//                             disabled={actionLoading}
//                           >
//                             <Shield className="h-3 w-3 mr-1" />
//                             Permissions
//                           </Button>
                          
//                           {customer.status === 'Actif' ? (
//                             <Button 
//                               size="sm" 
//                               variant="destructive"
//                               onClick={() => openDeactivateModal(customer.customer)}
//                               disabled={actionLoading}
//                             >
//                               <UserX className="h-3 w-3 mr-1" />
//                               Désactiver
//                             </Button>
//                           ) : (
//                             <Button 
//                               size="sm" 
//                               className="bg-green-600 hover:bg-green-700 text-white"
//                               onClick={() => openActivateModal(customer.customer)}
//                               disabled={actionLoading}
//                             >
//                               <UserCheck className="h-3 w-3 mr-1" />
//                               Activer
//                             </Button>
//                           )}
                          
//                           <Button 
//                             size="sm" 
//                             className="bg-orange-600 hover:bg-orange-700 text-white"
//                             onClick={() => openFreezeModal(customer.customer)}
//                             disabled={actionLoading}
//                           >
//                             ❄️ Geler
//                           </Button>
                          
//                           <Button 
//                             size="sm" 
//                             className="bg-purple-600 hover:bg-purple-700 text-white"
//                             onClick={() => openBalanceModal(customer.customer)}
//                             disabled={actionLoading}
//                           >
//                             💰 Solde
//                           </Button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//                 <PaginationComponent />
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>


//       {/* Modal des Permissions */}
//       <Dialog open={isPermissionsModalOpen} onOpenChange={setIsPermissionsModalOpen}>
//         <DialogContent className="max-w-4xl">
//           <DialogHeader>
//             <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-white flex items-center">
//               <Shield className="h-5 w-5 mr-2 text-blue-600" />
//               Gestion des Permissions
//             </DialogTitle>
//             <DialogDescription className="text-neutral-600 dark:text-neutral-400">
//               Gérez les permissions d'opérateurs pour ce client
//             </DialogDescription>
//           </DialogHeader>
          
//           {selectedCustomerForAction && (
//             <div className="space-y-6">
//               {/* Informations client */}
//               <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl">
//                 <div className="flex items-center space-x-3">
//                   <Avatar className="h-12 w-12">
//                     <AvatarFallback className="bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-slate-300">
//                       {selectedCustomerForAction.customer_id.slice(0, 2).toUpperCase()}
//                     </AvatarFallback>
//                   </Avatar>
//                   <div>
//                     <h3 className="font-semibold text-neutral-900 dark:text-white">
//                       Client {selectedCustomerForAction.customer_id.slice(0, 8)}
//                     </h3>
//                     <p className="text-sm text-neutral-600 dark:text-neutral-400">ID: {selectedCustomerForAction.customer_id}</p>
//                     <p className="text-xs text-neutral-500 dark:text-neutral-400">Statut: {selectedCustomerForAction.is_active ? 'Actif' : 'Inactif'}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Permissions existantes */}
//               <div>
//                 <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Permissions Actuelles</h4>
//                 <div className="space-y-3">
//                   {customerPermissions.length === 0 ? (
//                     <p className="text-neutral-500 dark:text-neutral-400 text-center py-4">Aucune permission accordée</p>
//                   ) : (
//                     customerPermissions.map((permission) => (
//                       <div key={permission.uid} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg">
//                         <div>
//                           <p className="font-medium text-neutral-900 dark:text-white">{permission.operator_name}</p>
//                           <p className="text-sm text-neutral-600 dark:text-neutral-400">Code: {permission.operator_code}</p>
//                           <p className="text-xs text-neutral-500 dark:text-neutral-400">
//                             Activé le: {new Date(permission.activated_at).toLocaleDateString()}
//                           </p>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <Badge className={permission.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
//                             {permission.is_active ? "Actif" : "Inactif"}
//                           </Badge>
//                           <Button
//                             size="sm"
//                             variant="destructive"
//                             onClick={() => revokePermission(permission.uid)}
//                             disabled={actionLoading}
//                           >
//                             Révoquer
//                           </Button>
//                         </div>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </div>

//               {/* Accorder une nouvelle permission */}
//               <div>
//                 <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Accorder une Nouvelle Permission</h4>
//                 <div className="flex items-center space-x-3">
//                   <select
//                     value={selectedOperator}
//                     onChange={(e) => setSelectedOperator(e.target.value)}
//                     className="flex-1 p-2 border border-slate-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900"
//                   >
//                     <option value="">Sélectionner un opérateur</option>
//                     {operators.map((operator) => (
//                       <option key={operator.uid} value={operator.uid}>
//                         {operator.name} ({operator.code})
//                       </option>
//                     ))}
//                   </select>
//                   <Button
//                     onClick={() => selectedOperator && grantPermission(selectedCustomerForAction.customer_id, selectedOperator)}
//                     disabled={!selectedOperator || actionLoading}
//                     className="bg-blue-600 hover:bg-blue-700 text-white"
//                   >
//                     {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accorder"}
//                   </Button>
//                 </div>
//               </div>

//               {/* Actions */}
//               <div className="flex justify-end space-x-3">
//                 <Button
//                   variant="outline"
//                   onClick={() => setIsPermissionsModalOpen(false)}
//                   className="rounded-xl"
//                 >
//                   Fermer
//                 </Button>
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Modal d'Activation */}
//       <Dialog open={isActivateModalOpen} onOpenChange={setIsActivateModalOpen}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-white flex items-center">
//               <UserCheck className="h-5 w-5 mr-2 text-green-600" />
//               Activer le Client
//             </DialogTitle>
//             <DialogDescription className="text-neutral-600 dark:text-neutral-400">
//               Êtes-vous sûr de vouloir activer ce client ?
//             </DialogDescription>
//           </DialogHeader>
          
//           {selectedCustomerForAction && (
//               <div className="space-y-4">
//               <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl">
//                 <p className="font-medium text-neutral-900 dark:text-white">
//                   Client {selectedCustomerForAction.customer_id.slice(0, 8)}
//                 </p>
//                 <p className="text-sm text-neutral-600 dark:text-neutral-400">ID: {selectedCustomerForAction.customer_id}</p>
//               </div>

//               <div className="flex justify-end space-x-3">
//                 <Button
//                   variant="outline"
//                   onClick={() => setIsActivateModalOpen(false)}
//                   className="rounded-xl"
//                 >
//                   Annuler
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     activateCustomer(selectedCustomerForAction.customer_id)
//                     setIsActivateModalOpen(false)
//                   }}
//                   disabled={actionLoading}
//                   className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
//                 >
//                   {actionLoading ? (
//                     <>
//                       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                       Activation...
//                     </>
//                   ) : (
//                     <>
//                       <UserCheck className="h-4 w-4 mr-2" />
//                       Activer
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Modal de Désactivation */}
//       <Dialog open={isDeactivateModalOpen} onOpenChange={setIsDeactivateModalOpen}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-white flex items-center">
//               <UserX className="h-5 w-5 mr-2 text-red-600" />
//               Désactiver le Client
//             </DialogTitle>
//             <DialogDescription className="text-neutral-600 dark:text-neutral-400">
//               Êtes-vous sûr de vouloir désactiver ce client ?
//             </DialogDescription>
//           </DialogHeader>
          
//           {selectedCustomerForAction && (
//             <div className="space-y-4">
//               <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl">
//                 <p className="font-medium text-neutral-900 dark:text-white">
//                   Client {selectedCustomerForAction.customer_id.slice(0, 8)}
//                 </p>
//                 <p className="text-sm text-neutral-600 dark:text-neutral-400">ID: {selectedCustomerForAction.customer_id}</p>
//               </div>

//               <div className="flex justify-end space-x-3">
//                 <Button
//                   variant="outline"
//                   onClick={() => setIsDeactivateModalOpen(false)}
//                   className="rounded-xl"
//                 >
//                   Annuler
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     deactivateCustomer(selectedCustomerForAction.customer_id)
//                     setIsDeactivateModalOpen(false)
//                   }}
//                   disabled={actionLoading}
//                   variant="destructive"
//                   className="rounded-xl"
//                 >
//                   {actionLoading ? (
//                     <>
//                       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                       Désactivation...
//                     </>
//                   ) : (
//                     <>
//                       <UserX className="h-4 w-4 mr-2" />
//                       Désactiver
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Modal de Gel */}
//       <Dialog open={isFreezeModalOpen} onOpenChange={setIsFreezeModalOpen}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-white flex items-center">
//               ❄️ Geler le Compte
//             </DialogTitle>
//             <DialogDescription className="text-neutral-600 dark:text-neutral-400">
//               Geler le compte de ce client avec une raison
//             </DialogDescription>
//           </DialogHeader>
          
//           {selectedCustomerForAction && (
//             <div className="space-y-4">
//               <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl">
//                 <p className="font-medium text-neutral-900 dark:text-white">
//                   Client {selectedCustomerForAction.customer_id.slice(0, 8)}
//                 </p>
//                 <p className="text-sm text-neutral-600 dark:text-neutral-400">ID: {selectedCustomerForAction.customer_id}</p>
//               </div>

//                 <div>
//                   <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
//                   Raison du gel
//                 </label>
//                 <Input
//                   placeholder="Entrez la raison du gel..."
//                   value={freezeReason}
//                   onChange={(e) => setFreezeReason(e.target.value)}
//                   className="rounded-xl border-slate-200 dark:border-neutral-700"
//                 />
//               </div>

//               <div className="flex justify-end space-x-3">
//                 <Button
//                   variant="outline"
//                   onClick={() => setIsFreezeModalOpen(false)}
//                   className="rounded-xl"
//                 >
//                   Annuler
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     freezeAccount(selectedCustomerForAction.customer_id, freezeReason)
//                     setIsFreezeModalOpen(false)
//                   }}
//                   disabled={actionLoading || !freezeReason.trim()}
//                   className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl"
//                 >
//                   {actionLoading ? (
//                     <>
//                       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                       Gel...
//                     </>
//                   ) : (
//                     <>
//                       ❄️
//                       Geler
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Modal de Dégel */}
//       <Dialog open={isUnfreezeModalOpen} onOpenChange={setIsUnfreezeModalOpen}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-white flex items-center">
//               🔥 Dégeler le Compte
//             </DialogTitle>
//             <DialogDescription className="text-neutral-600 dark:text-neutral-400">
//               Êtes-vous sûr de vouloir dégeler ce compte ?
//             </DialogDescription>
//           </DialogHeader>
          
//           {selectedCustomerForAction && (
//             <div className="space-y-4">
//               <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl">
//                 <p className="font-medium text-neutral-900 dark:text-white">
//                   Client {selectedCustomerForAction.customer_id.slice(0, 8)}
//                 </p>
//                 <p className="text-sm text-neutral-600 dark:text-neutral-400">ID: {selectedCustomerForAction.customer_id}</p>
//               </div>

//               <div className="flex justify-end space-x-3">
//                 <Button
//                   variant="outline"
//                   onClick={() => setIsUnfreezeModalOpen(false)}
//                   className="rounded-xl"
//                 >
//                   Annuler
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     unfreezeAccount(selectedCustomerForAction.customer_id)
//                     setIsUnfreezeModalOpen(false)
//                   }}
//                   disabled={actionLoading}
//                   className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
//                 >
//                   {actionLoading ? (
//                     <>
//                       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                       Dégel...
//                     </>
//                   ) : (
//                     <>
//                       🔥
//                       Dégeler
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Modal d'Ajustement de Solde */}
//       <Dialog open={isBalanceModalOpen} onOpenChange={setIsBalanceModalOpen}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-white flex items-center">
//               💰 Ajuster le Solde
//             </DialogTitle>
//             <DialogDescription className="text-neutral-600 dark:text-neutral-400">
//               Ajuster le solde de ce client
//             </DialogDescription>
//           </DialogHeader>
          
//           {selectedCustomerForAction && (
//             <div className="space-y-4">
//               <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl">
//                 <p className="font-medium text-neutral-900 dark:text-white">
//                   Client {selectedCustomerForAction.customer_id.slice(0, 8)}
//                 </p>
//                 <p className="text-sm text-neutral-600 dark:text-neutral-400">ID: {selectedCustomerForAction.customer_id}</p>
//               </div>

//               <div className="space-y-4">
//                 <div>
//                   <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
//                     Type d'ajustement
//                   </label>
//                   <div className="flex space-x-4">
//                     <label className="flex items-center space-x-2">
//                       <input
//                         type="radio"
//                         name="balanceType"
//                         value="credit"
//                         checked={balanceType === "credit"}
//                         onChange={(e) => setBalanceType(e.target.value as "credit" | "debit")}
//                         className="text-green-600 focus:ring-green-500"
//                       />
//                       <span className="text-sm text-neutral-700 dark:text-neutral-300">Crédit</span>
//                     </label>
//                     <label className="flex items-center space-x-2">
//                       <input
//                         type="radio"
//                         name="balanceType"
//                         value="debit"
//                         checked={balanceType === "debit"}
//                         onChange={(e) => setBalanceType(e.target.value as "credit" | "debit")}
//                         className="text-red-600 focus:ring-red-500"
//                       />
//                       <span className="text-sm text-neutral-700 dark:text-neutral-300">Débit</span>
//                     </label>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
//                     Montant
//                   </label>
//                   <Input
//                     type="number"
//                     placeholder="Entrez le montant..."
//                     value={balanceAmount}
//                     onChange={(e) => setBalanceAmount(e.target.value)}
//                     className="rounded-xl border-slate-200 dark:border-neutral-700"
//                   />
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
//                     Raison
//                   </label>
//                   <Input
//                     placeholder="Entrez la raison de l'ajustement..."
//                     value={balanceReason}
//                     onChange={(e) => setBalanceReason(e.target.value)}
//                     className="rounded-xl border-slate-200 dark:border-neutral-700"
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-end space-x-3">
//                 <Button
//                   variant="outline"
//                   onClick={() => setIsBalanceModalOpen(false)}
//                   className="rounded-xl"
//                 >
//                   Annuler
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     adjustBalance(selectedCustomerForAction.customer_id, balanceAmount, balanceType, balanceReason)
//                     setIsBalanceModalOpen(false)
//                   }}
//                   disabled={actionLoading || !balanceAmount || !balanceReason.trim()}
//                   className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
//                 >
//                   {actionLoading ? (
//                     <>
//                       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                       Ajustement...
//                     </>
//                   ) : (
//                     <>
//                       💰
//                       Ajuster
//                     </>
//                   )}
//                 </Button>
//         </div>
//       </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </DashboardLayout>
//   )
// }



import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

export default function Customers() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">Gestion des Clients</h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">Gérez et analysez votre base de clients</p>
          </div>
        </div>

        <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
          <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
            <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
              <Users className="h-5 w-5 mr-2 text-crimson-600" />
              Clients
            </CardTitle>
            <CardDescription className="text-neutral-600 dark:text-neutral-400">
              Page en cours de développement
            </CardDescription>
          </CardHeader>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Users className="h-16 w-16 text-neutral-400 mb-4" />
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-2">
                Page en construction
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 max-w-md">
                Cette page est actuellement en cours de développement. Le contenu sera bientôt disponible.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


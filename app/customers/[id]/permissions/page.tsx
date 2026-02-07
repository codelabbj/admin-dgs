"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Shield, Plus, X, Loader2, Calendar, User } from "lucide-react"
import { smartFetch } from "@/utils/auth"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// Interface pour les permissions
interface CustomerPermission {
  uid: string
  customer_id: string
  operator_config: string
  operator_name: string
  operator_code: string
  is_active: boolean
  activated_at: string
  deactivated_at: string | null
  notes: string
}

// Interface pour les opérateurs
interface Operator {
  uid: string
  operator_name: string
  operator_code: string
  is_active: boolean
  operator_payin_rate: string
  operator_payout_rate: string
  min_payin_amount: number
  max_payin_amount: number
  min_payout_amount: number
  max_payout_amount: number
  api_base_url: string
  supports_smartlink: boolean
  supports_callback: boolean
  created_at: string
}

export default function CustomerPermissions({ params }: { params: { id: string } }) {
  const router = useRouter()
  const customerId = params.id

  // États pour la gestion des données
  const [permissions, setPermissions] = useState<CustomerPermission[]>([])
  const [operators, setOperators] = useState<Operator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // États pour les modals
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false)
  const [selectedOperator, setSelectedOperator] = useState("")

  // États pour les actions
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState("")

  // Fonction pour récupérer les permissions
  const fetchPermissions = async () => {
    try {
      setLoading(true)
      setError(null)

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const response = await smartFetch(`${baseUrl}/api/v2/admin/customers-config/${customerId}/permissions/`)

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
      setPermissions(data)
    } catch (err) {
      console.error("Error fetching permissions:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des permissions"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour récupérer les opérateurs
  const fetchOperators = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const response = await smartFetch(`${baseUrl}/api/v2/admin/operators/`)

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
      // Handle both array and object responses with results property
      const operatorsList = Array.isArray(data) ? data : (data.results || data)
      setOperators(operatorsList)
    } catch (err) {
      console.error("Error fetching operators:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des opérateurs"
      setError(errorMessage)
    }
  }

  // Fonction pour accorder une permission
  const grantPermission = async (operatorUid: string) => {
    try {
      setActionLoading(true)
      setActionMessage("")

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const response = await smartFetch(`${baseUrl}/api/v2/admin/customers-config/${customerId}/permissions/`, {
        method: "POST",
        body: JSON.stringify({ operator_uid: operatorUid })
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
        throw new Error(errorMessage)
      }

      const result = await response.json()
      setActionMessage("Permission accordée avec succès")

      // Rafraîchir les permissions
      await fetchPermissions()

    } catch (err) {
      console.error("Error granting permission:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'octroi de permission"
      setError(errorMessage)
    } finally {
      setActionLoading(false)
    }
  }

  // Fonction pour révoquer une permission
  const revokePermission = async (permissionUid: string) => {
    try {
      setActionLoading(true)
      setActionMessage("")

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const response = await smartFetch(`${baseUrl}/api/v2/admin/permissions/${permissionUid}/`, {
        method: "DELETE"
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
        throw new Error(errorMessage)
      }

      const result = await response.json()
      setActionMessage(result.message || "Permission révoquée avec succès")

      // Rafraîchir les permissions
      await fetchPermissions()

    } catch (err) {
      console.error("Error revoking permission:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la révocation de permission"
      setError(errorMessage)
    } finally {
      setActionLoading(false)
    }
  }

  // Fonction pour ouvrir le modal d'octroi
  const openGrantModal = async () => {
    await fetchOperators()
    setIsGrantModalOpen(true)
  }

  // Charger les permissions au montage
  useEffect(() => {
    fetchPermissions()
  }, [customerId])

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
                Permissions du Client
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                Client: {customerId.slice(0, 8)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={openGrantModal}
              className=" rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Accorder une Permission
            </Button>
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
                  onClick={() => fetchPermissions()}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Réessayer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des permissions */}
        <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
          <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
            <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
              <Shield className="h-5 w-5 mr-2 text-primary" />
              Permissions Accordées
            </CardTitle>
            <CardDescription className="text-neutral-600 dark:text-neutral-400">
              {permissions.length} permission(s) accordée(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-neutral-600 dark:text-neutral-400">Chargement des permissions...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center max-w-md">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-4">
                    <p className="text-red-800 dark:text-red-200 font-medium mb-2">⚠️ Erreur lors du chargement</p>
                    <p className="text-sm text-red-700 dark:text-red-300 break-words">{error}</p>
                  </div>
                  <Button
                    onClick={() => fetchPermissions()}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    🔄 Réessayer
                  </Button>
                </div>
              </div>
            ) : permissions.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Shield className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-400">Aucune permission accordée</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                    Cliquez sur "Accorder une Permission" pour commencer
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {permissions.map((permission) => (
                  <div key={permission.uid} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-slate-200 dark:bg-neutral-700 rounded-xl">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">
                          {permission.operator_name}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Code: {permission.operator_code}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Config: {permission.operator_config.slice(0, 8)}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={permission.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {permission.is_active ? "Actif" : "Inactif"}
                          </Badge>
                          {permission.notes && (
                            <Badge variant="outline" className="text-xs">
                              {permission.notes}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="text-right mr-4">
                        <div className="flex items-center space-x-2 text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                          <Calendar className="h-3 w-3" />
                          <span>Activé le {new Date(permission.activated_at).toLocaleDateString()}</span>
                        </div>
                        {permission.deactivated_at && (
                          <div className="flex items-center space-x-2 text-sm text-neutral-500 dark:text-neutral-400">
                            <X className="h-3 w-3" />
                            <span>Désactivé le {new Date(permission.deactivated_at).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-lg"
                        onClick={() => revokePermission(permission.uid)}
                        disabled={actionLoading}
                      >
                        <X className="h-3 w-3" />
                        Révoquer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal d'octroi de permission */}
        <Dialog open={isGrantModalOpen} onOpenChange={setIsGrantModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-white flex items-center">
                <Plus className="h-5 w-5 mr-2 text-primary" />
                Accorder une Permission
              </DialogTitle>
              <DialogDescription className="text-neutral-600 dark:text-neutral-400">
                Sélectionnez un opérateur pour accorder la permission
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                  Opérateur
                </label>
                <select
                  value={selectedOperator}
                  onChange={(e) => setSelectedOperator(e.target.value)}
                  className="w-full p-2 border border-slate-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900"
                >
                  <option value="">Sélectionner un opérateur</option>
                  {operators.map((operator) => (
                    <option key={operator.uid} value={operator.uid}>
                      {operator.operator_name} ({operator.operator_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsGrantModalOpen(false)}
                  className="rounded-xl"
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => {
                    grantPermission(selectedOperator)
                    setIsGrantModalOpen(false)
                  }}
                  disabled={!selectedOperator || actionLoading}
                  className="bg-primary hover:bg-primary/90 text-white rounded-xl"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Octroi...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Accorder
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

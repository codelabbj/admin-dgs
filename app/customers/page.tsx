"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Search, Users, UserCheck, UserX, TrendingUp, MapPin, Building,
  Loader2, Shield, ChevronLeft, ChevronRight, DollarSign, Snowflake, Flame
} from "lucide-react"
import { smartFetch } from "@/utils/auth"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

interface Customer {
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
  ip_whitelist: string[] | null
  require_ip_whitelist: boolean
  notes: string
  created_at: string
  grpc_info?: {
    email: string
    entreprise_name: string
    phone: string
    is_verify: boolean
    is_block: boolean
    account_status: string
  }
  account?: {
    balance: number
    total_payin: number
    total_payout: number
    total_fees_paid: number
  }
}

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

interface Operator {
  uid: string
  operator_name: string
  operator_code: string
  is_active: boolean
}

export default function Customers() {
  const router = useRouter()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isActiveFilter, setIsActiveFilter] = useState<string>("")
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState("")

  // Permissions modal
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false)
  const [selectedCustomerForAction, setSelectedCustomerForAction] = useState<Customer | null>(null)
  const [customerPermissions, setCustomerPermissions] = useState<CustomerPermission[]>([])
  const [operators, setOperators] = useState<Operator[]>([])
  const [selectedOperator, setSelectedOperator] = useState<string>("")

  // Activate / Deactivate modals
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false)
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false)

  // Freeze / Unfreeze modals
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false)
  const [isUnfreezeModalOpen, setIsUnfreezeModalOpen] = useState(false)
  const [freezeReason, setFreezeReason] = useState("")

  // Balance modal
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false)
  const [balanceAmount, setBalanceAmount] = useState("")
  const [balanceType, setBalanceType] = useState<"credit" | "debit">("credit")
  const [balanceReason, setBalanceReason] = useState("")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [totalPages, setTotalPages] = useState(0)
  const [totalCustomers, setTotalCustomers] = useState(0)

  // ─── API helpers ─────────────────────────────────────────────────────────────

  const fetchCustomers = async (query = "", page = 1, isActive = "") => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (query) params.append("search", query)
      if (isActive) params.append("is_active", isActive)
      params.append("page", page.toString())
      params.append("page_size", pageSize.toString())

      const res = await smartFetch(`${baseUrl}/api/v2/admin/customers-config/?${params}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || err.message || `Erreur ${res.status}`)
      }
      const data = await res.json()
      if (data && Array.isArray(data.results)) {
        setCustomers(data.results)
        setTotalCustomers(data.count || data.results.length)
        setTotalPages(Math.ceil((data.count || data.results.length) / pageSize))
      } else if (Array.isArray(data)) {
        setCustomers(data)
        setTotalCustomers(data.length)
        setTotalPages(Math.ceil(data.length / pageSize))
      } else {
        setCustomers([])
        setTotalCustomers(0)
        setTotalPages(0)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomerPermissions = async (customerId: string) => {
    const res = await smartFetch(`${baseUrl}/api/v2/admin/customers-config/${customerId}/permissions/`)
    if (res.ok) setCustomerPermissions(await res.json())
  }

  const fetchOperators = async () => {
    const res = await smartFetch(`${baseUrl}/api/v2/admin/operators/`)
    if (res.ok) {
      const data = await res.json()
      setOperators(Array.isArray(data) ? data : data.results || [])
    }
  }

  const callAction = async (url: string, method = "POST", body?: object) => {
    setActionLoading(true)
    setActionMessage("")
    try {
      const res = await smartFetch(url, { method, body: body ? JSON.stringify(body) : undefined })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || err.message || `Erreur ${res.status}`)
      }
      const result = await res.json()
      setActionMessage(result.message || "Action réussie")
      await fetchCustomers(searchQuery, currentPage, isActiveFilter)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'action")
    } finally {
      setActionLoading(false)
    }
  }

  const grantPermission = async (customerId: string, operatorUid: string) => {
    await callAction(`${baseUrl}/api/v2/admin/customers-config/${customerId}/permissions/`, "POST", { operator_uid: operatorUid })
    await fetchCustomerPermissions(customerId)
  }

  const revokePermission = async (permissionUid: string, customerId: string) => {
    await callAction(`${baseUrl}/api/v2/admin/permissions/${permissionUid}/`, "DELETE")
    await fetchCustomerPermissions(customerId)
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────────

  useEffect(() => { fetchCustomers("", 1, "") }, [])
  useEffect(() => { fetchCustomers(searchQuery, currentPage, isActiveFilter) }, [currentPage])

  const debouncedSearch = useCallback((() => {
    let t: NodeJS.Timeout
    return (q: string) => { clearTimeout(t); t = setTimeout(() => fetchCustomers(q, 1, isActiveFilter), 300) }
  })(), [isActiveFilter])

  const handleSearch = (q: string) => { setSearchQuery(q); setCurrentPage(1); debouncedSearch(q) }
  const handleActiveFilter = (f: string) => { setIsActiveFilter(f); setCurrentPage(1); fetchCustomers(searchQuery, 1, f) }

  // ─── Pagination component ────────────────────────────────────────────────────

  const PaginationComponent = () => {
    if (totalPages <= 1) return null
    const pages: number[] = []
    const start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, start + 4)
    for (let i = start; i <= end; i++) pages.push(i)
    return (
      <div className="flex items-center justify-between px-2 py-4">
        <span className="text-sm text-muted-foreground">
          {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, totalCustomers)} sur {totalCustomers}
        </span>
        <div className="flex items-center space-x-1">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button>
          {pages.map(p => (
            <Button key={p} variant={currentPage === p ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(p)} className="h-8 w-8 p-0">{p}</Button>
          ))}
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
    )
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  const stats = [
    { label: "Total Clients", value: totalCustomers.toLocaleString(), icon: Users, color: "blue" },
    { label: "Actifs", value: customers.filter(c => c.is_active).length.toString(), icon: UserCheck, color: "green" },
    { label: "Inactifs", value: customers.filter(c => !c.is_active).length.toString(), icon: UserX, color: "red" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* ── Messages ─────────────────────────────────────────────── */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center justify-between">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            <Button size="sm" onClick={() => { setError(null); fetchCustomers(searchQuery, currentPage, isActiveFilter) }} className="bg-red-600 hover:bg-red-700 text-white ml-4">Réessayer</Button>
          </div>
        )}
        {actionMessage && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center justify-between">
            <p className="text-green-800 dark:text-green-200 text-sm">✅ {actionMessage}</p>
            <Button size="sm" variant="outline" onClick={() => setActionMessage("")} className="ml-4">Fermer</Button>
          </div>
        )}

        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">Gestion des Clients</h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">Gérez et analysez votre base de clients</p>
          </div>
        </div>

        {/* ── Stats ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <Card key={i} className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-lg rounded-2xl">
              <CardContent className="p-6 flex items-center justify-between">
                <div className={`p-3 bg-${stat.color}-600 rounded-xl shadow-lg`}><stat.icon className="h-6 w-6 text-white" /></div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Search + Filter ───────────────────────────────────────── */}
        <Card className="bg-white/80 dark:bg-neutral-900/80 border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
          <CardContent className="p-6 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input placeholder="Rechercher par ID, email..." className="pl-10 rounded-xl h-12" value={searchQuery} onChange={e => handleSearch(e.target.value)} />
            </div>
            {(["", "true", "false"] as const).map((f, i) => (
              <Button key={i} variant={isActiveFilter === f ? "default" : "outline"} className="rounded-xl h-12" onClick={() => handleActiveFilter(f)}>
                {f === "" ? "Tous" : f === "true" ? "Actifs" : "Inactifs"}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* ── Customer list ─────────────────────────────────────────── */}
        <Card className="bg-white/80 dark:bg-neutral-900/80 border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
          <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
            <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />Tous les Clients
            </CardTitle>
            <CardDescription>{totalCustomers} client(s) au total</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-neutral-600 dark:text-neutral-400">Chargement...</span>
              </div>
            ) : customers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-neutral-400 mb-4" />
                <p className="text-neutral-600 dark:text-neutral-400">Aucun client trouvé</p>
              </div>
            ) : (
              <div className="space-y-4">
                {customers.map(customer => (
                  <div key={customer.uid} className="p-5 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      {/* Info */}
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-slate-200 dark:bg-neutral-700 font-semibold text-sm">
                            {customer.customer_id.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white text-sm">
                            {customer.grpc_info?.entreprise_name || `Client ${customer.customer_id.slice(0, 8)}`}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">{customer.grpc_info?.email || customer.customer_id}</p>
                          {customer.grpc_info?.phone && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{customer.grpc_info.phone}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={customer.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                              {customer.is_active ? "Actif" : "Inactif"}
                            </Badge>
                            {customer.account && (
                              <Badge variant="outline" className="text-xs">
                                Solde: {customer.account.balance?.toLocaleString()} FCFA
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" variant="outline" className="rounded-lg text-primary border-primary/30" onClick={() => router.push(`/customers/${customer.customer_id}`)}>
                          Voir détails
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg" onClick={async () => { setSelectedCustomerForAction(customer); await fetchCustomerPermissions(customer.customer_id); await fetchOperators(); setIsPermissionsModalOpen(true) }}>
                          <Shield className="h-3 w-3 mr-1" />Permissions
                        </Button>
                        {customer.is_active ? (
                          <Button size="sm" variant="destructive" className="rounded-lg" onClick={() => { setSelectedCustomerForAction(customer); setIsDeactivateModalOpen(true) }}>
                            <UserX className="h-3 w-3 mr-1" />Désactiver
                          </Button>
                        ) : (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-lg" onClick={() => { setSelectedCustomerForAction(customer); setIsActivateModalOpen(true) }}>
                            <UserCheck className="h-3 w-3 mr-1" />Activer
                          </Button>
                        )}
                        <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg" onClick={() => { setSelectedCustomerForAction(customer); setFreezeReason(""); setIsFreezeModalOpen(true) }}>
                          <Snowflake className="h-3 w-3 mr-1" />Geler
                        </Button>
                        <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg" onClick={() => { setSelectedCustomerForAction(customer); setIsUnfreezeModalOpen(true) }}>
                          <Flame className="h-3 w-3 mr-1" />Dégeler
                        </Button>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg" onClick={() => { setSelectedCustomerForAction(customer); setBalanceAmount(""); setBalanceReason(""); setIsBalanceModalOpen(true) }}>
                          <DollarSign className="h-3 w-3 mr-1" />Solde
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <PaginationComponent />
          </CardContent>
        </Card>
      </div>

      {/* ── Modal Permissions ─────────────────────────────────────── */}
      <Dialog open={isPermissionsModalOpen} onOpenChange={setIsPermissionsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center"><Shield className="h-5 w-5 mr-2 text-blue-600" />Gestion des Permissions</DialogTitle>
            <DialogDescription>Client : {selectedCustomerForAction?.customer_id.slice(0, 8)}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <h4 className="font-semibold text-neutral-900 dark:text-white">Permissions actuelles</h4>
            {customerPermissions.length === 0 ? (
              <p className="text-neutral-500 text-sm text-center py-4">Aucune permission accordée</p>
            ) : customerPermissions.map(p => (
              <div key={p.uid} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{p.operator_name} <span className="text-xs text-neutral-500">({p.operator_code})</span></p>
                  <Badge className={p.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"} >{p.is_active ? "Actif" : "Inactif"}</Badge>
                </div>
                <Button size="sm" variant="destructive" onClick={() => revokePermission(p.uid, selectedCustomerForAction!.customer_id)} disabled={actionLoading}>Révoquer</Button>
              </div>
            ))}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">Accorder une permission</h4>
              <div className="flex gap-2">
                <select value={selectedOperator} onChange={e => setSelectedOperator(e.target.value)} className="flex-1 p-2 border border-slate-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-sm">
                  <option value="">Sélectionner un opérateur</option>
                  {operators.map(op => <option key={op.uid} value={op.uid}>{op.operator_name} ({op.operator_code})</option>)}
                </select>
                <Button onClick={() => selectedOperator && grantPermission(selectedCustomerForAction!.customer_id, selectedOperator)} disabled={!selectedOperator || actionLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accorder"}
                </Button>
              </div>
            </div>
            <div className="flex justify-end"><Button variant="outline" onClick={() => setIsPermissionsModalOpen(false)}>Fermer</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal Activer ─────────────────────────────────────────── */}
      <Dialog open={isActivateModalOpen} onOpenChange={setIsActivateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center"><UserCheck className="h-5 w-5 mr-2 text-green-600" />Activer le Client</DialogTitle></DialogHeader>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Activer le client <strong>{selectedCustomerForAction?.customer_id.slice(0, 8)}</strong> ?</p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsActivateModalOpen(false)}>Annuler</Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" disabled={actionLoading} onClick={async () => { await callAction(`${baseUrl}/api/v2/admin/customers-config/${selectedCustomerForAction?.customer_id}/activate/`, "POST"); setIsActivateModalOpen(false) }}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserCheck className="h-4 w-4 mr-2" />}Activer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal Désactiver ──────────────────────────────────────── */}
      <Dialog open={isDeactivateModalOpen} onOpenChange={setIsDeactivateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center"><UserX className="h-5 w-5 mr-2 text-red-600" />Désactiver le Client</DialogTitle></DialogHeader>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Désactiver le client <strong>{selectedCustomerForAction?.customer_id.slice(0, 8)}</strong> ?</p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsDeactivateModalOpen(false)}>Annuler</Button>
            <Button variant="destructive" disabled={actionLoading} onClick={async () => { await callAction(`${baseUrl}/api/v2/admin/customers-config/${selectedCustomerForAction?.customer_id}/deactivate/`, "DELETE"); setIsDeactivateModalOpen(false) }}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserX className="h-4 w-4 mr-2" />}Désactiver
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal Geler ───────────────────────────────────────────── */}
      <Dialog open={isFreezeModalOpen} onOpenChange={setIsFreezeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center"><Snowflake className="h-5 w-5 mr-2 text-cyan-600" />Geler le Compte</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Client : <strong>{selectedCustomerForAction?.customer_id.slice(0, 8)}</strong></p>
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">Raison du gel *</label>
              <Input placeholder="Saisissez la raison..." value={freezeReason} onChange={e => setFreezeReason(e.target.value)} className="rounded-xl" />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsFreezeModalOpen(false)}>Annuler</Button>
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white" disabled={actionLoading || !freezeReason.trim()} onClick={async () => { await callAction(`${baseUrl}/api/v2/admin/customers-config/${selectedCustomerForAction?.customer_id}/freeze/`, "POST", { reason: freezeReason }); setIsFreezeModalOpen(false) }}>
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Snowflake className="h-4 w-4 mr-2" />}Geler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal Dégeler ─────────────────────────────────────────── */}
      <Dialog open={isUnfreezeModalOpen} onOpenChange={setIsUnfreezeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center"><Flame className="h-5 w-5 mr-2 text-orange-500" />Dégeler le Compte</DialogTitle></DialogHeader>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Dégeler le compte du client <strong>{selectedCustomerForAction?.customer_id.slice(0, 8)}</strong> ?</p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsUnfreezeModalOpen(false)}>Annuler</Button>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white" disabled={actionLoading} onClick={async () => { await callAction(`${baseUrl}/api/v2/admin/customers-config/${selectedCustomerForAction?.customer_id}/unfreeze/`, "POST"); setIsUnfreezeModalOpen(false) }}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Flame className="h-4 w-4 mr-2" />}Dégeler
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal Ajuster Solde ───────────────────────────────────── */}
      <Dialog open={isBalanceModalOpen} onOpenChange={setIsBalanceModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center"><DollarSign className="h-5 w-5 mr-2 text-purple-600" />Ajuster le Solde</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Client : <strong>{selectedCustomerForAction?.customer_id.slice(0, 8)}</strong></p>
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">Type</label>
              <div className="flex gap-4">
                {(["credit", "debit"] as const).map(t => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value={t} checked={balanceType === t} onChange={() => setBalanceType(t)} />
                    <span className="text-sm capitalize">{t === "credit" ? "Crédit +" : "Débit −"}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">Montant (FCFA) *</label>
              <Input type="number" placeholder="Ex: 50000" value={balanceAmount} onChange={e => setBalanceAmount(e.target.value)} className="rounded-xl" />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">Raison *</label>
              <Input placeholder="Ex: Correction comptable..." value={balanceReason} onChange={e => setBalanceReason(e.target.value)} className="rounded-xl" />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsBalanceModalOpen(false)}>Annuler</Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white" disabled={actionLoading || !balanceAmount || !balanceReason.trim()} onClick={async () => { await callAction(`${baseUrl}/api/v2/admin/customers-config/${selectedCustomerForAction?.customer_id}/adjust-balance/`, "POST", { amount: parseInt(balanceAmount), type: balanceType, reason: balanceReason }); setIsBalanceModalOpen(false) }}>
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <DollarSign className="h-4 w-4 mr-2" />}Ajuster
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  )
}

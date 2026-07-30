"use client"

import React, { useState, useEffect } from "react"
import { smartFetch } from "@/utils/auth"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Server,
  Globe,
  DollarSign,
  Settings,
  Activity,
  Zap,
  Shield,
  Link,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Users,
  BarChart3,
  Database,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface Operator {
  uid: string
  operator_name: string
  public_operator_name?: string
  display_name?: string
  operator_code: string
  api_backend?: string
  country_code?: string
  currency?: string
  operator_payin_rate: string
  operator_payout_rate: string
  operator_bank_transfer_rate?: string
  payin_fee_mode?: string
  payout_fee_mode?: string
  bank_transfer_fee_mode?: string
  operator_payin_fee_fixed?: number
  operator_payout_fee_fixed?: number
  operator_bank_transfer_fee_fixed?: number
  operator_payin_fee_base?: number
  operator_payout_fee_base?: number
  operator_bank_transfer_fee_base?: number
  min_payin_amount: number
  max_payin_amount: number
  min_payout_amount: number
  max_payout_amount: number
  min_bank_transfer_amount?: number
  max_bank_transfer_amount?: number
  is_active: boolean
  api_base_url: string
  api_token?: string
  api_timeout_seconds?: number
  supports_smartlink: boolean
  supports_callback: boolean
  webhook_secret?: string
  pal_v2_enabled?: boolean
  pal_v2_public_key?: string
  pal_v2_secret_key?: string
  pal_v2_base_url?: string
  created_at: string
}

interface OperatorHealth {
  operator_code: string
  operator_name: string
  status: string
  balance: number | null
}

interface CreateOperatorPayload {
  operator_name: string
  public_operator_name?: string
  operator_code: string
  api_backend?: string
  country_code?: string
  currency?: string
  operator_payin_rate: number
  operator_payout_rate: number
  operator_bank_transfer_rate?: number
  payin_fee_mode?: string
  payout_fee_mode?: string
  bank_transfer_fee_mode?: string
  operator_payin_fee_fixed?: number
  operator_payout_fee_fixed?: number
  operator_bank_transfer_fee_fixed?: number
  operator_payin_fee_base?: number
  operator_payout_fee_base?: number
  operator_bank_transfer_fee_base?: number
  min_payin_amount: number
  max_payin_amount: number
  min_payout_amount: number
  max_payout_amount: number
  min_bank_transfer_amount?: number
  max_bank_transfer_amount?: number
  is_active: boolean
  api_base_url: string
  api_token?: string
  api_timeout_seconds: number
  supports_smartlink: boolean
  supports_callback: boolean
  webhook_secret?: string
  pal_v2_enabled?: boolean
  pal_v2_public_key?: string
  pal_v2_secret_key?: string
  pal_v2_base_url?: string
}

const FEE_MODE_OPTIONS = [
  { value: "percentage", label: "Pourcentage (actuel)" },
  { value: "fixed", label: "Frais fixe" },
  { value: "base_percent", label: "Base + %" },
]

function OperatorFeeFlowFields({
  idPrefix,
  title,
  mode,
  rate,
  fixed,
  base,
  onMode,
  onRate,
  onFixed,
  onBase,
}: {
  idPrefix: string
  title: string
  mode?: string
  rate?: number
  fixed?: number
  base?: number
  onMode: (v: string) => void
  onRate: (v: number) => void
  onFixed: (v: number) => void
  onBase: (v: number) => void
}) {
  const m = mode || "percentage"
  return (
    <div className="space-y-2 p-3 rounded-lg border border-slate-200 dark:border-neutral-700">
      <Label className="font-medium">{title}</Label>
      <Select value={m} onValueChange={onMode}>
        <SelectTrigger id={`${idPrefix}_mode`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FEE_MODE_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {(m === "percentage" || m === "base_percent") && (
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix}_rate`} className="text-xs text-muted-foreground">Taux (%)</Label>
          <Input
            id={`${idPrefix}_rate`}
            type="number"
            step="0.01"
            value={rate ?? 0}
            onChange={(e) => onRate(parseFloat(e.target.value) || 0)}
          />
        </div>
      )}
      {m === "fixed" && (
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix}_fixed`} className="text-xs text-muted-foreground">Montant fixe</Label>
          <Input
            id={`${idPrefix}_fixed`}
            type="number"
            value={fixed ?? 0}
            onChange={(e) => onFixed(parseInt(e.target.value) || 0)}
          />
        </div>
      )}
      {m === "base_percent" && (
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix}_base`} className="text-xs text-muted-foreground">Frais de base (minimum)</Label>
          <Input
            id={`${idPrefix}_base`}
            type="number"
            value={base ?? 0}
            onChange={(e) => onBase(parseInt(e.target.value) || 0)}
          />
        </div>
      )}
    </div>
  )
}

export function OperatorsContent() {
  const [operators, setOperators] = useState<Operator[]>([])
  const [operatorHealth, setOperatorHealth] = useState<OperatorHealth[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [operatorToDelete, setOperatorToDelete] = useState<Operator | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("operators")
  const [currencies, setCurrencies] = useState<{ code: string; name: string; is_active: boolean }[]>([])
  const { toast } = useToast()

  // Form state for create/edit
  const [formData, setFormData] = useState<CreateOperatorPayload>({
    operator_name: '',
    public_operator_name: '',
    operator_code: '',
    api_backend: 'wave',
    country_code: '',
    currency: 'XOF',
    operator_payin_rate: 1.0,
    operator_payout_rate: 1.0,
    operator_bank_transfer_rate: 1.0,
    payin_fee_mode: 'percentage',
    payout_fee_mode: 'percentage',
    bank_transfer_fee_mode: 'percentage',
    operator_payin_fee_fixed: 0,
    operator_payout_fee_fixed: 0,
    operator_bank_transfer_fee_fixed: 0,
    operator_payin_fee_base: 0,
    operator_payout_fee_base: 0,
    operator_bank_transfer_fee_base: 0,
    min_payin_amount: 500,
    max_payin_amount: 2000000,
    min_payout_amount: 1000,
    max_payout_amount: 2000000,
    min_bank_transfer_amount: 500,
    max_bank_transfer_amount: 2000000,
    is_active: true,
    api_base_url: '',
    api_token: '',
    api_timeout_seconds: 120,
    supports_smartlink: true,
    supports_callback: true,
    webhook_secret: '',
    pal_v2_enabled: false,
    pal_v2_public_key: '',
    pal_v2_secret_key: '',
    pal_v2_base_url: 'https://partner.pals.africa/api',
  })

  useEffect(() => {
    loadOperators()
    loadOperatorHealth()
    loadCurrencies()
  }, [])

  const loadCurrencies = async () => {
    try {
      const response = await smartFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v2/admin/currencies/`)
      if (!response.ok) return
      const data = await response.json()
      const list = Array.isArray(data) ? data : data.results || []
      setCurrencies(list)
    } catch (error) {
      console.error("Error loading currencies:", error)
    }
  }

  const currencyOptions = (() => {
    const active = currencies.filter((c) => c.is_active)
    const current = formData.currency
    if (current && !active.some((c) => c.code === current)) {
      const orphan = currencies.find((c) => c.code === current)
      if (orphan) return [...active, orphan]
      return [...active, { code: current, name: current, is_active: false }]
    }
    return active.length > 0 ? active : currencies
  })()

  const loadOperators = async () => {
    try {
      setLoading(true)
      const response = await smartFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v2/admin/operators/`)
      
      if (response.ok) {
        const data = await response.json()
        setOperators(data)
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les opérateurs",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading operators:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les opérateurs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadOperatorHealth = async () => {
    try {
      const response = await smartFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v2/admin/health/operators/`)
      
      if (response.ok) {
        const data = await response.json()
        setOperatorHealth(data.operators)
      }
    } catch (error) {
      console.error("Error loading operator health:", error)
    }
  }

  const handleCreateOperator = async () => {
    try {
      setIsSubmitting(true)
      const payload: Record<string, unknown> = { ...formData }
      // PAL : credentials dans Settings — ne pas les envoyer sur l'opérateur
      if (payload.api_backend === "pal_v2") {
        payload.pal_v2_enabled = true
        payload.api_base_url = ""
        payload.api_token = ""
        delete payload.pal_v2_public_key
        delete payload.pal_v2_secret_key
        delete payload.pal_v2_base_url
      }
      delete payload.webhook_secret
      delete payload.supports_callback
      const response = await smartFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v2/admin/operators/create/`, {
        method: "POST",
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Opérateur créé avec succès",
        })
        setIsCreateDialogOpen(false)
        resetForm()
        loadOperators()
        loadOperatorHealth()
      } else {
        const errorData = await response.json()
        toast({
          title: "Erreur",
          description:
            errorData.message
            || (typeof errorData === "object"
              ? Object.entries(errorData)
                  .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                  .join(" · ")
              : null)
            || "Échec de la création de l'opérateur",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating operator:", error)
      toast({
        title: "Erreur",
        description: "Échec de la création de l'opérateur",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateOperator = async () => {
    if (!selectedOperator) return

    try {
      setIsSubmitting(true)
      // Ne pas renvoyer les secrets vides (sinon 400 "ne peut être vide")
      const payload: Record<string, unknown> = { ...formData }
      if (!String(payload.api_token || "").trim()) delete payload.api_token
      delete payload.webhook_secret
      delete payload.supports_callback
      delete payload.pal_v2_secret_key
      if (payload.api_backend === "pal_v2") {
        payload.pal_v2_enabled = true
        delete payload.pal_v2_public_key
        delete payload.pal_v2_secret_key
        delete payload.pal_v2_base_url
        delete payload.api_token
      }

      const response = await smartFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v2/admin/operators/${selectedOperator.uid}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Opérateur mis à jour avec succès",
        })
        setIsEditDialogOpen(false)
        setSelectedOperator(null)
        resetForm()
        loadOperators()
        loadOperatorHealth()
      } else {
        const errorData = await response.json()
        toast({
          title: "Erreur",
          description: errorData.message || "Échec de la mise à jour de l'opérateur",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating operator:", error)
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour de l'opérateur",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteOperator = async () => {
    if (!operatorToDelete) return

    try {
      setIsSubmitting(true)
      const response = await smartFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v2/admin/operators/${operatorToDelete.uid}/delete/`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Opérateur supprimé avec succès",
        })
        setIsDeleteDialogOpen(false)
        setOperatorToDelete(null)
        loadOperators()
        loadOperatorHealth()
      } else {
        const errorData = await response.json()
        toast({
          title: "Erreur",
          description: errorData.message || "Échec de la suppression de l'opérateur",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting operator:", error)
      toast({
        title: "Erreur",
        description: "Échec de la suppression de l'opérateur",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      operator_name: '',
      public_operator_name: '',
      operator_code: '',
      api_backend: 'wave',
      country_code: '',
      currency: 'XOF',
      operator_payin_rate: 1.0,
      operator_payout_rate: 1.0,
      operator_bank_transfer_rate: 1.0,
      payin_fee_mode: 'percentage',
      payout_fee_mode: 'percentage',
      bank_transfer_fee_mode: 'percentage',
      operator_payin_fee_fixed: 0,
      operator_payout_fee_fixed: 0,
      operator_bank_transfer_fee_fixed: 0,
      operator_payin_fee_base: 0,
      operator_payout_fee_base: 0,
      operator_bank_transfer_fee_base: 0,
      min_payin_amount: 500,
      max_payin_amount: 2000000,
      min_payout_amount: 1000,
      max_payout_amount: 2000000,
      min_bank_transfer_amount: 500,
      max_bank_transfer_amount: 2000000,
      is_active: true,
      api_base_url: '',
      api_token: '',
      api_timeout_seconds: 120,
      supports_smartlink: true,
      supports_callback: true,
      webhook_secret: '',
      pal_v2_enabled: false,
      pal_v2_public_key: '',
      pal_v2_secret_key: '',
      pal_v2_base_url: 'https://partner.pals.africa/api',
    })
  }

  const openEditDialog = (operator: Operator) => {
    setSelectedOperator(operator)
    setFormData({
      operator_name: operator.operator_name,
      public_operator_name: operator.public_operator_name || '',
      operator_code: operator.operator_code,
      api_backend: operator.api_backend || 'wave',
      country_code: operator.country_code || '',
      currency: operator.currency || 'XOF',
      operator_payin_rate: parseFloat(operator.operator_payin_rate),
      operator_payout_rate: parseFloat(operator.operator_payout_rate),
      operator_bank_transfer_rate: operator.operator_bank_transfer_rate ? parseFloat(operator.operator_bank_transfer_rate) : 1.0,
      payin_fee_mode: operator.payin_fee_mode || 'percentage',
      payout_fee_mode: operator.payout_fee_mode || 'percentage',
      bank_transfer_fee_mode: operator.bank_transfer_fee_mode || 'percentage',
      operator_payin_fee_fixed: operator.operator_payin_fee_fixed || 0,
      operator_payout_fee_fixed: operator.operator_payout_fee_fixed || 0,
      operator_bank_transfer_fee_fixed: operator.operator_bank_transfer_fee_fixed || 0,
      operator_payin_fee_base: operator.operator_payin_fee_base || 0,
      operator_payout_fee_base: operator.operator_payout_fee_base || 0,
      operator_bank_transfer_fee_base: operator.operator_bank_transfer_fee_base || 0,
      min_payin_amount: operator.min_payin_amount,
      max_payin_amount: operator.max_payin_amount,
      min_payout_amount: operator.min_payout_amount,
      max_payout_amount: operator.max_payout_amount,
      min_bank_transfer_amount: operator.min_bank_transfer_amount || 500,
      max_bank_transfer_amount: operator.max_bank_transfer_amount || 2000000,
      is_active: operator.is_active,
      api_base_url: operator.api_base_url,
      api_token: '',
      api_timeout_seconds: operator.api_timeout_seconds || 120,
      supports_smartlink: operator.supports_smartlink,
      supports_callback: operator.supports_callback,
      webhook_secret: '',
      pal_v2_enabled: operator.pal_v2_enabled || false,
      pal_v2_public_key: operator.pal_v2_public_key || '',
      pal_v2_secret_key: '',
      pal_v2_base_url: operator.pal_v2_base_url || 'https://partner.pals.africa/api',
    })
    setIsEditDialogOpen(true)
  }

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "inactive":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "not_implemented":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getHealthStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Actif</Badge>
      case "inactive":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactif</Badge>
      case "not_implemented":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Non implémenté</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inconnu</Badge>
    }
  }

  const filteredOperators = operators.filter(operator => {
    const matchesSearch =
      operator.operator_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (operator.public_operator_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      operator.operator_code.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterStatus === "all") return matchesSearch
    if (filterStatus === "active") return matchesSearch && operator.is_active
    if (filterStatus === "inactive") return matchesSearch && !operator.is_active
    
    return matchesSearch
  })

  const formatCurrency = (amount: number, currencyCode = "XOF") => {
    try {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 0,
      }).format(amount)
    } catch {
      return `${amount.toLocaleString("fr-FR")} ${currencyCode}`
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des opérateurs...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Gestion des opérateurs</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Gérer les opérateurs de paiement et suivre leur état de santé
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un opérateur
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total opérateurs</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operators.length}</div>
            <p className="text-xs text-muted-foreground">
              {operators.filter(op => op.is_active).length} actifs
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">État de santé</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {operatorHealth.filter(op => op.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {operatorHealth.filter(op => op.status === "not_implemented").length} non implémentés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liens de paiement</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {operators.filter(op => op.supports_smartlink).length}
            </div>
            <p className="text-xs text-muted-foreground">
              sur {operators.length} opérateurs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {operators.filter(op => op.supports_callback).length}
            </div>
            <p className="text-xs text-muted-foreground">
              sur {operators.length} opérateurs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="operators">Opérateurs</TabsTrigger>
          <TabsTrigger value="health">État de santé</TabsTrigger>
        </TabsList>

        {/* Operators Tab */}
        <TabsContent value="operators" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Rechercher un opérateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadOperators}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>

          {/* Operators Table */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des opérateurs</CardTitle>
              <CardDescription>
                Gérer et configurer les opérateurs de paiement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Opérateur</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Taux</TableHead>
                    <TableHead>Limites</TableHead>
                    <TableHead>Fonctionnalités</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOperators.map((operator) => (
                    <TableRow key={operator.uid}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {operator.public_operator_name || operator.display_name || operator.operator_name}
                          </div>
                          <div className="text-sm text-slate-500">
                            Interne : {operator.operator_name}
                            {operator.api_backend === "wave" && operator.api_base_url
                              ? ` · ${operator.api_base_url}`
                              : operator.api_backend === "pal_v2"
                                ? " · PAL v2 (paramètres)"
                                : ""}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{operator.operator_code}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Collecte : {operator.payin_fee_mode || "percentage"} / {operator.operator_payin_rate}</div>
                          <div>Retrait : {operator.payout_fee_mode || "percentage"} / {operator.operator_payout_rate}</div>
                          {operator.operator_bank_transfer_rate && (
                            <div>Virement : {operator.operator_bank_transfer_rate}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Collecte : {formatCurrency(operator.min_payin_amount, operator.currency || "XOF")} - {formatCurrency(operator.max_payin_amount, operator.currency || "XOF")}</div>
                          <div>Retrait : {formatCurrency(operator.min_payout_amount, operator.currency || "XOF")} - {formatCurrency(operator.max_payout_amount, operator.currency || "XOF")}</div>
                          {operator.min_bank_transfer_amount && operator.max_bank_transfer_amount && (
                            <div>Virement : {formatCurrency(operator.min_bank_transfer_amount, operator.currency || "XOF")} - {formatCurrency(operator.max_bank_transfer_amount, operator.currency || "XOF")}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            {operator.api_backend === "wave" ? "Wave" : "PAL v2"}
                          </Badge>
                          <Badge variant="outline" className="text-xs font-semibold">
                            {operator.currency || "XOF"}
                          </Badge>
                          {operator.country_code && (
                            <Badge variant="outline" className="text-xs">
                              {operator.country_code}
                            </Badge>
                          )}
                          {operator.pal_v2_enabled && (
                            <Badge className="bg-purple-100 text-purple-800 text-xs">
                              PAL v2 activé
                            </Badge>
                          )}
                          {operator.supports_smartlink && (
                            <Badge variant="secondary" className="text-xs">Lien de paiement</Badge>
                          )}
                          {operator.supports_callback && (
                            <Badge variant="secondary" className="text-xs">Notification</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={operator.is_active ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"}>
                          {operator.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {formatDate(operator.created_at)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openEditDialog(operator)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setOperatorToDelete(operator)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* État de santé Tab */}
        <TabsContent value="health" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Santé des opérateurs</CardTitle>
              <CardDescription>
                Suivi en temps réel de la santé de tous les opérateurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {operatorHealth.map((health) => (
                  <div key={health.operator_code} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getHealthStatusIcon(health.status)}
                      <div>
                        <div className="font-medium">{health.operator_name}</div>
                        <div className="text-sm text-slate-500">{health.operator_code}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {health.balance !== null && (
                        <div className="text-sm">
                          <span className="text-slate-500">Solde :</span>
                          <span className="font-medium ml-1">{formatCurrency(health.balance)}</span>
                        </div>
                      )}
                      {getHealthStatusBadge(health.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Operator Dialog */}
  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Créer un opérateur</DialogTitle>
        <DialogDescription>
          Ajouter un nouvel opérateur de paiement
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="operator_name">Nom interne (admin)</Label>
            <Input
              id="operator_name"
              value={formData.operator_name}
              onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })}
              placeholder="ex: Moov BJ Pal"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="public_operator_name">Nom public (marchand)</Label>
            <Input
              id="public_operator_name"
              value={formData.public_operator_name || ""}
              onChange={(e) => setFormData({ ...formData, public_operator_name: e.target.value })}
              placeholder="ex: Moov Bénin"
            />
            <p className="text-xs text-muted-foreground">
              Affiché dans les sélecteurs collecte/retrait du tableau de bord. Si vide → nom interne.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="operator_code">Code opérateur</Label>
            <Input
              id="operator_code"
              value={formData.operator_code}
              onChange={(e) => setFormData({ ...formData, operator_code: e.target.value })}
              placeholder="ex: wave-sn"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="api_backend">Passerelle d'API</Label>
            <Select
              value={formData.api_backend}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  api_backend: value,
                  pal_v2_enabled: value === "pal_v2",
                  ...(value === "pal_v2"
                    ? { api_base_url: "", api_token: "" }
                    : {}),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir la passerelle d'API" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wave">Wave</SelectItem>
                <SelectItem value="pal_v2">PAL v2</SelectItem>
              </SelectContent>
            </Select>
            {formData.api_backend === "pal_v2" && (
              <p className="text-xs text-muted-foreground">
                URL et clés PAL : paramètres globaux (pas sur l&apos;opérateur).
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="country_code">Code pays</Label>
            <Input
              id="country_code"
              value={formData.country_code}
              onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
              placeholder="ex: SN"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Devise (portefeuille impacté)</Label>
          <Select
            value={formData.currency || "XOF"}
            onValueChange={(value) => setFormData({ ...formData, currency: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir la devise" />
            </SelectTrigger>
            <SelectContent>
              {currencyOptions.length === 0 ? (
                <SelectItem value="XOF">XOF</SelectItem>
              ) : (
                currencyOptions.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.code}{c.name ? ` — ${c.name}` : ""}{!c.is_active ? " (inactif)" : ""}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {formData.api_backend === "wave" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="api_base_url">URL de base de l'API</Label>
              <Input
                id="api_base_url"
                value={formData.api_base_url}
                onChange={(e) => setFormData({ ...formData, api_base_url: e.target.value })}
                placeholder="https://api.wave.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="api_token">Clé API</Label>
                <Input
                  id="api_token"
                  type="password"
                  value={formData.api_token}
                  onChange={(e) => setFormData({ ...formData, api_token: e.target.value })}
                  placeholder="Saisir la clé API"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api_timeout_seconds">Délai d'attente API (secondes)</Label>
                <Input
                  id="api_timeout_seconds"
                  type="number"
                  value={formData.api_timeout_seconds}
                  onChange={(e) => setFormData({ ...formData, api_timeout_seconds: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </>
        )}

        {formData.api_backend === "pal_v2" && (
          <div className="space-y-2">
            <Label htmlFor="api_timeout_seconds">Délai d'attente API (secondes)</Label>
            <Input
              id="api_timeout_seconds"
              type="number"
              value={formData.api_timeout_seconds}
              onChange={(e) => setFormData({ ...formData, api_timeout_seconds: parseInt(e.target.value) })}
            />
          </div>
        )}

        {/* Frais / coûts opérateur */}
        <div className="space-y-2">
          <Label className="text-base">Coûts opérateur (par flux)</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <OperatorFeeFlowFields
              idPrefix="payin"
              title="Collecte"
              mode={formData.payin_fee_mode}
              rate={formData.operator_payin_rate}
              fixed={formData.operator_payin_fee_fixed}
              base={formData.operator_payin_fee_base}
              onMode={(v) => setFormData({ ...formData, payin_fee_mode: v })}
              onRate={(v) => setFormData({ ...formData, operator_payin_rate: v })}
              onFixed={(v) => setFormData({ ...formData, operator_payin_fee_fixed: v })}
              onBase={(v) => setFormData({ ...formData, operator_payin_fee_base: v })}
            />
            <OperatorFeeFlowFields
              idPrefix="payout"
              title="Retrait"
              mode={formData.payout_fee_mode}
              rate={formData.operator_payout_rate}
              fixed={formData.operator_payout_fee_fixed}
              base={formData.operator_payout_fee_base}
              onMode={(v) => setFormData({ ...formData, payout_fee_mode: v })}
              onRate={(v) => setFormData({ ...formData, operator_payout_rate: v })}
              onFixed={(v) => setFormData({ ...formData, operator_payout_fee_fixed: v })}
              onBase={(v) => setFormData({ ...formData, operator_payout_fee_base: v })}
            />
            <OperatorFeeFlowFields
              idPrefix="bank"
              title="Virement"
              mode={formData.bank_transfer_fee_mode}
              rate={formData.operator_bank_transfer_rate}
              fixed={formData.operator_bank_transfer_fee_fixed}
              base={formData.operator_bank_transfer_fee_base}
              onMode={(v) => setFormData({ ...formData, bank_transfer_fee_mode: v })}
              onRate={(v) => setFormData({ ...formData, operator_bank_transfer_rate: v })}
              onFixed={(v) => setFormData({ ...formData, operator_bank_transfer_fee_fixed: v })}
              onBase={(v) => setFormData({ ...formData, operator_bank_transfer_fee_base: v })}
            />
          </div>
        </div>

        {/* Limits */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min_payin_amount">Montant min. collecte</Label>
            <Input
              id="min_payin_amount"
              type="number"
              value={formData.min_payin_amount}
              onChange={(e) => setFormData({ ...formData, min_payin_amount: parseInt(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_payin_amount">Montant max. collecte</Label>
            <Input
              id="max_payin_amount"
              type="number"
              value={formData.max_payin_amount}
              onChange={(e) => setFormData({ ...formData, max_payin_amount: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min_payout_amount">Montant min. retrait</Label>
            <Input
              id="min_payout_amount"
              type="number"
              value={formData.min_payout_amount}
              onChange={(e) => setFormData({ ...formData, min_payout_amount: parseInt(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_payout_amount">Montant max. retrait</Label>
            <Input
              id="max_payout_amount"
              type="number"
              value={formData.max_payout_amount}
              onChange={(e) => setFormData({ ...formData, max_payout_amount: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min_bank_transfer_amount">Montant min. virement</Label>
            <Input
              id="min_bank_transfer_amount"
              type="number"
              value={formData.min_bank_transfer_amount}
              onChange={(e) => setFormData({ ...formData, min_bank_transfer_amount: parseInt(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_bank_transfer_amount">Montant max. virement</Label>
            <Input
              id="max_bank_transfer_amount"
              type="number"
              value={formData.max_bank_transfer_amount}
              onChange={(e) => setFormData({ ...formData, max_bank_transfer_amount: parseInt(e.target.value) })}
            />
          </div>
        </div>

        {/* PAL v2 : credentials dans Settings globaux */}
        {formData.api_backend === "pal_v2" && (
          <p className="text-sm text-muted-foreground border rounded-lg p-3">
            Clés et base URL PAL v2 : configurées dans les paramètres globaux, pas ici.
          </p>
        )}

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Actif</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="supports_smartlink"
              checked={formData.supports_smartlink}
              onCheckedChange={(checked) => setFormData({ ...formData, supports_smartlink: checked })}
            />
            <Label htmlFor="supports_smartlink">Liens de paiement</Label>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
          Annuler
        </Button>
        <Button onClick={handleCreateOperator} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Création...
            </>
          ) : (
            "Créer l'opérateur"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

      {/* Modifier l'opérateur Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'opérateur</DialogTitle>
            <DialogDescription>
              Mettre à jour la configuration de l'opérateur
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_operator_name">Nom interne (admin)</Label>
                <Input
                  id="edit_operator_name"
                  value={formData.operator_name}
                  onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_public_operator_name">Nom public (marchand)</Label>
                <Input
                  id="edit_public_operator_name"
                  value={formData.public_operator_name || ""}
                  onChange={(e) => setFormData({ ...formData, public_operator_name: e.target.value })}
                  placeholder="ex: Moov Bénin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_operator_code">Code opérateur</Label>
                <Input
                  id="edit_operator_code"
                  value={formData.operator_code}
                  onChange={(e) => setFormData({ ...formData, operator_code: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_api_backend">Passerelle d'API</Label>
                <Select
                  value={formData.api_backend}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      api_backend: value,
                      pal_v2_enabled: value === "pal_v2",
                      ...(value === "pal_v2" ? { api_base_url: "", api_token: "" } : {}),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir la passerelle d'API" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wave">Wave</SelectItem>
                    <SelectItem value="pal_v2">PAL v2</SelectItem>
                  </SelectContent>
                </Select>
                {formData.api_backend === "pal_v2" && (
                  <p className="text-xs text-muted-foreground">
                    URL et clés PAL : paramètres globaux (pas sur l&apos;opérateur).
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_country_code">Code pays</Label>
                <Input
                  id="edit_country_code"
                  value={formData.country_code}
                  onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_currency">Devise (portefeuille impacté)</Label>
              <Select
                value={formData.currency || "XOF"}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger id="edit_currency">
                  <SelectValue placeholder="Choisir la devise" />
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.length === 0 ? (
                    <SelectItem value="XOF">XOF</SelectItem>
                  ) : (
                    currencyOptions.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.code}{c.name ? ` — ${c.name}` : ""}{!c.is_active ? " (inactif)" : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {formData.api_backend === "wave" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit_api_base_url">URL de base de l'API</Label>
                  <Input
                    id="edit_api_base_url"
                    value={formData.api_base_url}
                    onChange={(e) => setFormData({ ...formData, api_base_url: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_api_token">Clé API (laisser vide pour conserver)</Label>
                    <Input
                      id="edit_api_token"
                      type="password"
                      value={formData.api_token}
                      onChange={(e) => setFormData({ ...formData, api_token: e.target.value })}
                      placeholder="Nouvelle clé API"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_api_timeout_seconds">Délai d'attente API (secondes)</Label>
                    <Input
                      id="edit_api_timeout_seconds"
                      type="number"
                      value={formData.api_timeout_seconds}
                      onChange={(e) => setFormData({ ...formData, api_timeout_seconds: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </>
            )}

            {formData.api_backend === "pal_v2" && (
              <div className="space-y-2">
                <Label htmlFor="edit_api_timeout_seconds">Délai d'attente API (secondes)</Label>
                <Input
                  id="edit_api_timeout_seconds"
                  type="number"
                  value={formData.api_timeout_seconds}
                  onChange={(e) => setFormData({ ...formData, api_timeout_seconds: parseInt(e.target.value) })}
                />
              </div>
            )}

            {/* Frais / coûts opérateur */}
            <div className="space-y-2">
              <Label className="text-base">Coûts opérateur (par flux)</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <OperatorFeeFlowFields
                  idPrefix="edit_payin"
                  title="Collecte"
                  mode={formData.payin_fee_mode}
                  rate={formData.operator_payin_rate}
                  fixed={formData.operator_payin_fee_fixed}
                  base={formData.operator_payin_fee_base}
                  onMode={(v) => setFormData({ ...formData, payin_fee_mode: v })}
                  onRate={(v) => setFormData({ ...formData, operator_payin_rate: v })}
                  onFixed={(v) => setFormData({ ...formData, operator_payin_fee_fixed: v })}
                  onBase={(v) => setFormData({ ...formData, operator_payin_fee_base: v })}
                />
                <OperatorFeeFlowFields
                  idPrefix="edit_payout"
                  title="Retrait"
                  mode={formData.payout_fee_mode}
                  rate={formData.operator_payout_rate}
                  fixed={formData.operator_payout_fee_fixed}
                  base={formData.operator_payout_fee_base}
                  onMode={(v) => setFormData({ ...formData, payout_fee_mode: v })}
                  onRate={(v) => setFormData({ ...formData, operator_payout_rate: v })}
                  onFixed={(v) => setFormData({ ...formData, operator_payout_fee_fixed: v })}
                  onBase={(v) => setFormData({ ...formData, operator_payout_fee_base: v })}
                />
                <OperatorFeeFlowFields
                  idPrefix="edit_bank"
                  title="Virement"
                  mode={formData.bank_transfer_fee_mode}
                  rate={formData.operator_bank_transfer_rate}
                  fixed={formData.operator_bank_transfer_fee_fixed}
                  base={formData.operator_bank_transfer_fee_base}
                  onMode={(v) => setFormData({ ...formData, bank_transfer_fee_mode: v })}
                  onRate={(v) => setFormData({ ...formData, operator_bank_transfer_rate: v })}
                  onFixed={(v) => setFormData({ ...formData, operator_bank_transfer_fee_fixed: v })}
                  onBase={(v) => setFormData({ ...formData, operator_bank_transfer_fee_base: v })}
                />
              </div>
            </div>

            {/* Limits */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_min_payin_amount">Montant min. collecte</Label>
                <Input
                  id="edit_min_payin_amount"
                  type="number"
                  value={formData.min_payin_amount}
                  onChange={(e) => setFormData({ ...formData, min_payin_amount: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_max_payin_amount">Montant max. collecte</Label>
                <Input
                  id="edit_max_payin_amount"
                  type="number"
                  value={formData.max_payin_amount}
                  onChange={(e) => setFormData({ ...formData, max_payin_amount: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_min_payout_amount">Montant min. retrait</Label>
                <Input
                  id="edit_min_payout_amount"
                  type="number"
                  value={formData.min_payout_amount}
                  onChange={(e) => setFormData({ ...formData, min_payout_amount: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_max_payout_amount">Montant max. retrait</Label>
                <Input
                  id="edit_max_payout_amount"
                  type="number"
                  value={formData.max_payout_amount}
                  onChange={(e) => setFormData({ ...formData, max_payout_amount: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_min_bank_transfer_amount">Montant min. virement</Label>
                <Input
                  id="edit_min_bank_transfer_amount"
                  type="number"
                  value={formData.min_bank_transfer_amount}
                  onChange={(e) => setFormData({ ...formData, min_bank_transfer_amount: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_max_bank_transfer_amount">Montant max. virement</Label>
                <Input
                  id="edit_max_bank_transfer_amount"
                  type="number"
                  value={formData.max_bank_transfer_amount}
                  onChange={(e) => setFormData({ ...formData, max_bank_transfer_amount: parseInt(e.target.value) })}
                />
              </div>
            </div>

            {/* PAL v2 : credentials dans Settings globaux */}
            {formData.api_backend === "pal_v2" && (
              <p className="text-sm text-muted-foreground border rounded-lg p-3">
                Clés et base URL PAL v2 : configurées dans les paramètres globaux, pas ici.
              </p>
            )}

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="edit_is_active">Actif</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_supports_smartlink"
                  checked={formData.supports_smartlink}
                  onCheckedChange={(checked) => setFormData({ ...formData, supports_smartlink: checked })}
                />
                <Label htmlFor="edit_supports_smartlink">Liens de paiement</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateOperator} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                "Mettre à jour"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Supprimer l'opérateur Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'opérateur</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment supprimer {operatorToDelete?.operator_name} ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteOperator} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}



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
  operator_code: string
  operator_payin_rate: string
  operator_payout_rate: string
  min_payin_amount: number
  max_payin_amount: number
  min_payout_amount: number
  max_payout_amount: number
  is_active: boolean
  api_base_url: string
  supports_smartlink: boolean
  supports_callback: boolean
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
  operator_code: string
  operator_payin_rate: number
  operator_payout_rate: number
  min_payin_amount: number
  max_payin_amount: number
  min_payout_amount: number
  max_payout_amount: number
  is_active: boolean
  api_base_url: string
  api_timeout_seconds: number
  supports_smartlink: boolean
  supports_callback: boolean
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("operators")
  const { toast } = useToast()

  // Form state for create/edit
  const [formData, setFormData] = useState<CreateOperatorPayload>({
    operator_name: "",
    operator_code: "",
    operator_payin_rate: 1.0,
    operator_payout_rate: 1.0,
    min_payin_amount: 500,
    max_payin_amount: 2000000,
    min_payout_amount: 1000,
    max_payout_amount: 2000000,
    is_active: true,
    api_base_url: "",
    api_timeout_seconds: 120,
    supports_smartlink: true,
    supports_callback: true,
  })

  useEffect(() => {
    loadOperators()
    loadOperatorHealth()
  }, [])

  const loadOperators = async () => {
    try {
      setLoading(true)
      const response = await smartFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v2/admin/operators/`)
      
      if (response.ok) {
        const data = await response.json()
        setOperators(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to load operators",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading operators:", error)
      toast({
        title: "Error",
        description: "Failed to load operators",
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
      const response = await smartFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v2/admin/operators/create/`, {
        method: "POST",
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Operator created successfully",
        })
        setIsCreateDialogOpen(false)
        resetForm()
        loadOperators()
        loadOperatorHealth()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to create operator",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating operator:", error)
      toast({
        title: "Error",
        description: "Failed to create operator",
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
      const response = await smartFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v2/admin/operators/${selectedOperator.uid}/`, {
        method: "PUT",
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Operator updated successfully",
        })
        setIsEditDialogOpen(false)
        setSelectedOperator(null)
        resetForm()
        loadOperators()
        loadOperatorHealth()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to update operator",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating operator:", error)
      toast({
        title: "Error",
        description: "Failed to update operator",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      operator_name: "",
      operator_code: "",
      operator_payin_rate: 1.0,
      operator_payout_rate: 1.0,
      min_payin_amount: 500,
      max_payin_amount: 2000000,
      min_payout_amount: 1000,
      max_payout_amount: 2000000,
      is_active: true,
      api_base_url: "",
      api_timeout_seconds: 120,
      supports_smartlink: true,
      supports_callback: true,
    })
  }

  const openEditDialog = (operator: Operator) => {
    setSelectedOperator(operator)
    setFormData({
      operator_name: operator.operator_name,
      operator_code: operator.operator_code,
      operator_payin_rate: parseFloat(operator.operator_payin_rate),
      operator_payout_rate: parseFloat(operator.operator_payout_rate),
      min_payin_amount: operator.min_payin_amount,
      max_payin_amount: operator.max_payin_amount,
      min_payout_amount: operator.min_payout_amount,
      max_payout_amount: operator.max_payout_amount,
      is_active: operator.is_active,
      api_base_url: operator.api_base_url,
      api_timeout_seconds: 120,
      supports_smartlink: operator.supports_smartlink,
      supports_callback: operator.supports_callback,
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
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "inactive":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactive</Badge>
      case "not_implemented":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Not Implemented</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Unknown</Badge>
    }
  }

  const filteredOperators = operators.filter(operator => {
    const matchesSearch = operator.operator_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         operator.operator_code.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterStatus === "all") return matchesSearch
    if (filterStatus === "active") return matchesSearch && operator.is_active
    if (filterStatus === "inactive") return matchesSearch && !operator.is_active
    
    return matchesSearch
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading operators...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Operators Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage payment operators and monitor their health status
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Operator
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Operators</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operators.length}</div>
            <p className="text-xs text-muted-foreground">
              {operators.filter(op => op.is_active).length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {operatorHealth.filter(op => op.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {operatorHealth.filter(op => op.status === "not_implemented").length} not implemented
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Smartlink Support</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {operators.filter(op => op.supports_smartlink).length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {operators.length} operators
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Callback Support</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {operators.filter(op => op.supports_callback).length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {operators.length} operators
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="operators">Operators</TabsTrigger>
          <TabsTrigger value="health">Health Status</TabsTrigger>
        </TabsList>

        {/* Operators Tab */}
        <TabsContent value="operators" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search operators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadOperators}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Operators Table */}
          <Card>
            <CardHeader>
              <CardTitle>Operators List</CardTitle>
              <CardDescription>
                Manage and configure payment operators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Operator</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Rates</TableHead>
                    <TableHead>Limits</TableHead>
                    <TableHead>Features</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOperators.map((operator) => (
                    <TableRow key={operator.uid}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{operator.operator_name}</div>
                          <div className="text-sm text-slate-500">{operator.api_base_url}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{operator.operator_code}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Payin: {operator.operator_payin_rate}</div>
                          <div>Payout: {operator.operator_payout_rate}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Payin: {formatCurrency(operator.min_payin_amount)} - {formatCurrency(operator.max_payin_amount)}</div>
                          <div>Payout: {formatCurrency(operator.min_payout_amount)} - {formatCurrency(operator.max_payout_amount)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {operator.supports_smartlink && (
                            <Badge variant="secondary" className="text-xs">Smartlink</Badge>
                          )}
                          {operator.supports_callback && (
                            <Badge variant="secondary" className="text-xs">Callback</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={operator.is_active ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"}>
                          {operator.is_active ? "Active" : "Inactive"}
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
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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

        {/* Health Status Tab */}
        <TabsContent value="health" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Operator Health Status</CardTitle>
              <CardDescription>
                Real-time health monitoring of all operators
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
                          <span className="text-slate-500">Balance:</span>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Operator</DialogTitle>
            <DialogDescription>
              Add a new payment operator to the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="operator_name">Operator Name</Label>
                <Input
                  id="operator_name"
                  value={formData.operator_name}
                  onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })}
                  placeholder="e.g., Wave Senegal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="operator_code">Operator Code</Label>
                <Input
                  id="operator_code"
                  value={formData.operator_code}
                  onChange={(e) => setFormData({ ...formData, operator_code: e.target.value })}
                  placeholder="e.g., wave-sn"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="api_base_url">API Base URL</Label>
              <Input
                id="api_base_url"
                value={formData.api_base_url}
                onChange={(e) => setFormData({ ...formData, api_base_url: e.target.value })}
                placeholder="https://api.wave.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="operator_payin_rate">Payin Rate</Label>
                <Input
                  id="operator_payin_rate"
                  type="number"
                  step="0.01"
                  value={formData.operator_payin_rate}
                  onChange={(e) => setFormData({ ...formData, operator_payin_rate: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="operator_payout_rate">Payout Rate</Label>
                <Input
                  id="operator_payout_rate"
                  type="number"
                  step="0.01"
                  value={formData.operator_payout_rate}
                  onChange={(e) => setFormData({ ...formData, operator_payout_rate: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_payin_amount">Min Payin Amount</Label>
                <Input
                  id="min_payin_amount"
                  type="number"
                  value={formData.min_payin_amount}
                  onChange={(e) => setFormData({ ...formData, min_payin_amount: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_payin_amount">Max Payin Amount</Label>
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
                <Label htmlFor="min_payout_amount">Min Payout Amount</Label>
                <Input
                  id="min_payout_amount"
                  type="number"
                  value={formData.min_payout_amount}
                  onChange={(e) => setFormData({ ...formData, min_payout_amount: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_payout_amount">Max Payout Amount</Label>
                <Input
                  id="max_payout_amount"
                  type="number"
                  value={formData.max_payout_amount}
                  onChange={(e) => setFormData({ ...formData, max_payout_amount: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api_timeout_seconds">API Timeout (seconds)</Label>
              <Input
                id="api_timeout_seconds"
                type="number"
                value={formData.api_timeout_seconds}
                onChange={(e) => setFormData({ ...formData, api_timeout_seconds: parseInt(e.target.value) })}
              />
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="supports_smartlink"
                  checked={formData.supports_smartlink}
                  onCheckedChange={(checked) => setFormData({ ...formData, supports_smartlink: checked })}
                />
                <Label htmlFor="supports_smartlink">Smartlink Support</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="supports_callback"
                  checked={formData.supports_callback}
                  onCheckedChange={(checked) => setFormData({ ...formData, supports_callback: checked })}
                />
                <Label htmlFor="supports_callback">Callback Support</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOperator} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Operator"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Operator Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Operator</DialogTitle>
            <DialogDescription>
              Update operator configuration
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_operator_name">Operator Name</Label>
                <Input
                  id="edit_operator_name"
                  value={formData.operator_name}
                  onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_operator_code">Operator Code</Label>
                <Input
                  id="edit_operator_code"
                  value={formData.operator_code}
                  onChange={(e) => setFormData({ ...formData, operator_code: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_api_base_url">API Base URL</Label>
              <Input
                id="edit_api_base_url"
                value={formData.api_base_url}
                onChange={(e) => setFormData({ ...formData, api_base_url: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_operator_payin_rate">Payin Rate</Label>
                <Input
                  id="edit_operator_payin_rate"
                  type="number"
                  step="0.01"
                  value={formData.operator_payin_rate}
                  onChange={(e) => setFormData({ ...formData, operator_payin_rate: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_operator_payout_rate">Payout Rate</Label>
                <Input
                  id="edit_operator_payout_rate"
                  type="number"
                  step="0.01"
                  value={formData.operator_payout_rate}
                  onChange={(e) => setFormData({ ...formData, operator_payout_rate: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_min_payin_amount">Min Payin Amount</Label>
                <Input
                  id="edit_min_payin_amount"
                  type="number"
                  value={formData.min_payin_amount}
                  onChange={(e) => setFormData({ ...formData, min_payin_amount: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_max_payin_amount">Max Payin Amount</Label>
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
                <Label htmlFor="edit_min_payout_amount">Min Payout Amount</Label>
                <Input
                  id="edit_min_payout_amount"
                  type="number"
                  value={formData.min_payout_amount}
                  onChange={(e) => setFormData({ ...formData, min_payout_amount: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_max_payout_amount">Max Payout Amount</Label>
                <Input
                  id="edit_max_payout_amount"
                  type="number"
                  value={formData.max_payout_amount}
                  onChange={(e) => setFormData({ ...formData, max_payout_amount: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_api_timeout_seconds">API Timeout (seconds)</Label>
              <Input
                id="edit_api_timeout_seconds"
                type="number"
                value={formData.api_timeout_seconds}
                onChange={(e) => setFormData({ ...formData, api_timeout_seconds: parseInt(e.target.value) })}
              />
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="edit_is_active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_supports_smartlink"
                  checked={formData.supports_smartlink}
                  onCheckedChange={(checked) => setFormData({ ...formData, supports_smartlink: checked })}
                />
                <Label htmlFor="edit_supports_smartlink">Smartlink Support</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_supports_callback"
                  checked={formData.supports_callback}
                  onCheckedChange={(checked) => setFormData({ ...formData, supports_callback: checked })}
                />
                <Label htmlFor="edit_supports_callback">Callback Support</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateOperator} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Operator"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}



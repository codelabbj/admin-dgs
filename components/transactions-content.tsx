"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Download, Eye, Settings } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { useLanguage } from "@/contexts/language-context"
import { smartFetch, getAccessToken } from "@/utils/auth"

// Transaction status constants
const TRANSACTION_STATUS = [
  { value: "success", label: "Success" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "expired", label: "Expired" },
  { value: "canceled", label: "Canceled" },
  { value: "refund", label: "Refund" }
]

export function TransactionsContent() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")
  const [statusMap, setStatusMap] = useState<Record<string, string>>({})
  const [statusLoading, setStatusLoading] = useState<Record<string, boolean>>({})
  const [changeStatusModalOpen, setChangeStatusModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [selectedStatus, setSelectedStatus] = useState("")
  const [changeStatusLoading, setChangeStatusLoading] = useState(false)
  const { t } = useLanguage()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  // WebSocket references and state
  const webSocketRef = useRef<WebSocket | null>(null)
  const webSocketReconnectAttempts = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const transactionsMapRef = useRef(new Map())
  const wsHealth = useRef({
    lastMessageTime: 0,
    messageCount: 0
  })

  useEffect(() => {
    fetchTransactions()
    
    // Setup WebSocket connection
    setupWebSocket()
    
    // Add health check interval for WebSocket
    const healthCheckInterval = setInterval(() => {
      const now = Date.now()
      const minutesSinceLastMessage = (now - wsHealth.current.lastMessageTime) / (1000 * 60)
      
      if (wsHealth.current.lastMessageTime > 0 && minutesSinceLastMessage > 5) {
        console.warn('Aucun message WebSocket reçu depuis 5 minutes, reconnexion...')
        setupWebSocket() // Force reconnection
      }
    }, 60000) // Check every minute
    
    // Cleanup function
    return () => {
      clearInterval(healthCheckInterval)
      cleanupWebSocket()
    }
  }, [])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const res = await smartFetch(`${baseUrl}/prod/v1/api/transaction`)
      
      if (res.ok) {
        const data = await res.json()
        // Ensure data is an array, handle different response structures
        if (Array.isArray(data)) {
          // Reset the transactions map for first page
          transactionsMapRef.current.clear()
          
          // Add each transaction to the map
          data.forEach((tx: any) => {
            const key = getTransactionKey(tx)
            transactionsMapRef.current.set(key, tx)
          })
          
          setTransactions(data)
        } else if (data && Array.isArray(data.data)) {
          // Reset the transactions map for first page
          transactionsMapRef.current.clear()
          
          // Add each transaction to the map
          data.data.forEach((tx: any) => {
            const key = getTransactionKey(tx)
            transactionsMapRef.current.set(key, tx)
          })
          
          setTransactions(data.data)
        } else if (data && Array.isArray(data.results)) {
          // Reset the transactions map for first page
          transactionsMapRef.current.clear()
          
          // Add each transaction to the map
          data.results.forEach((tx: any) => {
            const key = getTransactionKey(tx)
            transactionsMapRef.current.set(key, tx)
          })
          
          setTransactions(data.results)
        } else {
          console.log('Structure de réponse API:', data)
          setTransactions([])
        }
      } else {
        setError(`Échec de la récupération des transactions: ${res.status}`)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error)
              setError('Échec de la récupération des transactions')
    } finally {
      setLoading(false)
    }
  }

  // Create a function to generate a composite key for transactions
  const getTransactionKey = (transaction: any) => {
    const id = transaction.id || transaction.reference || transaction.transaction_id
    if (!id) {
      console.error('Impossible d\'extraire l\'ID de la transaction:', transaction)
      return `unknown-${Math.random().toString(36).substring(2, 11)}`
    }
    return id.toString()
  }

  // WebSocket setup and management functions
  const setupWebSocket = () => {
    const token = getAccessToken()
    if (!token) {
      console.log('Aucun token d\'accès disponible pour la connexion WebSocket')
      return
    }

    // Clean up existing connection
    cleanupWebSocket()

    try {
      // Replace with your actual WebSocket URL when API is available
      const wsUrl = `${baseUrl?.replace('http', 'ws')}/ws/transactions?token=${encodeURIComponent(token)}`
      console.log('Tentative de connexion au WebSocket:', wsUrl)
      
      webSocketRef.current = new WebSocket(wsUrl)

      // Set connection timeout
      const connectionTimeout = setTimeout(() => {
        if (webSocketRef.current?.readyState !== WebSocket.OPEN) {
          handleConnectionFailure('Délai de connexion dépassé')
        }
      }, 5000)

      webSocketRef.current.onopen = () => {
        clearTimeout(connectionTimeout)
        console.log('WebSocket connecté avec succès')
        webSocketReconnectAttempts.current = 0
        startPingInterval()
      }

      webSocketRef.current.onclose = (event) => {
        clearTimeout(connectionTimeout)
        handleWebSocketClose(event)
      }

      webSocketRef.current.onerror = (error) => {
        console.error('Erreur WebSocket:', error)
        handleConnectionFailure('Échec de la connexion')
      }

      webSocketRef.current.onmessage = handleWebSocketMessage

    } catch (error) {
      console.error('Échec de la configuration WebSocket:', error)
              handleConnectionFailure('Échec de l\'initialisation du WebSocket')
    }
  }

  const cleanupWebSocket = () => {
    if (webSocketRef.current) {
      webSocketRef.current.close()
      webSocketRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
  }

  const startPingInterval = () => {
    const pingInterval = setInterval(() => {
      if (webSocketRef.current?.readyState === WebSocket.OPEN) {
        try {
          webSocketRef.current.send(JSON.stringify({ type: 'ping' }))
        } catch (error) {
          console.error('Échec de l\'envoi du ping:', error)
          cleanupWebSocket()
          setupWebSocket()
        }
      } else {
        clearInterval(pingInterval)
      }
    }, 30000)

    // Store the interval ID for cleanup
    if (webSocketRef.current) {
      (webSocketRef.current as any).pingInterval = pingInterval
    }
  }

  const handleConnectionFailure = (message: string) => {
            console.error('Message d\'erreur:', message)
    
    // Implement exponential backoff
    const backoffDelay = Math.min(1000 * Math.pow(2, webSocketReconnectAttempts.current), 30000)
    webSocketReconnectAttempts.current++

    reconnectTimeoutRef.current = setTimeout(() => {
      setupWebSocket()
    }, backoffDelay)
  }

  const handleWebSocketMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data)
      wsHealth.current = {
        lastMessageTime: Date.now(),
        messageCount: wsHealth.current.messageCount + 1
      }

              console.log('Message WebSocket reçu:', data)

      switch (data.type) {
        case 'transaction_update':
          handleTransactionUpdate(data.transaction)
          break
        case 'new_transaction':
          handleNewTransaction(data.transaction)
          break
        case 'pong':
          console.log('Pong reçu du serveur')
          break
        case 'error':
          console.error('Erreur du serveur:', data.message)
          break
        default:
          if (data.transaction) {
            const existingTransaction = transactionsMapRef.current.has(getTransactionKey(data.transaction))
            if (existingTransaction) {
              handleTransactionUpdate(data.transaction)
            } else {
              handleNewTransaction(data.transaction)
            }
          }
      }

    } catch (error) {
      console.error('Erreur lors du traitement du message WebSocket:', error)
    }
  }

  const handleWebSocketClose = (event: CloseEvent) => {
    cleanupWebSocket()
    
    const reason = getCloseReason(event.code)
          console.log(`WebSocket fermé: ${reason}`)

    if (event.code !== 1000) {
      handleConnectionFailure(reason)
    }
  }

  const getCloseReason = (code: number): string => {
    const closeReasons: Record<number, string> = {
          1000: 'Fermeture normale',
    1001: 'Départ',
    1002: 'Erreur de protocole',
    1003: 'Données non supportées',
    1005: 'Aucun statut reçu',
    1006: 'Fermeture anormale',
    1007: 'Données de trame invalides',
    1008: 'Violation de politique',
    1009: 'Message trop volumineux',
    1010: 'Extension obligatoire',
    1011: 'Erreur interne du serveur',
    1012: 'Redémarrage du service',
    1013: 'Réessayer plus tard',
    1014: 'Passerelle défaillante',
    1015: 'Poignée de main TLS'
    }

    return closeReasons[code] || `Unknown reason (${code})`
  }

  // Handle new transaction from WebSocket
  const handleNewTransaction = (transaction: any) => {
    const key = getTransactionKey(transaction)
    
    // Check if we already have this transaction
    if (!transactionsMapRef.current.has(key)) {
      // Add to our map
      transactionsMapRef.current.set(key, transaction)
      
      // Add to state (at the beginning)
      setTransactions(prev => [transaction, ...prev])
              console.log('Nouvelle transaction ajoutée via WebSocket:', transaction)
    }
  }
  
  // Handle transaction updates from WebSocket
  const handleTransactionUpdate = (updatedTransaction: any) => {
    const key = getTransactionKey(updatedTransaction)
    
            console.log('Mise à jour reçue pour la transaction:', key, updatedTransaction)
    
    // Update the transaction in our state
    setTransactions(prev => 
      prev.map(item => {
        if (getTransactionKey(item) === key) {
          // Update the transaction with new data
          return { ...item, ...updatedTransaction }
        }
        return item
      })
    )
    
    // Update the transaction in our map
    if (transactionsMapRef.current.has(key)) {
      const existingItem = transactionsMapRef.current.get(key)
      if (existingItem) {
        const updatedItem = { ...existingItem, ...updatedTransaction }
        transactionsMapRef.current.set(key, updatedItem)
      }
    }
    
            console.log('Transaction mise à jour via WebSocket:', updatedTransaction)
  }

  const handleCheckStatus = async (reference: string) => {
    setStatusLoading((prev) => ({ ...prev, [reference]: true }))
    try {
      const res = await smartFetch(`${baseUrl}/prod/v1/api/transaction-status?reference=${reference}`)
      
      if (res.ok) {
        const data = await res.json()
        setStatusMap((prev) => ({ ...prev, [reference]: data.status || 'Inconnu' }))
      } else {
                  setStatusMap((prev) => ({ ...prev, [reference]: 'Erreur lors de la vérification du statut' }))
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error)
              setStatusMap((prev) => ({ ...prev, [reference]: 'Échec de la vérification du statut' }))
    } finally {
      setStatusLoading((prev) => ({ ...prev, [reference]: false }))
    }
  }

  const handleChangeStatus = async () => {
    if (!selectedTransaction || !selectedStatus) return
    
    setChangeStatusLoading(true)
    try {
      const res = await smartFetch(`${baseUrl}/prod/v1/api/change-trans-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: selectedStatus,
          id: selectedTransaction.id
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        // Update the transaction in the local state
        setTransactions(prev => 
          prev.map(tx => 
            tx.id === selectedTransaction.id 
              ? { ...tx, status: selectedStatus, ...data }
              : tx
          )
        )
        setChangeStatusModalOpen(false)
        setSelectedTransaction(null)
        setSelectedStatus("")
        // You could add a toast notification here for success
      } else {
        console.error('Failed to change transaction status:', res.status)
        // You could add a toast notification here for error
      }
    } catch (error) {
      console.error('Error changing transaction status:', error)
      // You could add a toast notification here for error
    } finally {
      setChangeStatusLoading(false)
    }
  }

  const openChangeStatusModal = (transaction: any) => {
    setSelectedTransaction(transaction)
    setSelectedStatus(transaction.status || "")
    setChangeStatusModalOpen(true)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    const tableColumn = [
      t("transactionId"),
      t("date"),
      t("time"),
      t("customer"),
      t("email"),
      t("amount"),
      t("method"),
      t("status"),
      t("reference"),
    ]
    const tableRows = filteredTransactions.map((transaction) => {
      const dateObj = transaction.created_at ? new Date(transaction.created_at) : null
      return [
        transaction.id || "-",
        dateObj ? dateObj.toLocaleDateString() : "-",
        dateObj ? dateObj.toLocaleTimeString() : "-",
        transaction.customer?.username || transaction.customer?.email || "-",
        transaction.customer?.email || "-",
        transaction.amount?.toLocaleString?.() || transaction.amount || "-",
        transaction.network || transaction.type_trans || "-",
        transaction.status || "-",
        transaction.reference || "-",
      ]
    })
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [220, 220, 220] },
      margin: { top: 20 },
    })
    doc.save("transactions.pdf")
  }

  const filteredTransactions = (Array.isArray(transactions) ? transactions : []).filter((transaction) => {
    const customerName = transaction.customer?.username || transaction.customer?.email || ""
    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.reference || "").toLowerCase().includes(searchTerm.toLowerCase())
    // Status and method filters can be expanded if needed
    return matchesSearch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "success":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">{t("completed")}</Badge>
      case "pending":
      case "pening":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">{t("pending")}</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">{t("failed")}</Badge>
      case "expired":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200">Expired</Badge>
      case "canceled":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200">Canceled</Badge>
      case "refund":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Refund</Badge>
      default:
        return <Badge variant="secondary" className="bg-slate-100 text-slate-800 hover:bg-slate-100 border-slate-200">{status}</Badge>
    }
  }

  const totalAmount = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)
  const completedTransactions = filteredTransactions.filter((t) => t.status === "completed").length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("transactions")}</h1>
          <p className="text-muted-foreground">{t("manageAndTrackPayments")}</p>
        </div>
        <div className="flex space-x-2">
          {/* WebSocket Status Indicator */}
          <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">
            <div className={`w-2 h-2 rounded-full ${
              webSocketRef.current?.readyState === WebSocket.OPEN 
                ? 'bg-green-500' 
                : webSocketRef.current?.readyState === WebSocket.CONNECTING 
                ? 'bg-yellow-500' 
                : 'bg-red-500'
            }`}></div>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {webSocketRef.current?.readyState === WebSocket.OPEN 
                ? 'En Direct' 
                : webSocketRef.current?.readyState === WebSocket.CONNECTING 
                ? 'Connexion...' 
                : 'Hors Ligne'
              }
            </span>
          </div>
          
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            {t("export")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("totalTransactions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTransactions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("completed")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTransactions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("totalAmount")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAmount.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("successRate")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredTransactions.length > 0
                ? Math.round((completedTransactions / filteredTransactions.length) * 100)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("transactionHistory")}</CardTitle>
          <CardDescription>{t("viewAndFilterHistory")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder={t("status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatus")}</SelectItem>
                <SelectItem value="completed">{t("completed")}</SelectItem>
                <SelectItem value="pending">{t("pending")}</SelectItem>
                <SelectItem value="failed">{t("failed")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder={t("method")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allMethods")}</SelectItem>
                <SelectItem value="Mobile Money">{t("mobileMoney")}</SelectItem>
                <SelectItem value="Credit Card">{t("creditCard")}</SelectItem>
                <SelectItem value="Bank Account">{t("bankAccount")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("transactionId")}</TableHead>
                  <TableHead>{t("dateAndTime")}</TableHead>
                  <TableHead>{t("customer")}</TableHead>
                  <TableHead>{t("amount")}</TableHead>
                  <TableHead>{t("method")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">{t("loading")}</TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">{t("noTransactionsFound")}</TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : "-"}</div>
                          <div className="text-sm text-muted-foreground">{transaction.created_at ? new Date(transaction.created_at).toLocaleTimeString() : "-"}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.customer?.username || transaction.customer?.email || "-"}</div>
                          <div className="text-sm text-muted-foreground">{transaction.customer?.email || "-"}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{transaction.amount?.toLocaleString?.() || transaction.amount || "-"} {transaction.currency || ""}</TableCell>
                      <TableCell>{transaction.network || transaction.type_trans || "-"}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCheckStatus(transaction.reference)}
                            disabled={statusLoading[transaction.reference]}
                          >
                            {statusLoading[transaction.reference] ? t("checking") : t("checkStatus")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openChangeStatusModal(transaction)}
                            className="flex items-center space-x-1"
                          >
                            <Settings className="h-3 w-3" />
                            <span>Change Status</span>
                          </Button>
                          {statusMap[transaction.reference] && (
                            <div className="text-xs text-blue-600">{t("status")}: {statusMap[transaction.reference]}</div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Change Status Modal */}
      <Dialog open={changeStatusModalOpen} onOpenChange={setChangeStatusModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Transaction Status</DialogTitle>
            <DialogDescription>
              Select a new status for transaction {selectedTransaction?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right">
                Status
              </label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setChangeStatusModalOpen(false)}
              disabled={changeStatusLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleChangeStatus}
              disabled={changeStatusLoading || !selectedStatus}
            >
              {changeStatusLoading ? "Changing..." : "Change Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}



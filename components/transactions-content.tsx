"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Download, Eye, Settings, ChevronLeft, ChevronRight, Copy, Check } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { useLanguage } from "@/contexts/language-context"
import { smartFetch, getAccessToken } from "@/utils/auth"

// Transaction status constants
const TRANSACTION_STATUS = [
  { value: "success", label: "Succès" },
  { value: "pening", label: "En Attente" },
  { value: "failed", label: "Échec" },
  { value: "expired", label: "Expiré" },
  { value: "refund", label: "Remboursement" },
  { value: "customer_refund", label: "Remboursement Client" },
  { value: "accept", label: "Accepté" },
  { value: "reject", label: "Rejeté" }
]

// Transaction type constants
const TRANSACTION_TYPES = [
  { value: "payment", label: "Paiement" },
  { value: "withdrawal", label: "Retrait" },
  { value: "payout", label: "Paiement Sortant" },
  { value: "deposit", label: "Dépôt" },
  { value: "transfer", label: "Transfert" },
  { value: "refund", label: "Remboursement" },
  { value: "mobile_money", label: "Mobile Money" },
  { value: "bank_transfer", label: "Virement Bancaire" },
  { value: "card_payment", label: "Paiement par Carte" }
]

export function TransactionsContent() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [statusMap, setStatusMap] = useState<Record<string, string>>({})
  const [statusLoading, setStatusLoading] = useState<Record<string, boolean>>({})
  const [changeStatusModalOpen, setChangeStatusModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [selectedStatus, setSelectedStatus] = useState("")
  const [changeStatusLoading, setChangeStatusLoading] = useState(false)
  const [transactionDetailsModalOpen, setTransactionDetailsModalOpen] = useState(false)
  const [selectedTransactionDetails, setSelectedTransactionDetails] = useState<any>(null)
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({})
  const [refundModalOpen, setRefundModalOpen] = useState(false)
  const [refundLoading, setRefundLoading] = useState(false)
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalTransactions, setTotalTransactions] = useState(0)
  
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
    fetchTransactions({}, 1)
    
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

  // Refetch data when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1) // Reset to first page when filtering
      fetchTransactions({
        search: searchTerm,
        status: statusFilter,
        method: methodFilter,
        start_date: startDate,
        end_date: endDate
      }, 1)
    }, 500) // Debounce search by 500ms

    return () => clearTimeout(timeoutId)
  }, [searchTerm, statusFilter, methodFilter, startDate, endDate])

  // Refetch data when page changes
  useEffect(() => {
    fetchTransactions({
      search: searchTerm,
      status: statusFilter,
      method: methodFilter,
      start_date: startDate,
      end_date: endDate
    }, currentPage)
  }, [currentPage])

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

  const fetchTransactions = async (filters?: { search?: string; status?: string; method?: string; start_date?: string; end_date?: string }, page: number = 1) => {
    setLoading(true)
    try {
      // Build query parameters
      const queryParams = new URLSearchParams()
      
      if (filters?.search) {
        queryParams.append('q', filters.search)
      }
      if (filters?.status && filters.status !== 'all') {
        queryParams.append('status', filters.status)
      }
      if (filters?.method && filters.method !== 'all') {
        queryParams.append('method', filters.method)
      }
      if (filters?.start_date) {
        queryParams.append('start_date', filters.start_date)
      }
      if (filters?.end_date) {
        queryParams.append('end_date', filters.end_date)
      }
      
      // Add pagination parameters
      queryParams.append('page', page.toString())
      queryParams.append('page_size', pageSize.toString())
      
      const queryString = queryParams.toString()
      const url = `${baseUrl}/prod/v1/api/transaction?${queryString}`
      
      console.log('Fetching transactions with filters and pagination:', { filters, page, url })
      
      const res = await smartFetch(url)
      
      if (res.ok) {
        const data = await res.json()
        // Ensure data is an array, handle different response structures
        if (Array.isArray(data)) {
          // Reset the transactions map for first page
          if (page === 1) {
            transactionsMapRef.current.clear()
          }
          
          // Add each transaction to the map
          data.forEach((tx: any) => {
            const key = getTransactionKey(tx)
            transactionsMapRef.current.set(key, tx)
          })
          
          setTransactions(data)
          setTotalTransactions(data.length)
          setTotalPages(Math.ceil(data.length / pageSize))
        } else if (data && Array.isArray(data.data)) {
          // Reset the transactions map for first page
          if (page === 1) {
            transactionsMapRef.current.clear()
          }
          
          // Add each transaction to the map
          data.data.forEach((tx: any) => {
            const key = getTransactionKey(tx)
            transactionsMapRef.current.set(key, tx)
          })
          
          setTransactions(data.data)
          setTotalTransactions(data.total || data.data.length)
          setTotalPages(data.total_pages || Math.ceil((data.total || data.data.length) / pageSize))
        } else if (data && Array.isArray(data.results)) {
          // Reset the transactions map for first page
          if (page === 1) {
            transactionsMapRef.current.clear()
          }
          
          // Add each transaction to the map
          data.results.forEach((tx: any) => {
            const key = getTransactionKey(tx)
            transactionsMapRef.current.set(key, tx)
          })
          
          setTransactions(data.results)
          setTotalTransactions(data.count || data.results.length)
          setTotalPages(Math.ceil((data.count || data.results.length) / pageSize))
        } else {
          console.log('Structure de réponse API:', data)
          setTransactions([])
          setTotalTransactions(0)
          setTotalPages(0)
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
    
    // If customer_refund is selected, show confirmation modal
    if (selectedStatus === "customer_refund") {
      setRefundModalOpen(true)
      return
    }
    
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

  // Get allowed status transitions based on current status and transaction type
  const getAllowedStatusTransitions = (currentStatus: string, transactionType?: string) => {
    // Special handling for withdrawal transactions
    if (transactionType === "withdrawal") {
      switch (currentStatus) {
        case "pening":
          return [
            { value: "accept", label: "Accepté" },
            { value: "reject", label: "Rejeté" }
          ]
        case "accept":
          return [] // No transitions allowed from accept
        case "reject":
          return [] // No transitions allowed from reject
        default:
          return [] // No transitions for unknown statuses
      }
    }
    
    // Special handling for payout transactions
    if (transactionType === "payout") {
      switch (currentStatus) {
        case "pening":
          return [
            { value: "success", label: "Succès" },
            { value: "failed", label: "Échec" }
          ]
        case "success":
          return [{ value: "refund", label: "Remboursement" }]
        case "failed":
          return [{ value: "success", label: "Succès" }]
        case "refund":
          return [] // No transitions allowed from refund
        default:
          return [] // No transitions for unknown statuses
      }
    }
    
    // Regular transaction status transitions
    switch (currentStatus) {
      case "success":
        return [{ value: "refund", label: "Remboursement" }]
      case "pening":
        return [
          { value: "failed", label: "Échec" },
          { value: "expired", label: "Expiré" },
          { value: "success", label: "Succès" },
          { value: "customer_refund", label: "Remboursement Client" }
        ]
      case "failed":
        return [
          { value: "success", label: "Succès" },
          { value: "customer_refund", label: "Remboursement Client" }
        ]
      case "expired":
        return [] // No transitions allowed from expired
      case "refund":
        return [] // No transitions allowed from refund
      case "customer_refund":
        return [] // No transitions allowed from customer_refund
      case "accept":
        return [] // No transitions allowed from accept
      case "reject":
        return [] // No transitions allowed from reject
      default:
        return [] // No transitions for unknown statuses
    }
  }

  const openChangeStatusModal = (transaction: any) => {
    setSelectedTransaction(transaction)
    setSelectedStatus(transaction.status || "")
    setChangeStatusModalOpen(true)
  }

  const openTransactionDetailsModal = (transaction: any) => {
    setSelectedTransactionDetails(transaction)
    setTransactionDetailsModalOpen(true)
  }

  const handleRefundConfirmation = async () => {
    if (!selectedTransaction) return
    
    setRefundLoading(true)
    try {
      const res = await smartFetch(`${baseUrl}/prod/v1/api/change-trans-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: "customer_refund",
          id: selectedTransaction.id
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        // Update the transaction in the local state
        setTransactions(prev => 
          prev.map(tx => 
            tx.id === selectedTransaction.id 
              ? { ...tx, status: "customer_refund", ...data }
              : tx
          )
        )
        setRefundModalOpen(false)
        setChangeStatusModalOpen(false)
        setSelectedTransaction(null)
        setSelectedStatus("")
        // You could add a toast notification here for success
      } else {
        console.error('Failed to process refund:', res.status)
        // You could add a toast notification here for error
      }
    } catch (error) {
      console.error('Error processing refund:', error)
      // You could add a toast notification here for error
    } finally {
      setRefundLoading(false)
    }
  }

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedFields(prev => ({ ...prev, [fieldName]: true }))
      setTimeout(() => {
        setCopiedFields(prev => ({ ...prev, [fieldName]: false }))
      }, 2000)
    } catch (error) {
      console.error('Failed to copy text: ', error)
    }
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
      "Type de Transaction",
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
        transaction.network || "-",
        TRANSACTION_TYPES.find(t => t.value === transaction.type_trans)?.label || transaction.type_trans || "-",
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

  // Since we're now filtering on the API side, we can use transactions directly
  const filteredTransactions = Array.isArray(transactions) ? transactions : []

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
      case "customer_refund":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200">Remboursement Client</Badge>
      case "accept":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">Accepté</Badge>
      case "reject":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Rejeté</Badge>
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
                <SelectItem value="success">{t("success")}</SelectItem>
                <SelectItem value="pening">{t("pending")}</SelectItem>
                <SelectItem value="failed">{t("failed")}</SelectItem>
                <SelectItem value="accept">Accepté</SelectItem>
                <SelectItem value="reject">Rejeté</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="Date de début"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate || undefined}
                className="w-full md:w-40"
              />
              <Input
                type="date"
                placeholder="Date de fin"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                className="w-full md:w-40"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStartDate("")
                  setEndDate("")
                  setSearchTerm("")
                  setStatusFilter("all")
                  setMethodFilter("all")
                }}
                className="whitespace-nowrap"
              >
                Effacer les filtres
              </Button>
            </div>
            {/* <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder={t("method")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allMethods")}</SelectItem>
                <SelectItem value="Mobile Money">{t("mobileMoney")}</SelectItem>
                <SelectItem value="Credit Card">{t("creditCard")}</SelectItem>
                <SelectItem value="Bank Account">{t("bankAccount")}</SelectItem>
              </SelectContent>
            </Select> */}
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
                  <TableHead>Type de Transaction</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">{t("loading")}</TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">{t("noTransactionsFound")}</TableCell>
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
                      <TableCell>{transaction.network || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {TRANSACTION_TYPES.find(t => t.value === transaction.type_trans)?.label || transaction.type_trans || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openTransactionDetailsModal(transaction)}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="h-3 w-3" />
                            <span>View Details</span>
                          </Button>
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
          <PaginationComponent />
        </CardContent>
      </Card>

      {/* Change Status Modal */}
      <Dialog open={changeStatusModalOpen} onOpenChange={setChangeStatusModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier le Statut de la Transaction</DialogTitle>
            <DialogDescription>
              Sélectionnez un nouveau statut pour la transaction {selectedTransaction?.id}
              <br />
              <span className="text-sm text-muted-foreground">
                Statut actuel : <strong>{selectedTransaction?.status}</strong>
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {(() => {
              const allowedTransitions = getAllowedStatusTransitions(
                selectedTransaction?.status || "", 
                selectedTransaction?.type_trans
              )
              
              if (allowedTransitions.length === 0) {
                return (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      Aucun changement de statut n'est autorisé pour les transactions avec le statut : <strong>{selectedTransaction?.status}</strong>
                      {selectedTransaction?.type_trans === "withdrawal" && (
                        <span className="block mt-2 text-sm">
                          Type de transaction : <strong>Retrait</strong>
                        </span>
                      )}
                    </p>
                  </div>
                )
              }
              
              return (
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="status" className="text-right">
                    Nouveau Statut
                  </label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner un nouveau statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {allowedTransitions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(selectedTransaction?.type_trans === "withdrawal" || selectedTransaction?.type_trans === "payout") && (
                    <div className="col-span-4 text-sm text-muted-foreground">
                      Type de transaction : <strong>
                        {TRANSACTION_TYPES.find(t => t.value === selectedTransaction?.type_trans)?.label || selectedTransaction?.type_trans}
                      </strong>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setChangeStatusModalOpen(false)}
              disabled={changeStatusLoading}
            >
              Annuler
            </Button>
            {getAllowedStatusTransitions(selectedTransaction?.status || "", selectedTransaction?.type_trans).length > 0 && (
              <Button
                type="button"
                onClick={handleChangeStatus}
                disabled={changeStatusLoading || !selectedStatus || selectedStatus === selectedTransaction?.status}
              >
                {changeStatusLoading ? "Modification..." : "Modifier le Statut"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction Details Modal */}
      <Dialog open={transactionDetailsModalOpen} onOpenChange={setTransactionDetailsModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la Transaction</DialogTitle>
            <DialogDescription>
              Informations complètes de la transaction {selectedTransactionDetails?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedTransactionDetails && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">ID de Transaction</label>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded flex-1">{selectedTransactionDetails.id || "-"}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(selectedTransactionDetails.id, 'transactionId')}
                        className="h-8 w-8 p-0"
                      >
                        {copiedFields['transactionId'] ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Référence</label>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded flex-1">{selectedTransactionDetails.reference || "-"}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(selectedTransactionDetails.reference, 'reference')}
                        className="h-8 w-8 p-0"
                      >
                        {copiedFields['reference'] ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Transaction Reference */}
                {selectedTransactionDetails.transac_reference && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Référence de Transaction</label>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded flex-1">{selectedTransactionDetails.transac_reference}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(selectedTransactionDetails.transac_reference, 'transacReference')}
                        className="h-8 w-8 p-0"
                      >
                        {copiedFields['transacReference'] ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Amount, Status, and Type */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Montant</label>
                    <p className="text-lg font-semibold text-green-600">
                      {selectedTransactionDetails.amount?.toLocaleString?.() || selectedTransactionDetails.amount || "-"} 
                      {selectedTransactionDetails.currency ? ` ${selectedTransactionDetails.currency}` : " FCFA"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Statut</label>
                    <div className="mt-1">{getStatusBadge(selectedTransactionDetails.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <p className="text-sm font-medium">
                      {TRANSACTION_TYPES.find(t => t.value === selectedTransactionDetails.type_trans)?.label || selectedTransactionDetails.type_trans || "-"}
                    </p>
                  </div>
                </div>

                {/* Network and Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Réseau</label>
                    <p className="text-sm font-medium">{selectedTransactionDetails.network || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                    <p className="text-sm font-mono">{selectedTransactionDetails.phone || "-"}</p>
                  </div>
                </div>

                {/* Customer ID */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID Client</label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded flex-1">{selectedTransactionDetails.customer_id || "-"}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedTransactionDetails.customer_id, 'customerId')}
                      className="h-8 w-8 p-0"
                    >
                      {copiedFields['customerId'] ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Beneficiary Information */}
                {selectedTransactionDetails.beneficiary && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-3">Informations Bénéficiaire</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nom</label>
                        <p className="text-sm font-medium">{selectedTransactionDetails.beneficiary.name || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-sm">{selectedTransactionDetails.beneficiary.email || "-"}</p>
                      </div>
                    </div>
                    {selectedTransactionDetails.beneficiary.account_number && (
                      <div className="mt-2">
                        <label className="text-sm font-medium text-muted-foreground">Numéro de Compte</label>
                        <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded">{selectedTransactionDetails.beneficiary.account_number}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* URLs Section */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">URLs de Configuration</h4>
                  <div className="space-y-3">
                    {selectedTransactionDetails.success_url && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">URL de Succès</label>
                        <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded break-all">{selectedTransactionDetails.success_url}</p>
                      </div>
                    )}
                    {selectedTransactionDetails.cancel_url && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">URL d'Annulation</label>
                        <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded break-all">{selectedTransactionDetails.cancel_url}</p>
                      </div>
                    )}
                    {selectedTransactionDetails.callback_url && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">URL de Callback</label>
                        <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded break-all">{selectedTransactionDetails.callback_url}</p>
                      </div>
                    )}
                    {selectedTransactionDetails.wave_launch_url && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">URL de Lancement Wave</label>
                        <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded break-all">{selectedTransactionDetails.wave_launch_url}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Details */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">Détails Supplémentaires</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Code Pays</label>
                      <p className="text-sm">{selectedTransactionDetails.country_code || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Montant des Frais</label>
                      <p className="text-sm">{selectedTransactionDetails.fee_amount ? `${selectedTransactionDetails.fee_amount} FCFA` : "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Pour Compte Client</label>
                      <p className="text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          selectedTransactionDetails.for_customer_account 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedTransactionDetails.for_customer_account ? 'Oui' : 'Non'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Code Marchand</label>
                      <p className="text-sm font-mono">{selectedTransactionDetails.code || "-"}</p>
                    </div>
                  </div>
                  {selectedTransactionDetails.description && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-muted-foreground">Description</label>
                      <p className="text-sm bg-slate-100 dark:bg-slate-800 p-2 rounded">{selectedTransactionDetails.description}</p>
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">Dates</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Date de Création</label>
                      <p className="text-sm">
                        {selectedTransactionDetails.created_at 
                          ? new Date(selectedTransactionDetails.created_at).toLocaleString() 
                          : "-"
                        }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Date de Mise à Jour</label>
                      <p className="text-sm">
                        {selectedTransactionDetails.updated_at 
                          ? new Date(selectedTransactionDetails.updated_at).toLocaleString() 
                          : "-"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setTransactionDetailsModalOpen(false)}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Confirmation Modal */}
      <Dialog open={refundModalOpen} onOpenChange={setRefundModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer le Remboursement</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir rembourser cette transaction ?
              <br />
              <span className="text-sm text-muted-foreground">
                Transaction ID: <strong>{selectedTransaction?.id}</strong>
              </span>
              <br />
              <span className="text-sm text-muted-foreground">
                Montant: <strong>{selectedTransaction?.amount?.toLocaleString?.() || selectedTransaction?.amount || "-"} {selectedTransaction?.currency || "FCFA"}</strong>
              </span>
              <br />
              <span className="text-sm font-medium text-red-600 mt-2 block">
                ⚠️ Êtes-vous sûr de vouloir cela car cette action renverra l'argent à l'utilisateur
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Attention
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Cette action changera le statut de la transaction vers "Remboursement Client" et ne peut pas être annulée.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRefundModalOpen(false)}
              disabled={refundLoading}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleRefundConfirmation}
              disabled={refundLoading}
            >
              {refundLoading ? "Traitement..." : "Confirmer le Remboursement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}



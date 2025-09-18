"use client"

import React from "react"
import { useState, useEffect } from "react"
import { smartFetch } from "@/utils/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "@/contexts/language-context"
import {
  Users,
  Shield,
  Activity,
  Database,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Globe,
  Key,
  Server,
  Network,
  ShieldCheck,
  Eye,
  EyeOff,
  Cpu,
  HardDrive,
  Wifi,
  Zap,
  AlertCircle,
  BarChart3,
  UserCheck,
  UserX,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Settings,
  Bell,
  Calendar,
} from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts"

export function AdminDashboardContent() {
  const [showSystemStats, setShowSystemStats] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { t } = useLanguage()

  // State for API data
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Admin dashboard: Starting to fetch stats after delay')
      fetchStats()
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Vérifier que nous avons un token valide avant de faire l'appel
      const accessToken = localStorage.getItem("access")
      if (!accessToken) {
        console.warn("No access token available for statistics API")
        setError("Authentication token missing")
        return
      }
      
      const res = await smartFetch(`${baseUrl}/prod/v1/api/statistic`)
      
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      } else {
        const errorText = await res.text()
        console.error(`Statistics API error: ${res.status} - ${errorText}`)
        
        if (res.status === 401) {
          setError("Invalid or expired authentication token")
        } else {
          setError(`Failed to fetch stats: ${res.status}`)
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      setError('Failed to fetch statistics')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setIsRefreshing(true)
    await fetchStats()
    setIsRefreshing(false)
  }

  // Mock data for admin dashboard
  const systemMetrics = {
    cpu: 23,
    memory: 67,
    disk: 45,
    network: 89,
    uptime: "99.9%",
    lastBackup: "2 hours ago",
    securityStatus: "Protected",
    activeUsers: 1247,
    totalTransactions: 45678,
    revenue: 234567,
    pendingApprovals: 12,
    systemAlerts: 3,
  }

  const recentActivity = [
    { id: 1, action: "User login", user: "john.doe", time: "2 min ago", status: "success" },
    { id: 2, action: "Payment processed", user: "merchant_123", time: "5 min ago", status: "success" },
    { id: 3, action: "Security alert", user: "system", time: "8 min ago", status: "warning" },
    { id: 4, action: "Database backup", user: "admin", time: "1 hour ago", status: "success" },
    { id: 5, action: "New user registered", user: "jane.smith", time: "2 hours ago", status: "info" },
  ]

  const systemAlerts = [
    { id: 1, type: "warning", message: "High memory usage detected", time: "5 min ago" },
    { id: 2, type: "info", message: "Scheduled maintenance in 2 hours", time: "1 hour ago" },
    { id: 3, type: "success", message: "Security scan completed", time: "2 hours ago" },
  ]

  const chartData = [
    { name: "Mon", users: 1200, transactions: 4500, revenue: 12000 },
    { name: "Tue", users: 1350, transactions: 5200, revenue: 14500 },
    { name: "Wed", users: 1100, transactions: 4800, revenue: 13200 },
    { name: "Thu", users: 1400, transactions: 5600, revenue: 15800 },
    { name: "Fri", users: 1250, transactions: 5100, revenue: 14200 },
    { name: "Sat", users: 900, transactions: 3800, revenue: 10800 },
    { name: "Sun", users: 800, transactions: 3200, revenue: 9200 },
  ]

  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="space-y-8 p-6 pb-20">
          <div className="flex items-center justify-center h-64">
            <div className="text-neutral-600 dark:text-neutral-400">Loading admin dashboard...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-8 p-6 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md z-10 py-6 -mx-6 px-6 border-b border-slate-200 dark:border-neutral-700">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Admin Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">System Overview & Management</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800 bg-transparent"
              onClick={() => setShowSystemStats(!showSystemStats)}
            >
              {showSystemStats ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showSystemStats ? "Hide System Stats" : "Show System Stats"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800 bg-transparent"
              onClick={refreshData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* System Status Cards */}
        {showSystemStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                    <Cpu className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 rounded-full text-xs">
                    {systemMetrics.cpu}%
                  </Badge>
                </div>
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-4">
                  CPU Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={systemMetrics.cpu} className="h-2 mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Optimal performance</p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-purple-600 rounded-xl shadow-lg">
                    <HardDrive className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 rounded-full text-xs">
                    {systemMetrics.memory}%
                  </Badge>
                </div>
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-4">
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={systemMetrics.memory} className="h-2 mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Moderate load</p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-emerald-600 rounded-xl shadow-lg">
                    <Wifi className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 rounded-full text-xs">
                    {systemMetrics.network}%
                  </Badge>
                </div>
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-4">
                  Network Load
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={systemMetrics.network} className="h-2 mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">High traffic</p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-orange-600 rounded-xl shadow-lg">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 rounded-full text-xs">
                    {systemMetrics.uptime}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-4">
                  System Uptime
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {systemMetrics.uptime}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Last backup: {systemMetrics.lastBackup}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-emerald-600 rounded-xl shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-emerald-600 group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-4">
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {systemMetrics.activeUsers.toLocaleString()}
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 rounded-full">+12.5%</Badge>
                <span className="text-sm text-slate-500 dark:text-slate-400">from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-4">
                Total Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {systemMetrics.totalTransactions.toLocaleString()}
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 rounded-full">+8.2%</Badge>
                <span className="text-sm text-slate-500 dark:text-slate-400">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-purple-600 rounded-xl shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-4">
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                ${systemMetrics.revenue.toLocaleString()}
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 rounded-full">+15.3%</Badge>
                <span className="text-sm text-slate-500 dark:text-slate-400">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-orange-600 rounded-xl shadow-lg">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <ArrowDownRight className="h-5 w-5 text-orange-600 group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-4">
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {systemMetrics.pendingApprovals}
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 rounded-full">Requires attention</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Activity Chart */}
          <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">User Activity & Revenue</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Weekly trends for users, transactions, and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Area type="monotone" dataKey="users" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="transactions" stackId="2" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="revenue" stackId="3" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">System Alerts</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Recent system notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                    <div className={`p-2 rounded-lg ${
                      alert.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                      alert.type === 'info' ? 'bg-blue-100 dark:bg-blue-900/20' :
                      'bg-emerald-100 dark:bg-emerald-900/20'
                    }`}>
                      {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                      {alert.type === 'info' && <Bell className="h-4 w-4 text-blue-600" />}
                      {alert.type === 'success' && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{alert.message}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Latest system activities and user actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        activity.status === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/20' :
                        activity.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                        'bg-blue-100 dark:bg-blue-900/20'
                      }`}>
                        {activity.status === 'success' && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                        {activity.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                        {activity.status === 'info' && <Bell className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{activity.action}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">by {activity.user}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          activity.status === 'success' ? 'border-emerald-200 text-emerald-700' :
                          activity.status === 'warning' ? 'border-yellow-200 text-yellow-700' :
                          'border-blue-200 text-blue-700'
                        }`}
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Quick Actions</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
                <Button className="w-full justify-start bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
                <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
                <Button className="w-full justify-start bg-orange-600 hover:bg-orange-700 text-white rounded-xl">
                  <Settings className="h-4 w-4 mr-2" />
                  System Config
                </Button>
                <Button className="w-full justify-start bg-slate-600 hover:bg-slate-700 text-white rounded-xl">
                  <Database className="h-4 w-4 mr-2" />
                  Database Tools
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

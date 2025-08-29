import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Plus, Code, Zap, Shield, Globe, Database, Server, Cpu, Activity, TrendingUp, Users, Clock, CheckCircle, AlertCircle, BarChart3, BookOpen, Terminal, GitBranch, Eye } from "lucide-react"

export default function Developers() {
  // Données simulées pour la page développeurs améliorée
  const devStats = [
    { label: "APIs Actives", value: "156", change: "+8.2%", icon: Code, color: "blue" },
    { label: "Appels API", value: "2.4M", change: "+23.1%", icon: Zap, color: "green" },
    { label: "Temps de Fonctionnement", value: "99.9%", change: "Stable", icon: Shield, color: "emerald" },
    { label: "Utilisateurs Actifs", value: "1,847", change: "+15.3%", icon: Users, color: "purple" },
  ]

  const recentApiCalls = [
    { 
      id: 1, 
      endpoint: "/api/v1/payment", 
      method: "POST", 
      status: "Succès", 
      time: "Il y a 2 min", 
      response: "200ms",
      user: "john.doe@example.com"
    },
    { 
      id: 2, 
      endpoint: "/api/v1/transaction", 
      method: "GET", 
      status: "Succès", 
      time: "Il y a 5 min", 
      response: "150ms",
      user: "jane.smith@example.com"
    },
    { 
      id: 3, 
      endpoint: "/api/v1/user", 
      method: "PUT", 
      status: "Erreur", 
      time: "Il y a 8 min", 
      response: "500ms",
      user: "bob.johnson@example.com"
    },
    { 
      id: 4, 
      endpoint: "/api/v1/webhook", 
      method: "POST", 
      status: "Succès", 
      time: "Il y a 12 min", 
      response: "180ms",
      user: "alice.brown@example.com"
    },
  ]

  const apiEndpoints = [
    { endpoint: "/api/v1/payment", method: "POST", status: "Active", calls: 456789, avgResponse: "180ms" },
    { endpoint: "/api/v1/transaction", method: "GET", status: "Active", calls: 234567, avgResponse: "120ms" },
    { endpoint: "/api/v1/user", method: "PUT", status: "Active", calls: 123456, avgResponse: "200ms" },
    { endpoint: "/api/v1/webhook", method: "POST", status: "Active", calls: 98765, avgResponse: "150ms" },
    { endpoint: "/api/v1/analytics", method: "GET", status: "Maintenance", calls: 54321, avgResponse: "300ms" },
  ]

  const systemMetrics = [
    { metric: "Utilisation CPU", value: 23, status: "Optimal", icon: Cpu, color: "blue" },
    { metric: "Utilisation Mémoire", value: 67, status: "Modéré", icon: Activity, color: "purple" },
    { metric: "Charge Base de Données", value: 45, status: "Bon", icon: Database, color: "green" },
    { metric: "Latence Réseau", value: 12, status: "Excellent", icon: Globe, color: "emerald" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* En-tête Amélioré */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">Portail Développeur</h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">Documentation API, surveillance et outils de développement</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
            <Button className="bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Clé API
            </Button>
          </div>
        </div>

        {/* Statistiques Développeur */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {devStats.map((stat, index) => (
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
          ))}
        </div>

        {/* Recherche et Actions Rapides */}
        <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Rechercher des APIs, endpoints ou documentation..."
                  className="pl-10 rounded-xl border-slate-200 dark:border-neutral-700 h-12"
                />
              </div>
              <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700 h-12 px-6">
                <BookOpen className="h-4 w-4 mr-2" />
                Documentation
              </Button>
              <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700 h-12 px-6">
                <Terminal className="h-4 w-4 mr-2" />
                Terrain de Jeu
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Appels API Récents */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                                  <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-crimson-600" />
                    Appels API Récents
                  </CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">
                    Surveillance en temps réel des requêtes et réponses API
                  </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentApiCalls.map((apiCall) => (
                    <div key={apiCall.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          apiCall.status === 'Succès' ? 'bg-emerald-100 dark:bg-emerald-900/20' :
                          'bg-red-100 dark:bg-red-900/20'
                        }`}>
                          {apiCall.status === 'Succès' ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              className={`text-xs ${
                                apiCall.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                                apiCall.method === 'POST' ? 'bg-green-100 text-green-800' :
                                apiCall.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              {apiCall.method}
                            </Badge>
                            <p className="font-mono text-sm text-neutral-700 dark:text-neutral-300">{apiCall.endpoint}</p>
                          </div>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{apiCall.user}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white mb-1">{apiCall.response}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">{apiCall.time}</span>
                          <Button variant="ghost" size="sm" className="rounded-lg text-crimson-600 hover:text-crimson-700">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Aperçu Développeur */}
          <div className="space-y-6">
            {/* Métriques Système */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                                  <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                    <Server className="h-5 w-5 mr-2 text-crimson-600" />
                    Métriques Système
                  </CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">
                    Performance système en temps réel
                  </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {systemMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-slate-100 dark:bg-neutral-800 rounded-lg">
                          <metric.icon className="h-4 w-4 text-crimson-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{metric.metric}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">{metric.status}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">{metric.value}%</p>
                        <div className="w-16 bg-slate-200 dark:bg-neutral-700 rounded-full h-2 mt-1">
                          <div
                            className={`bg-${metric.color}-600 h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${metric.value}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Points de Terminaison API */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                                  <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                    <Code className="h-5 w-5 mr-2 text-crimson-600" />
                    Points de Terminaison API
                  </CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">
                    Points de terminaison API disponibles
                  </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {apiEndpoints.map((endpoint, index) => (
                    <div key={index} className="p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-600">
                      <div className="flex items-center justify-between mb-2">
                        <Badge 
                          className={`text-xs ${
                            endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                            endpoint.method === 'POST' ? 'bg-green-100 text-green-800' :
                            endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          {endpoint.method}
                        </Badge>
                        <Badge 
                          className={`text-xs ${
                            endpoint.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {endpoint.status}
                        </Badge>
                      </div>
                      <p className="font-mono text-xs text-neutral-700 dark:text-neutral-300 mb-2">{endpoint.endpoint}</p>
                      <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                        <span>{endpoint.calls.toLocaleString()} appels</span>
                        <span>{endpoint.avgResponse} moy</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions Rapides */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white">Actions Rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Voir la Documentation
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <Terminal className="h-4 w-4 mr-2" />
                  Terrain de Jeu API
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <GitBranch className="h-4 w-4 mr-2" />
                  Téléchargements SDK
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analyses
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

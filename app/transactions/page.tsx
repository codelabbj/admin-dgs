import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Download, Eye, CreditCard, TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, BarChart3, Calendar, MapPin } from "lucide-react"

export default function Transactions() {
  // Données simulées pour la page transactions améliorée
  const transactionStats = [
    { label: "Total Transactions", value: "45,678", change: "+12.5%", icon: CreditCard, color: "blue" },
    { label: "Réussies", value: "43,245", change: "+8.2%", icon: CheckCircle, color: "green" },
    { label: "Échouées", value: "2,433", change: "-3.1%", icon: XCircle, color: "red" },
    { label: "En Attente", value: "1,234", change: "+15.3%", icon: Clock, color: "amber" },
  ]

  const recentTransactions = [
    { 
      id: 1, 
      type: "Paiement", 
      amount: "25,000 FCFA", 
      status: "Terminé", 
      time: "Il y a 2 min", 
      method: "Mobile Money",
      customer: "John Doe",
      location: "Abidjan",
      avatar: "/placeholder-user.jpg"
    },
    { 
      id: 2, 
      type: "Transfert", 
      amount: "50,000 FCFA", 
      status: "En Attente", 
      time: "Il y a 15 min", 
      method: "Virement Bancaire",
      customer: "Jane Smith",
      location: "Dakar",
      avatar: "/placeholder-user.jpg"
    },
    { 
      id: 3, 
      type: "Paiement", 
      amount: "12,500 FCFA", 
      status: "Terminé", 
      time: "Il y a 1 heure", 
      method: "Carte de Crédit",
      customer: "Bob Johnson",
      location: "Lagos",
      avatar: "/placeholder-user.jpg"
    },
    { 
      id: 4, 
      type: "Retrait", 
      amount: "100,000 FCFA", 
      status: "En Cours", 
      time: "Il y a 3 heures", 
      method: "Virement Bancaire",
      customer: "Alice Brown",
      location: "Accra",
      avatar: "/placeholder-user.jpg"
    },
    { 
      id: 5, 
      type: "Paiement", 
      amount: "75,000 FCFA", 
      status: "Échoué", 
      time: "Il y a 5 heures", 
      method: "Mobile Money",
      customer: "Charlie Wilson",
      location: "Bamako",
      avatar: "/placeholder-user.jpg"
    },
  ]

  const paymentMethods = [
    { method: "Mobile Money", count: 23456, percentage: 51, icon: CreditCard, color: "crimson" },
    { method: "Carte de Crédit", count: 12345, percentage: 27, icon: CreditCard, color: "blue" },
    { method: "Virement Bancaire", count: 6789, percentage: 15, icon: CreditCard, color: "green" },
    { method: "Espèces", count: 3088, percentage: 7, icon: DollarSign, color: "amber" },
  ]

  const topLocations = [
    { country: "Côte d'Ivoire", transactions: 15678, percentage: 34 },
    { country: "Sénégal", transactions: 12345, percentage: 27 },
    { country: "Nigeria", transactions: 9876, percentage: 22 },
    { country: "Ghana", transactions: 5678, percentage: 12 },
    { country: "Mali", transactions: 2101, percentage: 5 },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* En-tête Amélioré */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">Historique des Transactions</h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">Surveillez et gérez toutes les activités de paiement</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
            <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Statistiques des Transactions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {transactionStats.map((stat, index) => (
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

        {/* Recherche et Filtres */}
        <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Rechercher des transactions par ID, client ou montant..."
                  className="pl-10 rounded-xl border-slate-200 dark:border-neutral-700 h-12"
                />
              </div>
              <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700 h-12 px-6">
                <Calendar className="h-4 w-4 mr-2" />
                Plage de Dates
              </Button>
              <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700 h-12 px-6">
                <Filter className="h-4 w-4 mr-2" />
                Filtres Avancés
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Transactions Récentes */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                                  <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-crimson-600" />
                    Transactions Récentes
                  </CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">
                    Dernières activités de paiement et transferts
                  </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={transaction.avatar} />
                          <AvatarFallback className="bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-slate-300">
                            {transaction.customer.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">{transaction.customer}</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">{transaction.type}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge 
                              className={`text-xs ${
                                transaction.status === 'Terminé' ? 'bg-emerald-100 text-emerald-800' :
                                transaction.status === 'En Attente' ? 'bg-yellow-100 text-yellow-800' :
                                transaction.status === 'En Cours' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              {transaction.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-slate-200 text-slate-700">
                              {transaction.method}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-neutral-900 dark:text-white mb-1">{transaction.amount}</p>
                        <div className="flex items-center space-x-2 text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                          <MapPin className="h-3 w-3" />
                          <span>{transaction.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">{transaction.time}</span>
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

          {/* Aperçu des Transactions */}
          <div className="space-y-6">
            {/* Méthodes de Paiement */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                                  <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-crimson-600" />
                    Méthodes de Paiement
                  </CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">
                    Répartition par type de paiement
                  </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {paymentMethods.map((method, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-slate-100 dark:bg-neutral-800 rounded-lg">
                          <method.icon className="h-4 w-4 text-crimson-600" />
                        </div>
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{method.method}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-20 bg-slate-200 dark:bg-neutral-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-crimson-500 to-crimson-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${method.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300 w-8">
                          {method.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Meilleures Localisations */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                                  <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-crimson-600" />
                    Meilleures Localisations
                  </CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">
                    Volume de transactions par pays
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
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white">Actions Rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter le Rapport
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Voir les Analyses
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Performance
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

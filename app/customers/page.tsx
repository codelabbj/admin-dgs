import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Plus, Users, UserCheck, UserX, TrendingUp, MapPin, Building, Globe } from "lucide-react"

export default function Customers() {
  // Données simulées pour la page clients améliorée
  const customerStats = [
    { label: "Total Clients", value: "2,847", change: "+12%", icon: Users, color: "blue" },
    { label: "Clients Actifs", value: "2,156", change: "+8%", icon: UserCheck, color: "green" },
    { label: "Nouveaux ce Mois", value: "234", change: "+23%", icon: TrendingUp, color: "purple" },
    { label: "Utilisateurs Premium", value: "456", change: "+15%", icon: Building, color: "amber" },
  ]

  const recentCustomers = [
    { id: 1, name: "John Doe", email: "john.doe@example.com", status: "Actif", location: "Abidjan", type: "Premium", avatar: "/placeholder-user.jpg" },
    { id: 2, name: "Jane Smith", email: "jane.smith@example.com", status: "Actif", location: "Dakar", type: "Standard", avatar: "/placeholder-user.jpg" },
    { id: 3, name: "Bob Johnson", email: "bob.johnson@example.com", status: "Inactif", location: "Lagos", type: "Standard", avatar: "/placeholder-user.jpg" },
    { id: 4, name: "Alice Brown", email: "alice.brown@example.com", status: "Actif", location: "Accra", type: "Premium", avatar: "/placeholder-user.jpg" },
  ]

  const topLocations = [
    { country: "Côte d'Ivoire", customers: 856, percentage: 30 },
    { country: "Sénégal", customers: 634, percentage: 22 },
    { country: "Nigeria", customers: 512, percentage: 18 },
    { country: "Ghana", customers: 398, percentage: 14 },
    { country: "Mali", customers: 234, percentage: 8 },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* En-tête Amélioré */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">Gestion des Clients</h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">Gérez et analysez votre base de clients</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
            <Button className="bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un Client
            </Button>
          </div>
        </div>

        {/* Statistiques des Clients */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {customerStats.map((stat, index) => (
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
                  placeholder="Rechercher des clients par nom, email ou localisation..."
                  className="pl-10 rounded-xl border-slate-200 dark:border-neutral-700 h-12"
                />
              </div>
              <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700 h-12 px-6">
                <Filter className="h-4 w-4 mr-2" />
                Filtres Avancés
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Clients Récents */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                                  <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                    <Users className="h-5 w-5 mr-2 text-crimson-600" />
                    Clients Récents
                  </CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">
                    Dernières inscriptions et activités des clients
                  </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentCustomers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={customer.avatar} />
                          <AvatarFallback className="bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-slate-300">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">{customer.name}</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">{customer.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                customer.type === 'Premium' ? 'border-amber-200 text-amber-700' : 'border-slate-200 text-slate-700'
                              }`}
                            >
                              {customer.type}
                            </Badge>
                            <Badge 
                              className={`text-xs ${
                                customer.status === 'Actif' ? 'bg-emerald-100 text-emerald-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              {customer.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-2 text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                          <MapPin className="h-3 w-3" />
                          <span>{customer.location}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="rounded-lg text-crimson-600 hover:text-crimson-700">
                          Voir les Détails
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Aperçu des Clients */}
          <div className="space-y-6">
            {/* Meilleures Localisations */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                                  <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-crimson-600" />
                    Meilleures Localisations
                  </CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">
                    Répartition des clients par pays
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
                  <Users className="h-4 w-4 mr-2" />
                  Exporter la Liste des Clients
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Voir les Analyses
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Support Client
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

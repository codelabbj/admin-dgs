import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, Building, Shield, Edit, Save, Camera, Key, Bell, Globe, MapPin, Calendar, CreditCard, Activity, TrendingUp, Award, Star } from "lucide-react"

export default function Profile() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* En-tête Amélioré */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">Profil</h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">Gérez vos informations personnelles et préférences</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700">
              <Edit className="h-4 w-4 mr-2" />
              Mode Édition
            </Button>
            <Button className="bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl">
              <Save className="h-4 w-4 mr-2" />
              Enregistrer les Modifications
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations du Profil */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations de Base */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                                  <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                    <User className="h-5 w-5 mr-2 text-crimson-600" />
                    Informations de Base
                  </CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">
                    Vos informations personnelles et de contact
                  </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      defaultValue="John"
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom de Famille</Label>
                    <Input
                      id="lastName"
                      defaultValue="Doe"
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="john.doe@example.com"
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Numéro de Téléphone</Label>
                    <Input
                      id="phone"
                      defaultValue="+225 0123456789"
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Poste</Label>
                    <Input
                      id="title"
                      defaultValue="Software Engineer"
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Département</Label>
                    <Input
                      id="department"
                      defaultValue="Engineering"
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations de l'Entreprise */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                                  <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                    <Building className="h-5 w-5 mr-2 text-crimson-600" />
                    Informations de l'Entreprise
                  </CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">
                    Vos détails d'entreprise et de société
                  </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                                          <Label htmlFor="companyName">Nom de l'Entreprise</Label>
                      <Input
                        id="companyName"
                        defaultValue="Tech Solutions Ltd"
                        className="rounded-xl border-slate-200 dark:border-neutral-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Secteur d'Activité</Label>
                      <Input
                        id="industry"
                        defaultValue="Technology"
                        className="rounded-xl border-slate-200 dark:border-neutral-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Site Web</Label>
                      <Input
                        id="website"
                        defaultValue="https://techsolutions.com"
                        className="rounded-xl border-slate-200 dark:border-neutral-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companySize">Taille de l'Entreprise</Label>
                      <Input
                        id="companySize"
                        defaultValue="50-100 employees"
                        className="rounded-xl border-slate-200 dark:border-neutral-700"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="address">Adresse Professionnelle</Label>
                      <Input
                        id="address"
                        defaultValue="123 Tech Street, Abidjan, Ivory Coast"
                        className="rounded-xl border-slate-200 dark:border-neutral-700"
                      />
                    </div>
                </div>
              </CardContent>
            </Card>

            {/* Paramètres de Sécurité */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                                  <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-crimson-600" />
                    Paramètres de Sécurité
                  </CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">
                    Gérez la sécurité de votre compte et l'authentification
                  </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Mot de Passe Actuel</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="Entrez le mot de passe actuel"
                        className="rounded-xl border-slate-200 dark:border-neutral-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nouveau Mot de Passe</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Entrez le nouveau mot de passe"
                        className="rounded-xl border-slate-200 dark:border-neutral-700"
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                      <div className="flex items-center space-x-3">
                        <Key className="h-5 w-5 text-crimson-600" />
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">Authentification à Deux Facteurs</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Sécurisez votre compte avec 2FA</p>
                        </div>
                      </div>
                      <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700">
                        Activer
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                      <div className="flex items-center space-x-3">
                        <Bell className="h-5 w-5 text-crimson-600" />
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">Notifications de Connexion</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Être notifié des nouvelles connexions</p>
                        </div>
                      </div>
                      <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700">
                        Configurer
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Préférences */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                                  <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-crimson-600" />
                    Préférences
                  </CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">
                    Personnalisez votre expérience de tableau de bord
                  </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                                          <Label htmlFor="timezone">Fuseau Horaire</Label>
                      <Input
                        id="timezone"
                        defaultValue="UTC+0 (GMT)"
                        className="rounded-xl border-slate-200 dark:border-neutral-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Langue</Label>
                      <Input
                        id="language"
                        defaultValue="English"
                        className="rounded-xl border-slate-200 dark:border-neutral-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Format de Date</Label>
                      <Input
                        id="dateFormat"
                        defaultValue="DD/MM/YYYY"
                        className="rounded-xl border-slate-200 dark:border-neutral-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Devise</Label>
                      <Input
                        id="currency"
                        defaultValue="FCFA (XOF)"
                        className="rounded-xl border-slate-200 dark:border-neutral-700"
                      />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Barre Latérale */}
          <div className="space-y-6">
            {/* Photo de Profil */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <Avatar className="h-32 w-32 mx-auto ring-4 ring-crimson-600">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback className="bg-gradient-to-br from-crimson-600 to-crimson-700 text-white text-3xl font-bold">
                        JD
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-crimson-600 hover:bg-crimson-700"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">John Doe</h3>
                    <p className="text-neutral-600 dark:text-neutral-400">Software Engineer</p>
                    <Badge className="mt-2 bg-crimson-100 text-crimson-800">Membre Premium</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statut du Compte */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white">Statut du Compte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Type de Compte</span>
                  <Badge className="bg-emerald-100 text-emerald-800">Premium</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Statut</span>
                  <Badge className="bg-emerald-100 text-emerald-800">Actif</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Dernière Connexion</span>
                  <span className="text-sm text-neutral-900 dark:text-white">Il y a 2 heures</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Membre Depuis</span>
                  <span className="text-sm text-neutral-900 dark:text-white">Jan 2024</span>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques d'Activité */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white">Statistiques d'Activité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-crimson-600" />
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Connexions</span>
                  </div>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">156</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-crimson-600" />
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Transactions</span>
                  </div>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">89</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-crimson-600" />
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Taux de Réussite</span>
                  </div>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">98.5%</span>
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
                  <Key className="h-4 w-4 mr-2" />
                  Changer le Mot de Passe
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <Bell className="h-4 w-4 mr-2" />
                  Paramètres de Notification
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <Shield className="h-4 w-4 mr-2" />
                  Paramètres de Sécurité
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <Globe className="h-4 w-4 mr-2" />
                  Langue et Région
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}


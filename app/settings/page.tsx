import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, Bell, Globe, Database, CreditCard, User, Lock, Eye, EyeOff, Save, RefreshCw, Download, Upload, Trash2, Key, Smartphone, Building } from "lucide-react"

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* En-tête Amélioré */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">Paramètres</h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">Configurez votre compte et vos préférences système</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Réinitialiser aux Défauts
            </Button>
            <Button className="bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl">
              <Save className="h-4 w-4 mr-2" />
              Enregistrer les Modifications
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Paramètres Principaux */}
          <div className="lg:col-span-2 space-y-6">
            {/* Paramètres du Compte */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                                  <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                    <User className="h-5 w-5 mr-2 text-crimson-600" />
                    Paramètres du Compte
                  </CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">
                    Gérez vos informations personnelles et préférences de compte
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
                    <Label htmlFor="company">Nom de l'Entreprise</Label>
                    <Input
                      id="company"
                      defaultValue="Tech Solutions Ltd"
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Poste</Label>
                    <Input
                      id="position"
                      defaultValue="Software Engineer"
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
                    Configurez les politiques de sécurité et méthodes d'authentification
                  </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                      <div className="flex items-center space-x-3">
                        <Lock className="h-5 w-5 text-crimson-600" />
                        <div>
                          <Label className="text-base font-medium">Authentification à Deux Facteurs</Label>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Sécurisez votre compte avec 2FA</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                      <div className="flex items-center space-x-3">
                        <Eye className="h-5 w-5 text-crimson-600" />
                        <div>
                          <Label className="text-base font-medium">Expiration de Session</Label>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Déconnexion automatique après inactivité</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                      <div className="flex items-center space-x-3">
                        <Key className="h-5 w-5 text-crimson-600" />
                        <div>
                          <Label className="text-base font-medium">Rotation des Clés API</Label>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Rotation automatique des clés API</p>
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Expiration de Session (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        defaultValue="30"
                        className="rounded-xl border-slate-200 dark:border-neutral-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxLoginAttempts">Tentatives de Connexion Max</Label>
                      <Input
                        id="maxLoginAttempts"
                        type="number"
                        defaultValue="5"
                        className="rounded-xl border-slate-200 dark:border-neutral-700"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Paramètres de Paiement */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                                  <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-crimson-600" />
                    Paramètres de Paiement
                  </CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">
                    Configurez les méthodes de paiement et préférences de facturation
                  </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="defaultCurrency">Devise par Défaut</Label>
                      <Input
                        id="defaultCurrency"
                        defaultValue="FCFA"
                        className="rounded-xl border-slate-200 dark:border-neutral-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxRate">Taux de Taxe (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        defaultValue="18"
                        className="rounded-xl border-slate-200 dark:border-neutral-700"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="h-5 w-5 text-crimson-600" />
                        <div>
                          <Label className="text-base font-medium">Mobile Money</Label>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Accepter les paiements mobile money</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                      <div className="flex items-center space-x-3">
                        <Building className="h-5 w-5 text-crimson-600" />
                        <div>
                          <Label className="text-base font-medium">Virements Bancaires</Label>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Accepter les paiements par virement bancaire</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Paramètres de Notification */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                                  <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-crimson-600" />
                    Paramètres de Notification
                  </CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">
                    Configurez comment vous recevez les notifications et alertes
                  </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                      <div className="flex items-center space-x-3">
                        <Bell className="h-5 w-5 text-crimson-600" />
                        <div>
                          <Label className="text-base font-medium">Notifications Email</Label>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Recevoir les notifications par email</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-crimson-600" />
                        <div>
                          <Label className="text-base font-medium">Alertes de Sécurité</Label>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Notifications de sécurité immédiates</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-5 w-5 text-crimson-600" />
                        <div>
                          <Label className="text-base font-medium">Notifications de Paiement</Label>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Alertes de succès/échec de paiement</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="notificationEmail">Email de Notification</Label>
                      <Input
                        id="notificationEmail"
                        type="email"
                        defaultValue="notifications@example.com"
                        className="rounded-xl border-slate-200 dark:border-neutral-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alertThreshold">Seuil d'Alerte (%)</Label>
                      <Input
                        id="alertThreshold"
                        type="number"
                        defaultValue="80"
                        className="rounded-xl border-slate-200 dark:border-neutral-700"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Barre Latérale */}
          <div className="space-y-6">
            {/* Actions Rapides */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white">Actions Rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter les Paramètres
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Importer les Paramètres
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Tout Réinitialiser
                </Button>
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

            {/* Informations Système */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white">Informations Système</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Version</span>
                  <span className="text-sm text-neutral-900 dark:text-white">v2.1.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Environnement</span>
                  <Badge className="bg-blue-100 text-blue-800">Production</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Dernière Mise à Jour</span>
                  <span className="text-sm text-neutral-900 dark:text-white">Il y a 2 jours</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

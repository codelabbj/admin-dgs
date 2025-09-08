"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, Bell, Globe, Database, CreditCard, User, Lock, Eye, EyeOff, Save, RefreshCw, Download, Upload, Trash2, Key, Smartphone, Building, Loader2, Edit, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { smartFetch } from "@/utils/auth"

interface PaymentSettings {
  id?: number
  minimum_payin: number
  minimum_payout: number
  max_payin: number
  max_payout: number
  payin_fee: string
  payout_fee: string
}

interface AccountSettings {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  position: string
}

interface PasswordChange {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function Settings() {
  const { toast } = useToast()
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    minimum_payin: 50,
    minimum_payout: 50,
    max_payin: 50,
    max_payout: 50,
    payin_fee: "1.75",
    payout_fee: "1.00"
  })
  const [accountSettings, setAccountSettings] = useState<AccountSettings>({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+225 0123456789",
    company: "Tech Solutions Ltd",
    position: "Software Engineer"
  })
  const [passwordChange, setPasswordChange] = useState<PasswordChange>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditingAccount, setIsEditingAccount] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const response = await smartFetch(`https://api.dgs-pay.com/prod/v1/api/setting`)
      if (response.ok) {
        const data = await response.json()
        setPaymentSettings(data)
      } else {
        const errorData = await response.json()
        toast({
          title: "Erreur",
          description: errorData.detail || "Impossible de charger les paramètres",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion lors du chargement des paramètres",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await smartFetch(`https://api.dgs-pay.com/prod/v1/api/setting`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          minimum_payin: paymentSettings.minimum_payin,
          minimum_payout: paymentSettings.minimum_payout,
          max_payin: paymentSettings.max_payin,
          max_payout: paymentSettings.max_payout,
          payin_fee: paymentSettings.payin_fee,
          payout_fee: paymentSettings.payout_fee
        })
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Paramètres sauvegardés avec succès"
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Erreur",
          description: errorData.detail || "Impossible de sauvegarder les paramètres",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion lors de la sauvegarde",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof PaymentSettings, value: string | number) => {
    setPaymentSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAccountChange = (field: keyof AccountSettings, value: string) => {
    setAccountSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePasswordChange = (field: keyof PasswordChange, value: string) => {
    setPasswordChange(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const saveAccountSettings = async () => {
    setIsSaving(true)
    try {
      const response = await smartFetch(`https://api.dgs-pay.com/v1/api/user-details`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: accountSettings.firstName,
          last_name: accountSettings.lastName,
          email: accountSettings.email,
          phone: accountSettings.phone,
          entreprise_name: accountSettings.company,
          website: null
        })
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Informations du compte mises à jour avec succès"
        })
        setIsEditingAccount(false)
      } else {
        const errorData = await response.json()
        toast({
          title: "Erreur",
          description: errorData.detail || "Impossible de mettre à jour les informations du compte",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion lors de la mise à jour",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const changePassword = async () => {
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      })
      return
    }

    if (passwordChange.newPassword.length < 8) {
      toast({
        title: "Erreur",
        description: "Le nouveau mot de passe doit contenir au moins 8 caractères",
        variant: "destructive"
      })
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await smartFetch(`https://api.dgs-pay.com/v1/api/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: passwordChange.currentPassword,
          new_password: passwordChange.newPassword
        })
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Mot de passe modifié avec succès"
        })
        setPasswordChange({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Erreur",
          description: errorData.detail || "Impossible de modifier le mot de passe",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion lors du changement de mot de passe",
        variant: "destructive"
      })
    } finally {
      setIsChangingPassword(false)
    }
  }
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* En-tête Amélioré */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-2">Paramètres</h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-base sm:text-lg">Configurez votre compte et vos préférences système</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            <Button 
              variant="outline" 
              className="rounded-xl border-slate-200 dark:border-neutral-700"
              onClick={fetchSettings}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Actualiser
            </Button>
            <Button 
              className="bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl"
              onClick={saveSettings}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Enregistrer les Modifications
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Paramètres Principaux */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            {/* Paramètres du Compte */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                      <User className="h-5 w-5 mr-2 text-crimson-600" />
                      Paramètres du Compte
                    </CardTitle>
                    <CardDescription className="text-neutral-600 dark:text-neutral-400">
                      Gérez vos informations personnelles et préférences de compte
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {!isEditingAccount ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingAccount(true)}
                        className="rounded-xl border-slate-200 dark:border-neutral-700"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditingAccount(false)}
                          disabled={isSaving}
                          className="rounded-xl border-slate-200 dark:border-neutral-700"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Annuler
                        </Button>
                        <Button
                          size="sm"
                          onClick={saveAccountSettings}
                          disabled={isSaving}
                          className="bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl"
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Enregistrer
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={accountSettings.firstName}
                      onChange={(e) => handleAccountChange('firstName', e.target.value)}
                      disabled={!isEditingAccount}
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom de Famille</Label>
                    <Input
                      id="lastName"
                      value={accountSettings.lastName}
                      onChange={(e) => handleAccountChange('lastName', e.target.value)}
                      disabled={!isEditingAccount}
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={accountSettings.email}
                      onChange={(e) => handleAccountChange('email', e.target.value)}
                      disabled={!isEditingAccount}
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Numéro de Téléphone</Label>
                    <Input
                      id="phone"
                      value={accountSettings.phone}
                      onChange={(e) => handleAccountChange('phone', e.target.value)}
                      disabled={!isEditingAccount}
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Nom de l'Entreprise</Label>
                    <Input
                      id="company"
                      value={accountSettings.company}
                      onChange={(e) => handleAccountChange('company', e.target.value)}
                      disabled={!isEditingAccount}
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Poste</Label>
                    <Input
                      id="position"
                      value={accountSettings.position}
                      onChange={(e) => handleAccountChange('position', e.target.value)}
                      disabled={!isEditingAccount}
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
                  
                  {/* Change Password Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-md font-semibold text-neutral-900 dark:text-white">Changer le Mot de Passe</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsChangingPassword(!isChangingPassword)}
                        className="rounded-xl border-slate-200 dark:border-neutral-700"
                      >
                        <Key className="h-4 w-4 mr-2" />
                        {isChangingPassword ? 'Annuler' : 'Changer'}
                      </Button>
                    </div>
                    
                    {isChangingPassword && (
                      <div className="space-y-4 p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Mot de Passe Actuel</Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type={showPasswords.current ? "text" : "password"}
                              value={passwordChange.currentPassword}
                              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                              className="rounded-xl border-slate-200 dark:border-neutral-700 pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                            >
                              {showPasswords.current ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">Nouveau Mot de Passe</Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showPasswords.new ? "text" : "password"}
                              value={passwordChange.newPassword}
                              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                              className="rounded-xl border-slate-200 dark:border-neutral-700 pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                            >
                              {showPasswords.new ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirmer le Nouveau Mot de Passe</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showPasswords.confirm ? "text" : "password"}
                              value={passwordChange.confirmPassword}
                              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                              className="rounded-xl border-slate-200 dark:border-neutral-700 pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                            >
                              {showPasswords.confirm ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsChangingPassword(false)
                              setPasswordChange({
                                currentPassword: "",
                                newPassword: "",
                                confirmPassword: ""
                              })
                            }}
                            disabled={isChangingPassword}
                            className="rounded-xl border-slate-200 dark:border-neutral-700"
                          >
                            Annuler
                          </Button>
                          <Button
                            onClick={changePassword}
                            disabled={isChangingPassword || !passwordChange.currentPassword || !passwordChange.newPassword || !passwordChange.confirmPassword}
                            className="bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl"
                          >
                            {isChangingPassword ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            Changer le Mot de Passe
                          </Button>
                        </div>
                      </div>
                    )}
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
                  Configurez les limites et frais de paiement
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Limites de Paiement */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-neutral-900 dark:text-white">Limites de Paiement</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="minimum_payin">Minimum Payin (FCFA)</Label>
                        <Input
                          id="minimum_payin"
                          type="number"
                          value={paymentSettings.minimum_payin}
                          onChange={(e) => handleInputChange('minimum_payin', parseInt(e.target.value) || 0)}
                          className="rounded-xl border-slate-200 dark:border-neutral-700"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minimum_payout">Minimum Payout (FCFA)</Label>
                        <Input
                          id="minimum_payout"
                          type="number"
                          value={paymentSettings.minimum_payout}
                          onChange={(e) => handleInputChange('minimum_payout', parseInt(e.target.value) || 0)}
                          className="rounded-xl border-slate-200 dark:border-neutral-700"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max_payin">Maximum Payin (FCFA)</Label>
                        <Input
                          id="max_payin"
                          type="number"
                          value={paymentSettings.max_payin}
                          onChange={(e) => handleInputChange('max_payin', parseInt(e.target.value) || 0)}
                          className="rounded-xl border-slate-200 dark:border-neutral-700"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max_payout">Maximum Payout (FCFA)</Label>
                        <Input
                          id="max_payout"
                          type="number"
                          value={paymentSettings.max_payout}
                          onChange={(e) => handleInputChange('max_payout', parseInt(e.target.value) || 0)}
                          className="rounded-xl border-slate-200 dark:border-neutral-700"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Frais de Paiement */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-neutral-900 dark:text-white">Frais de Paiement</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="payin_fee">Frais Payin (%)</Label>
                        <Input
                          id="payin_fee"
                          type="text"
                          value={paymentSettings.payin_fee}
                          onChange={(e) => handleInputChange('payin_fee', e.target.value)}
                          className="rounded-xl border-slate-200 dark:border-neutral-700"
                          disabled={isLoading}
                          placeholder="1.75"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="payout_fee">Frais Payout (%)</Label>
                        <Input
                          id="payout_fee"
                          type="text"
                          value={paymentSettings.payout_fee}
                          onChange={(e) => handleInputChange('payout_fee', e.target.value)}
                          className="rounded-xl border-slate-200 dark:border-neutral-700"
                          disabled={isLoading}
                          placeholder="1.00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Méthodes de Paiement */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-neutral-900 dark:text-white">Méthodes de Paiement</h4>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
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
          <div className="space-y-4 lg:space-y-6">
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

"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, Building, Shield, Edit, Save, Camera, Key, Bell, Globe, MapPin, Calendar, CreditCard, Activity, TrendingUp, Award, Star, Loader2, Sun, Moon, RefreshCw, Eye, EyeOff } from "lucide-react"
import { useState, useEffect } from "react"
import { smartFetch, getAccessToken } from "@/utils/auth"
import { useTheme } from "next-themes"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"

interface PaymentSettings {
  id?: number
  minimum_payin: number
  minimum_payout: number
  max_payin: number
  max_payout: number
  payin_fee: string
  payout_fee: string
}

export default function Profile() {
  // Theme and language hooks
  const { theme, setTheme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const { toast } = useToast()
  
  // State management for profile data
  const [profileData, setProfileData] = useState({
    email: "",
    phone: "",
    first_name: "",
    last_name: "",
    country: "",
    logo: ""
  })
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_new_password: ""
  })
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  })
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Payment settings state
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    minimum_payin: 50,
    minimum_payout: 50,
    max_payin: 50,
    max_payout: 50,
    payin_fee: "1.75",
    payout_fee: "1.00"
  })
  const [isLoadingSettings, setIsLoadingSettings] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // Fetch user details on component mount
  useEffect(() => {
    fetchUserDetails()
    fetchSettings()
  }, [])

  const fetchUserDetails = async () => {
    try {
      setLoading(true)
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const response = await smartFetch(`${baseUrl}/v1/api/user-details`)
      
      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
        throw new Error(errorMessage)
      }

      const userDetails = await response.json()
      
      // Update profile data with fetched information
      setProfileData({
        email: userDetails.email || "",
        phone: userDetails.phone || "",
        first_name: userDetails.first_name || "",
        last_name: userDetails.last_name || "",
        country: userDetails.country || "",
        logo: userDetails.logo || ""
      })
    } catch (err) {
      console.error("Error fetching user details:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des détails utilisateur"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccessMessage(null)
      
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      // Extract logo URL properly
      let logoUrl = null
      if (profileData.logo) {
        if (typeof profileData.logo === 'object' && (profileData.logo as any).file) {
          logoUrl = (profileData.logo as any).file
        } else if (typeof profileData.logo === 'string') {
          logoUrl = profileData.logo
        }
      }

      // Prepare payload according to the specified structure
      const payload = {
        email: profileData.email,
        phone: profileData.phone,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        country: profileData.country,
        logo: logoUrl, // Always a string URL or null
        entreprise_name: null,
        website: null,
        success_url: null,
        cancel_url: null,
        callback_url: null,
        ip_adress: null,
        trade_commerce: null, 
        gerant_doc: null,
        entreprise_number: null
      }

      console.log('Profile data being sent:', profileData)
      console.log('Logo value:', profileData.logo)
      console.log('Extracted logo URL:', logoUrl)
      console.log('Payload being sent:', payload)

      // 1. Update Profile
      const profileResponse = await smartFetch(`${baseUrl}/v1/api/update-profile`, {
        method: "PUT",
        body: JSON.stringify(payload)
      })
      
      if (!profileResponse.ok) {
        const errorData = await profileResponse.json()
        const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${profileResponse.status}`
        throw new Error(errorMessage)
      }

      // 2. Change Password (if password fields are filled)
      if (passwordData.old_password && passwordData.new_password && passwordData.confirm_new_password) {
        // Validate passwords match
        if (passwordData.new_password !== passwordData.confirm_new_password) {
          throw new Error("Les nouveaux mots de passe ne correspondent pas")
        }

        // Validate password strength (basic validation)
        if (passwordData.new_password.length < 6) {
          throw new Error("Le nouveau mot de passe doit contenir au moins 6 caractères")
        }

        const passwordPayload = {
          old_password: passwordData.old_password,
          new_password: passwordData.new_password,
          confirm_new_password: passwordData.confirm_new_password
        }

        const passwordResponse = await smartFetch(`${baseUrl}/v1/api/change-password`, {
          method: "POST",
          body: JSON.stringify(passwordPayload)
        })
        
        if (!passwordResponse.ok) {
          const errorData = await passwordResponse.json()
          const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${passwordResponse.status}`
          throw new Error(`Erreur changement mot de passe: ${errorMessage}`)
        }

        // Clear password fields after successful change
        setPasswordData({
          old_password: "",
          new_password: "",
          confirm_new_password: ""
        })
        
        // Reset password visibility
        setShowPasswords({
          old: false,
          new: false,
          confirm: false
        })
      }

      // 3. Save Settings
      const settingsResponse = await smartFetch(`https://api.dgs-pay.com/prod/v1/api/setting`, {
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

      if (!settingsResponse.ok) {
        const errorData = await settingsResponse.json()
        const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${settingsResponse.status}`
        throw new Error(`Erreur sauvegarde paramètres: ${errorMessage}`)
      }

      const result = await profileResponse.json()
      setSuccessMessage(result.message || "Profil, mot de passe et paramètres mis à jour avec succès")
      setIsEditing(false)
      
    } catch (err) {
      console.error("Error updating profile:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la mise à jour du profil"
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner un fichier image valide')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Le fichier doit être inférieur à 5MB')
        return
      }
      
      setSelectedFile(file)
      
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handleImageUpload = async () => {
    if (!selectedFile) return
    
    try {
      setUploadingImage(true)
      setError(null)
      
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      // Upload file to /api/upload endpoint
      const formData = new FormData()
      formData.append('file', selectedFile)
      
      // Get access token using the same method as smartFetch
      const accessToken = getAccessToken()
      
      if (!accessToken) {
        throw new Error("No access token available")
      }
      
      const uploadResponse = await fetch(`${baseUrl}/prod/v1/api/upload`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${accessToken}`
          // Don't set Content-Type - let browser set it with boundary for FormData
        },
        body: formData
      })
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${uploadResponse.status}`
        throw new Error(errorMessage)
      }

      const uploadResult = await uploadResponse.json()
      
      console.log('Upload response:', uploadResult)
      
      // Store the uploaded image URL for later use in profile update
      const uploadedImageUrl = uploadResult.url || uploadResult.path || uploadResult.file_url || uploadResult
      
      console.log('Extracted image URL:', uploadedImageUrl)
      
      // Update profile data with the uploaded image URL
      setProfileData(prev => {
        const updated = {
          ...prev,
          logo: uploadedImageUrl
        }
        console.log('Updated profile data:', updated)
        return updated
      })
      
      setSuccessMessage('Image téléchargée avec succès. N\'oubliez pas de sauvegarder vos modifications.')
      
      // Clear file selection
      setSelectedFile(null)
      setPreviewUrl(null)
      
    } catch (err) {
      console.error('Error uploading image:', err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du téléchargement de l'image"
      setError(errorMessage)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleChangePassword = async () => {
    try {
      setChangingPassword(true)
      setPasswordError(null)
      setPasswordSuccess(null)
      
      // Validate passwords match
      if (passwordData.new_password !== passwordData.confirm_new_password) {
        throw new Error("Les nouveaux mots de passe ne correspondent pas")
      }

      // Validate password strength (basic validation)
      if (passwordData.new_password.length < 6) {
        throw new Error("Le nouveau mot de passe doit contenir au moins 6 caractères")
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      // Prepare payload according to the specified structure
      const payload = {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
        confirm_new_password: passwordData.confirm_new_password
      }

      const response = await smartFetch(`${baseUrl}/v1/api/change-password`, {
        method: "POST",
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.detail || errorData.message || errorData.error || `Erreur ${response.status}`
        throw new Error(errorMessage)
      }

      const result = await response.json()
      setPasswordSuccess(result.message || "Mot de passe modifié avec succès")
      
      // Clear password fields
      setPasswordData({
        old_password: "",
        new_password: "",
        confirm_new_password: ""
      })
      
      // Reset password visibility
      setShowPasswords({
        old: false,
        new: false,
        confirm: false
      })
      
    } catch (err) {
      console.error("Error changing password:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du changement de mot de passe"
      setPasswordError(errorMessage)
    } finally {
      setChangingPassword(false)
    }
  }

  const fetchSettings = async () => {
    setIsLoadingSettings(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/prod/v1/api/setting`)
      if (response.ok) {
        const data = await response.json()
        setPaymentSettings(data)
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les paramètres",
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
      setIsLoadingSettings(false)
    }
  }

  const saveSettings = async () => {
    setIsSavingSettings(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/prod/v1/api/setting`, {
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
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder les paramètres",
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
      setIsSavingSettings(false)
    }
  }

  const handleSettingsInputChange = (field: keyof PaymentSettings, value: string | number) => {
    setPaymentSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* En-tête Amélioré */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">Profil Paramètres</h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">Gérez vos informations personnelles et préférences</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              className="rounded-xl border-slate-200 dark:border-neutral-700"
              onClick={fetchSettings}
              disabled={isLoadingSettings}
            >
              {isLoadingSettings ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Actualiser
            </Button>
            <Button 
              variant="outline" 
              className="rounded-xl border-slate-200 dark:border-neutral-700"
              onClick={() => setIsEditing(!isEditing)}
              disabled={saving}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? "Annuler" : "Mode Édition"}
            </Button>
            {isEditing && (
              <Button 
                className="bg-crimson-600 hover:bg-crimson-700 text-black dark:text-white rounded-xl"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin " />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer les Modifications
                  </>
                )}
              </Button>
            )}
            <Button 
              className="bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl"
              onClick={saveSettings}
              disabled={isSavingSettings}
            >
              {isSavingSettings ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Enregistrer les Paramètres
            </Button>
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
              </div>
              <div className="flex-1">
                <p className="text-red-800 dark:text-red-200 font-medium">Erreur de mise à jour</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1 break-words">{error}</p>
              </div>
              <div className="flex-shrink-0">
                <Button 
                  onClick={() => setError(null)} 
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <span className="text-green-600 dark:text-green-400 text-xl">✅</span>
              </div>
              <div className="flex-1">
                <p className="text-green-800 dark:text-green-200 font-medium">Succès</p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">{successMessage}</p>
              </div>
              <div className="flex-shrink-0">
                <Button 
                  onClick={() => setSuccessMessage(null)} 
                  size="sm"
                  variant="outline"
                  className="border-green-200 text-green-800 hover:bg-green-100"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        )}

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
                      value={profileData.first_name}
                      onChange={(e) => handleInputChange("first_name", e.target.value)}
                      disabled={!isEditing || loading}
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom de Famille</Label>
                    <Input
                      id="lastName"
                      value={profileData.last_name}
                      onChange={(e) => handleInputChange("last_name", e.target.value)}
                      disabled={!isEditing || loading}
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={!isEditing || loading}
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Numéro de Téléphone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      disabled={!isEditing || loading}
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Pays</Label>
                    <Input
                      id="country"
                      value={profileData.country}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                      disabled={!isEditing || loading}
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Poste</Label>
                    <Input
                      id="title"
                      defaultValue="Software Engineer"
                      disabled={true}
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations de l'Entreprise */}
            {/* <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
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
            </Card> */}

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
                  {/* Password Change Section */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-neutral-900 dark:text-white">Changer le Mot de Passe</h4>
                    
                    {/* Password Error Message */}
                    {passwordError && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-300">{passwordError}</p>
                      </div>
                    )}
                    
                    {/* Password Success Message */}
                    {passwordSuccess && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-700 dark:text-green-300">{passwordSuccess}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Mot de Passe Actuel</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showPasswords.old ? "text" : "password"}
                            value={passwordData.old_password}
                            onChange={(e) => handlePasswordChange("old_password", e.target.value)}
                            placeholder="Entrez le mot de passe actuel"
                            disabled={changingPassword}
                            className="rounded-xl border-slate-200 dark:border-neutral-700 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPasswords(prev => ({ ...prev, old: !prev.old }))}
                            disabled={changingPassword}
                          >
                            {showPasswords.old ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
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
                            value={passwordData.new_password}
                            onChange={(e) => handlePasswordChange("new_password", e.target.value)}
                            placeholder="Entrez le nouveau mot de passe"
                            disabled={changingPassword}
                            className="rounded-xl border-slate-200 dark:border-neutral-700 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                            disabled={changingPassword}
                          >
                            {showPasswords.new ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmer le Nouveau Mot de Passe</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirm_new_password}
                          onChange={(e) => handlePasswordChange("confirm_new_password", e.target.value)}
                          placeholder="Confirmez le nouveau mot de passe"
                          disabled={changingPassword}
                          className="rounded-xl border-slate-200 dark:border-neutral-700 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          disabled={changingPassword}
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleChangePassword}
                        disabled={changingPassword || !passwordData.old_password || !passwordData.new_password || !passwordData.confirm_new_password}
                        className="bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl"
                      >
                        {changingPassword ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Changement en cours...
                          </>
                        ) : (
                          <>
                            <Key className="h-4 w-4 mr-2" />
                            Changer le Mot de Passe
                          </>
                        )}
                      </Button>
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
                <div className="space-y-6">
                  {/* Language Settings */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-neutral-900 dark:text-white">Langue et Région</h4>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-crimson-600" />
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">Langue de l'Interface</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Choisissez votre langue préférée</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="rounded-xl border-slate-200 dark:border-neutral-700"
                        onClick={() => setLanguage(language === "en" ? "fr" : "en")}
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        {language === "en" ? "English" : "Français"}
                      </Button>
                    </div>
                  </div>

                  {/* Theme Settings */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-neutral-900 dark:text-white">Apparence</h4>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                      <div className="flex items-center space-x-3">
                        {theme === "dark" ? <Moon className="h-5 w-5 text-crimson-600" /> : <Sun className="h-5 w-5 text-crimson-600" />}
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">Thème</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {theme === "dark" ? "Mode sombre activé" : "Mode clair activé"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="rounded-xl border-slate-200 dark:border-neutral-700"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      >
                        {theme === "dark" ? (
                          <>
                            <Sun className="h-4 w-4 mr-2" />
                            Mode Clair
                          </>
                        ) : (
                          <>
                            <Moon className="h-4 w-4 mr-2" />
                            Mode Sombre
                          </>
                        )}
                      </Button>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="minimum_payin">Minimum Payin (FCFA)</Label>
                        <Input
                          id="minimum_payin"
                          type="number"
                          value={paymentSettings.minimum_payin}
                          onChange={(e) => handleSettingsInputChange('minimum_payin', parseInt(e.target.value) || 0)}
                          className="rounded-xl border-slate-200 dark:border-neutral-700"
                          disabled={isLoadingSettings}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minimum_payout">Minimum Payout (FCFA)</Label>
                        <Input
                          id="minimum_payout"
                          type="number"
                          value={paymentSettings.minimum_payout}
                          onChange={(e) => handleSettingsInputChange('minimum_payout', parseInt(e.target.value) || 0)}
                          className="rounded-xl border-slate-200 dark:border-neutral-700"
                          disabled={isLoadingSettings}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max_payin">Maximum Payin (FCFA)</Label>
                        <Input
                          id="max_payin"
                          type="number"
                          value={paymentSettings.max_payin}
                          onChange={(e) => handleSettingsInputChange('max_payin', parseInt(e.target.value) || 0)}
                          className="rounded-xl border-slate-200 dark:border-neutral-700"
                          disabled={isLoadingSettings}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max_payout">Maximum Payout (FCFA)</Label>
                        <Input
                          id="max_payout"
                          type="number"
                          value={paymentSettings.max_payout}
                          onChange={(e) => handleSettingsInputChange('max_payout', parseInt(e.target.value) || 0)}
                          className="rounded-xl border-slate-200 dark:border-neutral-700"
                          disabled={isLoadingSettings}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Frais de Paiement */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-neutral-900 dark:text-white">Frais de Paiement</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="payin_fee">Frais Payin (%)</Label>
                        <Input
                          id="payin_fee"
                          type="text"
                          value={paymentSettings.payin_fee}
                          onChange={(e) => handleSettingsInputChange('payin_fee', e.target.value)}
                          className="rounded-xl border-slate-200 dark:border-neutral-700"
                          disabled={isLoadingSettings}
                          placeholder="1.75"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="payout_fee">Frais Payout (%)</Label>
                        <Input
                          id="payout_fee"
                          type="text"
                          value={paymentSettings.payout_fee}
                          onChange={(e) => handleSettingsInputChange('payout_fee', e.target.value)}
                          className="rounded-xl border-slate-200 dark:border-neutral-700"
                          disabled={isLoadingSettings}
                          placeholder="1.00"
                        />
                      </div>
                    </div>
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
                      <AvatarImage src={previewUrl || profileData.logo || "/placeholder-user.jpg"} />
                      <AvatarFallback className="bg-gradient-to-br from-crimson-600 to-crimson-700 text-white text-3xl font-bold">
                        {loading ? "..." : `${profileData.first_name} ${profileData.last_name}`.trim().split(' ').map(n => n[0]).join('').slice(0, 2) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Hidden file input */}
                    <input
                      type="file"
                      id="profile-image-upload"
                      accept="image/*"
                      onChange={handleFileSelect}
                      disabled={loading || uploadingImage}
                      className="hidden"
                    />
                    
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-crimson-600 hover:bg-crimson-700"
                      onClick={() => {
                        if (selectedFile) {
                          handleImageUpload()
                        } else {
                          document.getElementById('profile-image-upload')?.click()
                        }
                      }}
                      disabled={loading || uploadingImage}
                    >
                      {uploadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                      {loading ? "Chargement..." : `${profileData.first_name} ${profileData.last_name}`.trim() || "Utilisateur"}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {profileData.email || "Email non disponible"}
                    </p>
                    <Badge className="mt-2 bg-crimson-100 text-crimson-800">Membre Premium</Badge>
                  </div>
                  
                  {/* Image Upload Preview */}
                  {selectedFile && (
                    <div className="mt-4 p-4 bg-slate-50 dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-600">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white mb-2">
                        Nouvelle image sélectionnée:
                      </p>
                      <div className="flex items-center space-x-3">
                        <img
                          src={previewUrl || ""}
                          alt="Preview"
                          className="h-12 w-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleImageUpload}
                            disabled={uploadingImage}
                            size="sm"
                            className="bg-crimson-600 hover:bg-crimson-700 text-dark dark:text-white"
                          >
                            {uploadingImage ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Upload...
                              </>
                            ) : (
                              "Confirmer"
                            )}
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedFile(null)
                              setPreviewUrl(null)
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Statut du Compte */}
            {/* <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
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
            </Card> */}

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


"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useRouter } from "next/navigation"
import { smartFetch } from "@/utils/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, CreditCard, Phone, Globe, DollarSign } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface WithdrawalFormData {
  phone: string
  country_code: string
  amount: number
  network: string
}

interface WithdrawalResponse {
  success: boolean
  message: string
  transaction_id?: string
  reference?: string
}

export default function WithdrawalPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<WithdrawalFormData>({
    phone: "",
    country_code: "CI",
    amount: 0,
    network: "wave"
  })

  const networks = [
    { value: "wave", label: "Wave" },
    // { value: "orange_money", label: "Orange Money" },
    // { value: "mtn_money", label: "MTN Money" },
    // { value: "moov_money", label: "Moov Money" }
  ]

  const countries = [
    { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮" },
    { code: "SN", name: "Sénégal", flag: "🇸🇳" },
    // { code: "ML", name: "Mali", flag: "🇲🇱" },
    { code: "BF", name: "Burkina Faso", flag: "🇧🇫" },
    // { code: "NE", name: "Niger", flag: "🇳🇪" },
    // { code: "GN", name: "Guinée", flag: "🇬🇳" }
  ]

  const handleInputChange = (field: keyof WithdrawalFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear errors when user starts typing
    if (error) setError(null)
    if (success) setSuccess(null)
  }

  const validateForm = (): boolean => {
    if (!formData.phone.trim()) {
      setError("Le numéro de téléphone est requis")
      return false
    }
    
    if (!formData.country_code) {
      setError("Le code pays est requis")
      return false
    }
    
    if (!formData.amount || formData.amount <= 0) {
      setError("Le montant doit être supérieur à 0")
      return false
    }
    
    if (!formData.network) {
      setError("Le réseau est requis")
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      const payload = {
        phone: formData.phone,
        country_code: formData.country_code,
        amount: formData.amount,
        network: formData.network
      }

      const response = await smartFetch(`${baseUrl}/api/v1/transaction/withdrawal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`)
      }

      const data: WithdrawalResponse = await response.json()
      
      if (data.success) {
        setSuccess(`Retrait effectué avec succès! ${data.transaction_id ? `ID: ${data.transaction_id}` : ''} ${data.reference ? `Référence: ${data.reference}` : ''}`)
        // Reset form after successful withdrawal
        setFormData({
          phone: "",
          country_code: "CI",
          amount: 0,
          network: "wave"
        })
      } else {
        setError(data.message || "Erreur lors du retrait")
      }
    } catch (err) {
      console.error("Withdrawal error:", err)
      setError(err instanceof Error ? err.message : "Une erreur inattendue s'est produite")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Retrait d'Argent
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Effectuez un retrait vers votre compte mobile money
          </p>
        </div>

        {/* Withdrawal Form */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              <span>Nouveau Retrait</span>
            </CardTitle>
            <CardDescription>
              Remplissez les informations ci-dessous pour effectuer votre retrait
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Numéro de téléphone</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Entrez le numéro de téléphone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full"
                  required
                />
                <p className="text-xs text-neutral-500">
                  Format: indicatif pays + numéro (ex: 0158920922)
                </p>
              </div>

              {/* Country Code */}
              <div className="space-y-2">
                <Label htmlFor="country" className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>Pays</span>
                </Label>
                <Select
                  value={formData.country_code}
                  onValueChange={(value) => handleInputChange("country_code", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un pays" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <div className="flex items-center space-x-2">
                          <span>{country.flag}</span>
                          <span>{country.name}</span>
                          <span className="text-xs text-neutral-500">({country.code})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Montant (FCFA)</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="10000"
                  value={formData.amount || ""}
                  onChange={(e) => handleInputChange("amount", parseFloat(e.target.value) || 0)}
                  className="w-full"
                  min="1"
                  required
                />
                <p className="text-xs text-neutral-500">
                  Montant minimum: 1 FCFA
                </p>
              </div>

              {/* Network */}
              <div className="space-y-2">
                <Label htmlFor="network" className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Réseau Mobile Money</span>
                </Label>
                <Select
                  value={formData.network}
                  onValueChange={(value) => handleInputChange("network", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un réseau" />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.map((network) => (
                      <SelectItem key={network.value} value={network.value}>
                        {network.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Success Alert */}
              {success && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  "Effectuer le Retrait"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Informations importantes
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Les retraits sont traités instantanément</li>
              <li>• Vérifiez bien le numéro de téléphone avant de confirmer</li>
              <li>• Les frais de retrait peuvent s'appliquer selon votre réseau</li>
              <li>• En cas de problème, contactez le support client</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
    </DashboardLayout>
  )
}

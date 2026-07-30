"use client"

import { useEffect, useState } from "react"
import { smartFetch } from "@/utils/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Globe, Plus, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Country {
  uid: string
  code: string
  name: string
  dial_code: string
  currency_code: string
  is_active: boolean
  orange_otp_required: boolean
  created_at: string
  updated_at: string
}

export function CountriesContent() {
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({
    code: "",
    name: "",
    dial_code: "",
    currency_code: "XOF",
    is_active: true,
    orange_otp_required: false,
  })
  const { toast } = useToast()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  const loadCountries = async () => {
    try {
      setLoading(true)
      const res = await smartFetch(`${baseUrl}/api/v2/admin/countries/`)
      if (!res.ok) throw new Error(`Erreur ${res.status}`)
      const data = await res.json()
      setCountries(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Chargement des pays impossible",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCountries()
  }, [])

  const patchCountry = async (country: Country, patch: Partial<Country>, okMsg: string) => {
    try {
      setSaving(true)
      const res = await smartFetch(`${baseUrl}/api/v2/admin/countries/${country.uid}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      if (!res.ok) throw new Error(`Erreur ${res.status}`)
      await loadCountries()
      toast({ title: "OK", description: okMsg })
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Mise à jour impossible",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const createCountry = async () => {
    try {
      setSaving(true)
      const payload = {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        dial_code: form.dial_code.trim().replace(/\D/g, ""),
        currency_code: form.currency_code.trim().toUpperCase() || "XOF",
        is_active: form.is_active,
        orange_otp_required: form.orange_otp_required,
      }
      const res = await smartFetch(`${baseUrl}/api/v2/admin/countries/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || err.detail || JSON.stringify(err) || `Erreur ${res.status}`)
      }
      setCreateOpen(false)
      setForm({
        code: "",
        name: "",
        dial_code: "",
        currency_code: "XOF",
        is_active: true,
        orange_otp_required: false,
      })
      await loadCountries()
      toast({ title: "Pays créé", description: payload.code })
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Création impossible",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Pays</h1>
          <p className="text-neutral-500 mt-1">
            Pays autorisés pour les payin/payout PAL (ex. BJ, CI, CM…)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadCountries} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Catalogue pays
          </CardTitle>
          <CardDescription>
            Un pays actif peut être utilisé comme <code>country_code</code> dans les requêtes PAL.
            Activez « OTP Orange » pour CI/SN/BF (et autres si besoin).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : countries.length === 0 ? (
            <p className="text-sm text-neutral-500 py-8 text-center">
              Aucun pays — lancez <code>python manage.py seed_countries</code> ou créez-en un.
            </p>
          ) : (
            <div className="space-y-3">
              {countries.map((country) => (
                <div
                  key={country.uid}
                  className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg font-bold">{country.code}</span>
                      <span className="text-neutral-500">+{country.dial_code || "—"}</span>
                      <Badge variant="outline">{country.currency_code || "—"}</Badge>
                      <Badge className={country.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}>
                        {country.is_active ? "Actif" : "Inactif"}
                      </Badge>
                      {country.orange_otp_required && (
                        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                          OTP Orange
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{country.name}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-3">
                      <Label htmlFor={`active-${country.uid}`} className="text-sm">Actif</Label>
                      <Switch
                        id={`active-${country.uid}`}
                        checked={country.is_active}
                        disabled={saving}
                        onCheckedChange={() =>
                          patchCountry(
                            country,
                            { is_active: !country.is_active },
                            `${country.code} ${!country.is_active ? "activé" : "désactivé"}`
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Label htmlFor={`otp-${country.uid}`} className="text-sm">OTP Orange</Label>
                      <Switch
                        id={`otp-${country.uid}`}
                        checked={country.orange_otp_required}
                        disabled={saving}
                        onCheckedChange={() =>
                          patchCountry(
                            country,
                            { orange_otp_required: !country.orange_otp_required },
                            `OTP Orange ${!country.orange_otp_required ? "activé" : "désactivé"} pour ${country.code}`
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau pays</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Code ISO *</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="CM"
                maxLength={5}
              />
            </div>
            <div>
              <Label>Nom *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Cameroun"
              />
            </div>
            <div>
              <Label>Indicatif</Label>
              <Input
                value={form.dial_code}
                onChange={(e) => setForm({ ...form, dial_code: e.target.value })}
                placeholder="237"
              />
            </div>
            <div>
              <Label>Devise associée</Label>
              <Input
                value={form.currency_code}
                onChange={(e) => setForm({ ...form, currency_code: e.target.value })}
                placeholder="XAF"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
              <Label>Actif</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.orange_otp_required}
                onCheckedChange={(v) => setForm({ ...form, orange_otp_required: v })}
              />
              <Label>OTP Orange requis</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
              <Button
                disabled={saving || !form.code.trim() || !form.name.trim()}
                onClick={createCountry}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Créer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

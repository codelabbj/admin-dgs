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
import { Loader2, Coins, Plus, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Currency {
  uid: string
  code: string
  name: string
  symbol: string
  is_active: boolean
  is_default: boolean
  country_codes: string[]
  created_at: string
  updated_at: string
}

export function CurrenciesContent() {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({
    code: "",
    name: "",
    symbol: "",
    is_active: true,
    is_default: false,
    country_codes: "",
  })
  const { toast } = useToast()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  const loadCurrencies = async () => {
    try {
      setLoading(true)
      const res = await smartFetch(`${baseUrl}/api/v2/admin/currencies/`)
      if (!res.ok) throw new Error(`Erreur ${res.status}`)
      const data = await res.json()
      setCurrencies(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Chargement devises impossible",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCurrencies()
  }, [])

  const toggleActive = async (currency: Currency) => {
    try {
      setSaving(true)
      const res = await smartFetch(`${baseUrl}/api/v2/admin/currencies/${currency.uid}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currency.is_active }),
      })
      if (!res.ok) throw new Error(`Erreur ${res.status}`)
      await loadCurrencies()
      toast({ title: "OK", description: `${currency.code} ${!currency.is_active ? "activée" : "désactivée"}` })
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

  const createCurrency = async () => {
    try {
      setSaving(true)
      const payload = {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        symbol: form.symbol.trim() || form.code.trim().toUpperCase(),
        is_active: form.is_active,
        is_default: form.is_default,
        country_codes: form.country_codes
          .split(",")
          .map((c) => c.trim().toUpperCase())
          .filter(Boolean),
      }
      const res = await smartFetch(`${baseUrl}/api/v2/admin/currencies/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || err.detail || JSON.stringify(err) || `Erreur ${res.status}`)
      }
      setCreateOpen(false)
      setForm({ code: "", name: "", symbol: "", is_active: true, is_default: false, country_codes: "" })
      await loadCurrencies()
      toast({ title: "Devise créée", description: payload.code })
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
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Devises</h1>
          <p className="text-neutral-500 mt-1">Wallets multi-devises (XOF, NGN, GHS…)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadCurrencies} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
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
            <Coins className="h-5 w-5" />
            Devises actives
          </CardTitle>
          <CardDescription>
            Chaque devise active ouvre un wallet client. L’opérateur pointe vers une devise (wallet crédité/débité).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : currencies.length === 0 ? (
            <p className="text-sm text-neutral-500 py-8 text-center">
              Aucune devise — lancez `seed_currencies` côté backend ou créez-en une.
            </p>
          ) : (
            <div className="space-y-3">
              {currencies.map((currency) => (
                <div
                  key={currency.uid}
                  className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{currency.code}</span>
                      <span className="text-neutral-500">{currency.symbol}</span>
                      {currency.is_default && (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Default</Badge>
                      )}
                      <Badge className={currency.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}>
                        {currency.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{currency.name}</p>
                    {currency.country_codes?.length > 0 && (
                      <p className="text-xs text-neutral-500 mt-1">
                        Pays: {currency.country_codes.join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Label htmlFor={`active-${currency.uid}`} className="text-sm">Active</Label>
                    <Switch
                      id={`active-${currency.uid}`}
                      checked={currency.is_active}
                      disabled={saving}
                      onCheckedChange={() => toggleActive(currency)}
                    />
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
            <DialogTitle>Nouvelle devise</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Code *</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="NGN"
              />
            </div>
            <div>
              <Label>Nom *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Naira nigérian"
              />
            </div>
            <div>
              <Label>Symbole</Label>
              <Input
                value={form.symbol}
                onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                placeholder="₦"
              />
            </div>
            <div>
              <Label>Codes pays (séparés par virgule)</Label>
              <Input
                value={form.country_codes}
                onChange={(e) => setForm({ ...form, country_codes: e.target.value })}
                placeholder="NG"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
              <Label>Active</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_default}
                onCheckedChange={(v) => setForm({ ...form, is_default: v })}
              />
              <Label>Par défaut</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
              <Button
                disabled={saving || !form.code.trim() || !form.name.trim()}
                onClick={createCurrency}
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

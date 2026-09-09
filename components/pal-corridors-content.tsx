"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { smartFetch } from "@/utils/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, RefreshCw } from "lucide-react"

interface FeeInfo {
  enabled?: boolean | string | null
  rate?: string | number | null
  fixed?: string | number | null
}

interface Corridor {
  id?: string
  name?: string
  network?: string
  country_code?: string
  currency_code?: string
  payin?: FeeInfo
  payout?: FeeInfo
  min_amount?: string | number | null
  max_amount?: string | number | null
  status?: string | boolean | null
}

function yesNo(value: FeeInfo["enabled"]) {
  if (value === true || value === "true" || value === 1 || value === "1") return "Oui"
  if (value === false || value === "false" || value === 0 || value === "0") return "Non"
  return "—"
}

function formatFee(fee?: FeeInfo) {
  if (!fee) return "—"
  const parts: string[] = []
  if (fee.rate != null && fee.rate !== "") parts.push(`${fee.rate}%`)
  if (fee.fixed != null && fee.fixed !== "") parts.push(String(fee.fixed))
  if (!parts.length) return yesNo(fee.enabled)
  return parts.join(" + ")
}

export function PalCorridorsContent() {
  const [corridors, setCorridors] = useState<Corridor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [country, setCountry] = useState("")
  const [payinOnly, setPayinOnly] = useState(false)
  const [payoutOnly, setPayoutOnly] = useState(false)
  const [search, setSearch] = useState("")
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      if (!baseUrl) throw new Error("Base URL non configurée")
      const params = new URLSearchParams()
      if (country.trim()) params.set("country_code", country.trim().toUpperCase())
      if (payinOnly) params.set("payin", "true")
      if (payoutOnly) params.set("payout", "true")
      const qs = params.toString()
      const res = await smartFetch(`${baseUrl}/api/v2/admin/pal/corridors/${qs ? `?${qs}` : ""}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || data.detail || `Erreur ${res.status}`)
      setCorridors(Array.isArray(data.corridors) ? data.corridors : [])
    } catch (err) {
      setCorridors([])
      setError(err instanceof Error ? err.message : "Impossible de charger les corridors PAL")
    } finally {
      setLoading(false)
    }
  }, [baseUrl, country, payinOnly, payoutOnly])

  useEffect(() => {
    load()
    // Chargement initial seulement — les filtres partent sur Actualiser.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return corridors
    return corridors.filter((row) =>
      [row.name, row.network, row.country_code, row.currency_code]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
  }, [corridors, search])

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Corridors PAL</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Opérateurs autorisés chez PAL et frais à payer (payin / payout).
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Actualiser
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtres</CardTitle>
          <CardDescription>Ces filtres sont envoyés à PAL.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="space-y-2">
            <Label htmlFor="country">Pays</Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="CI, NG, BJ…"
              className="w-32 uppercase"
            />
          </div>
          <div className="space-y-2 flex-1">
            <Label htmlFor="search">Recherche</Label>
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Réseau, pays, devise"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="payin" checked={payinOnly} onCheckedChange={setPayinOnly} />
            <Label htmlFor="payin">Payin</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="payout" checked={payoutOnly} onCheckedChange={setPayoutOnly} />
            <Label htmlFor="payout">Payout</Label>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Opérateurs</CardTitle>
          <CardDescription>{filtered.length} corridor{filtered.length > 1 ? "s" : ""}</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading && corridors.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-neutral-500">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Chargement…
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opérateur</TableHead>
                  <TableHead>Pays</TableHead>
                  <TableHead>Devise</TableHead>
                  <TableHead>Payin</TableHead>
                  <TableHead>Frais payin</TableHead>
                  <TableHead>Payout</TableHead>
                  <TableHead>Frais payout</TableHead>
                  <TableHead>Min / Max</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-neutral-500 py-8">
                      Aucun corridor trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row, index) => (
                    <TableRow key={row.id || `${row.network}-${row.country_code}-${index}`}>
                      <TableCell>
                        <div className="font-medium">{row.name || row.network || "—"}</div>
                        {row.network && row.name && row.network !== row.name && (
                          <div className="text-xs text-neutral-500">{row.network}</div>
                        )}
                      </TableCell>
                      <TableCell>{row.country_code || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{row.currency_code || "—"}</Badge>
                      </TableCell>
                      <TableCell>{yesNo(row.payin?.enabled)}</TableCell>
                      <TableCell>{formatFee(row.payin)}</TableCell>
                      <TableCell>{yesNo(row.payout?.enabled)}</TableCell>
                      <TableCell>{formatFee(row.payout)}</TableCell>
                      <TableCell className="text-sm">
                        {row.min_amount ?? "—"} / {row.max_amount ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useCallback, useEffect, useState } from "react"
import { smartFetch } from "@/utils/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, Wallet } from "lucide-react"

interface PalWallet {
  id?: string
  currency_code?: string
  currency_name?: string
  currency_symbol?: string
  balance?: string | number | null
  frozen?: string | number | null
  balance_available?: string | number | null
  updated_at?: string | null
}

function formatAmount(value: string | number | null | undefined, code?: string) {
  if (value == null || value === "") return "—"
  const num = Number(value)
  const formatted = Number.isFinite(num) ? num.toLocaleString(undefined, { maximumFractionDigits: 2 }) : String(value)
  return code ? `${formatted} ${code}` : formatted
}

export function PalWalletsContent() {
  const [wallets, setWallets] = useState<PalWallet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      if (!baseUrl) throw new Error("Base URL non configurée")
      const res = await smartFetch(`${baseUrl}/api/v2/admin/pal/wallets/`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || data.detail || `Erreur ${res.status}`)
      }
      setWallets(Array.isArray(data.wallets) ? data.wallets : [])
    } catch (err) {
      setWallets([])
      setError(err instanceof Error ? err.message : "Impossible de charger les soldes PAL")
    } finally {
      setLoading(false)
    }
  }, [baseUrl])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Soldes PAL</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Soldes du compte marchand PAL (XOF, NGN, GHS…).
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Actualiser
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {loading && wallets.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-neutral-500">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Chargement des wallets PAL…
        </div>
      ) : wallets.length === 0 && !error ? (
        <Card>
          <CardContent className="py-12 text-center text-neutral-500">
            Aucun wallet PAL trouvé.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {wallets.map((wallet) => {
            const code = wallet.currency_code || "—"
            return (
              <Card key={wallet.id || code}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-slate-100 p-2 dark:bg-neutral-800">
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{code}</CardTitle>
                        <CardDescription>{wallet.currency_name || "Wallet PAL"}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">{code}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-neutral-500">Solde</p>
                    <p className="text-2xl font-semibold">{formatAmount(wallet.balance, code)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-neutral-500">Disponible</p>
                      <p className="font-medium">{formatAmount(wallet.balance_available, code)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Gelé</p>
                      <p className="font-medium">{formatAmount(wallet.frozen, code)}</p>
                    </div>
                  </div>
                  {wallet.updated_at && (
                    <p className="text-xs text-neutral-500">
                      Maj : {new Date(wallet.updated_at).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

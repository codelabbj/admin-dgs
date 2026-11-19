"use client"

import { useCallback, useEffect, useState } from "react"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cardsApi, dateTime } from "@/lib/cards-api"
import { ConfirmAction, ErrorBanner, Panel } from "./cards-ui"

interface FxRow {
  code: string
  name: string
  is_active: boolean
  card_usd_rate: string | null
  updated_at: string | null
  max_age_hours: number
  stale: boolean
}

/**
 * Taux DGS pour recharger une carte (USD) depuis un wallet partenaire d'une autre devise.
 * 1 USD = X : la marge DGS est incluse dans le taux. Vide = recharge impossible depuis ce wallet.
 */
export function CardFxRatesPanel() {
  const [rows, setRows] = useState<FxRow[]>([])
  const [error, setError] = useState("")
  const [editing, setEditing] = useState<FxRow | null>(null)
  const [value, setValue] = useState("")
  const [maxAge, setMaxAge] = useState("72")

  const load = useCallback(async () => {
    setError("")
    try {
      setRows((await cardsApi<{ results: FxRow[] }>("fx-rates/")).results)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chargement impossible")
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <Panel
      title="Taux de recharge carte"
      description="Un partenaire peut recharger une carte depuis son wallet XOF, USDT… DGS débite ce wallet à ce taux (marge incluse) et crédite l'USD. Vide = désactivé."
    >
      {error && <ErrorBanner message={error} onRetry={load} />}
      <div className="divide-y">
        {rows.map((r) => (
          <div key={r.code} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
            <div>
              <p className="font-medium">
                {r.code} <span className="font-normal text-muted-foreground">· {r.name}</span>
                {!r.is_active && <span className="ml-2 text-xs text-muted-foreground">(devise inactive)</span>}
              </p>
              <p className="text-xs text-muted-foreground">
                {r.card_usd_rate ? `1 $ = ${Number(r.card_usd_rate).toLocaleString("fr-FR")} ${r.code}` : "Désactivé"}
                {r.updated_at ? ` · modifié ${dateTime(r.updated_at)}` : ""}
                {r.max_age_hours ? ` · valable ${r.max_age_hours} h` : " · sans limite d'âge"}
              </p>
              {r.stale && (
                <p className="text-xs font-medium text-destructive">Périmé : recharges depuis ce wallet suspendues jusqu'à mise à jour.</p>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditing(r)
                setValue(r.card_usd_rate || "")
                setMaxAge(String(r.max_age_hours ?? 72))
              }}
            >
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Modifier
            </Button>
          </div>
        ))}
      </div>
      <ConfirmAction
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        title={`Taux ${editing?.code ?? ""} → USD`}
        description="S'applique aux prochaines recharges. Les recharges déjà faites gardent leur taux (tracé sur l'opération)."
        confirmLabel="Enregistrer"
        requireReason={false}
        onConfirm={async ({ totp }) => {
          await cardsApi("fx-rates/", { method: "POST", totp, body: { code: editing?.code, card_usd_rate: value.trim(), max_age_hours: maxAge.trim() } })
          await load()
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="fx-rate">1 USD = ({editing?.code})</Label>
          <Input id="fx-rate" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} placeholder="ex. 620" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fx-age">Validité (heures, 0 = illimitée)</Label>
          <Input id="fx-age" inputMode="numeric" value={maxAge} onChange={(e) => setMaxAge(e.target.value)} />
        </div>
      </ConfirmAction>
    </Panel>
  )
}

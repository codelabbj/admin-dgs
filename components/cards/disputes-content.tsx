"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cardsApi, dateTime, usd } from "@/lib/cards-api"
import { CardsShell, ConfirmAction, EmptyState, ErrorBanner, Panel } from "./cards-ui"

interface Dispute {
  id: string
  customer_id: string
  card_id: string
  external_ref: string
  transaction_reference: string
  amount: string
  merchant: { name?: string; country?: string }
  description: string
  transaction_at: string
  reason_label: string
  details: string
  status: "open" | "submitted" | "won" | "lost" | "cancelled"
  status_label: string
  provider_ticket: string
  resolution_note: string
  refunded_amount: string
  created_at: string
}

const NEXT: Record<string, { status: Dispute["status"]; label: string }[]> = {
  open: [
    { status: "submitted", label: "Transmise à Maplerad" },
    { status: "lost", label: "Refusée" },
    { status: "cancelled", label: "Annulée" },
  ],
  submitted: [
    { status: "won", label: "Gagnée" },
    { status: "lost", label: "Perdue" },
  ],
}

export function CardDisputesContent() {
  const [filter, setFilter] = useState("open")
  const [rows, setRows] = useState<Dispute[]>([])
  const [openCount, setOpenCount] = useState(0)
  const [error, setError] = useState("")
  const [target, setTarget] = useState<{ d: Dispute; status: Dispute["status"] } | null>(null)
  const [ticket, setTicket] = useState("")
  const [note, setNote] = useState("")

  const load = useCallback(async () => {
    setError("")
    try {
      const res = await cardsApi<{ results: Dispute[]; open: number }>("disputes/", { query: { status: filter } })
      setRows(res.results)
      setOpenCount(res.open)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chargement impossible")
    }
  }, [filter])

  useEffect(() => {
    load()
  }, [load])

  return (
    <CardsShell
      title="Contestations"
      description="Maplerad n'a pas d'API de litige : transmettez la contestation à son support, notez le n° de ticket ici. Un remboursement marchand (REFUND / REVERSAL) du même montant clôt automatiquement la contestation « gagnée »."
    >
      <div className="flex flex-wrap gap-2">
        {[["open", `Ouvertes (${openCount})`], ["submitted", "Transmises"], ["won", "Gagnées"], ["lost", "Perdues"], ["all", "Toutes"]].map(([k, l]) => (
          <Button key={k} size="sm" variant={filter === k ? "default" : "outline"} onClick={() => setFilter(k)}>
            {l}
          </Button>
        ))}
      </div>
      {error && <ErrorBanner message={error} onRetry={load} />}
      <Panel>
        {rows.length === 0 ? (
          <EmptyState title="Aucune contestation" />
        ) : (
          <div className="divide-y">
            {rows.map((d) => (
              <div key={d.id} className="flex flex-col gap-2 p-4 text-sm md:flex-row md:items-start md:justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">
                    {usd(d.amount)} · {d.merchant?.name || d.description || "—"}{" "}
                    <span className="text-muted-foreground">({d.reason_label})</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {d.customer_id} · porteur {d.external_ref || "—"} · carte {d.card_id.slice(0, 12)} · tx {d.transaction_reference} du {dateTime(d.transaction_at)}
                  </p>
                  {d.details && <p className="text-xs">« {d.details} »</p>}
                  <p className="text-xs">
                    <span className="font-medium">{d.status_label}</span>
                    {d.provider_ticket ? ` · ticket ${d.provider_ticket}` : ""}
                    {d.resolution_note ? ` · ${d.resolution_note}` : ""}
                    {` · ouverte ${dateTime(d.created_at)}`}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {(NEXT[d.status] || []).map((n) => (
                    <Button key={n.status} size="sm" variant="outline" onClick={() => { setTarget({ d, status: n.status }); setTicket(d.provider_ticket); setNote("") }}>
                      {n.label}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
      <ConfirmAction
        open={!!target}
        onOpenChange={(v) => !v && setTarget(null)}
        title="Mettre à jour la contestation"
        description="Le partenaire est notifié (événement card.dispute.updated). « Gagnée » ne crédite rien : la carte est recréditée par le remboursement Maplerad."
        confirmLabel="Enregistrer"
        requireReason={false}
        onConfirm={async () => {
          if (!target) return
          await cardsApi(`disputes/${target.d.id}/`, { method: "POST", body: { status: target.status, provider_ticket: ticket, note } })
          await load()
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="ticket">N° de ticket support Maplerad</Label>
          <Input id="ticket" value={ticket} onChange={(e) => setTicket(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="note">Note (visible par le partenaire)</Label>
          <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </ConfirmAction>
    </CardsShell>
  )
}

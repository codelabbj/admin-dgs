"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Ban, Loader2, Lock, Minus, RefreshCw, Unlock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LEDGER_TYPE, OP_KIND, ago, cardsApi, dateTime, usd, type AdminCard, type CardOp, type LedgerRow } from "@/lib/cards-api"
import { CardsShell, ComplianceBadge, ConfirmAction, EmptyState, ErrorBanner, Mono, Panel, StatusPill } from "./cards-ui"

interface Detail {
  card: AdminCard
  ledger: LedgerRow[]
  operations: CardOp[]
}

type Action = "freeze" | "unfreeze" | "terminate" | null

export function CardDetailContent({ uid }: { uid: string }) {
  const [data, setData] = useState<Detail | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [action, setAction] = useState<Action>(null)

  const load = useCallback(async () => {
    setError("")
    try {
      setData(await cardsApi<Detail>(`${uid}/`))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chargement impossible")
    } finally {
      setLoading(false)
    }
  }, [uid])

  useEffect(() => {
    load()
  }, [load])

  const refresh = async () => {
    setRefreshing(true)
    try {
      await cardsApi(`${uid}/refresh/`, { method: "POST" })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Maplerad indisponible")
    } finally {
      setRefreshing(false)
    }
  }

  const card = data?.card
  const dead = card && ["TERMINATED", "FAILED"].includes(card.status)

  return (
    <CardsShell
      title={card ? card.masked_pan || "Carte en création" : "Carte"}
      description={card ? `${card.brand || "—"} · partenaire ${card.owner_customer_id} · utilisateur ${card.external_ref || "—"}` : undefined}
      actions={
        <>
          <Button asChild variant="ghost" size="sm">
            <Link href="/cards/list"><ArrowLeft className="mr-2 h-4 w-4" />Cartes</Link>
          </Button>
          {card && !dead && (
            <>
              <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing}>
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />Relire Maplerad
              </Button>
              {card.frozen_by === "dgs" ? (
                <Button variant="outline" size="sm" onClick={() => setAction("unfreeze")}>
                  <Unlock className="mr-2 h-4 w-4" />Lever le gel
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setAction("freeze")}>
                  <Lock className="mr-2 h-4 w-4" />Gel conformité
                </Button>
              )}
              <Button variant="destructive" size="sm" onClick={() => setAction("terminate")}>
                <Ban className="mr-2 h-4 w-4" />Résilier
              </Button>
            </>
          )}
        </>
      }
    >
      {error && <ErrorBanner message={error} onRetry={load} />}
      {loading && !data ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : card ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A1F34] via-[#123456] to-[#1c4a7a] p-5 text-white shadow-lg">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-white/70">DGS · {card.brand || "CARD"}</span>
                <StatusPill status={card.status} className="bg-white/10 text-white ring-white/20" />
              </div>
              <p className="mt-8 font-mono text-lg tracking-[0.2em]">{card.masked_pan || "•••• •••• •••• ••••"}</p>
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/60">Solde</p>
                  <p className="text-2xl font-semibold tabular-nums">{usd(card.balance)}</p>
                  <p className="text-[11px] text-white/60">lu {ago(card.balance_synced_at)}</p>
                </div>
                <ComplianceBadge frozenBy={card.frozen_by} />
              </div>
            </div>

            <Panel title="Identifiants" className="lg:col-span-2">
              <dl className="grid gap-x-6 gap-y-3 p-4 text-sm sm:grid-cols-2">
                {[
                  ["ID Maplerad", card.id],
                  ["Référence création", card.reference || "—"],
                  ["Client Maplerad", card.customer_id || "—"],
                  ["Partenaire", card.owner_customer_id],
                  ["Utilisateur final", card.external_ref || "—"],
                  ["Créée", dateTime(card.created_at)],
                  ["Gel", card.frozen_by ? `${card.frozen_by === "dgs" ? "Conformité DGS" : "Partenaire"}${card.frozen_reason ? ` — ${card.frozen_reason}` : ""}` : "Non"],
                  ["Résiliée", dateTime(card.terminated_at)],
                ].map(([k, v]) => (
                  <div key={k} className="min-w-0">
                    <dt className="text-xs text-muted-foreground">{k}</dt>
                    <dd className="truncate font-mono text-xs">{v}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          </div>

          <Tabs defaultValue="ledger">
            <TabsList>
              <TabsTrigger value="ledger">Historique ({data!.ledger.length})</TabsTrigger>
              <TabsTrigger value="ops">Opérations ({data!.operations.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="ledger">
              <Panel>
                {data!.ledger.length === 0 ? (
                  <EmptyState title="Aucun mouvement" hint="Les achats, recharges et frais apparaissent ici dès réception des webhooks Maplerad." />
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mouvement</TableHead>
                          <TableHead className="hidden sm:table-cell">Marchand</TableHead>
                          <TableHead className="text-right">Montant</TableHead>
                          <TableHead className="hidden md:table-cell">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data!.ledger.map((row) => {
                          const Icon = row.direction === "credit" ? ArrowDownLeft : row.direction === "debit" ? ArrowUpRight : Minus
                          return (
                            <TableRow key={row.uid}>
                              <TableCell>
                                <div className="flex items-center gap-2.5">
                                  <span className={`flex h-7 w-7 items-center justify-center rounded-full ${row.direction === "credit" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15" : row.direction === "debit" ? "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300" : "bg-muted text-muted-foreground"}`}>
                                    <Icon className="h-3.5 w-3.5" />
                                  </span>
                                  <div>
                                    <p className="text-sm font-medium">{LEDGER_TYPE[row.type] || row.type}</p>
                                    <p className="max-w-[16rem] truncate text-xs text-muted-foreground">{row.description || row.status}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden text-sm sm:table-cell">{row.merchant?.name || "—"}</TableCell>
                              <TableCell className={`text-right font-medium tabular-nums ${row.direction === "credit" ? "text-emerald-600" : ""}`}>
                                {row.direction === "credit" ? "+" : row.direction === "debit" ? "−" : ""}{usd(row.amount)}
                                {Number(row.fee) > 0 && <p className="text-[11px] font-normal text-muted-foreground">frais {usd(row.fee)}</p>}
                              </TableCell>
                              <TableCell className="hidden text-sm text-muted-foreground md:table-cell">{dateTime(row.occurred_at)}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Panel>
            </TabsContent>
            <TabsContent value="ops">
              <Panel>
                {data!.operations.length === 0 ? (
                  <EmptyState title="Aucune opération" />
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Opération</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Montant · frais</TableHead>
                          <TableHead className="hidden md:table-cell">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data!.operations.map((op) => (
                          <TableRow key={op.id}>
                            <TableCell>
                              <p className="text-sm font-medium">{OP_KIND[op.kind] || op.kind}</p>
                              <Mono>{op.client_reference || op.reference || op.id.slice(0, 8)}</Mono>
                            </TableCell>
                            <TableCell>
                              <StatusPill status={op.status} />
                              {op.error && <p className="mt-1 max-w-[18rem] truncate text-[11px] text-muted-foreground">{op.error}</p>}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {usd(op.amount)}
                              <p className="text-[11px] text-muted-foreground">{usd(op.fee)}</p>
                            </TableCell>
                            <TableCell className="hidden text-sm text-muted-foreground md:table-cell">{dateTime(op.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Panel>
            </TabsContent>
          </Tabs>
        </>
      ) : null}

      <ConfirmAction
        open={action === "freeze"}
        onOpenChange={(v) => !v && setAction(null)}
        title="Gel conformité"
        description="La carte est bloquée chez Maplerad. Le partenaire et l'utilisateur NE PEUVENT PAS la dégeler ; ils sont prévenus par un événement signé."
        confirmLabel="Geler la carte"
        destructive
        onConfirm={async ({ reason, totp }) => {
          await cardsApi(`${uid}/freeze/`, { method: "POST", body: { reason }, totp })
          await load()
        }}
      />
      <ConfirmAction
        open={action === "unfreeze"}
        onOpenChange={(v) => !v && setAction(null)}
        title="Lever le gel conformité"
        description="La carte redevient utilisable immédiatement."
        confirmLabel="Lever le gel"
        requireReason={false}
        onConfirm={async ({ totp }) => {
          await cardsApi(`${uid}/unfreeze/`, { method: "POST", totp })
          await load()
        }}
      />
      <ConfirmAction
        open={action === "terminate"}
        onOpenChange={(v) => !v && setAction(null)}
        title="Résilier la carte"
        description={
          <>
            Le solde de la carte ({usd(card?.balance)}) est d'abord rapatrié sur le wallet USD du partenaire, puis la carte est
            définitivement résiliée chez Maplerad. <strong>Action irréversible.</strong>
          </>
        }
        confirmLabel="Résilier définitivement"
        destructive
        onConfirm={async ({ reason, totp }) => {
          await cardsApi(`${uid}/terminate/`, { method: "POST", body: { reason }, totp })
          await load()
        }}
      />
    </CardsShell>
  )
}

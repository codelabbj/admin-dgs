"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Gavel, Loader2, RefreshCw, Search, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { OP_KIND, cardsApi, dateTime, usd, type CardOp, type Paginated } from "@/lib/cards-api"
import { CardsShell, ConfirmAction, EmptyState, ErrorBanner, Mono, Pager, Panel, StatusPill } from "./cards-ui"

const PAGE_SIZE = 25

export function CardOperationsContent() {
  const params = useSearchParams()
  const [status, setStatus] = useState(params.get("status") || "open")
  const [kind, setKind] = useState("all")
  const [q, setQ] = useState("")
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Paginated<CardOp> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [resolving, setResolving] = useState<{ op: CardOp; outcome: "success" | "failed" } | null>(null)
  const [busyId, setBusyId] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      setData(await cardsApi<Paginated<CardOp>>("operations/", { query: { status, kind, q, page, page_size: PAGE_SIZE } }))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chargement impossible")
    } finally {
      setLoading(false)
    }
  }, [status, kind, q, page])

  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
  }, [load])

  const retry = async (op: CardOp) => {
    setBusyId(op.id)
    try {
      await cardsApi(`operations/${op.id}/reconcile/`, { method: "POST" })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rapprochement impossible")
    } finally {
      setBusyId("")
    }
  }

  const open = (s: string) => ["pending", "unknown", "review"].includes(s)

  return (
    <CardsShell
      title="Opérations"
      description="Recharges, retraits, frais et restitutions. Une opération « inconnue » garde le débit : elle est rapprochée automatiquement, jamais remboursée à l'aveugle."
      actions={
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Actualiser
        </Button>
      }
    >
      <Panel>
        <div className="flex flex-col gap-2 border-b p-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} placeholder="client_reference, utilisateur, carte, référence AGG-…" className="pl-9" />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
            <SelectTrigger className="md:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Ouvertes (toutes)</SelectItem>
              <SelectItem value="review">À vérifier</SelectItem>
              <SelectItem value="unknown">Résultat inconnu</SelectItem>
              <SelectItem value="pending">En cours</SelectItem>
              <SelectItem value="success">Réussies</SelectItem>
              <SelectItem value="failed">Échouées</SelectItem>
              <SelectItem value="all">Tout</SelectItem>
            </SelectContent>
          </Select>
          <Select value={kind} onValueChange={(v) => { setKind(v); setPage(1) }}>
            <SelectTrigger className="md:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous types</SelectItem>
              {Object.entries(OP_KIND).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {error && <div className="p-3"><ErrorBanner message={error} onRetry={load} /></div>}

        {loading && !data ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : data && data.results.length === 0 ? (
          <EmptyState title={status === "open" || status === "review" ? "Rien à traiter" : "Aucune opération"} hint={status === "open" ? "Toutes les opérations carte sont tranchées." : undefined} />
        ) : data ? (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Opération</TableHead>
                    <TableHead>Partenaire · carte</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Montant · frais</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.results.map((op) => (
                    <TableRow key={op.id} className={op.status === "review" ? "bg-red-50/40 dark:bg-red-500/5" : undefined}>
                      <TableCell>
                        <p className="text-sm font-medium">{OP_KIND[op.kind] || op.kind}</p>
                        <Mono>{op.client_reference || op.reference || op.id.slice(0, 8)}</Mono>
                        <p className="text-[11px] text-muted-foreground">{dateTime(op.created_at)}</p>
                      </TableCell>
                      <TableCell>
                        <p className="max-w-[12rem] truncate text-sm">{op.owner_customer_id}</p>
                        {op.card_uid ? (
                          <Link href={`/cards/${op.card_uid}`} className="font-mono text-xs text-primary hover:underline">
                            {(op.card_id || "").slice(0, 14)}…
                          </Link>
                        ) : <Mono>—</Mono>}
                        {op.end_user_ref && <Mono className="block">user {op.end_user_ref}</Mono>}
                      </TableCell>
                      <TableCell className="max-w-[18rem]">
                        <StatusPill status={op.status} />
                        {op.error && <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{op.error}</p>}
                        {op.status === "unknown" && (
                          <p className="text-[11px] text-muted-foreground">{op.attempts} essai(s) · prochain contrôle {dateTime(op.next_check_at)}</p>
                        )}
                        {op.resolution_note && <p className="mt-1 text-[11px] italic text-muted-foreground">« {op.resolution_note} »</p>}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        <p className="font-medium">{usd(op.amount)}</p>
                        <p className="text-[11px] text-muted-foreground">{usd(op.fee)}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        {open(op.status) ? (
                          <div className="flex justify-end gap-1.5">
                            {["fund", "withdraw", "terminate"].includes(op.kind) && op.status !== "review" && (
                              <Button size="sm" variant="ghost" className="h-8" disabled={busyId === op.id} onClick={() => retry(op)} title="Relancer le rapprochement">
                                {busyId === op.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="h-8" onClick={() => setResolving({ op, outcome: "success" })}>
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-600" />A eu lieu
                            </Button>
                            <Button size="sm" variant="outline" className="h-8" onClick={() => setResolving({ op, outcome: "failed" })}>
                              <XCircle className="mr-1 h-3.5 w-3.5 text-red-600" />N'a pas eu lieu
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">{op.resolved_by_admin_id ? <><Gavel className="mr-1 inline h-3 w-3" />admin</> : "auto"}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pager page={page} pageSize={PAGE_SIZE} count={data.count} onPage={setPage} />
          </>
        ) : null}
      </Panel>

      <ConfirmAction
        open={!!resolving}
        onOpenChange={(v) => !v && setResolving(null)}
        title={resolving?.outcome === "success" ? "Confirmer : l'opération A EU LIEU" : "Confirmer : l'opération N'A PAS EU LIEU"}
        description={
          resolving && (
            <div className="space-y-2">
              <p>
                <strong>{OP_KIND[resolving.op.kind] || resolving.op.kind}</strong> de {usd(resolving.op.amount)} pour {resolving.op.owner_customer_id}.
              </p>
              <p className="rounded-lg bg-muted p-2 text-xs">
                {resolving.outcome === "success"
                  ? resolving.op.kind === "withdraw"
                    ? "Le partenaire sera CRÉDITÉ du montant (net des frais). Ne confirmez que si le retrait apparaît sur la carte dans le dashboard Maplerad."
                    : resolving.op.kind === "termination_refund"
                      ? "Le partenaire sera CRÉDITÉ du solde restitué."
                      : "Le débit du partenaire est conservé. Ne confirmez que si l'argent est bien arrivé sur la carte (dashboard Maplerad)."
                  : resolving.op.kind === "fund" || resolving.op.kind === "create"
                    ? "Le partenaire sera REMBOURSÉ (montant + frais). Ne confirmez que si rien n'a bougé chez Maplerad."
                    : "L'opération est clôturée sans mouvement d'argent."}
              </p>
            </div>
          )
        }
        confirmLabel={resolving?.outcome === "success" ? "Confirmer « a eu lieu »" : "Confirmer « n'a pas eu lieu »"}
        destructive={resolving?.outcome === "failed"}
        reasonLabel="Justification (ce que vous avez vérifié — tracé dans l'audit)"
        onConfirm={async ({ reason, totp }) => {
          if (!resolving) return
          await cardsApi(`operations/${resolving.op.id}/resolve/`, {
            method: "POST",
            body: { outcome: resolving.outcome, note: reason },
            totp,
          })
          await load()
        }}
      />
    </CardsShell>
  )
}

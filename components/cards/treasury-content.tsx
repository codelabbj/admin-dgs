"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronDown, Loader2, Play, Power } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cardsApi, dateTime, usd, type Paginated, type Report } from "@/lib/cards-api"
import { CardsShell, ConfirmAction, EmptyState, ErrorBanner, Kpi, Pager, Panel, StatusPill } from "./cards-ui"

export function CardTreasuryContent() {
  const [data, setData] = useState<Paginated<Report> | null>(null)
  const [sw, setSw] = useState<{ enabled: boolean; reason: string } | null>(null)
  const [page, setPage] = useState(1)
  const [error, setError] = useState("")
  const [running, setRunning] = useState(false)
  const [switchOpen, setSwitchOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError("")
    try {
      const [reports, swState] = await Promise.all([
        cardsApi<Paginated<Report>>("reconciliations/", { query: { page, page_size: 20 } }),
        cardsApi<{ enabled: boolean; reason: string }>("switch/"),
      ])
      setData(reports)
      setSw(swState)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chargement impossible")
    }
  }, [page])

  useEffect(() => {
    load()
  }, [load])

  const run = async () => {
    setRunning(true)
    setError("")
    try {
      await cardsApi("reconciliations/run/", { method: "POST" })
      setPage(1)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Contrôle impossible")
    } finally {
      setRunning(false)
    }
  }

  const last = data?.results[0]

  return (
    <CardsShell
      title="Trésorerie & kill switch"
      description="Toutes les 6 h, DGS compare l'argent réellement détenu chez Maplerad à ce qu'il doit aux partenaires. En cas de déficit, les cartes sont suspendues automatiquement."
      actions={
        <>
          <Button variant={sw?.enabled === false ? "default" : "outline"} size="sm" onClick={() => setSwitchOpen(true)}>
            <Power className="mr-2 h-4 w-4" />{sw?.enabled === false ? "Réactiver les cartes" : "Suspendre les cartes"}
          </Button>
          <Button size="sm" onClick={run} disabled={running}>
            {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}Contrôler maintenant
          </Button>
        </>
      }
    >
      {error && <ErrorBanner message={error} onRetry={load} />}

      {last && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Wallet USD Maplerad" value={usd(last.provider_balance)} hint="Actif réel" />
          <Kpi label="Dû aux partenaires" value={usd(last.partner_liabilities)} hint="Somme des wallets USD DGS" />
          <Kpi label="Recharges non tranchées" value={usd(last.open_operations_amount)} hint="Débitées, en rapprochement" />
          <Kpi
            label="Marge de sécurité"
            value={usd(last.surplus, { sign: true })}
            hint={<span className="inline-flex items-center gap-1.5"><StatusPill status={last.status} /> {dateTime(last.created_at)}</span>}
            tone={last.status === "alert" ? "danger" : last.status === "warning" ? "warning" : "default"}
          />
        </div>
      )}

      <Panel title="Historique des contrôles" description="Écart = wallet Maplerad − dettes partenaires (doit rester ≥ 0 : c'est la marge DGS)">
        {!data ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : data.results.length === 0 ? (
          <EmptyState title="Aucun contrôle" hint="Lancez un premier contrôle avec « Contrôler maintenant »." />
        ) : (
          <>
            <ul className="divide-y">
              {data.results.map((r) => (
                <li key={r.uid}>
                  <button
                    onClick={() => setExpanded(expanded === r.uid ? null : r.uid)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50"
                  >
                    <StatusPill status={r.status} />
                    <span className="hidden text-sm text-muted-foreground sm:inline">{dateTime(r.created_at)}</span>
                    <span className="ml-auto text-sm tabular-nums">
                      {usd(r.provider_balance)} − {usd(r.partner_liabilities)} ={" "}
                      <strong className={Number(r.surplus) < 0 ? "text-red-600" : "text-emerald-600"}>{usd(r.surplus, { sign: true })}</strong>
                    </span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded === r.uid ? "rotate-180" : ""}`} />
                  </button>
                  {expanded === r.uid && (
                    <div className="space-y-3 bg-muted/30 px-4 py-3 text-xs">
                      <p className="text-muted-foreground">
                        {r.triggered_by_admin_id ? `Lancé par l'admin ${r.triggered_by_admin_id}` : "Contrôle automatique"} ·{" "}
                        {r.card_mismatches} carte(s) avec écart de solde
                      </p>
                      {r.details?.wallet_error && <ErrorBanner message={`Lecture wallet Maplerad : ${r.details.wallet_error}`} />}
                      {Array.isArray(r.details?.card_mismatches) && r.details.card_mismatches.length > 0 && (
                        <table className="w-full max-w-lg">
                          <thead className="text-muted-foreground">
                            <tr><th className="py-1 text-left font-medium">Carte</th><th className="text-right font-medium">DGS</th><th className="text-right font-medium">Maplerad</th></tr>
                          </thead>
                          <tbody>
                            {r.details.card_mismatches.map((m: any) => (
                              <tr key={m.card}>
                                <td className="py-1 font-mono">{String(m.card).slice(0, 18)}</td>
                                <td className="text-right tabular-nums">{usd(m.dgs)}</td>
                                <td className="text-right tabular-nums">{usd(m.maplerad)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <Pager page={page} pageSize={20} count={data.count} onPage={setPage} />
          </>
        )}
      </Panel>

      <ConfirmAction
        open={switchOpen}
        onOpenChange={setSwitchOpen}
        title={sw?.enabled === false ? "Réactiver les cartes" : "Suspendre les cartes"}
        description={
          sw?.enabled === false
            ? `Suspendues : ${sw?.reason || "sans motif"}. Vérifiez que la cause est résolue avant de réactiver.`
            : "Bloque toutes les créations et recharges, pour tous les partenaires. Retraits et résiliations restent possibles."
        }
        confirmLabel={sw?.enabled === false ? "Réactiver" : "Suspendre"}
        destructive={sw?.enabled !== false}
        requireReason={sw?.enabled !== false}
        onConfirm={async ({ reason, totp }) => {
          await cardsApi("switch/", { method: "POST", body: { enabled: sw?.enabled === false, reason }, totp })
          await load()
        }}
      />
    </CardsShell>
  )
}

"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, CreditCard, Loader2, Power, RefreshCw, Scale, ShieldAlert, TriangleAlert, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cardsApi, dateTime, usd, type Report } from "@/lib/cards-api"
import { CardsShell, ConfirmAction, ErrorBanner, Kpi, Panel, StatusPill } from "./cards-ui"

interface Overview {
  cards: { total: number; alive: number; by_status: Record<string, number>; compliance_frozen: number; total_balance_usd: string; partners: number }
  operations: { open: number; review: number; unknown: number; open_amount_usd: string; fund_today_count: number; fund_today_usd: string }
  revenue_month_usd: string
  events_undelivered: number
  switch: { enabled: boolean; reason: string; updated_at: string | null }
  last_reconciliation: Report | null
}

export function CardsOverviewContent() {
  const [data, setData] = useState<Overview | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [switchOpen, setSwitchOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      setData(await cardsApi<Overview>("overview/"))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chargement impossible")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const sw = data?.switch
  const rec = data?.last_reconciliation

  return (
    <CardsShell
      title="Vue d'ensemble"
      description="Cartes émises via Maplerad pour tous les partenaires DGS (Qora…) et leurs utilisateurs finaux."
      actions={
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Actualiser
        </Button>
      }
    >
      {error && <ErrorBanner message={error} onRetry={load} />}

      {sw && !sw.enabled && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-300 bg-red-50 p-4 dark:border-red-500/40 dark:bg-red-500/10 sm:flex-row sm:items-center">
          <Power className="h-5 w-5 shrink-0 text-red-600" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-red-800 dark:text-red-300">Créations et recharges de cartes SUSPENDUES</p>
            <p className="text-red-700/80 dark:text-red-300/80">{sw.reason || "Sans motif"} · {dateTime(sw.updated_at)}</p>
          </div>
          <Button size="sm" onClick={() => setSwitchOpen(true)}>Réactiver</Button>
        </div>
      )}

      {data && data.operations.review > 0 && (
        <Link
          href="/cards/operations?status=review"
          className="group flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 transition-colors hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-500/10"
        >
          <TriangleAlert className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-amber-900 dark:text-amber-300">
              {data.operations.review} opération{data.operations.review > 1 ? "s" : ""} à trancher
            </p>
            <p className="text-amber-800/80 dark:text-amber-300/80">
              Le rapprochement automatique n'a pas pu décider. Vérifiez sur le dashboard Maplerad avant de clôturer.
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-amber-700 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}

      {loading && !data ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label="Cartes vivantes" value={data.cards.alive} hint={`${data.cards.partners} partenaire(s) · ${data.cards.total} au total`} icon={CreditCard} />
            <Kpi label="Solde total sur cartes" value={usd(data.cards.total_balance_usd)} hint="Dernier solde lu chez Maplerad" icon={Wallet} />
            <Kpi
              label="Opérations ouvertes"
              value={data.operations.open}
              hint={`${usd(data.operations.open_amount_usd)} · ${data.operations.unknown} en rapprochement`}
              tone={data.operations.review ? "warning" : "default"}
              icon={Scale}
            />
            <Kpi label="Revenus cartes (mois)" value={usd(data.revenue_month_usd)} hint={`Recharges du jour : ${data.operations.fund_today_count} · ${usd(data.operations.fund_today_usd)}`} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Panel
              title="Trésorerie Maplerad"
              description="Argent détenu chez Maplerad vs dettes envers les partenaires"
              className="lg:col-span-2"
              actions={
                <Button asChild size="sm" variant="outline">
                  <Link href="/cards/treasury">Détail</Link>
                </Button>
              }
            >
              {rec ? (
                <div className="grid gap-4 p-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Wallet USD Maplerad</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums">{usd(rec.provider_balance)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Dû aux partenaires</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums">{usd(rec.partner_liabilities)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Marge de sécurité</p>
                    <p className={`mt-1 text-lg font-semibold tabular-nums ${Number(rec.surplus) < 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {usd(rec.surplus, { sign: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground sm:col-span-3">
                    <StatusPill status={rec.status} /> Contrôle du {dateTime(rec.created_at)}
                    {rec.card_mismatches > 0 && <span>· {rec.card_mismatches} carte(s) avec écart de solde</span>}
                  </div>
                </div>
              ) : (
                <p className="p-4 text-sm text-muted-foreground">Aucun contrôle encore. Lancez-en un depuis l'onglet Trésorerie.</p>
              )}
            </Panel>

            <Panel title="Santé du système">
              <ul className="divide-y text-sm">
                <li className="flex items-center justify-between px-4 py-3">
                  <span className="text-muted-foreground">Kill switch cartes</span>
                  <button onClick={() => setSwitchOpen(true)} className="font-medium hover:underline">
                    {sw?.enabled ? <span className="text-emerald-600">Opérationnel</span> : <span className="text-red-600">Suspendu</span>}
                  </button>
                </li>
                <li className="flex items-center justify-between px-4 py-3">
                  <span className="text-muted-foreground">Gels conformité</span>
                  <Link href="/cards/list?frozen_by=dgs" className="flex items-center gap-1.5 font-medium hover:underline">
                    {data.cards.compliance_frozen > 0 && <ShieldAlert className="h-3.5 w-3.5 text-red-600" />}
                    {data.cards.compliance_frozen}
                  </Link>
                </li>
                <li className="flex items-center justify-between px-4 py-3">
                  <span className="text-muted-foreground">Événements non livrés</span>
                  <Link href="/cards/events?delivered=false" className={`font-medium hover:underline ${data.events_undelivered ? "text-amber-600" : ""}`}>
                    {data.events_undelivered}
                  </Link>
                </li>
                {Object.entries(data.cards.by_status).map(([status, n]) => (
                  <li key={status} className="flex items-center justify-between px-4 py-2.5">
                    <StatusPill status={status} />
                    <span className="tabular-nums">{n}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </>
      ) : null}

      <ConfirmAction
        open={switchOpen}
        onOpenChange={setSwitchOpen}
        title={sw?.enabled ? "Suspendre les cartes" : "Réactiver les cartes"}
        description={
          sw?.enabled
            ? "Bloque immédiatement toutes les créations et recharges, pour tous les partenaires. Retraits et résiliations restent possibles (l'argent peut toujours revenir)."
            : "Les partenaires pourront de nouveau créer et recharger des cartes."
        }
        confirmLabel={sw?.enabled ? "Suspendre" : "Réactiver"}
        destructive={sw?.enabled}
        requireReason={!!sw?.enabled}
        onConfirm={async ({ reason, totp }) => {
          await cardsApi("switch/", { method: "POST", body: { enabled: !sw?.enabled, reason }, totp })
          await load()
        }}
      />
    </CardsShell>
  )
}

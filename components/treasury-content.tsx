"use client"

import { useCallback, useEffect, useState } from "react"
import { CheckCircle2, Landmark, Loader2, Pencil, Play, Plus, Search, ShieldAlert, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { smartFetch } from "@/utils/auth"
import { ConfirmAction, EmptyState, ErrorBanner, Kpi, Panel, StatusPill } from "@/components/cards/cards-ui"
import { ApiError, dateTime } from "@/lib/cards-api"

const BASE = `${process.env.NEXT_PUBLIC_BASE_URL}/api/v2/admin/treasury`

async function call<T = any>(path: string, opts: { method?: string; body?: any; totp?: string } = {}): Promise<T> {
  const headers: Record<string, string> = {}
  if (opts.totp) headers["X-TOTP-Code"] = opts.totp
  const res = await smartFetch(`${BASE}/${path}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  })
  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) {
    const code = typeof data?.error === "string" && data.error.startsWith("totp") ? data.error : data?.code
    const msg = data?.message || (typeof data?.error === "string" ? data.error : null) || data?.detail || `Erreur ${res.status}`
    throw new ApiError(msg, res.status, code, data)
  }
  return data as T
}

const num = (v: string | number | null | undefined, cur = "") => {
  if (v === null || v === undefined || v === "") return "—"
  const n = Number(v)
  return `${n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}${cur ? ` ${cur}` : ""}`
}

interface TreasuryLine {
  currency: string
  status: string
  providers: { provider: string; account: string; balance: string }[]
  holdings: { name: string; balance: string; updated_at: string }[]
  assets: string
  partner_liabilities: string
  dgs_commissions_unwithdrawn: string
  payouts_in_flight: string
  gap: string
  tolerance: string
  incomplete: boolean
}

interface Run {
  uid: string
  kind: "treasury" | "partners"
  status: string
  summary: any
  details: any[]
  created_at: string
}

interface Holding {
  uid: string
  name: string
  currency: string
  balance: string
  note: string
  is_active: boolean
  updated_at: string
}

interface WalletAudit {
  customer_id: string
  currency: string
  status: string
  wallet_balance: string
  computed_balance: string
  difference: string
  opening_balance: string
  entries: number
  credits: string
  debits: string
  chain_breaks: any[]
  sign_errors: number
  anomalies: { code: string; label: string; severity: string; count: number; samples: any[] }[]
  activity?: Record<string, any>
}

export function TreasuryContent() {
  const [data, setData] = useState<{ treasury: Run | null; partners: Run | null; holdings: Holding[] } | null>(null)
  const [error, setError] = useState("")
  const [running, setRunning] = useState<"" | "treasury" | "partners">("")

  const load = useCallback(async () => {
    setError("")
    try {
      setData(await call("overview/"))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chargement impossible")
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const run = async (kind: "treasury" | "partners") => {
    setRunning(kind)
    setError("")
    try {
      await call("run/", { method: "POST", body: { kind } })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Point de solde impossible")
    } finally {
      setRunning("")
    }
  }

  const t = data?.treasury
  const p = data?.partners

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Finance</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Point de solde</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Argent réellement détenu (PAL, Wave, Maplerad, banques) = ce qui est dû aux partenaires + vos commissions non retirées.
            Chaque wallet partenaire est recalculé depuis son historique complet.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => run("partners")} disabled={!!running}>
            {running === "partners" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            Vérifier les partenaires
          </Button>
          <Button size="sm" onClick={() => run("treasury")} disabled={!!running}>
            {running === "treasury" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            Point trésorerie
          </Button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      {!data ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi
              label="Trésorerie"
              value={t ? <StatusPill status={t.status} /> : "—"}
              hint={t ? `${dateTime(t.created_at)} · ${t.summary?.currencies ?? 0} devise(s)` : "Jamais lancé"}
              tone={t?.status === "alert" ? "danger" : t?.status === "warning" || t?.status === "error" ? "warning" : "default"}
              icon={Landmark}
            />
            <Kpi
              label="Wallets vérifiés"
              value={p ? `${p.summary?.ok ?? 0} / ${p.summary?.wallets ?? 0}` : "—"}
              hint={p ? dateTime(p.created_at) : "Jamais lancé"}
              icon={CheckCircle2}
            />
            <Kpi
              label="Wallets en alerte"
              value={p?.summary?.alert ?? 0}
              hint={`${p?.summary?.warning ?? 0} à surveiller`}
              tone={p?.summary?.alert ? "danger" : p?.summary?.warning ? "warning" : "default"}
              icon={ShieldAlert}
            />
            <Kpi label="Avoirs hors fournisseurs" value={data.holdings.filter((h) => h.is_active).length} hint="Banques, caisse… (saisie manuelle)" />
          </div>

          <Tabs defaultValue="treasury">
            <TabsList>
              <TabsTrigger value="treasury">Trésorerie</TabsTrigger>
              <TabsTrigger value="partners">Partenaires</TabsTrigger>
              <TabsTrigger value="statement">Relevé d’un partenaire</TabsTrigger>
              <TabsTrigger value="holdings">Avoirs</TabsTrigger>
            </TabsList>
            <TabsContent value="treasury">
              <TreasuryTab run={t ?? null} />
            </TabsContent>
            <TabsContent value="partners">
              <PartnersTab run={p ?? null} />
            </TabsContent>
            <TabsContent value="statement">
              <StatementTab />
            </TabsContent>
            <TabsContent value="holdings">
              <HoldingsTab holdings={data.holdings} onChange={load} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

function TreasuryTab({ run }: { run: Run | null }) {
  if (!run) return <Panel><EmptyState title="Aucun point de trésorerie" hint="Lancez « Point trésorerie »." /></Panel>
  const lines = run.details as TreasuryLine[]
  const errors = (run.summary?.provider_errors || []) as { provider: string; error: string }[]
  return (
    <div className="space-y-4">
      {errors.length > 0 && (
        <ErrorBanner
          message={`Solde illisible chez : ${errors.map((e) => `${e.provider} (${e.error})`).join(", ")}. Le point est incomplet : un écart négatif n'est pas forcément une perte.`}
        />
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {lines.map((l) => {
          const gap = Number(l.gap)
          return (
            <Panel
              key={l.currency}
              title={l.currency}
              description={`Tolérance ${num(l.tolerance, l.currency)}`}
              actions={<StatusPill status={l.status} />}
            >
              <div className="space-y-3 p-4 text-sm">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actif</p>
                  {l.providers.map((pr, i) => (
                    <Row key={`${pr.provider}-${i}`} k={`${pr.provider}${pr.account ? ` · ${pr.account}` : ""}`} v={num(pr.balance)} />
                  ))}
                  {l.holdings.map((h) => (
                    <Row key={h.name} k={`${h.name} (manuel, ${dateTime(h.updated_at)})`} v={num(h.balance)} />
                  ))}
                  {l.providers.length + l.holdings.length === 0 && <p className="text-xs text-muted-foreground">Aucun avoir connu dans cette devise.</p>}
                  <Row k="Total actif" v={num(l.assets, l.currency)} strong />
                </div>
                <div className="border-t pt-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Passif</p>
                  <Row k="Dû aux partenaires (wallets)" v={num(l.partner_liabilities)} />
                  <Row k="Commissions DGS non retirées" v={num(l.dgs_commissions_unwithdrawn)} />
                </div>
                <div className={`flex items-center justify-between rounded-lg p-3 ${gap < 0 ? "bg-red-50 dark:bg-red-500/10" : "bg-muted"}`}>
                  <span className="font-medium">{gap < 0 ? "Il manque" : "Excédent non expliqué"}</span>
                  <span className={`text-lg font-semibold tabular-nums ${gap < 0 ? "text-red-600" : ""}`}>{num(l.gap, l.currency)}</span>
                </div>
                {Number(l.payouts_in_flight) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Retraits en cours : {num(l.payouts_in_flight, l.currency)} (déjà débités des partenaires, peut-être pas encore sortis du fournisseur).
                  </p>
                )}
              </div>
            </Panel>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">Point du {dateTime(run.created_at)} · automatique toutes les 3 h.</p>
    </div>
  )
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3 py-0.5">
      <span className={strong ? "font-medium" : "text-muted-foreground"}>{k}</span>
      <span className={`tabular-nums ${strong ? "font-semibold" : ""}`}>{v}</span>
    </div>
  )
}

function PartnersTab({ run }: { run: Run | null }) {
  if (!run) return <Panel><EmptyState title="Aucune vérification" hint="Lancez « Vérifier les partenaires »." /></Panel>
  const wallets = (run.details || []).filter((d: any) => d.customer_id) as WalletAudit[]
  const legacy = (run.details || []).find((d: any) => d.legacy_mismatch)?.legacy_mismatch || []
  return (
    <div className="space-y-4">
      <Panel
        title="Wallets à examiner"
        description={`${run.summary?.wallets ?? 0} wallet(s) vérifié(s) le ${dateTime(run.created_at)} — seuls ceux qui posent problème sont listés.`}
      >
        {wallets.length === 0 ? (
          <EmptyState title="Tous les soldes sont justes" hint="Chaque wallet correspond exactement à son historique." />
        ) : (
          <ul className="divide-y">
            {wallets.map((w) => <WalletRow key={`${w.customer_id}-${w.currency}`} w={w} />)}
          </ul>
        )}
      </Panel>
      {legacy.length > 0 && (
        <Panel title="Compte historique XOF désynchronisé" description="CustomerAccount.balance ≠ wallet XOF">
          <ul className="divide-y text-sm">
            {legacy.map((l: any) => (
              <li key={l.customer_id} className="flex justify-between px-4 py-2">
                <span className="font-mono text-xs">{l.customer_id}</span>
                <span className="tabular-nums">{num(l.account_balance)} ≠ {num(l.xof_wallet)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  )
}

function WalletRow({ w }: { w: WalletAudit }) {
  const [open, setOpen] = useState(false)
  const diff = Number(w.difference)
  return (
    <li>
      <button onClick={() => setOpen(!open)} className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left hover:bg-muted/50">
        <StatusPill status={w.status} />
        <span className="font-mono text-xs">{w.customer_id}</span>
        <span className="text-xs text-muted-foreground">{w.currency}</span>
        <span className="ml-auto text-sm tabular-nums">
          enregistré {num(w.wallet_balance)} · recalculé {num(w.computed_balance)}
          {Math.abs(diff) > 0.009 && <strong className="ml-2 text-red-600">écart {num(w.difference)}</strong>}
        </span>
      </button>
      {open && <WalletDetail w={w} />}
    </li>
  )
}

function WalletDetail({ w }: { w: WalletAudit }) {
  return (
    <div className="space-y-3 bg-muted/30 px-4 py-3 text-xs">
      <div className="grid gap-2 sm:grid-cols-4">
        <Row k="Ouverture" v={num(w.opening_balance)} />
        <Row k="Crédits" v={num(w.credits)} />
        <Row k="Débits" v={num(w.debits)} />
        <Row k="Écritures" v={String(w.entries)} />
      </div>
      {w.activity && (
        <div className="grid gap-x-6 gap-y-1 rounded-lg border bg-card p-3 sm:grid-cols-2">
          <Row k={`Dépôts réussis (${w.activity.payins_success.count})`} v={num(w.activity.payins_success.amount)} />
          <Row k="dont commissions" v={num(w.activity.payins_success.fees)} />
          <Row k="Crédité au partenaire" v={num(w.activity.credited_payins)} />
          <Row k={`Retraits réussis (${w.activity.payouts_success.count})`} v={num(w.activity.payouts_success.amount)} />
          <Row k="Débité pour retraits" v={num(w.activity.debited_payouts)} />
          <Row k="Retraits remboursés" v={num(w.activity.refunded_payouts)} />
          <Row k="Crédits manuels / ajustements" v={num(w.activity.manual_credits)} />
          <Row k="Débits manuels / ajustements" v={num(w.activity.manual_debits)} />
          <Row k="Frais cartes" v={num(w.activity.card_fees)} />
          <Row k="Total frais payés" v={num(w.activity.fees_paid)} />
        </div>
      )}
      {(w.sign_errors > 0 || w.chain_breaks.length > 0) && (
        <div className="rounded-lg border border-red-300 p-3 dark:border-red-500/40">
          <p className="font-semibold text-red-700 dark:text-red-400">
            Ledger incohérent : {w.chain_breaks.length} rupture(s) de chaîne, {w.sign_errors} écriture(s) au sens incorrect
          </p>
          {w.chain_breaks.map((b, i) => (
            <p key={i} className="font-mono">
              {dateTime(b.at)} · {b.type} · attendu {num(b.expected_before)} → trouvé {num(b.actual_before)} (écart {num(b.gap)})
            </p>
          ))}
        </div>
      )}
      {w.anomalies.map((a) => (
        <div key={a.code} className={`rounded-lg border p-3 ${a.severity === "critical" ? "border-red-300 dark:border-red-500/40" : "border-amber-300 dark:border-amber-500/40"}`}>
          <p className="font-semibold">
            {a.label} — {a.count}
          </p>
          {a.samples.map((s: any) => (
            <p key={s.reference} className="font-mono">
              {s.reference} · {num(s.amount)} · {s.status} · {dateTime(s.created_at)}
            </p>
          ))}
        </div>
      ))}
    </div>
  )
}

function StatementTab() {
  const [customerId, setCustomerId] = useState("")
  const [data, setData] = useState<{ customer_id: string; verified: boolean; wallets: WalletAudit[]; legacy_mismatch: any } | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const search = async () => {
    if (!customerId.trim()) return
    setLoading(true)
    setError("")
    try {
      setData(await call(`partners/${encodeURIComponent(customerId.trim())}/`))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Panel title="Relevé vérifié d’un partenaire" description="Calcul en direct : chaque dépôt, commission, retrait, remboursement et ajustement est recompté.">
      <div className="flex gap-2 border-b p-3">
        <Input value={customerId} onChange={(e) => setCustomerId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} placeholder="ID partenaire (customer_id)" />
        <Button onClick={search} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>
      {error && <div className="p-3"><ErrorBanner message={error} /></div>}
      {data && (
        <div className="space-y-3 p-3">
          <div className={`rounded-lg p-3 text-sm font-medium ${data.verified ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-300"}`}>
            {data.verified ? "Soldes vérifiés : tout correspond à l’historique." : "Au moins un wallet ne correspond pas à son historique — voir le détail."}
          </div>
          {data.legacy_mismatch && (
            <ErrorBanner message={`Compte historique ${num(data.legacy_mismatch.account_balance)} ≠ wallet XOF ${num(data.legacy_mismatch.xof_wallet)}`} />
          )}
          {data.wallets.length === 0 ? (
            <EmptyState title="Aucun wallet" />
          ) : (
            <ul className="divide-y rounded-lg border">
              {data.wallets.map((w) => (
                <li key={w.currency}>
                  <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <StatusPill status={w.status} />
                    <span className="font-medium">{w.currency}</span>
                    <span className="ml-auto text-sm tabular-nums">
                      {num(w.wallet_balance)} enregistré · {num(w.computed_balance)} recalculé
                    </span>
                  </div>
                  <WalletDetail w={w} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Panel>
  )
}

function HoldingsTab({ holdings, onChange }: { holdings: Holding[]; onChange: () => Promise<void> }) {
  const [editing, setEditing] = useState<Partial<Holding> | null>(null)
  const [deleting, setDeleting] = useState<Holding | null>(null)
  return (
    <Panel
      title="Avoirs hors fournisseurs"
      description="Argent détenu ailleurs que chez PAL / Wave / Maplerad (comptes bancaires, caisse). Mettez-le à jour à chaque relevé bancaire : il entre dans le calcul de la trésorerie."
      actions={
        <Button size="sm" onClick={() => setEditing({ name: "", currency: "XOF", balance: "0", note: "", is_active: true })}>
          <Plus className="mr-2 h-4 w-4" />Ajouter
        </Button>
      }
    >
      {holdings.length === 0 ? (
        <EmptyState title="Aucun avoir" hint="Ajoutez vos comptes bancaires pour un point de trésorerie complet." />
      ) : (
        <ul className="divide-y">
          {holdings.map((h) => (
            <li key={h.uid} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{h.name} {!h.is_active && <span className="text-xs text-muted-foreground">(ignoré)</span>}</p>
                <p className="text-xs text-muted-foreground">{h.note || "—"} · mis à jour {dateTime(h.updated_at)}</p>
              </div>
              <span className="text-sm font-semibold tabular-nums">{num(h.balance, h.currency)}</span>
              <Button size="icon" variant="ghost" onClick={() => setEditing(h)}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => setDeleting(h)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
            </li>
          ))}
        </ul>
      )}
      {editing && <HoldingDialog holding={editing} onClose={() => setEditing(null)} onSaved={async () => { setEditing(null); await onChange() }} />}
      <ConfirmAction
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Supprimer cet avoir"
        description={deleting ? `${deleting.name} (${num(deleting.balance, deleting.currency)}) ne sera plus compté dans la trésorerie.` : ""}
        confirmLabel="Supprimer"
        destructive
        requireReason={false}
        onConfirm={async ({ totp }) => {
          await call(`holdings/${deleting!.uid}/`, { method: "DELETE", totp })
          await onChange()
        }}
      />
    </Panel>
  )
}

function HoldingDialog({ holding, onClose, onSaved }: { holding: Partial<Holding>; onClose: () => void; onSaved: () => Promise<void> }) {
  const [form, setForm] = useState(holding)
  const [totp, setTotp] = useState("")
  const [needTotp, setNeedTotp] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const save = async () => {
    setBusy(true)
    setError("")
    const body = { name: form.name, currency: form.currency, balance: form.balance, note: form.note || "", is_active: form.is_active }
    try {
      if (holding.uid) await call(`holdings/${holding.uid}/`, { method: "PATCH", body, totp })
      else await call("holdings/", { method: "POST", body, totp })
      await onSaved()
    } catch (e) {
      if (e instanceof ApiError && e.needsTotp) {
        setNeedTotp(true)
        setError("Saisissez votre code 2FA.")
      } else {
        setError(e instanceof Error ? e.message : "Enregistrement impossible")
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{holding.uid ? "Modifier l’avoir" : "Nouvel avoir"}</DialogTitle>
          <DialogDescription>Le solde saisi est pris tel quel dans le point de trésorerie. Chaque modification est auditée.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1"><Label>Nom</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Banque UBA — compte XOF" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Devise</Label><Input value={form.currency || ""} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} /></div>
            <div className="space-y-1"><Label>Solde</Label><Input inputMode="decimal" value={form.balance || ""} onChange={(e) => setForm({ ...form, balance: e.target.value })} /></div>
          </div>
          <div className="space-y-1"><Label>Note</Label><Input value={form.note || ""} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Relevé du 18/11" /></div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Compter dans la trésorerie
          </label>
          {needTotp && (
            <div className="space-y-1"><Label>Code 2FA</Label><Input maxLength={6} inputMode="numeric" value={totp} onChange={(e) => setTotp(e.target.value.replace(/\D/g, ""))} className="font-mono tracking-[0.4em]" /></div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={busy}>Annuler</Button>
          <Button onClick={save} disabled={busy}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

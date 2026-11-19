"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, Copy, KeyRound, Loader2, Pencil, Plus, ShieldCheck, ShieldOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ApiError, cardsApi, dateTime, usd, type Program } from "@/lib/cards-api"
import { CardsShell, ConfirmAction, EmptyState, ErrorBanner, Panel } from "./cards-ui"
import { CardFxRatesPanel } from "./fx-rates-panel"

const DEFAULTS: Partial<Program> = {
  enabled: false,
  creation_fee: "0",
  creation_prefund: "2.00",
  contactless: false,
  fund_fee_percent: "0",
  fund_fee_fixed: "0",
  withdraw_fee_percent: "0",
  withdraw_fee_fixed: "0",
  monthly_fee: "0",
  pass_through_provider_charges: true,
  max_cards_per_end_user: 3,
  max_active_cards: 1000,
  min_fund_amount: "1",
  max_fund_amount: "2500",
  daily_fund_limit_per_card: "5000",
  max_card_balance: "10000",
  auto_freeze_after_declines: 5,
}

const FEE_FIELDS: [keyof Program, string, string][] = [
  ["creation_fee", "Prix création — VISA", "USD"],
  ["creation_fee_mastercard", "Prix création — Mastercard (vide = VISA)", "USD"],
  ["creation_prefund", "Solde chargé à la création (min. 0,01)", "USD"],
  ["fund_fee_percent", "Recharge — %", "%"],
  ["fund_fee_fixed", "Recharge — fixe", "USD"],
  ["withdraw_fee_percent", "Retrait — %", "%"],
  ["withdraw_fee_fixed", "Retrait — fixe", "USD"],
  ["monthly_fee", "Frais mensuel / carte", "USD"],
]
const LIMIT_FIELDS: [keyof Program, string, string][] = [
  ["max_cards_per_end_user", "Cartes max / utilisateur", ""],
  ["max_active_cards", "Cartes actives max (programme)", ""],
  ["min_fund_amount", "Recharge minimum", "USD"],
  ["max_fund_amount", "Recharge maximum", "USD"],
  ["daily_fund_limit_per_card", "Plafond recharge / jour / carte", "USD"],
  ["max_card_balance", "Solde maximum d'une carte", "USD"],
  ["auto_freeze_after_declines", "Gel auto après N refus / 24 h (0 = off)", ""],
]

export function CardProgramsContent() {
  const [programs, setPrograms] = useState<Program[] | null>(null)
  const [error, setError] = useState("")
  const [editing, setEditing] = useState<{ program: Partial<Program>; isNew: boolean } | null>(null)
  const [rotating, setRotating] = useState<string | null>(null)
  const [secret, setSecret] = useState<{ customer_id: string; value: string } | null>(null)

  const load = useCallback(async () => {
    setError("")
    try {
      const data = await cardsApi<{ results: Program[] }>("programs/")
      setPrograms(data.results)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chargement impossible")
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <CardsShell
      title="Programmes partenaires"
      description="Chaque partenaire (Qora…) a son programme : activation, frais refacturés en USD sur son wallet, et limites anti-perte."
      actions={
        <Button size="sm" onClick={() => setEditing({ program: { ...DEFAULTS, customer_id: "" }, isNew: true })}>
          <Plus className="mr-2 h-4 w-4" />Nouveau programme
        </Button>
      }
    >
      {error && <ErrorBanner message={error} onRetry={load} />}
      {!programs ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : programs.length === 0 ? (
        <Panel><EmptyState title="Aucun programme" hint="Créez un programme pour autoriser un partenaire à émettre des cartes." /></Panel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {programs.map((p) => (
            <Panel
              key={p.customer_id}
              title={p.customer_id}
              description={`${p.cards_alive} carte(s) vivante(s) · ${usd(p.cards_balance_usd)} sur cartes · modifié ${dateTime(p.updated_at)}`}
              actions={
                <>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${p.enabled ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                    {p.enabled ? "Actif" : "Désactivé"}
                  </span>
                  <Button size="sm" variant="outline" className="h-7" onClick={() => setEditing({ program: p, isNew: false })}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />Modifier
                  </Button>
                </>
              }
            >
              <div className="grid gap-4 p-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Frais</p>
                  <dl className="space-y-1.5 text-sm">
                    <Row k="Création VISA" v={usd(p.creation_fee)} />
                    <Row k="Création Mastercard" v={usd(p.creation_fee_mastercard ?? p.creation_fee)} />
                    <Row k="Préfinancement carte" v={usd(p.creation_prefund)} />
                    <Row k="Sans contact" v={p.contactless ? "Oui (Apple/Google Pay)" : "Non"} />
                    <Row k="Recharge" v={`${Number(p.fund_fee_percent)} % + ${usd(p.fund_fee_fixed)}`} />
                    <Row k="Retrait" v={`${Number(p.withdraw_fee_percent)} % + ${usd(p.withdraw_fee_fixed)}`} />
                    <Row k="Mensuel" v={usd(p.monthly_fee)} />
                    <Row k="Frais Maplerad" v={p.pass_through_provider_charges ? "Refacturés" : "Absorbés par DGS"} />
                  </dl>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Limites</p>
                  <dl className="space-y-1.5 text-sm">
                    <Row k="Cartes / utilisateur" v={String(p.max_cards_per_end_user)} />
                    <Row k="Recharge" v={`${usd(p.min_fund_amount)} → ${usd(p.max_fund_amount)}`} />
                    <Row k="Par jour / carte" v={usd(p.daily_fund_limit_per_card)} />
                    <Row k="Solde max" v={usd(p.max_card_balance)} />
                    <Row k="Gel auto" v={p.auto_freeze_after_declines ? `${p.auto_freeze_after_declines} refus / 24 h` : "Désactivé"} />
                  </dl>
                </div>
              </div>
              <div className="flex flex-col gap-2 border-t px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-1.5">
                  {p.webhook_signing_enabled ? (
                    <><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Événements signés (HMAC)</>
                  ) : (
                    <><ShieldOff className="h-3.5 w-3.5 text-amber-600" /> <span className="text-amber-700 dark:text-amber-400">Événements NON signés — générez un secret</span></>
                  )}
                  <span className="truncate text-muted-foreground">· {p.webhook_url || "URL de callback non configurée"}</span>
                </span>
                <Button size="sm" variant="ghost" className="h-7" onClick={() => setRotating(p.customer_id)}>
                  <KeyRound className="mr-1.5 h-3.5 w-3.5" />{p.webhook_signing_enabled ? "Régénérer le secret" : "Générer le secret"}
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {editing && (
        <ProgramDialog
          initial={editing.program}
          isNew={editing.isNew}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null)
            await load()
          }}
        />
      )}

      <CardFxRatesPanel />

      <ConfirmAction
        open={!!rotating}
        onOpenChange={(v) => !v && setRotating(null)}
        title="Générer un secret de signature"
        description="L'ancien secret cesse immédiatement de fonctionner : le partenaire doit mettre à jour sa configuration (ex. Qora : AGGREGATOR_DGS_WEBHOOK_SECRET) sans délai, sinon ses webhooks seront rejetés."
        confirmLabel="Générer"
        requireReason={false}
        onConfirm={async ({ totp }) => {
          const res = await cardsApi<{ customer_id: string; webhook_signing_secret: string }>(`programs/${rotating}/webhook-secret/`, { method: "POST", totp })
          setSecret({ customer_id: res.customer_id, value: res.webhook_signing_secret })
          await load()
        }}
      />

      <SecretDialog secret={secret} onClose={() => setSecret(null)} />
    </CardsShell>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right font-medium tabular-nums">{v}</dd>
    </div>
  )
}

function SecretDialog({ secret, onClose }: { secret: { customer_id: string; value: string } | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  return (
    <Dialog open={!!secret} onOpenChange={(v) => { if (!v) { setCopied(false); onClose() } }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Secret de signature — {secret?.customer_id}</DialogTitle>
          <DialogDescription>Affiché une seule fois. Copiez-le maintenant dans la configuration du partenaire.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-lg border bg-muted p-3">
          <code className="flex-1 break-all text-xs">{secret?.value}</code>
          <Button
            size="icon"
            variant="ghost"
            onClick={async () => {
              await navigator.clipboard.writeText(secret?.value || "")
              setCopied(true)
            }}
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>J'ai copié le secret</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ProgramDialog({
  initial,
  isNew,
  onClose,
  onSaved,
}: {
  initial: Partial<Program>
  isNew: boolean
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const [form, setForm] = useState<Partial<Program>>(initial)
  const [totp, setTotp] = useState("")
  const [needTotp, setNeedTotp] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const set = (key: keyof Program, value: any) => setForm((f) => ({ ...f, [key]: value }))

  const save = async () => {
    setBusy(true)
    setError("")
    const body: Record<string, any> = {}
    ;[...FEE_FIELDS, ...LIMIT_FIELDS].forEach(([k]) => (body[k] = form[k]))
    // Mastercard vide = même prix que VISA (null côté API).
    body.creation_fee_mastercard = form.creation_fee_mastercard === "" || form.creation_fee_mastercard == null ? null : form.creation_fee_mastercard
    body.enabled = form.enabled
    body.pass_through_provider_charges = form.pass_through_provider_charges
    body.contactless = !!form.contactless
    try {
      if (isNew) {
        await cardsApi("programs/", { method: "POST", body: { ...body, customer_id: form.customer_id }, totp })
      } else {
        await cardsApi(`programs/${initial.customer_id}/`, { method: "PATCH", body, totp })
      }
      await onSaved()
    } catch (e) {
      if (e instanceof ApiError && e.needsTotp) {
        setNeedTotp(true)
        setError("Saisissez votre code 2FA pour enregistrer.")
      } else {
        setError(e instanceof Error ? e.message : "Enregistrement impossible")
      }
    } finally {
      setBusy(false)
    }
  }

  const field = ([key, label, unit]: [keyof Program, string, string]) => (
    <div key={key} className="space-y-1">
      <Label htmlFor={key} className="text-xs">{label}</Label>
      <div className="relative">
        <Input id={key} inputMode="decimal" value={String(form[key] ?? "")} onChange={(e) => set(key, e.target.value)} className="pr-12 tabular-nums" />
        {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  )

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isNew ? "Nouveau programme carte" : `Programme — ${initial.customer_id}`}</DialogTitle>
          <DialogDescription>Montants en USD, débités du wallet USD du partenaire. Les modifications sont tracées dans l'audit.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          {isNew && (
            <div className="space-y-1">
              <Label htmlFor="customer_id">ID partenaire (customer_id DGS)</Label>
              <Input id="customer_id" value={form.customer_id || ""} onChange={(e) => set("customer_id", e.target.value.trim())} />
            </div>
          )}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Programme actif</p>
              <p className="text-xs text-muted-foreground">Désactivé : plus aucune création ni recharge (retraits toujours possibles).</p>
            </div>
            <Switch checked={!!form.enabled} onCheckedChange={(v) => set("enabled", v)} />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Frais facturés au partenaire</p>
            <div className="grid gap-3 sm:grid-cols-3">{FEE_FIELDS.map(field)}</div>
            <div className="mt-3 flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Refacturer les frais Maplerad</p>
                <p className="text-xs text-muted-foreground">Frais de refus / frais carte prélevés sur le wallet DGS.</p>
              </div>
              <Switch checked={!!form.pass_through_provider_charges} onCheckedChange={(v) => set("pass_through_provider_charges", v)} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Cartes sans contact (Apple Pay / Google Pay)</p>
              <p className="text-xs text-muted-foreground">Le code d’activation est transmis au partenaire par événement signé.</p>
            </div>
            <Switch checked={!!form.contactless} onCheckedChange={(v) => set("contactless", v)} />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Limites anti-perte</p>
            <div className="grid gap-3 sm:grid-cols-2">{LIMIT_FIELDS.map(field)}</div>
          </div>
          {needTotp && (
            <div className="space-y-1">
              <Label htmlFor="program-totp">Code 2FA</Label>
              <Input id="program-totp" maxLength={6} inputMode="numeric" value={totp} onChange={(e) => setTotp(e.target.value.replace(/\D/g, ""))} className="font-mono tracking-[0.4em] sm:w-40" />
            </div>
          )}
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={busy}>Annuler</Button>
          <Button onClick={save} disabled={busy}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

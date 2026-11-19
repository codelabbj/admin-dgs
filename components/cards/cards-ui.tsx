"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AlertTriangle, Loader2, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { ApiError } from "@/lib/cards-api"

// ── Statuts ─────────────────────────────────────────────────────────────────

const TONE = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30",
  red: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/30",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/30",
  gray: "bg-muted text-muted-foreground ring-border",
} as const

const STATUS: Record<string, [string, keyof typeof TONE]> = {
  ACTIVE: ["Active", "green"],
  DISABLED: ["Gelée", "blue"],
  PENDING: ["En création", "amber"],
  FAILED: ["Échec", "red"],
  TERMINATED: ["Résiliée", "gray"],
  success: ["Réussie", "green"],
  failed: ["Échouée", "red"],
  pending: ["En cours", "amber"],
  unknown: ["Résultat inconnu", "violet"],
  review: ["À vérifier", "red"],
  ok: ["Équilibré", "green"],
  warning: ["Écart toléré", "amber"],
  alert: ["Déficit", "red"],
  error: ["Erreur", "gray"],
}

export function StatusPill({ status, className }: { status: string; className?: string }) {
  const [label, tone] = STATUS[status] || [status || "—", "gray"]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        TONE[tone],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  )
}

export function ComplianceBadge({ frozenBy }: { frozenBy: string }) {
  if (frozenBy !== "dgs") return null
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white">
      <ShieldAlert className="h-3 w-3" /> Conformité
    </span>
  )
}

// ── Mise en page ────────────────────────────────────────────────────────────

const TABS = [
  { href: "/cards", label: "Vue d'ensemble" },
  { href: "/cards/list", label: "Cartes" },
  { href: "/cards/operations", label: "Opérations" },
  { href: "/cards/programs", label: "Programmes" },
  { href: "/cards/treasury", label: "Trésorerie" },
  { href: "/cards/events", label: "Événements" },
  { href: "/cards/disputes", label: "Contestations" },
]

export function CardsShell({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const active = (href: string) => (href === "/cards" ? pathname === "/cards" : pathname?.startsWith(href))
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cartes virtuelles</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
      <nav className="-mx-1 flex gap-1 overflow-x-auto border-b px-1">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors",
              active(tab.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            {active(tab.href) && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  )
}

export function Kpi({
  label,
  value,
  hint,
  tone = "default",
  icon: Icon,
}: {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  tone?: "default" | "danger" | "warning" | "success"
  icon?: React.ElementType
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 shadow-sm",
        tone === "danger" && "border-red-300 bg-red-50/60 dark:border-red-500/40 dark:bg-red-500/5",
        tone === "warning" && "border-amber-300 bg-amber-50/60 dark:border-amber-500/40 dark:bg-amber-500/5",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("rounded-xl border bg-card shadow-sm", className)}>
      {(title || actions) && (
        <header className="flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-semibold">{title}</h2>}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  )
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <p className="text-sm font-medium">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1">{message}</p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="h-7">
          Réessayer
        </Button>
      )}
    </div>
  )
}

export function Mono({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("font-mono text-xs text-muted-foreground", className)}>{children}</span>
}

export function Pager({
  page,
  pageSize,
  count,
  onPage,
}: {
  page: number
  pageSize: number
  count: number
  onPage: (p: number) => void
}) {
  const pages = Math.max(Math.ceil(count / pageSize), 1)
  return (
    <div className="flex items-center justify-between gap-2 border-t px-4 py-3 text-xs text-muted-foreground">
      <span>
        {count} résultat{count > 1 ? "s" : ""} · page {page}/{pages}
      </span>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="h-7" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Précédent
        </Button>
        <Button size="sm" variant="outline" className="h-7" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          Suivant
        </Button>
      </div>
    </div>
  )
}

// ── Confirmation d'action sensible (motif + 2FA) ────────────────────────────

export function ConfirmAction({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  destructive,
  requireReason = true,
  reasonLabel = "Motif (obligatoire, tracé dans l'audit)",
  children,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  description?: React.ReactNode
  confirmLabel: string
  destructive?: boolean
  requireReason?: boolean
  reasonLabel?: string
  children?: React.ReactNode
  onConfirm: (args: { reason: string; totp: string }) => Promise<void>
}) {
  const [reason, setReason] = useState("")
  const [totp, setTotp] = useState("")
  const [showTotp, setShowTotp] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const reset = () => {
    setReason("")
    setTotp("")
    setShowTotp(false)
    setError("")
  }

  const submit = async () => {
    if (requireReason && reason.trim().length < 5) {
      setError("Le motif doit contenir au moins 5 caractères.")
      return
    }
    setBusy(true)
    setError("")
    try {
      await onConfirm({ reason: reason.trim(), totp: totp.trim() })
      reset()
      onOpenChange(false)
    } catch (e) {
      if (e instanceof ApiError && e.needsTotp) {
        setShowTotp(true)
        setError(totp ? "Code 2FA invalide." : "Saisissez votre code 2FA pour confirmer.")
      } else {
        setError(e instanceof Error ? e.message : "Action impossible.")
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset()
        onOpenChange(v)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription asChild><div className="text-sm text-muted-foreground">{description}</div></DialogDescription>}
        </DialogHeader>
        <div className="space-y-4">
          {children}
          {requireReason && (
            <div className="space-y-1.5">
              <Label htmlFor="confirm-reason">{reasonLabel}</Label>
              <Textarea id="confirm-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
          )}
          {showTotp && (
            <div className="space-y-1.5">
              <Label htmlFor="confirm-totp">Code 2FA</Label>
              <Input
                id="confirm-totp"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={totp}
                onChange={(e) => setTotp(e.target.value.replace(/\D/g, ""))}
                className="font-mono tracking-[0.4em]"
              />
            </div>
          )}
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Annuler
          </Button>
          <Button variant={destructive ? "destructive" : "default"} onClick={submit} disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

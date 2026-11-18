"use client"

import type React from "react"
import { Fragment, useCallback, useEffect, useState } from "react"
import { Globe, KeyRound, Laptop, Loader2, LogIn, MapPin, RefreshCw, Search, ShieldAlert, Smartphone, Tablet, Terminal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { smartFetch } from "@/utils/auth"
import { EmptyState, ErrorBanner, Kpi, Pager, Panel } from "@/components/cards/cards-ui"

const BASE = `${process.env.NEXT_PUBLIC_BASE_URL}/v1/api`

interface AuthEvent {
  id: string
  created_at: string
  event: string
  event_label: string
  success: boolean
  reason: string | null
  user_id: string | null
  email: string | null
  user_name: string | null
  is_staff: boolean | null
  ip_address: string | null
  forwarded_for: string | null
  user_agent: string | null
  browser: string | null
  browser_version: string | null
  os: string | null
  device: string | null
  city: string | null
  region: string | null
  country: string | null
  country_code: string | null
  latitude: string | null
  longitude: string | null
  geo_source: string | null
  token_fingerprint: string | null
  is_new_device: boolean
  is_new_country: boolean
  recent_failures: number
}

interface Stats {
  hours: number
  logins: number
  failed: number
  locked: number
  refresh: number
  refresh_rejected: number
  api_keys: number
  new_countries: number
  new_devices: number
  unique_users: number
  unique_ips: number
  top_countries: { code: string; name: string; count: number }[]
  top_failed_ips: { ip: string; count: number }[]
}

async function get<T>(path: string, query: Record<string, string | number | undefined> = {}): Promise<T> {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== "all") params.append(k, String(v))
  })
  const res = await smartFetch(`${BASE}/${path}${params.toString() ? `?${params}` : ""}`)
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.detail || `Erreur ${res.status}`)
  return data as T
}

const flag = (code?: string | null) =>
  code && /^[A-Z]{2}$/.test(code) ? String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0))) : ""

const when = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" })

function DeviceIcon({ device }: { device: string | null }) {
  const cls = "h-4 w-4 text-muted-foreground"
  if (device === "mobile") return <Smartphone className={cls} />
  if (device === "tablette") return <Tablet className={cls} />
  if (device === "api" || device === "bot") return <Terminal className={cls} />
  return <Laptop className={cls} />
}

function EventPill({ e }: { e: AuthEvent }) {
  const tone = !e.success
    ? "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400"
    : e.event === "login_success"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400"
      : "bg-muted text-muted-foreground ring-border"
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tone}`}>{e.event_label}</span>
}

export function SecurityContent() {
  const [hours, setHours] = useState("24")
  const [stats, setStats] = useState<Stats | null>(null)
  const [data, setData] = useState<{ count: number; results: AuthEvent[]; event_types: Record<string, string> } | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [f, setF] = useState({ email: "", user_id: "", event: "all", success: "all", ip: "", country: "", suspicious: false })

  const set = (patch: Partial<typeof f>) => {
    setF((prev) => ({ ...prev, ...patch }))
    setPage(1)
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [s, list] = await Promise.all([
        get<Stats>("auth-events/stats", { hours }),
        get<{ count: number; results: AuthEvent[]; event_types: Record<string, string> }>("auth-events", {
          page, page_size: 50, email: f.email, user_id: f.user_id, event: f.event, success: f.success,
          ip: f.ip, country: f.country, suspicious: f.suspicious ? "true" : undefined,
        }),
      ])
      setStats(s)
      setData(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chargement impossible")
    } finally {
      setLoading(false)
    }
  }, [hours, page, f])

  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
  }, [load])

  const activeFilters = f.user_id || f.ip || f.country

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sécurité</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Journal de connexions</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Chaque connexion, token généré ou renouvelé, déconnexion, clé API, mot de passe et 2FA — avec IP, navigateur, appareil et localisation.
            Après 5 échecs en 15 min, l’email est bloqué automatiquement.
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={hours} onValueChange={setHours}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="24">24 heures</SelectItem>
              <SelectItem value="168">7 jours</SelectItem>
              <SelectItem value="720">30 jours</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-10" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      {stats && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Connexions réussies" value={stats.logins} hint={`${stats.unique_users} personne(s) · ${stats.unique_ips} IP`} icon={LogIn} />
          <Kpi
            label="Échecs / blocages"
            value={`${stats.failed} / ${stats.locked}`}
            hint="Mot de passe faux, compte bloqué…"
            tone={stats.locked ? "danger" : stats.failed > 20 ? "warning" : "default"}
            icon={ShieldAlert}
          />
          <Kpi
            label="Nouveaux pays / appareils"
            value={`${stats.new_countries} / ${stats.new_devices}`}
            hint="Connexions inhabituelles"
            tone={stats.new_countries ? "warning" : "default"}
            icon={Globe}
          />
          <Kpi
            label="Tokens renouvelés"
            value={stats.refresh}
            hint={`${stats.refresh_rejected} refusé(s) · ${stats.api_keys} clé(s) API générée(s)`}
            tone={stats.refresh_rejected ? "warning" : "default"}
            icon={KeyRound}
          />
        </div>
      )}

      {stats && (stats.top_countries.length > 0 || stats.top_failed_ips.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Pays de connexion">
            <ul className="divide-y text-sm">
              {stats.top_countries.map((c) => (
                <li key={c.code} className="flex cursor-pointer justify-between px-4 py-2 hover:bg-muted/50" onClick={() => set({ country: c.code })}>
                  <span>{flag(c.code)} {c.name || c.code || "Inconnu"}</span>
                  <span className="tabular-nums">{c.count}</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="IP avec le plus d’échecs">
            {stats.top_failed_ips.length === 0 ? (
              <EmptyState title="Aucun échec" />
            ) : (
              <ul className="divide-y text-sm">
                {stats.top_failed_ips.map((r) => (
                  <li key={r.ip} className="flex cursor-pointer justify-between px-4 py-2 hover:bg-muted/50" onClick={() => set({ ip: r.ip })}>
                    <span className="font-mono text-xs">{r.ip}</span>
                    <span className="tabular-nums text-red-600">{r.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}

      <Panel>
        <div className="flex flex-col gap-2 border-b p-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={f.email} onChange={(e) => set({ email: e.target.value })} placeholder="Email" className="pl-9" />
          </div>
          <Input value={f.ip} onChange={(e) => set({ ip: e.target.value })} placeholder="IP" className="lg:w-40" />
          <Input value={f.country} onChange={(e) => set({ country: e.target.value.toUpperCase() })} placeholder="Pays (BJ…)" className="lg:w-28" maxLength={2} />
          <Select value={f.event} onValueChange={(v) => set({ event: v })}>
            <SelectTrigger className="lg:w-52"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les événements</SelectItem>
              {Object.entries(data?.event_types || {}).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={f.success} onValueChange={(v) => set({ success: v })}>
            <SelectTrigger className="lg:w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="true">Réussis</SelectItem>
              <SelectItem value="false">Refusés</SelectItem>
            </SelectContent>
          </Select>
          <Button variant={f.suspicious ? "default" : "outline"} onClick={() => set({ suspicious: !f.suspicious })}>
            <ShieldAlert className="mr-2 h-4 w-4" />Suspects
          </Button>
        </div>
        {activeFilters && (
          <div className="flex flex-wrap gap-2 border-b px-3 py-2 text-xs">
            {f.user_id && <Chip label={`Utilisateur ${f.user_id.slice(0, 8)}…`} onClear={() => set({ user_id: "" })} />}
            {f.ip && <Chip label={`IP ${f.ip}`} onClear={() => set({ ip: "" })} />}
            {f.country && <Chip label={`Pays ${f.country}`} onClear={() => set({ country: "" })} />}
          </div>
        )}

        {!data ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : data.results.length === 0 ? (
          <EmptyState title="Aucun événement" hint="Les connexions apparaîtront ici dès le déploiement." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Personne</TableHead>
                    <TableHead>Événement</TableHead>
                    <TableHead>IP · lieu</TableHead>
                    <TableHead>Appareil</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.results.map((e) => (
                    <Fragment key={e.id}>
                      <TableRow className={`cursor-pointer ${!e.success ? "bg-red-50/40 dark:bg-red-500/5" : ""}`} onClick={() => setOpen(open === e.id ? null : e.id)}>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{when(e.created_at)}</TableCell>
                        <TableCell>
                          <button
                            className="text-left hover:underline"
                            onClick={(ev) => {
                              ev.stopPropagation()
                              if (e.user_id) set({ user_id: e.user_id })
                            }}
                          >
                            <p className="text-sm font-medium">{e.user_name || e.email || "—"}</p>
                            <p className="text-xs text-muted-foreground">
                              {e.email}
                              {e.is_staff ? " · admin" : ""}
                            </p>
                          </button>
                        </TableCell>
                        <TableCell>
                          <EventPill e={e} />
                          {e.reason && <p className="mt-1 text-[11px] text-muted-foreground">{e.reason}</p>}
                          <div className="mt-1 flex flex-wrap gap-1">
                            {e.is_new_country && <Tag tone="red">Nouveau pays</Tag>}
                            {e.is_new_device && <Tag tone="amber">Nouvel appareil</Tag>}
                            {e.recent_failures >= 3 && <Tag tone="red">{e.recent_failures} échecs récents</Tag>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <button
                            className="font-mono text-xs hover:underline"
                            onClick={(ev) => {
                              ev.stopPropagation()
                              if (e.ip_address) set({ ip: e.ip_address })
                            }}
                          >
                            {e.ip_address || "—"}
                          </button>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {flag(e.country_code)} {[e.city, e.country || e.country_code].filter(Boolean).join(", ") || "Lieu inconnu"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DeviceIcon device={e.device} />
                            <div>
                              <p className="text-sm">{e.browser || "—"} {e.browser_version ? e.browser_version.split(".")[0] : ""}</p>
                              <p className="text-xs text-muted-foreground">{e.os || e.device || "—"}</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                      {open === e.id && (
                        <TableRow>
                          <TableCell colSpan={5} className="bg-muted/30">
                            <dl className="grid gap-x-6 gap-y-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
                              <Detail k="User-Agent complet" v={e.user_agent} wide />
                              <Detail k="Chaîne X-Forwarded-For" v={e.forwarded_for} />
                              <Detail k="Région" v={e.region} />
                              <Detail
                                k="Coordonnées"
                                v={e.latitude && e.longitude ? `${e.latitude}, ${e.longitude}` : null}
                                href={e.latitude && e.longitude ? `https://www.openstreetmap.org/?mlat=${e.latitude}&mlon=${e.longitude}#map=11/${e.latitude}/${e.longitude}` : undefined}
                              />
                              <Detail k="Source localisation" v={e.geo_source} />
                              <Detail k="Empreinte du token" v={e.token_fingerprint} />
                              <Detail k="Identifiant utilisateur" v={e.user_id} />
                            </dl>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pager page={page} pageSize={50} count={data.count} onPage={setPage} />
          </>
        )}
      </Panel>
    </div>
  )
}

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
      {label}
      <button onClick={onClear} aria-label="Retirer le filtre"><X className="h-3 w-3" /></button>
    </span>
  )
}

function Tag({ tone, children }: { tone: "red" | "amber"; children: React.ReactNode }) {
  const cls = tone === "red" ? "bg-red-600 text-white" : "bg-amber-500 text-white"
  return <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${cls}`}>{children}</span>
}

function Detail({ k, v, wide, href }: { k: string; v: string | null | undefined; wide?: boolean; href?: string }) {
  return (
    <div className={wide ? "sm:col-span-2 lg:col-span-3" : ""}>
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="break-all font-mono">
        {href ? <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{v}</a> : v || "—"}
      </dd>
    </div>
  )
}

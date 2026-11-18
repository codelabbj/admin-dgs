"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ago, cardsApi, usd, type AdminCard, type Paginated } from "@/lib/cards-api"
import { CardsShell, ComplianceBadge, EmptyState, ErrorBanner, Mono, Pager, Panel, StatusPill } from "./cards-ui"

const PAGE_SIZE = 25

export function CardsListContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [q, setQ] = useState(params.get("q") || "")
  const [status, setStatus] = useState(params.get("status") || "all")
  const [frozenBy, setFrozenBy] = useState(params.get("frozen_by") || "all")
  const [customer, setCustomer] = useState(params.get("customer_id") || "")
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Paginated<AdminCard> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      setData(
        await cardsApi<Paginated<AdminCard>>("", {
          query: { q, status, frozen_by: frozenBy, customer_id: customer, page, page_size: PAGE_SIZE },
        }),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chargement impossible")
    } finally {
      setLoading(false)
    }
  }, [q, status, frozenBy, customer, page])

  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
  }, [load])

  return (
    <CardsShell title="Cartes" description="Toutes les cartes de tous les partenaires. Le solde affiché est le dernier lu chez Maplerad.">
      <Panel>
        <div className="flex flex-col gap-2 border-b p-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                setPage(1)
              }}
              placeholder="ID carte, utilisateur final, PAN masqué, client Maplerad…"
              className="pl-9"
            />
          </div>
          <Input
            value={customer}
            onChange={(e) => {
              setCustomer(e.target.value)
              setPage(1)
            }}
            placeholder="ID partenaire"
            className="md:w-48"
          />
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
            <SelectTrigger className="md:w-40"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="DISABLED">Gelée</SelectItem>
              <SelectItem value="PENDING">En création</SelectItem>
              <SelectItem value="TERMINATED">Résiliée</SelectItem>
              <SelectItem value="FAILED">Échec</SelectItem>
            </SelectContent>
          </Select>
          <Select value={frozenBy} onValueChange={(v) => { setFrozenBy(v); setPage(1) }}>
            <SelectTrigger className="md:w-44"><SelectValue placeholder="Gel" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous gels</SelectItem>
              <SelectItem value="dgs">Conformité DGS</SelectItem>
              <SelectItem value="partner">Partenaire</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && <div className="p-3"><ErrorBanner message={error} onRetry={load} /></div>}

        {loading && !data ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : data && data.results.length === 0 ? (
          <EmptyState title="Aucune carte" hint="Modifiez les filtres ou attendez les premières créations." />
        ) : data ? (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Carte</TableHead>
                    <TableHead>Partenaire · utilisateur</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Solde</TableHead>
                    <TableHead className="hidden md:table-cell">Créée</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.results.map((c) => (
                    <TableRow
                      key={c.uid}
                      className="cursor-pointer"
                      onClick={() => router.push(`/cards/${c.uid}`)}
                    >
                      <TableCell>
                        <Link href={`/cards/${c.uid}`} className="block" onClick={(e) => e.stopPropagation()}>
                          <p className="font-medium">{c.masked_pan || "•••• ••••"}</p>
                          <Mono>{c.brand || "—"} · {c.id.slice(0, 18)}</Mono>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <p className="max-w-[14rem] truncate text-sm">{c.owner_customer_id}</p>
                        <Mono>{c.external_ref || "—"}</Mono>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <StatusPill status={c.status} />
                          <ComplianceBadge frozenBy={c.frozen_by} />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-medium tabular-nums">{usd(c.balance)}</p>
                        <p className="text-[11px] text-muted-foreground">{ago(c.balance_synced_at)}</p>
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">{ago(c.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pager page={page} pageSize={PAGE_SIZE} count={data.count} onPage={setPage} />
          </>
        ) : null}
      </Panel>
    </CardsShell>
  )
}

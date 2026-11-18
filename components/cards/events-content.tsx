"use client"

import { Fragment, useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cardsApi, dateTime, type Paginated } from "@/lib/cards-api"
import { CardsShell, EmptyState, ErrorBanner, Mono, Pager, Panel } from "./cards-ui"

interface OutboxEvent {
  uid: string
  event_id: string
  event_type: string
  customer_id: string
  delivered: boolean
  attempts: number
  last_status_code: number | null
  last_error: string
  created_at: string
  delivered_at: string | null
  payload: any
}

export function CardEventsContent() {
  const params = useSearchParams()
  const [delivered, setDelivered] = useState(params.get("delivered") || "all")
  const [customer, setCustomer] = useState("")
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Paginated<OutboxEvent> | null>(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState("")
  const [open, setOpen] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError("")
    try {
      setData(await cardsApi<Paginated<OutboxEvent>>("events/", { query: { delivered, customer_id: customer, page, page_size: 25 } }))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chargement impossible")
    }
  }, [delivered, customer, page])

  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
  }, [load])

  const retry = async (uid: string) => {
    setBusy(uid)
    try {
      await cardsApi(`events/${uid}/retry/`, { method: "POST" })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Relance impossible")
    } finally {
      setBusy("")
    }
  }

  return (
    <CardsShell
      title="Événements partenaires"
      description="Notifications signées (HMAC) envoyées aux partenaires : création, achats, gels, résiliations, frais. Rejouées automatiquement jusqu'à confirmation."
    >
      <Panel>
        <div className="flex flex-col gap-2 border-b p-3 md:flex-row">
          <Input value={customer} onChange={(e) => { setCustomer(e.target.value); setPage(1) }} placeholder="ID partenaire" className="md:w-64" />
          <Select value={delivered} onValueChange={(v) => { setDelivered(v); setPage(1) }}>
            <SelectTrigger className="md:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="false">Non livrés</SelectItem>
              <SelectItem value="true">Livrés</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {error && <div className="p-3"><ErrorBanner message={error} onRetry={load} /></div>}
        {!data ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : data.results.length === 0 ? (
          <EmptyState title="Aucun événement" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Événement</TableHead>
                    <TableHead>Partenaire</TableHead>
                    <TableHead>Livraison</TableHead>
                    <TableHead className="hidden md:table-cell">Créé</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.results.map((e) => (
                    <Fragment key={e.uid}>
                      <TableRow className="cursor-pointer" onClick={() => setOpen(open === e.uid ? null : e.uid)}>
                        <TableCell>
                          <p className="font-mono text-sm">{e.event_type}</p>
                          <Mono>{e.event_id}</Mono>
                        </TableCell>
                        <TableCell className="max-w-[12rem] truncate text-sm">{e.customer_id}</TableCell>
                        <TableCell>
                          {e.delivered ? (
                            <span className="text-sm text-emerald-600">Livré · {dateTime(e.delivered_at)}</span>
                          ) : (
                            <div>
                              <span className="text-sm text-amber-600">En attente · {e.attempts} essai(s)</span>
                              {e.last_error && <p className="max-w-[16rem] truncate text-[11px] text-muted-foreground">{e.last_error}</p>}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="hidden text-sm text-muted-foreground md:table-cell">{dateTime(e.created_at)}</TableCell>
                        <TableCell className="text-right">
                          {!e.delivered && (
                            <Button size="sm" variant="ghost" className="h-8" disabled={busy === e.uid} onClick={(ev) => { ev.stopPropagation(); retry(e.uid) }}>
                              {busy === e.uid ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCw className="h-4 w-4" />}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                      {open === e.uid && (
                        <TableRow>
                          <TableCell colSpan={5} className="bg-muted/30">
                            <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-all text-[11px]">{JSON.stringify(e.payload, null, 2)}</pre>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pager page={page} pageSize={25} count={data.count} onPage={setPage} />
          </>
        )}
      </Panel>
    </CardsShell>
  )
}

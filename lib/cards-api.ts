// Client de l'API admin cartes (/api/v2/admin/cards/…).
// Les actions sensibles exigent le code 2FA (en-tête X-TOTP-Code) si l'admin l'a activé.
import { smartFetch } from "@/utils/auth"

const BASE = `${process.env.NEXT_PUBLIC_BASE_URL}/api/v2/admin/cards`

export class ApiError extends Error {
  status: number
  code?: string
  data?: any
  constructor(message: string, status: number, code?: string, data?: any) {
    super(message)
    this.status = status
    this.code = code
    this.data = data
  }
  get needsTotp() {
    return this.code === "totp_required" || this.code === "totp_invalid"
  }
}

function errorMessage(data: any, status: number): string {
  if (!data) return `Erreur ${status}`
  if (typeof data === "string") return data
  if (data.message && data.error === "totp_required") return "Code 2FA requis."
  if (data.error && typeof data.error === "string") return data.message && data.error.length < 20 ? data.message : data.error
  if (data.detail) return data.detail
  const first = Object.entries(data)[0]
  if (first) return `${first[0]} : ${Array.isArray(first[1]) ? first[1][0] : first[1]}`
  return `Erreur ${status}`
}

export async function cardsApi<T = any>(
  path: string,
  opts: { method?: string; body?: any; totp?: string; query?: Record<string, string | number | undefined> } = {},
): Promise<T> {
  const params = new URLSearchParams()
  Object.entries(opts.query || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== "all") params.append(k, String(v))
  })
  const qs = params.toString()
  const headers: Record<string, string> = {}
  if (opts.totp) headers["X-TOTP-Code"] = opts.totp
  const res = await smartFetch(`${BASE}/${path}${qs ? `?${qs}` : ""}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  })
  let data: any = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  if (!res.ok) {
    const code = data?.code || (typeof data?.error === "string" && data.error.startsWith("totp") ? data.error : undefined)
    throw new ApiError(errorMessage(data, res.status), res.status, code, data)
  }
  return data as T
}

// ── Types ───────────────────────────────────────────────────────────────────

export interface AdminCard {
  uid: string
  id: string
  reference: string
  owner_customer_id: string
  customer_id: string
  external_ref: string
  status: string
  brand: string
  currency: string
  masked_pan: string
  name: string
  balance: string
  balance_synced_at: string | null
  frozen_by: string
  frozen_reason: string
  terminated_at: string | null
  created_at: string | null
}

export interface CardOp {
  id: string
  kind: string
  status: string
  amount: string
  fee: string
  currency: string
  client_reference: string
  card_id: string | null
  card_uid: string | null
  end_user_ref: string
  owner_customer_id: string
  reference: string | null
  error: string
  attempts: number
  next_check_at: string | null
  created_at: string | null
  resolved_at: string | null
  resolved_by_admin_id: string
  resolution_note: string
  partner_refunded: boolean
}

export interface LedgerRow {
  uid: string
  type: string
  direction: "credit" | "debit" | "none"
  amount: string
  fee: string
  description: string
  merchant: Record<string, any>
  status: string
  occurred_at: string
}

export interface Program {
  customer_id: string
  enabled: boolean
  creation_fee: string
  creation_fee_mastercard: string | null
  fund_fee_percent: string
  fund_fee_fixed: string
  withdraw_fee_percent: string
  withdraw_fee_fixed: string
  monthly_fee: string
  pass_through_provider_charges: boolean
  max_cards_per_end_user: number
  max_active_cards: number
  min_fund_amount: string
  max_fund_amount: string
  daily_fund_limit_per_card: string
  max_card_balance: string
  auto_freeze_after_declines: number
  webhook_signing_enabled: boolean
  webhook_url: string
  cards_alive: number
  cards_balance_usd: string
  updated_at: string
}

export interface Report {
  uid: string
  status: "ok" | "warning" | "alert" | "error"
  created_at: string
  provider_balance: string | null
  partner_liabilities: string
  open_operations_amount: string
  surplus: string | null
  card_mismatches: number
  details: any
  triggered_by_admin_id: string
}

export interface Paginated<T> {
  count: number
  page: number
  page_size: number
  results: T[]
}

// ── Formatage ───────────────────────────────────────────────────────────────

export function usd(value: string | number | null | undefined, opts: { sign?: boolean } = {}) {
  if (value === null || value === undefined || value === "") return "—"
  const n = Number(value)
  if (Number.isNaN(n)) return String(value)
  const s = n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${opts.sign && n > 0 ? "+" : ""}${s} $`
}

export function dateTime(value: string | null | undefined) {
  if (!value) return "—"
  const d = new Date(value)
  return d.toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
}

export function ago(value: string | null | undefined) {
  if (!value) return "—"
  const diff = (Date.now() - new Date(value).getTime()) / 1000
  if (diff < 60) return "à l'instant"
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`
  return `il y a ${Math.floor(diff / 86400)} j`
}

export const OP_KIND: Record<string, string> = {
  create: "Création",
  fund: "Recharge",
  withdraw: "Retrait",
  terminate: "Résiliation",
  provider_charge: "Frais Maplerad",
  monthly_fee: "Frais mensuel",
  termination_refund: "Solde restitué",
}

export const LEDGER_TYPE: Record<string, string> = {
  fund: "Recharge",
  withdraw: "Retrait",
  purchase: "Achat",
  settlement: "Règlement",
  reversal: "Annulation",
  refund: "Remboursement marchand",
  decline: "Refus",
  provider_fee: "Frais Maplerad",
  termination: "Résiliation",
  other: "Autre",
}

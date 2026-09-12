"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const FEE_MODE_OPTIONS = [
  { value: "percentage", label: "Pourcentage (%)" },
  { value: "fixed", label: "Frais fixe" },
  { value: "base_percent", label: "Base + %" },
]

export function FeeFlowFields({
  idPrefix,
  title,
  mode,
  rate,
  fixed,
  base,
  onMode,
  onRate,
  onFixed,
  onBase,
}: {
  idPrefix: string
  title: string
  mode?: string
  rate?: number
  fixed?: number | null
  base?: number
  onMode: (v: string) => void
  onRate: (v: number) => void
  onFixed: (v: number) => void
  onBase: (v: number) => void
}) {
  const m = mode || "percentage"
  return (
    <div className="space-y-2 p-3 rounded-lg border border-slate-200 dark:border-neutral-700">
      <Label className="font-medium">{title}</Label>
      <Select value={m} onValueChange={onMode}>
        <SelectTrigger id={`${idPrefix}_mode`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FEE_MODE_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {(m === "percentage" || m === "base_percent") && (
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix}_rate`} className="text-xs text-muted-foreground">Taux (%)</Label>
          <Input
            id={`${idPrefix}_rate`}
            type="number"
            step="0.01"
            value={rate ?? 0}
            onChange={(e) => onRate(parseFloat(e.target.value) || 0)}
          />
        </div>
      )}
      {m === "fixed" && (
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix}_fixed`} className="text-xs text-muted-foreground">Montant fixe</Label>
          <Input
            id={`${idPrefix}_fixed`}
            type="number"
            value={fixed ?? 0}
            onChange={(e) => onFixed(parseFloat(e.target.value) || 0)}
          />
        </div>
      )}
      {m === "base_percent" && (
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix}_base`} className="text-xs text-muted-foreground">Frais de base (minimum)</Label>
          <Input
            id={`${idPrefix}_base`}
            type="number"
            value={base ?? 0}
            onChange={(e) => onBase(parseFloat(e.target.value) || 0)}
          />
        </div>
      )}
    </div>
  )
}

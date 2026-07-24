"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { CurrenciesContent } from "@/components/currencies-content"

export default function CurrenciesPage() {
  return (
    <DashboardLayout>
      <CurrenciesContent />
    </DashboardLayout>
  )
}

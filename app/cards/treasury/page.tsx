import { Suspense } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CardTreasuryContent } from "@/components/cards/treasury-content"

export default function Page() {
  return (
    <DashboardLayout>
      <Suspense fallback={null}>
        <CardTreasuryContent />
      </Suspense>
    </DashboardLayout>
  )
}

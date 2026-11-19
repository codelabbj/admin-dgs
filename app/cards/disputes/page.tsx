import { Suspense } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CardDisputesContent } from "@/components/cards/disputes-content"

export default function Page() {
  return (
    <DashboardLayout>
      <Suspense fallback={null}>
        <CardDisputesContent />
      </Suspense>
    </DashboardLayout>
  )
}

import { Suspense } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CardsOverviewContent } from "@/components/cards/overview-content"

export default function Page() {
  return (
    <DashboardLayout>
      <Suspense fallback={null}>
        <CardsOverviewContent />
      </Suspense>
    </DashboardLayout>
  )
}

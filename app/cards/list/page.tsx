import { Suspense } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CardsListContent } from "@/components/cards/cards-list-content"

export default function Page() {
  return (
    <DashboardLayout>
      <Suspense fallback={null}>
        <CardsListContent />
      </Suspense>
    </DashboardLayout>
  )
}

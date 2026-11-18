import { Suspense } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CardEventsContent } from "@/components/cards/events-content"

export default function Page() {
  return (
    <DashboardLayout>
      <Suspense fallback={null}>
        <CardEventsContent />
      </Suspense>
    </DashboardLayout>
  )
}

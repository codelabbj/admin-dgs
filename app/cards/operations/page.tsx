import { Suspense } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CardOperationsContent } from "@/components/cards/operations-content"

export default function Page() {
  return (
    <DashboardLayout>
      <Suspense fallback={null}>
        <CardOperationsContent />
      </Suspense>
    </DashboardLayout>
  )
}

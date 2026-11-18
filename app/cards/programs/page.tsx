import { Suspense } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CardProgramsContent } from "@/components/cards/programs-content"

export default function Page() {
  return (
    <DashboardLayout>
      <Suspense fallback={null}>
        <CardProgramsContent />
      </Suspense>
    </DashboardLayout>
  )
}

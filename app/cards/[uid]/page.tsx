import { DashboardLayout } from "@/components/dashboard-layout"
import { CardDetailContent } from "@/components/cards/card-detail-content"

export default function Page({ params }: { params: { uid: string } }) {
  return (
    <DashboardLayout>
      <CardDetailContent uid={params.uid} />
    </DashboardLayout>
  )
}

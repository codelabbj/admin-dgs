"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { CommissionManagementContent } from "@/components/commission-management-content"

export default function CommissionManagement() {
  return (
    <DashboardLayout>
      <CommissionManagementContent />
    </DashboardLayout>
  )
}

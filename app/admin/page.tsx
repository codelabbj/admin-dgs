"use client"

import React from "react"
import { AdminLayout } from "@/components/admin-layout"
import { AdminDashboardContent } from "@/components/admin-dashboard-content"

export default function AdminPage() {
  return (
    <AdminLayout>
      <AdminDashboardContent />
    </AdminLayout>
  )
}

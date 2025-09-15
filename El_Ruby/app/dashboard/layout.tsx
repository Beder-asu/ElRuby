import type React from "react"
import { LowStockAlert } from "@/components/alerts/low-stock-alert"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <LowStockAlert />
      {children}
    </>
  )
}

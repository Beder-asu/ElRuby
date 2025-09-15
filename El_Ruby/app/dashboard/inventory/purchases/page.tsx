import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PurchasesTable } from "@/components/inventory/purchases-table"

interface Purchase {
  id: string
  total_amount: number
  paid_amount: number
  status: "pending" | "partially_paid" | "completed"
  notes: string | null
  created_at: string
  company: {
    id: string
    name: string
    email: string | null
  } | null
}

export default async function PurchaseHistoryPage() {
  const supabase = await createClient()

  let purchases: Purchase[] = []
  let error = null

  if (!supabase) {
    error = "Database not configured"
  } else {
    try {
      const purchasesResult = await supabase
        .from("inventory_purchases")
        .select(`
          *,
          company:companies (
            id,
            name,
            email
          )
        `)
        .order("created_at", { ascending: false })

      if ('data' in purchasesResult && purchasesResult.data) {
        purchases = purchasesResult.data as Purchase[]
      }
    } catch (err) {
      console.error("[v0] Database error:", err)
      error = err instanceof Error ? err.message : "An error occurred"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto p-6">
        <PurchasesTable purchases={purchases} error={error} />
      </main>
    </div>
  )
}

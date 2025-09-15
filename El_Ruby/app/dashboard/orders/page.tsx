import { createClient } from "@/lib/supabase/server"
import { OrdersPageContent } from "@/components/orders/orders-page-content"
import type { OrderWithCustomer } from "@/types/database"

export default async function OrdersPage() {
  const supabase = await createClient()

  let orders: OrderWithCustomer[] = []
  let ordersError = null

  if (!supabase) {
    ordersError = "Database not configured"
  } else {
    try {
      const ordersResult = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          customer_id,
          total_amount,
          paid_amount,
          notes,
          created_at,
          customers (
            id,
            name,
            phone
          )
        `)
        .order('created_at', { ascending: false })

      // Handle the response properly with type safety
      if ('data' in ordersResult && ordersResult.data) {
        orders = ordersResult.data as OrderWithCustomer[]
        ordersError = ordersResult.error
      }
    } catch (error) {
      console.log("[v0] Database tables not found, using empty data:", error)
      ordersError = error
    }
  }

  return <OrdersPageContent orders={orders} ordersError={ordersError} />
}

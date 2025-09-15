import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OrderDetailsClient } from "@/components/orders/order-details-client"

interface OrderDetailsPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch order with customer, items, payments, and customer transactions
  const orderResult = await supabase
    .from("orders")
    .select(`
      *,
      customers (
        id,
        name,
        phone,
        balance
      ),
      order_items (
        id,
        quantity,
        unit_price,
        total_price,
        products (
          id,
          name
        )
      ),
      payments (
        id,
        amount,
        payment_method
      )
    `)
    .eq("id", id)

  // Handle the response properly with type safety
  let order = null
  let orderError = null

  console.log("Order query result:", orderResult)

  if (orderResult.error) {
    console.error("Order query error:", orderResult.error)
    orderError = orderResult.error
  } else if (orderResult.data && orderResult.data.length > 0) {
    order = orderResult.data[0]
    console.log("Found order:", order)
  } else {
    console.log("No order found with id:", id)
  }

  if (orderError) {
    console.error("Database error:", orderError)
    notFound()
  }

  if (!order) {
    console.log("Order not found, showing 404")
    notFound()
  }

  // Handle customer transactions query - make it optional in case table doesn't exist
  let customerTransactions = []

  if (order.customer_id) {
    try {
      const transactionsResult = await supabase
        .from("customer_transactions")
        .select("*")
        .eq("customer_id", order.customer_id)
        .order("transaction_date", { ascending: false })

      if (transactionsResult.data) {
        customerTransactions = transactionsResult.data
      }
    } catch (error) {
      console.log("Customer transactions table might not exist:", error)
      // Continue without transactions - this is optional
    }
  }

  return (
    <OrderDetailsClient 
      order={order} 
      payments={order.payments || []} 
      customerTransactions={customerTransactions || []} 
    />
  )
}

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import NewOrderPage from "@/components/orders/new-order-page"

export default async function OrderPageWrapper({
  searchParams,
}: {
  searchParams: { customer?: string }
}) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const customersResult = await supabase.from("customers").select("id, name, phone, balance")
  const productsResult = await supabase.from("products").select("id, name, price, stock_quantity, cost, supplier, category")

  // Debug logging for errors
  if ('error' in customersResult && customersResult.error) {
    console.log('[ERROR] Customers query error:', customersResult.error)
  }
  if ('error' in productsResult && productsResult.error) {
    console.log('[ERROR] Products query error:', productsResult.error)
  }

  // Handle the response properly with type safety
  const customers = 'data' in customersResult ? customersResult.data || [] : []
  const products = 'data' in productsResult ? productsResult.data || [] : []

  // Quick debug logging
  console.log('[DEBUG] Data loaded - Customers:', customers.length, 'Products:', products.length)

  return (
    <NewOrderPage
      customers={customers}
      products={products}
      preselectedCustomerId={searchParams.customer}
    />
  )
}

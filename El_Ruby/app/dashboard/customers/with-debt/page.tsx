import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CustomersWithDebtClient } from "@/components/customers/customers-with-debt-client"

type Customer = {
  id: string
  name: string
  phone: string | null
  email: string | null
  balance: number
  created_at: string
}

type Order = {
  id: string
  order_number: number
  total_amount: number
  paid_amount: number
  created_at: string
}

export default async function CustomersWithDebtPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get customers who owe us money (negative balance)
  const customersRes = await ((supabase.from("customers") as any)
    .select("*")
    .lt("balance", 0)
    .order("balance", { ascending: true }))

  const customers = (customersRes?.data || []) as Customer[]

  // for each customer, fetch orders then filter unpaid orders in JS
  const customersWithOrders: (Customer & { unpaidOrders: Order[] })[] = []
  for (const customer of customers) {
    const ordersRes = await ((supabase.from("orders") as any)
      .select("id, order_number, total_amount, paid_amount, created_at")
      .eq("customer_id", customer.id))

    const allOrders = ordersRes?.data || []
    const unpaid = (allOrders || []).filter((o: any) => (o.total_amount - o.paid_amount) > 0)
    customersWithOrders.push({ ...customer, unpaidOrders: unpaid as Order[] })
  }

  return <CustomersWithDebtClient customersWithOrders={customersWithOrders} />
}
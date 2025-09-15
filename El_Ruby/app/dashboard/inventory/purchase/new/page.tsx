import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PurchaseForm } from "@/components/inventory/purchase-form"

interface Company {
  id: string
  name: string
  phone?: string
  description?: string
  products_description?: string
  balance: number
}

interface Product {
  id: string
  name: string
  description?: string
  price: number
  cost: number
  stock_quantity: number
  low_stock_threshold: number
  category?: string
  supplier?: string
}

export default async function InventoryPurchasePage() {
  const supabase = await createClient()

  // Check authentication
  let companies: Company[] = []
  let products: Product[] = []
  let error: string | null = null

  if (!supabase) {
    error = "Database not configured"
  } else {
    try {
      const companiesResult = await supabase
        .from("companies")
        .select("*")
        .order('name')

      const productsResult = await supabase
        .from("products")
        .select("*")
        .order('name')

      // Handle the responses properly with type safety
      if ('data' in companiesResult && companiesResult.data) {
        companies = companiesResult.data as Company[]
      }

      if ('data' in productsResult && productsResult.data) {
        products = productsResult.data as Product[]
      }
    } catch (err) {
      console.error("[v0] Database tables not found:", err)
      error = err instanceof Error ? err.message : "An error occurred"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto p-6">
        <PurchaseForm companies={companies} products={products} />
      </main>
    </div>
  )
}

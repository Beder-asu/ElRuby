import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { InventoryPageContent } from "@/components/inventory/inventory-page-content"

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
interface BalanceRecord {
  balance: number
}

export default async function InventoryPage() {
  const supabase = await createClient()

  // Auth check (server-side)
  const { data: userData, error: authError } = await supabase.auth.getUser()
  if (authError || !userData?.user) {
    redirect("/auth/login")
  }

  try {
    // Fetch products and balances in parallel
    const [productsResRaw, customersResRaw, companiesResRaw] = await Promise.all([
      supabase.from("products").select("id, name, stock_quantity, low_stock_threshold, price"),
      supabase.from("customers").select("balance"),
      supabase.from("companies").select("balance")
    ]) as any[]

    // Normalize results to simple objects (data, error) to avoid fragile union types
    const productsRes = productsResRaw as { data?: Product[] | null; error?: any }
    const customersRes = customersResRaw as { data?: BalanceRecord[] | null; error?: any }
    const companiesRes = companiesResRaw as { data?: BalanceRecord[] | null; error?: any }

    // If any query returned an error, surface a generic error
    if (productsRes.error || customersRes.error || companiesRes.error) {
      throw new Error("Failed to fetch inventory data")
    }

    const products = (productsRes.data || []) as Product[]
    // Sort products by name
    products.sort((a, b) => a.name.localeCompare(b.name))

    // Compute inventory stats
    const totalProducts = products.length
    const lowStockProducts = products.filter(p => p.stock_quantity <= p.low_stock_threshold).length
    const outOfStockProducts = products.filter(p => p.stock_quantity === 0).length
    const totalValue = products.reduce((sum, p) => sum + p.stock_quantity * p.price, 0)

    // Compute financials
    const totalCustomerDebt = (customersRes.data || [])
      .map((r: BalanceRecord) => r.balance)
      .filter((b: number) => typeof b === 'number' && b < 0)
      .reduce((s: number, b: number) => s + Math.abs(b), 0)

    const totalCompanyOwed = (companiesRes.data || [])
      .map((r: BalanceRecord) => r.balance)
      .filter((b: number) => typeof b === 'number' && b > 0)
      .reduce((s: number, b: number) => s + b, 0)

    return (
      <div className="min-h-screen bg-background">
        <InventoryPageContent
          products={products}
          totalProducts={totalProducts}
          lowStockProducts={lowStockProducts}
          outOfStockProducts={outOfStockProducts}
          totalValue={totalValue}
          productsError={null}
          totalCustomerDebt={totalCustomerDebt}
          totalCompanyOwed={totalCompanyOwed}
        />
      </div>
    )
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error")
    console.error("InventoryPage error:", error)

    return (
      <div className="min-h-screen bg-background">
        <InventoryPageContent
          products={[]}
          totalProducts={0}
          lowStockProducts={0}
          outOfStockProducts={0}
          totalValue={0}
          productsError={error}
          totalCustomerDebt={0}
          totalCompanyOwed={0}
        />
      </div>
    )
  }
}

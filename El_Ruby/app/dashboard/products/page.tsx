"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, LogOut } from "lucide-react"
import Link from "next/link"
import { ProductsTable } from "@/components/products/products-table"
import { useLanguage } from "@/lib/language-context"
import type { Product } from "@/types/database"

export default function ProductsPage() {
  const { t, language } = useLanguage()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) {
        router.push("/auth/login")
        return
      }
      setUser(data.user)

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")

      if (productsError) {
        console.error("Error fetching products:", productsError)
      }

      setProducts(productsData || [])
      setLoading(false)
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">{t("loading")}</div>
      </div>
    )
  }

  const totalProducts = products?.length || 0
  const lowStockProducts = products?.filter((p) => p.stock_quantity <= p.low_stock_threshold).length || 0
  const outOfStockProducts = products?.filter((p) => p.stock_quantity === 0).length || 0

  return (
    <div className={`min-h-screen bg-background ${language === "ar" ? "rtl" : "ltr"}`}>
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-xl font-bold text-primary hover:underline">
              {t("systemName")}
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-muted-foreground">{t("products")}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {t("welcome")}, {user?.email}
            </span>
            <form action="/auth/logout" method="post">
              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                {t("logout")}
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">{t("products")}</h1>
            <p className="text-muted-foreground">{t("manageInventoryDesc")}</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/products/new">
              <Plus className="mr-2 h-4 w-4" />
              {t("addProduct")}
            </Link>
          </Button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("totalProducts")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("lowStock")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{lowStockProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("outOfStock")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{outOfStockProducts}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("products")}</CardTitle>
            <CardDescription>
              {totalProducts} {t("products")} in {t("inventory")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductsTable products={products || []} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

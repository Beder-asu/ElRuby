"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, Package, Users, ShoppingCart, BarChart3 } from "lucide-react"
import { FinancialSummaryCard } from "@/components/dashboard/financial-summary-card"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

export default function DashboardPage() {
  const { t, language } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    customerCount: 0,
    productCount: 0,
    orderCount: 0,
    totalRevenue: 0,
    totalCustomerBalances: 0,
    totalNetProfit: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        window.location.href = "/auth/login"
        return
      }
      setUser(userData.user)

      try {
        const [customersResult, productsResult, ordersResult, balancesResult, profitResult] = await Promise.all([
          supabase.from("customers").select("id", { count: "exact" }),
          supabase.from("products").select("id", { count: "exact" }),
          supabase.from("orders").select("id, total_amount, paid_amount", { count: "exact" }),
          supabase.from("customers").select("balance"),
          supabase.from("orders").select("total_amount, paid_amount, order_items(product_id, quantity)")
        ])

        const customerCount = 'count' in customersResult ? (customersResult.count || 0) : 0
        const productCount = 'count' in productsResult ? (productsResult.count || 0) : 0
        const orderCount = 'count' in ordersResult ? (ordersResult.count || 0) : 0
        const totalRevenue = ('data' in ordersResult && ordersResult.data)
          ? ordersResult.data.filter((o: any) => (o.paid_amount >= o.total_amount)).reduce((sum: number, o: any) => sum + o.total_amount, 0)
          : 0

        const totalCustomerBalances = ('data' in balancesResult && balancesResult.data)
          ? balancesResult.data
            .filter((c: any) => (c.balance || 0) < 0) // Only include negative balances
            .reduce((sum: number, c: any) => sum + Math.abs(c.balance || 0), 0) // Use Math.abs to show positive amount owed
          : 0

        let totalNetProfit = 0
        if ('data' in profitResult && profitResult.data) {
          // Get all products for profit calculation
          const productsForProfit = await supabase.from("products").select("id, price, cost")
          const productMap = new Map()
          if ('data' in productsForProfit && productsForProfit.data) {
            productsForProfit.data.forEach((p: any) => productMap.set(p.id, p))
          }

          totalNetProfit = profitResult.data
            .filter((o: any) => (o.paid_amount >= o.total_amount)) // completed orders
            .reduce((sum: number, order: any) => {
              const orderProfit = order.order_items?.reduce((itemSum: number, item: any) => {
                const product = productMap.get(item.product_id)
                if (product && product.cost) {
                  return itemSum + ((product.price - product.cost) * item.quantity)
                }
                return itemSum
              }, 0) || 0
              return sum + orderProfit
            }, 0)
        }

        setStats({
          customerCount,
          productCount,
          orderCount,
          totalRevenue,
          totalCustomerBalances,
          totalNetProfit
        })
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">{t("loading")}</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-background ${language === "ar" ? "rtl" : "ltr"}`}>
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-balance">{t("welcomeToPOS")}</h2>
          <p className="text-muted-foreground">{t("manageInventoryDesc")}</p>
        </div>

        <div className="mb-6">
          <FinancialSummaryCard
            totalCustomerBalances={stats.totalCustomerBalances}
            totalNetProfit={stats.totalNetProfit}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("customers")}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.customerCount}</div>
              <p className="text-xs text-muted-foreground">
                <Link href="/dashboard/customers" className="hover:underline">
                  {t("manageCustomerDatabase")}
                </Link>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("products")}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.productCount}</div>
              <p className="text-xs text-muted-foreground">
                <Link href="/dashboard/products" className="hover:underline">
                  {t("trackInventoryLevels")}
                </Link>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("orders")}</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.orderCount}</div>
              <p className="text-xs text-muted-foreground">
                <Link href="/dashboard/orders" className="hover:underline">
                  {t("processSalesInvoices")}
                </Link>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("revenue")}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">{t("totalCompletedSales")}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>{t("quickActions")}</CardTitle>
              <CardDescription>{t("commonTasksDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                <Link href="/dashboard/customers/new">
                  <Users className="mr-2 h-4 w-4" />
                  {t("addNewCustomer")}
                </Link>
              </Button>
              <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                <Link href="/dashboard/products/new">
                  <Package className="mr-2 h-4 w-4" />
                  {t("addNewProduct")}
                </Link>
              </Button>
              <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                <Link href="/dashboard/orders/new">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {t("createNewOrder")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

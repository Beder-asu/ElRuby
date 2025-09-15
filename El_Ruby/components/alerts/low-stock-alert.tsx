"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X, Package } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

interface LowStockProduct {
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

export function LowStockAlert() {
  const { t, language } = useLanguage()
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
  const [isDismissed, setIsDismissed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const dismissed = localStorage.getItem("lowStockAlertDismissed")
    if (dismissed === "true") {
      setIsDismissed(true)
    }
  }, [])

  useEffect(() => {
    const fetchLowStockProducts = async () => {
      try {
        const supabase = createClient()
        console.log("[v0] Creating Supabase client")
        console.log("[v0] Supabase client created successfully")

        let lowStockData: LowStockProduct[] = []

        // Check if supabase has rpc function (real client)
        if (supabase && typeof supabase === 'object' && 'rpc' in supabase) {
          try {
            const { data: rawData, error: rawError } = await (supabase as any).rpc("get_low_stock_products")
            if (!rawError && rawData) {
              console.log("[v0] Low stock products found:", rawData.length)
              lowStockData = rawData
            }
          } catch (rpcError) {
            console.log("[v0] RPC function not available, falling back to regular query")
          }
        }

        // If RPC didn't work, try regular query
        if (lowStockData.length === 0) {
          const productsResult = await supabase
            .from("products")
            .select("id, name, stock_quantity, low_stock_threshold")

          let productsData: any[] = []
          if ('data' in productsResult && productsResult.data) {
            productsData = productsResult.data
          }

          // Filter manually to compare stock_quantity with low_stock_threshold
          const filteredData = productsData.filter(
            (product: any) => product.stock_quantity <= product.low_stock_threshold && product.low_stock_threshold > 0,
          )

          console.log("[v0] Low stock products found:", filteredData.length)
          lowStockData = filteredData
        }

        setLowStockProducts(lowStockData)

        // Handle localStorage for dismissal logic
        if (lowStockData && lowStockData.length > 0) {
          const currentProducts = JSON.stringify(lowStockData.map((p: any) => p.id).sort())
          const lastProducts = localStorage.getItem("lastLowStockProducts")
          if (currentProducts !== lastProducts) {
            localStorage.setItem("lastLowStockProducts", currentProducts)
            localStorage.removeItem("lowStockAlertDismissed")
            setIsDismissed(false)
          }
        }
      } catch (error) {
        console.log("[v0] Database tables not found or other error, skipping low stock check:", error)
        setLowStockProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchLowStockProducts()

    // Refresh every 5 minutes
    const interval = setInterval(fetchLowStockProducts, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem("lowStockAlertDismissed", "true")
  }

  if (isLoading || isDismissed || lowStockProducts.length === 0) {
    return null
  }

  return (
    <div className="sticky top-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4 py-2">
        <Alert className="border-orange-200 bg-orange-50 text-orange-800">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {lowStockProducts.length} {lowStockProducts.length === 1 ? t("product") : t("productsRunningLow")}:
              </span>
              <div className="flex items-center gap-1 text-sm">
                {lowStockProducts.slice(0, 3).map((product, index) => (
                  <span key={product.id}>
                    {product.name} ({product.stock_quantity} {t("left")})
                    {index < Math.min(lowStockProducts.length, 3) - 1 && ", "}
                  </span>
                ))}
                {lowStockProducts.length > 3 && <span>{t("andMore").replace("%1", (lowStockProducts.length - 3).toString())}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="h-7 text-xs bg-transparent">
                <Link href="/dashboard/inventory">
                  <Package className="mr-1 h-3 w-3" />
                  {t("viewInventory")}
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-orange-600 hover:text-orange-800"
                onClick={handleDismiss}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}

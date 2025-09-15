"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, AlertTriangle, Edit } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import formatCurrency from "@/lib/format-currency"

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

interface InventoryTableProps {
  products: Product[]
}

export function InventoryTable({ products }: InventoryTableProps) {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [stockFilter, setStockFilter] = useState<string>("all")

  // Get unique categories
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)))

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && product.stock_quantity <= product.low_stock_threshold) ||
      (stockFilter === "out" && product.stock_quantity === 0) ||
      (stockFilter === "in" && product.stock_quantity > product.low_stock_threshold)

    return matchesSearch && matchesCategory && matchesStock
  })

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity === 0) {
      return { label: t("outOfStock"), variant: "destructive" as const, color: "text-red-600" }
    } else if (product.stock_quantity <= product.low_stock_threshold) {
      return { label: t("lowStock"), variant: "secondary" as const, color: "text-orange-600" }
    } else {
      return { label: t("inStock"), variant: "default" as const, color: "text-green-600" }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchProductsByName")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t("category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allCategories")}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category!}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={t("stock")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allStock")}</SelectItem>
              <SelectItem value="in">{t("inStock")}</SelectItem>
              <SelectItem value="low">{t("lowStock")}</SelectItem>
              <SelectItem value="out">{t("outOfStock")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm || categoryFilter !== "all" || stockFilter !== "all"
              ? t("noProductsFound")
              : t("noProductsAdded")}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("product")}</TableHead>
                <TableHead>{t("category")}</TableHead>
                <TableHead>{t("currentStock")}</TableHead>
                <TableHead>{t("lowStock")}</TableHead>
                <TableHead>{t("unitPrice")}</TableHead>
                <TableHead>{t("stockValue")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product)
                const stockValue = product.stock_quantity * product.price
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      {product.category ? <Badge variant="outline">{product.category}</Badge> : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${stockStatus.color}`}>{product.stock_quantity}</span>
                        {product.stock_quantity <= product.low_stock_threshold && (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{product.low_stock_threshold}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(stockValue)}</TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/inventory/adjust?product=${product.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Search, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { DeleteProductDialog } from "./delete-product-dialog"
import { useLanguage } from "@/lib/language-context"
import { Product } from "@/types/database"

interface ProductsTableProps {
  products: Product[]
}

export function ProductsTable({ products }: ProductsTableProps) {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)

  // Get unique categories
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)))

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && product.stock_quantity <= product.low_stock_threshold) ||
      (stockFilter === "out" && product.stock_quantity === 0) ||
      (stockFilter === "in" && product.stock_quantity > product.low_stock_threshold)

    return matchesSearch && matchesCategory && matchesStock
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity === 0) {
      return { label: t("outOfStock"), variant: "destructive" as const }
    } else if (product.stock_quantity <= product.low_stock_threshold) {
      return { label: t("lowStock"), variant: "secondary" as const }
    } else {
      return { label: t("inStock"), variant: "default" as const }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchProducts")}
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
          {!searchTerm && categoryFilter === "all" && stockFilter === "all" && (
            <Button asChild className="mt-4">
              <Link href="/dashboard/products/new">{t("addYourFirstProduct")}</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("product")}</TableHead>
                <TableHead>{t("category")}</TableHead>
                <TableHead>{t("price")}</TableHead>
                <TableHead>{t("stock")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product)
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-muted-foreground max-w-xs truncate">{product.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.category ? <Badge variant="outline">{product.category}</Badge> : "—"}
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(product.price)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{product.stock_quantity}</span>
                        {product.stock_quantity <= product.low_stock_threshold && (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{t("low")}: {product.low_stock_threshold}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/dashboard/products/${product.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteProductId(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <DeleteProductDialog productId={deleteProductId} onClose={() => setDeleteProductId(null)} />
    </div>
  )
}

"use client"
import { Combobox } from "@/components/ui/new-combobox"
import { Button } from "@/components/ui/button"
import { Package } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { Product } from "@/types/database"

interface ProductSearchProps {
  products: Product[]
  value: string
  onValueChange: (value: string) => void
  onAddProduct: () => void
}

export function ProductSearch({ products, value, onValueChange, onAddProduct }: ProductSearchProps) {
  const { t } = useLanguage()

  // Debug logging
  console.log('[DEBUG] ProductSearch render - products length:', products?.length || 0)
  console.log('[DEBUG] ProductSearch render - products data:', products?.slice(0, 1) || 'undefined')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
    }).format(amount)
  }

  const productOptions = products
    .filter((product) => product.stock_quantity > 0) // Only show products with stock
    .map((product) => ({
      value: product.id,
      label: `${product.name} - ${formatCurrency(product.price)} - ${t("stock")}: ${product.stock_quantity}`,
    }))

  console.log('[DEBUG] ProductSearch - productOptions:', productOptions.length, productOptions.slice(0, 2))

  return (
    <div className="flex gap-2">
      <Combobox
        options={productOptions}
        value={value}
        onValueChange={onValueChange}
        placeholder={t("searchProducts")}
        searchPlaceholder={t("typeToSearchProducts")}
        emptyText={t("noProductsFoundCombobox")}
        className="flex-1"
      />
      <Button type="button" variant="outline" size="icon" onClick={onAddProduct}>
        <Package className="h-4 w-4" />
      </Button>
    </div>
  )
}

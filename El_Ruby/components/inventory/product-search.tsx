"use client"

import { Combobox } from "@/components/ui/new-combobox"
import { useLanguage } from "@/lib/language-context"

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

interface ProductSearchProps {
  products: Product[]
  value: string
  onValueChange: (value: string) => void
}

export function ProductSearch({ products, value, onValueChange }: ProductSearchProps) {
  const { t } = useLanguage()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
    }).format(amount)
  }

  const productOptions = products.map((product) => ({
    value: product.id,
    label: `${product.name} - ${formatCurrency(product.cost || product.price || 0)}`
  }))

  return (
    <Combobox
      options={productOptions}
      value={value}
      onValueChange={onValueChange}
      placeholder={t("selectProduct")}
      emptyText={t("noProductsFound")}
    />
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductSearch } from "@/components/inventory/product-search"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import formatCurrency from "@/lib/format-currency"
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

interface StockAdjustmentFormProps {
  products: Product[]
  selectedProduct?: Product | null
}

export function StockAdjustmentForm({ products, selectedProduct }: StockAdjustmentFormProps) {
  const { t } = useLanguage()
  const [productId, setProductId] = useState(selectedProduct?.id || "")
  const [adjustmentType, setAdjustmentType] = useState<"restock" | "adjustment">("restock")
  const [quantityChange, setQuantityChange] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const selectedProductData = products.find((p) => p.id === productId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!productId || !quantityChange) {
      setError(t("selectProductAndEnterQuantity"))
      setIsSubmitting(false)
      return
    }

    const quantity = Number.parseInt(quantityChange)
    if (isNaN(quantity) || quantity === 0) {
      setError(t("enterValidQuantityError"))
      setIsSubmitting(false)
      return
    }

    const supabase = createClient()

    try {
      // Generate meaningful default notes if user didn't provide any
      let transactionNotes = notes.trim()
      if (!transactionNotes) {
        if (adjustmentType === "restock") {
          transactionNotes = quantity > 0
            ? `${t("restockAddInventory")} (+${quantity})`
            : `${t("stockAdjustment")} (${quantity})`
        } else {
          transactionNotes = quantity > 0
            ? `${t("stockAdjustment")} (+${quantity})`
            : `${t("stockAdjustment")} (${quantity})`
        }
      }

      // Record the inventory transaction
      const { error: transactionError } = await supabase.from("inventory_transactions").insert([
        {
          product_id: productId,
          quantity_change: quantity,
          notes: transactionNotes,
        },
      ])

      if (transactionError) throw transactionError

      // Update the product stock quantity
      const { error: updateError } = await supabase
        .from("products")
        .update({
          stock_quantity: (selectedProductData?.stock_quantity || 0) + quantity,
        })
        .eq("id", productId)

      if (updateError) throw updateError

      setProductId("")
      setAdjustmentType("restock")
      setQuantityChange("")
      setNotes("")

      router.push("/dashboard/inventory")
      router.refresh()
    } catch (error: any) {
      setError(error.message || t("genericError"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateNewStock = () => {
    if (!selectedProductData || !quantityChange) return null
    const change = Number.parseInt(quantityChange) || 0
    return selectedProductData.stock_quantity + change
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{t("stockAdjustment")}</CardTitle>
          <CardDescription>{t("adjustInventoryLevels")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="product">{t("product")} *</Label>
              <ProductSearch
                products={products}
                value={productId}
                onValueChange={setProductId}
              />
            </div>

            {selectedProductData && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">{t("currentProductInfo")}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t("currentStockLevel")}:</span>
                    <div className="font-medium">{selectedProductData.stock_quantity}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("unitPriceLabel")}:</span>
                    <div className="font-medium">{formatCurrency(selectedProductData.price)}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="adjustment-type">{t("adjustmentType")} *</Label>
                <Select
                  value={adjustmentType}
                  onValueChange={(value: "restock" | "adjustment") => setAdjustmentType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restock">{t("restockAddInventory")}</SelectItem>
                    <SelectItem value="adjustment">{t("adjustmentAddRemove")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">{t("quantityChangeLabel")} *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantityChange}
                  onChange={(e) => setQuantityChange(e.target.value)}
                  placeholder={adjustmentType === "restock" ? t("enterQuantityToAdd") : t("enterPlusMinusQuantity")}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {adjustmentType === "restock"
                    ? t("enterPositiveNumberToAdd")
                    : t("usePositiveNumbersToAdd")}
                </p>
              </div>
            </div>

            {selectedProductData && quantityChange && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t("newStockLevel")}:</span>
                  <Badge variant="outline" className="text-base">
                    {calculateNewStock()}
                  </Badge>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">{t("notes")} ({t("optional")})</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("reasonForAdjustment")}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {t("adjustmentNotesHint")}
              </p>
            </div>

            {error && <div className="text-sm text-destructive">{error}</div>}

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("processingAdjustment") : t("applyAdjustment")}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/inventory">{t("cancel")}</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

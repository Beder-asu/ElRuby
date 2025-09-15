"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/language-context"
import { CompanySearch } from "./company-search"
import { ProductSearch } from "./product-search"
import formatCurrency from "@/lib/format-currency"

interface PurchaseFormProps {
  companies: any[]
  products: any[]
}

export function PurchaseForm({ companies, products }: PurchaseFormProps) {
  const [companyId, setCompanyId] = useState<string>("")
  const [items, setItems] = useState<Array<{
    productId: string
    quantity: number
    costPerUnit: number
    product: any
  }>>([])
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [quantity, setQuantity] = useState<string>("")
  const [costPerUnit, setCostPerUnit] = useState<string>("")
  const [paymentAmount, setPaymentAmount] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()

  const selectedCompany = companies.find(c => c.id === companyId)

  const handleAddItem = () => {
    if (!selectedProduct) {
      setError(t("selectProduct"))
      return
    }

    const quantityNum = Number(quantity)
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError(t("invalidQuantity"))
      return
    }

    const costNum = Number(costPerUnit)
    if (isNaN(costNum) || costNum < 0) {
      setError(t("invalidCost"))
      return
    }

    const product = products.find(p => p.id === selectedProduct)
    if (!product) return

    setItems(prev => [...prev, {
      productId: selectedProduct,
      quantity: quantityNum,
      costPerUnit: costNum,
      product
    }])

    setSelectedProduct("")
    setQuantity("")
    setCostPerUnit("")
    setError(null)
  }

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    console.log('🚀 PURCHASE FORM SUBMISSION STARTED')
    console.log('📊 Form data:', {
      companyId,
      itemsCount: items.length,
      items: items.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        costPerUnit: item.costPerUnit
      })),
      paymentAmount,
      totalAmount,
      notes
    })

    if (!companyId) {
      console.log('❌ No company selected')
      setError("Please select a supplier. If no suppliers are available, please add one first.")
      setIsSubmitting(false)
      return
    }

    if (items.length === 0) {
      console.log('❌ No items added')
      setError(t("addItems"))
      setIsSubmitting(false)
      return
    }

    const payment = Number(paymentAmount)
    if (payment > totalAmount) {
      console.log('❌ Payment exceeds total:', { payment, totalAmount })
      setError(t("paymentExceedsTotal"))
      setIsSubmitting(false)
      return
    }

    console.log('✅ Form validation passed')
    const supabase = createClient()
    console.log('🔌 Supabase client created:', !!supabase)

    try {
      // Create inventory purchase record
      console.log('📦 Creating inventory purchase...')
      const purchaseData = {
        company_id: companyId,
        total_amount: totalAmount,
        paid_amount: payment || 0,
        notes: notes || null
      }
      console.log('Purchase data:', purchaseData)
      
      const { data: purchase, error: purchaseError } = await supabase
        .from("inventory_purchases")
        .insert([purchaseData])
        .select()
        .single()

      if (purchaseError) {
        console.error('❌ Purchase creation error:', purchaseError)
        throw purchaseError
      }

      console.log('✅ Purchase created successfully:', purchase)

      // Create items records
      console.log('📋 Creating purchase items...')
      const purchaseId = purchase.id
      const itemsData = items.map(item => ({
        purchase_id: purchaseId,
        product_id: item.productId,
        quantity: item.quantity,
        cost_per_unit: item.costPerUnit
      }))
      console.log('Items data:', itemsData)
      
      const { error: itemsError } = await supabase
        .from("inventory_purchase_items")
        .insert(itemsData)

      if (itemsError) {
        console.error('❌ Purchase items creation error:', itemsError)
        throw itemsError
      }

      console.log('✅ Purchase items created successfully')

      // Calculate payment per item (proportional distribution)
      const paymentPerItem = payment > 0 ? (payment / items.length) : 0
      console.log('💰 Payment calculation:', { payment, itemsCount: items.length, paymentPerItem })

      // Update product costs and quantities, and create inventory transactions
      console.log('🔄 Processing items for stock update and transactions...')
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        console.log(`\n📦 Processing item ${i + 1}/${items.length}:`, {
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          costPerUnit: item.costPerUnit,
          currentStock: item.product.stock_quantity
        })

        // Update product stock
        console.log('📈 Updating product stock...')
        const { error: updateError } = await supabase
          .from("products")
          .update({
            stock_quantity: item.product.stock_quantity + item.quantity,
            cost: item.costPerUnit // Update to latest cost
          })
          .eq("id", item.productId)

        if (updateError) {
          console.error('❌ Product update error:', updateError)
          throw updateError
        }
        console.log('✅ Product stock updated successfully')

        // Create inventory transaction record with proper payment tracking
        console.log('🔄 Creating inventory transaction...')
        
        const itemTotal = item.quantity * item.costPerUnit
        const itemPaidAmount = paymentPerItem
        
        const transactionData = {
          product_id: item.productId,
          quantity_change: item.quantity,
          reference_id: purchaseId,
          notes: `Purchase from ${selectedCompany?.name || 'Unknown Supplier'}`,
          total_price: itemTotal,
          amount_paid: itemPaidAmount
        }
        
        console.log('Transaction data:', transactionData)
        
        const { data: insertedTransaction, error: transactionError } = await supabase
          .from("inventory_transactions")
          .insert([transactionData])
          .select()

        if (transactionError) {
          console.error('❌ Transaction error details:', {
            message: transactionError.message,
            details: transactionError.details,
            hint: transactionError.hint,
            code: transactionError.code
          })
          throw transactionError
        }
        console.log('✅ Transaction created successfully:', insertedTransaction[0])
      }

      // Create company transaction for the payment if any
      if (payment > 0) {
        console.log('💳 Creating company transaction for payment...')
        const companyTransactionData = {
          company_id: companyId,
          amount: -payment, // Negative because it's a payment to the company
          purchase_id: purchaseId,
          payment_method: "cash",
          notes: "Payment for inventory purchase",
          balance_after: selectedCompany.balance + (totalAmount - payment) // Update balance
        }
        console.log('Company transaction data:', companyTransactionData)
        
        const { error: transactionError } = await supabase
          .from("company_transactions")
          .insert([companyTransactionData])

        if (transactionError) {
          console.error('❌ Company transaction error:', transactionError)
          throw transactionError
        }
        console.log('✅ Company transaction created successfully')
      }

      console.log('🎉 PURCHASE COMPLETED SUCCESSFULLY!')
      console.log('📊 Final summary:', {
        purchaseId,
        totalAmount,
        payment,
        itemsProcessed: items.length,
        transactionsCreated: items.length
      })

      router.push("/dashboard/inventory/purchases")
      router.refresh()
    } catch (error: any) {
      console.error('💥 PURCHASE FAILED:', error)
      setError(error.message)
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("newInventoryPurchase")}</CardTitle>
            <CardDescription>
              {t("createInventoryPurchaseDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Company/Supplier Selection */}
            <div className="space-y-2">
              <Label>{t("supplier")}</Label>
              {companies.length === 0 ? (
                <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    No suppliers available. Please add a supplier first before creating purchases.
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => window.open('/dashboard/companies/new', '_blank')}
                  >
                    Add Supplier
                  </Button>
                </div>
              ) : (
                <CompanySearch
                  companies={companies}
                  value={companyId}
                  onValueChange={setCompanyId}
                />
              )}
            </div>

            {/* Item Addition Form */}
            <div className="space-y-2 rounded-lg border p-4">
              <Label>{t("addItems")}</Label>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="md:col-span-2">
                  <ProductSearch
                    products={products}
                    value={selectedProduct}
                    onValueChange={setSelectedProduct}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder={t("quantity")}
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={t("purchaseCostPerUnit")}
                    value={costPerUnit}
                    onChange={e => setCostPerUnit(e.target.value)}
                  />
                </div>
              </div>
              <Button type="button" onClick={handleAddItem} className="mt-2">
                {t("add")}
              </Button>
            </div>

            {/* Items List */}
            {items.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">{t("items")}</h4>
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg border p-2">
                      <div className="space-y-1">
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {t("quantity")}: {item.quantity} × {formatCurrency(item.costPerUnit)} = {formatCurrency(item.quantity * item.costPerUnit)}
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => removeItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-medium">{t("total")}:</span>
                  <Badge variant="secondary" className="ml-2">
                    {formatCurrency(totalAmount)}
                  </Badge>
                </div>
              </div>
            )}

            {/* Payment Amount */}
            <div className="space-y-2">
              <Label htmlFor="payment">{t("purchasePaymentAmount")}</Label>
              <Input
                id="payment"
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">{t("purchaseNotes")}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-sm font-medium text-destructive">{error}</div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button variant="outline" type="button" asChild>
                <a href="/dashboard/inventory/purchases">{t("cancel")}</a>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("purchaseCreating") : t("createPurchase")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}

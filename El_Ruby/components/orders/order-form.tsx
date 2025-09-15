"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { CustomerSearch } from "./customer-search"
import { ProductSearch } from "./product-search"
import { PaymentSection } from "./payment-section"
import { useLanguage } from "@/lib/language-context"
import { Customer, Product, Payment as DatabasePayment } from "@/types/database"

interface OrderItem {
  id?: string
  order_id?: string
  product_id: string
  quantity: number
  unit_price: number
  total_price?: number
  total_amount?: number
  quantity_change?: number
}

interface Payment {
  id: string
  amount: number
  method: 'cash' | 'customer_balance' | 'credit_card' | 'debit_card'
}

interface OrderFormProps {
  customers: Customer[]
  products: Product[]
  preselectedCustomerId?: string // Added prop for preselected customer
}

export function OrderForm({ customers, products, preselectedCustomerId }: OrderFormProps) {
  const [customerId, setCustomerId] = useState<string>("walk-in")
  const [notes, setNotes] = useState("")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [payments, setPayments] = useState<Payment[]>([{ id: "1", amount: 0, method: "cash" }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false)
  const [newCustomerData, setNewCustomerData] = useState({
    name: "",
    phone: "",
    balance: "0",
    notes: "",
  })
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false)
  const [customersList, setCustomersList] = useState<Customer[]>(customers)

  const [showNewProductDialog, setShowNewProductDialog] = useState(false)
  const [newProductData, setNewProductData] = useState({
    name: "",
    description: "",
    price: "",
    cost: "",
    stock_quantity: "0",
    low_stock_threshold: "10",
    category: "",
    supplier: "",
  })
  const [isCreatingProduct, setIsCreatingProduct] = useState(false)
  const [productsList, setProductsList] = useState<Product[]>(products)
  const [activeOrderItemIndex, setActiveOrderItemIndex] = useState<number | null>(null)

  const router = useRouter()

  const { t, isRTL } = useLanguage()

  // Helper function to handle Supabase operations with type safety
  const executeSupabaseOperation = async (operation: string, table: string, data?: any, options?: any) => {
    const supabase = createClient()
    if (!supabase) return { error: new Error("Database connection failed") }

    try {
      const tableRef = supabase.from(table)

      switch (operation) {
        case 'insert': {
          const result = await tableRef.insert(data).select('*')
          return { data: result.data?.[0], error: result.error }
        }
        case 'update': {
          if (!options?.column) {
            return { error: new Error("Missing column for update operation") }
          }
          const result = await tableRef.update(data).eq(options.column, options.value)
          return { data: result.data?.[0], error: result.error }
        }
        default:
          return { error: new Error("Invalid operation") }
      }
    } catch (error: any) {
      return { error: new Error(error.message || "Operation failed") }
    }
  }

  useEffect(() => {
    if (preselectedCustomerId && customers.find((c) => c.id === preselectedCustomerId)) {
      setCustomerId(preselectedCustomerId)
    }
  }, [preselectedCustomerId, customers])

  const handleCreateProduct = async () => {
    if (!newProductData.name.trim()) {
      setError(t("productNameRequired"))
      return
    }

    if (!newProductData.price || Number.parseFloat(newProductData.price) <= 0) {
      setError(t("validPriceRequired"))
      return
    }

    setIsCreatingProduct(true)
    setError(null)

    const supabase = createClient()

    if (!supabase || typeof supabase.from !== "function") {
      setError(t("databaseUnavailable"))
      setIsCreatingProduct(false)
      return
    }

    try {
      const productData = {
        name: newProductData.name.trim(),
        description: newProductData.description.trim() || null,
        price: Number.parseFloat(newProductData.price),
        cost: Number.parseFloat(newProductData.cost) || 0,
        stock_quantity: Number.parseInt(newProductData.stock_quantity) || 0,
        low_stock_threshold: Number.parseInt(newProductData.low_stock_threshold) || 10,
        category: newProductData.category.trim() || null,
        supplier: newProductData.supplier.trim() || null,
      }

      const productQuery = supabase.from("products")

      // Handle both real and mock Supabase clients
      let productResult
      if ('insert' in productQuery) {
        productResult = await (productQuery as any).insert([productData]).select().single()
      } else {
        // Mock response for development
        productResult = {
          data: {
            id: Math.random().toString(36).substr(2, 9),
            ...productData
          },
          error: null
        }
      }

      const { data: product, error: productError } = productResult

      if (productError) throw productError

      const newProduct: Product = {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        cost: product.cost || 0,
        stock_quantity: product.stock_quantity,
        low_stock_threshold: product.low_stock_threshold || 10,
        category: product.category,
        supplier: product.supplier,
      }
      setProductsList([...productsList, newProduct])

      if (activeOrderItemIndex !== null) {
        updateOrderItem(activeOrderItemIndex, "product_id", product.id)
      }

      setNewProductData({
        name: "",
        description: "",
        price: "",
        cost: "",
        stock_quantity: "0",
        low_stock_threshold: "10",
        category: "",
        supplier: "",
      })
      setShowNewProductDialog(false)
      setActiveOrderItemIndex(null)
    } catch (error: any) {
      setError(error.message || t("createProductFailed"))
    } finally {
      setIsCreatingProduct(false)
    }
  }

  const handleCreateCustomer = async () => {
    if (!newCustomerData.name.trim()) {
      setError(t("customerNameRequired"))
      return
    }

    setIsCreatingCustomer(true)
    setError(null)

    const supabase = createClient()

    if (!supabase || typeof supabase.from !== "function") {
      setError(t("databaseUnavailable"))
      setIsCreatingCustomer(false)
      return
    }

    try {
      const customerData = {
        name: newCustomerData.name.trim(),
        phone: newCustomerData.phone.trim() || null,
        balance: Number.parseFloat(newCustomerData.balance) || 0,
        notes: newCustomerData.notes.trim() || null,
      }

      const { data: customer, error: customerError } = await executeSupabaseOperation('insert', 'customers', [customerData])

      if (customerError) throw customerError

      const newCustomer: Customer = {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        balance: customer.balance,
        notes: customer.notes,
      }
      setCustomersList([...customersList, newCustomer])
      setCustomerId(customer.id)

      setNewCustomerData({ name: "", phone: "", balance: "0", notes: "" })
      setShowNewCustomerDialog(false)
    } catch (error: any) {
      setError(error.message || "Failed to create customer")
    } finally {
      setIsCreatingCustomer(false)
    }
  }

  const addOrderItem = () => {
    setOrderItems([...orderItems, { product_id: "", quantity: 1, unit_price: 0 }])
  }

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const updateOrderItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const updatedItems = [...orderItems]
    if (field === "product_id" && typeof value === "string") {
      const product = productsList.find((p) => p.id === value)
      if (product) {
        // Check if product is out of stock
        if (product.stock_quantity <= 0) {
          setError(t("productOutOfStock").replace("{productName}", product.name))
          return
        }

        updatedItems[index] = {
          ...updatedItems[index],
          product_id: value,
          unit_price: product.price,
          quantity: Math.min(updatedItems[index].quantity || 1, product.stock_quantity), // Limit quantity to available stock
        }
        setError("") // Clear any previous errors
      }
    } else if (field === "quantity" && typeof value === "number") {
      const product = productsList.find((p) => p.id === updatedItems[index].product_id)
      if (product) {
        // Validate quantity against stock
        if (value <= 0) {
          setError(`Quantity must be greater than 0`)
          return
        }
        if (value > product.stock_quantity) {
          setError(`Cannot set quantity to ${value} for ${product.name}. Only ${product.stock_quantity} available in stock`)
          return
        }
        updatedItems[index] = { ...updatedItems[index], [field]: value }
        setError("") // Clear error if validation passes
      } else {
        updatedItems[index] = { ...updatedItems[index], [field]: value }
      }
    } else {
      updatedItems[index] = { ...updatedItems[index], [field]: value }
    }
    setOrderItems(updatedItems)
  }

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + item.quantity * item.unit_price, 0)
  }

  const hasStockIssues = () => {
    return orderItems.some((item) => {
      const product = productsList.find((p) => p.id === item.product_id)
      if (!product) return true // No product selected
      return product.stock_quantity <= 0 || item.quantity > product.stock_quantity || item.quantity <= 0
    })
  }

  const selectedCustomer = customersList.find((c) => c.id === customerId)
  const orderTotal = calculateTotal()
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const remainingBalance = orderTotal - totalPaid

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (orderItems.length === 0) {
      setError(t("addAtLeastOneItem"))
      setIsSubmitting(false)
      return
    }

    // Validate stock availability for each item
    for (const item of orderItems) {
      const product = productsList.find((p) => p.id === item.product_id)
      if (!product) {
        setError(`Product not found for order item`)
        setIsSubmitting(false)
        return
      }

      // Check if product is out of stock
      if (product.stock_quantity <= 0) {
        setError(t("productOutOfStockDetails").replace("{productName}", product.name))
        setIsSubmitting(false)
        return
      }

      // Check if requested quantity exceeds available stock
      if (item.quantity <= 0) {
        setError(`Invalid quantity for ${product.name}. Quantity must be greater than 0`)
        setIsSubmitting(false)
        return
      }

      if (product.stock_quantity < item.quantity) {
        setError(t("insufficientStock")
          .replace("{productName}", product.name)
          .replace("{available}", product.stock_quantity.toString())
          .replace("{requested}", item.quantity.toString()))
        setIsSubmitting(false)
        return
      }
    }

    if (totalPaid <= 0) {
      // Only require payment for walk-in customers
      if (customerId === "walk-in") {
        setError(t("walkInCustomerMustPay"))
        setIsSubmitting(false)
        return
      }
      // Registered customers can have $0 payment (partial orders)
    } else if (customerId === "walk-in" && totalPaid < orderTotal) {
      // Walk-in customers must pay the full amount
      setError(t("walkInCustomerMustPayFull"))
      setIsSubmitting(false)
      return
    }

    // Validate customer balance payments
    const customerBalancePayments = payments.filter((p) => p.method === "customer_balance")
    const totalCustomerBalancePayment = customerBalancePayments.reduce((sum, p) => sum + p.amount, 0)

    if (customerBalancePayments.length > 0 && customerId === "walk-in") {
      setError(t("customerBalanceRequiresCustomer"))
      setIsSubmitting(false)
      return
    }

    const supabase = createClient()

    if (!supabase || typeof supabase.from !== "function") {
      setError(t("databaseUnavailable"))
      setIsSubmitting(false)
      return
    }

    try {
      const cashPaid = payments.filter((p) => p.method === "cash").reduce((sum, payment) => sum + payment.amount, 0)
      const balanceUsed = payments
        .filter((p) => p.method === "customer_balance")
        .reduce((sum, payment) => sum + payment.amount, 0)
      const remainingAfterBalance = orderTotal - balanceUsed
      const cashOverpayment = Math.max(0, cashPaid - remainingAfterBalance)
      const cashShortfall = Math.max(0, remainingAfterBalance - cashPaid)

      // Update customer balance with proper logic
      if (customerId !== "walk-in" && selectedCustomer) {
        const currentBalance = selectedCustomer.balance || 0
        const newBalance = currentBalance - balanceUsed + cashOverpayment - cashShortfall

        const { error: balanceError } = await executeSupabaseOperation('update', 'customers', { balance: newBalance }, { column: 'id', value: customerId })

        if (balanceError) throw balanceError
      }

      // Create the order
      const orderData = {
        customer_id: customerId === "walk-in" ? null : customerId,
        order_number: "", // Will be auto-generated by trigger
        total_amount: orderTotal,
        paid_amount: totalPaid,
        notes: notes.trim() || null,
      }

      const { data: order, error: orderError } = await executeSupabaseOperation('insert', 'orders', [orderData])

      if (orderError) throw orderError

      // Create order items
      const orderItemsData = orderItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price, // Changed from total_amount to total_price
      }))

      const { error: itemsError } = await executeSupabaseOperation('insert', 'order_items', orderItemsData)

      if (itemsError) throw itemsError

      // Reduce stock quantities for each product and create inventory transactions
      for (const item of orderItems) {
        const product = productsList.find((p) => p.id === item.product_id)
        if (product) {
          const newStock = Math.max(0, product.stock_quantity - item.quantity)
          const { error: stockError } = await executeSupabaseOperation('update', 'products',
            { stock_quantity: newStock },
            { column: 'id', value: item.product_id }
          )
          if (stockError) throw stockError

          // Create inventory transaction for the sale
          console.log('Creating inventory transaction for sale - product:', item.product_id, 'quantity:', -item.quantity)
          const { error: transactionError } = await executeSupabaseOperation('insert', 'inventory_transactions', [{
            product_id: item.product_id,
            quantity_change: -item.quantity, // Negative for sales
            notes: `Sale - Order ${order.order_number || order.id}`,
            total_price: item.quantity * item.unit_price,
            amount_paid: 0 // Individual item transactions don't track payment
          }])
          if (transactionError) {
            console.error('Sale transaction error:', transactionError)
            throw transactionError
          }
          console.log('Sale transaction created successfully')
        }
      }

      // Create payment records with individual payment methods
      // Insert payments one at a time to avoid coercion issues with triggers
      for (const payment of payments.filter(p => p.amount > 0)) {
        const paymentData = {
          order_id: order.id,
          customer_id: customerId === "walk-in" ? null : customerId,
          amount: payment.amount,
          payment_method: payment.method,
          notes: null,
        };

        // Insert a single payment at a time
        const { error: paymentError } = await executeSupabaseOperation('insert', 'payments', paymentData)
        if (paymentError) {
          console.error('Payment insertion error:', paymentError);
          throw new Error(paymentError.message || 'Failed to process payment');
        }
      }

      if (customerId !== "walk-in" && selectedCustomer) {
        const totalAmountPaid = payments.reduce((sum, p) => sum + p.amount, 0)
        const currentBalance = selectedCustomer.balance || 0
        const newBalance = currentBalance - balanceUsed + cashOverpayment - cashShortfall

        const { error: transactionError } = await executeSupabaseOperation('insert', 'customer_transactions', [
          {
            customer_id: customerId,
            order_id: order.id,
            invoice_number: order.order_number || `ORD-${order.id}`,
            transaction_date: new Date().toISOString(),
            amount_paid: totalAmountPaid,
            balance_after: newBalance,
            payment_method: payments.map((p) => p.method).join(", "),
            transaction_type: "order",
            description: `Order ${order.order_number || order.id}`,
          },
        ])

        if (transactionError) throw transactionError
      }

      setCustomerId("walk-in")
      setNotes("")
      setOrderItems([])
      setPayments([{ id: "1", amount: 0, method: "cash" }])
      setError(null)

      router.push(`/dashboard/orders/${order.id}`)
    } catch (error: any) {
      setError(error.message || "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
    }).format(amount)
  }

  // Check if submit should be disabled
  const isSubmitDisabled = () => {
    if (isSubmitting || orderItems.length === 0 || hasStockIssues()) {
      return true
    }

    // For walk-in customers, require payment
    if (customerId === "walk-in" && totalPaid <= 0) {
      return true
    }

    // For walk-in customers, require full payment
    if (customerId === "walk-in" && totalPaid < orderTotal) {
      return true
    }

    // Registered customers can submit with any payment amount (including $0)
    return false
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("selectCustomer")}</CardTitle>
              <CardDescription>{t("walkInCustomer")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">{t("selectCustomer")}</Label>
                  <CustomerSearch
                    customers={customersList}
                    value={customerId}
                    onValueChange={setCustomerId}
                    onAddCustomer={() => setShowNewCustomerDialog(true)}
                  />
                </div>
                {selectedCustomer && selectedCustomer.balance !== undefined && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{t("customerBalance")}:</span>
                      <span className="text-green-600">{formatCurrency(selectedCustomer.balance)}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("searchProducts")}</CardTitle>
                  <CardDescription>{t("addProductsToOrder")}</CardDescription>
                </div>
                <Button type="button" onClick={addOrderItem} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("addItem")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderItems.map((item, index) => {
                  const product = productsList.find((p) => p.id === item.product_id)
                  return (
                    <div key={index} className="flex items-end gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <Label>{t("product")}</Label>
                        <ProductSearch
                          products={productsList}
                          value={item.product_id}
                          onValueChange={(value) => updateOrderItem(index, "product_id", value)}
                          onAddProduct={() => {
                            setActiveOrderItemIndex(index)
                            setShowNewProductDialog(true)
                          }}
                        />
                        {product && (
                          <>
                            {product.stock_quantity <= 0 ? (
                              <p className="text-sm text-destructive font-semibold mt-1">⚠️ {t("outOfStock")}</p>
                            ) : product.stock_quantity < item.quantity ? (
                              <p className="text-sm text-destructive mt-1">⚠️ {t("onlyInStock").replace("%1", product.stock_quantity.toString())}</p>
                            ) : product.stock_quantity <= 5 ? (
                              <p className="text-sm text-orange-600 mt-1">⚠️ {t("lowStock")}: {product.stock_quantity} {t("left")}</p>
                            ) : null}
                          </>
                        )}
                      </div>
                      <div className="w-24">
                        <Label>{t("quantity")}</Label>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const value = e.target.value
                            const numValue = Number.parseInt(value) || 0
                            const product = productsList.find((p) => p.id === item.product_id)

                            // Allow empty input for editing, but validate on blur
                            if (value === "") {
                              updateOrderItem(index, "quantity", 0)
                            } else if (numValue > 0) {
                              if (!product) {
                                // No product selected yet, allow any positive number
                                updateOrderItem(index, "quantity", numValue)
                              } else if (numValue <= product.stock_quantity) {
                                // Valid quantity within stock limits
                                updateOrderItem(index, "quantity", numValue)
                              }
                              // If numValue > stock, don't update (prevents typing invalid quantities)
                            }
                          }}
                          onBlur={(e) => {
                            const numValue = Number.parseInt(e.target.value) || 0
                            if (numValue === 0) {
                              updateOrderItem(index, "quantity", 1) // Default to 1 if empty
                            }
                          }}
                          placeholder="1"
                        />
                      </div>
                      <div className="w-32">
                        <Label>{t("price")}</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateOrderItem(index, "unit_price", Number.parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="w-32">
                        <Label>{t("total")}</Label>
                        <div className="h-10 flex items-center font-medium">
                          {formatCurrency(item.quantity * item.unit_price)}
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeOrderItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
                {orderItems.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {t("noItemsAddedYet")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("orderSummary")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t("items")} ({orderItems.length})</span>
                  <span>{formatCurrency(orderTotal)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>{t("total")}</span>
                  <span>{formatCurrency(orderTotal)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t("notes")}</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("orderNotesOptional")}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <PaymentSection
            orderTotal={orderTotal}
            payments={payments}
            onPaymentsChange={setPayments}
            customerBalance={selectedCustomer?.balance}
            customerId={customerId}
          />

          {error && <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-lg">{error}</div>}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitDisabled()}
              className="flex-1"
            >
              {isSubmitting ? t("processing") : remainingBalance <= 0.01 ? t("createOrder") : t("createPartialOrder")}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/orders">{t("cancel")}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Customer Dialog */}
      <Dialog open={showNewCustomerDialog} onOpenChange={setShowNewCustomerDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("createNewCustomer")}</DialogTitle>
            <DialogDescription>
              {t("quicklyAddWalkInCustomer")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-customer-name">{t("customerName")} *</Label>
              <Input
                id="new-customer-name"
                value={newCustomerData.name}
                onChange={(e) => setNewCustomerData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder={t("customerName")}
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-customer-phone">{t("customerPhone")}</Label>
                <Input
                  id="new-customer-phone"
                  value={newCustomerData.phone}
                  onChange={(e) => setNewCustomerData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder={t("phonePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-customer-balance">{t("balance")}</Label>
                <Input
                  id="new-customer-balance"
                  type="number"
                  step="0.01"
                  value={newCustomerData.balance}
                  onChange={(e) => setNewCustomerData((prev) => ({ ...prev, balance: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-customer-notes">{t("notes")}</Label>
              <Textarea
                id="new-customer-notes"
                value={newCustomerData.notes}
                onChange={(e) => setNewCustomerData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder={t("notes")}
                rows={2}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowNewCustomerDialog(false)}>
                {t("cancel")}
              </Button>
              <Button
                type="button"
                onClick={handleCreateCustomer}
                disabled={isCreatingCustomer || !newCustomerData.name.trim()}
              >
                {isCreatingCustomer ? t("adding") : t("addCustomer")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={showNewProductDialog} onOpenChange={setShowNewProductDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("createNewProduct")}</DialogTitle>
            <DialogDescription>{t("quicklyAddProduct")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-product-name">{t("productName")} *</Label>
                <Input
                  id="new-product-name"
                  value={newProductData.name}
                  onChange={(e) => setNewProductData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={t("productName")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-product-cost">{t("cost")}</Label>
                <Input
                  id="new-product-cost"
                  type="number"
                  step="0.01"
                  value={newProductData.cost}
                  onChange={(e) => setNewProductData((prev) => ({ ...prev, cost: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-product-description">{t("description")}</Label>
              <Textarea
                id="new-product-description"
                value={newProductData.description}
                onChange={(e) => setNewProductData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder={t("description")}
                rows={2}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-product-supplier">{t("supplier")}</Label>
                <Input
                  id="new-product-supplier"
                  value={newProductData.supplier}
                  onChange={(e) => setNewProductData((prev) => ({ ...prev, supplier: e.target.value }))}
                  placeholder={t("supplier")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-product-category">{t("category")}</Label>
                <Input
                  id="new-product-category"
                  value={newProductData.category}
                  onChange={(e) => setNewProductData((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder={t("category")}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-product-price">{t("price")} *</Label>
                <Input
                  id="new-product-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newProductData.price}
                  onChange={(e) => setNewProductData((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-product-stock">{t("stockQuantity")}</Label>
                <Input
                  id="new-product-stock"
                  type="number"
                  min="0"
                  value={newProductData.stock_quantity}
                  onChange={(e) => setNewProductData((prev) => ({ ...prev, stock_quantity: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-product-threshold">{t("lowStock")}</Label>
                <Input
                  id="new-product-threshold"
                  type="number"
                  min="0"
                  value={newProductData.low_stock_threshold}
                  onChange={(e) => setNewProductData((prev) => ({ ...prev, low_stock_threshold: e.target.value }))}
                  placeholder="10"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowNewProductDialog(false)
                  setActiveOrderItemIndex(null)
                }}
              >
                {t("cancel")}
              </Button>
              <Button
                type="button"
                onClick={handleCreateProduct}
                disabled={isCreatingProduct || !newProductData.name.trim() || !newProductData.price}
              >
                {isCreatingProduct ? t("adding") : t("addProduct")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  )
}

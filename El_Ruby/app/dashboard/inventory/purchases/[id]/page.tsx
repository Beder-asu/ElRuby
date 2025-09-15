"use client"

import { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { useLanguage } from "@/lib/language-context"

interface PurchaseDetails {
  id: string
  company: {
    name: string
  }
  total_amount: number
  paid_amount: number
  status: string
  notes: string
  created_at: string
  items: {
    id: string
    product: {
      name: string
    }
    quantity: number
    cost_per_unit: number
  }[]
  transactions: {
    id: string
    amount: number
    payment_method: string
    notes: string
    created_at: string
  }[]
}

export default function PurchaseDetailsPage({ params }: { params: { id: string } }) {
  const { t } = useLanguage()
  const [purchase, setPurchase] = useState<PurchaseDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPurchase() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("inventory_purchases")
        .select(`
          id,
          company:company_id(name),
          total_amount,
          paid_amount,
          status,
          notes,
          created_at,
          items:inventory_purchase_items(
            id,
            product:product_id(name),
            quantity,
            cost_per_unit
          ),
          transactions:company_transactions(
            id,
            amount,
            payment_method,
            notes,
            created_at
          )
        `)
        .eq("id", params.id)
        .single()

      if (error || !data) {
        notFound()
      }

      setPurchase(data)
      setLoading(false)
    }

    loadPurchase()
  }, [params.id])

  if (loading) {
    return <div>{t("loading")}</div>
  }

  if (!purchase) {
    return notFound()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success"
      case "partially_paid":
        return "warning"
      default:
        return "secondary"
    }
  }

  const remaining = purchase.total_amount - purchase.paid_amount

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {t("purchaseDetails")} - {purchase.company?.name || t("unknownSupplier")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2">{t("purchaseInfo")}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{t("totalAmount")}:</span>
                  <span>{purchase.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("paidAmount")}:</span>
                  <span>{purchase.paid_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("remainingAmount")}:</span>
                  <span>{remaining.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{t("status")}:</span>
                  <Badge variant={getStatusColor(purchase.status)}>
                    {t(purchase.status === "completed" ? "purchaseFullyPaid" :
                       purchase.status === "partially_paid" ? "purchasePartiallyPaid" : "pending")}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>{t("date")}:</span>
                  <span>{format(new Date(purchase.created_at), "PPP")}</span>
                </div>
                {purchase.notes && (
                  <div>
                    <span className="font-medium">{t("notes")}:</span>
                    <p className="mt-1 text-muted-foreground">{purchase.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">{t("items")}</h3>
              <div className="space-y-2">
                {purchase.items.map((item) => (
                  <div key={item.id} className="flex justify-between p-2 rounded-lg border">
                    <div>
                      <div>{item.product?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.quantity} x {item.cost_per_unit.toFixed(2)}
                      </div>
                    </div>
                    <div className="font-medium">
                      {(item.quantity * item.cost_per_unit).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {purchase.transactions.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium mb-2">{t("paymentHistory")}</h3>
              <div className="space-y-2">
                {purchase.transactions.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between p-2 rounded-lg border">
                    <div>
                      <div>{t(transaction.payment_method)}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(transaction.created_at), "PPP")}
                      </div>
                      {transaction.notes && (
                        <div className="text-sm text-muted-foreground">{transaction.notes}</div>
                      )}
                    </div>
                    <div className="font-medium">{transaction.amount.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

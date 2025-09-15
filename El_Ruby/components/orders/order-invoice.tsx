"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Printer, Download } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

interface OrderInvoiceProps {
  order: {
    id: string
    order_number: string
    total_amount: number
    status?: string
    payment_method?: string | null
    notes?: string | null
    created_at: string
    customers?: {
      id: string
      name: string
      phone?: string | null
      balance?: number
    } | null
    order_items?: Array<{
      id: string
      quantity: number
      unit_price?: number
      total_price?: number
      products?: {
        id: string
        name: string
      } | null
    }>
  }
  payments: Array<{
    id: string
    amount: number
    payment_method: string
  }>
  customerTransactions: Array<{
    id: string
    invoice_number: string
    transaction_date: string
    amount_paid: number
    balance_after: number
    payment_method: string
  }>
}

export function OrderInvoice({ order, payments, customerTransactions }: OrderInvoiceProps) {
  const { t, language, isRTL } = useLanguage()
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const locale = language === 'ar' ? 'ar-EG' : 'en-US'
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusBadge = (order: OrderInvoiceProps['order']) => {
    // Calculate payment status from total_amount and paid_amount since status field doesn't exist
    const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0)
    if (paidAmount >= order.total_amount) {
      return <Badge className="bg-green-100 text-green-800">{t("completed")}</Badge>
    } else if (paidAmount > 0) {
      return <Badge className="bg-blue-100 text-blue-800">{t("partialPayment")}</Badge>
    } else {
      return <Badge variant="secondary">{t("unpaid")}</Badge>
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("invoice")}</h1>
          <p className="text-muted-foreground">Order #{order.order_number}</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            {t("print")}
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {t("downloadPdf")}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-primary">{t("businessName")}</h2>
              <p className="text-muted-foreground">{t("businessTagline")}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{order.order_number}</div>
              <div className="text-muted-foreground">{t("date")}: {formatDate(order.created_at)}</div>
              <div className="mt-2">{getStatusBadge(order)}</div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-2">{t("customer")}:</h3>
              {order.customers ? (
                <div className="text-sm space-y-1">
                  <div className="font-medium">{order.customers.name}</div>
                  {order.customers.phone && <div>{order.customers.phone}</div>}
                  <div className="mt-2 p-2 bg-muted rounded">
                    <span className="font-medium">{t("balance")}: </span>
                    <span className={(order.customers.balance || 0) >= 0 ? "text-green-600" : "text-red-600"}>
                      {formatCurrency(order.customers.balance || 0)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">{t("walkInCustomer")}</div>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t("payment")}:</h3>
              <div className="text-sm space-y-2">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex justify-between p-2 bg-muted rounded">
                    <span className="capitalize">{payment.payment_method.replace("_", " ")}:</span>
                    <span className="font-medium">{formatCurrency(payment.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>{t("totalPaid")}:</span>
                  <span>{formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <h3 className="font-semibold mb-4">{t("items")}:</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className={`p-3 ${isRTL ? 'text-right' : 'text-left'}`}>{t("product")}</th>
                    <th className={`p-3 ${isRTL ? 'text-left' : 'text-right'}`}>{t("quantity")}</th>
                    <th className={`p-3 ${isRTL ? 'text-left' : 'text-right'}`}>{t("price")}</th>
                    <th className={`p-3 ${isRTL ? 'text-left' : 'text-right'}`}>{t("total")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.order_items || []).map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className={`p-3 ${isRTL ? 'text-right' : 'text-left'}`}>{item.products?.name || "-"}</td>
                      <td className={`p-3 ${isRTL ? 'text-left' : 'text-right'}`}>{item.quantity}</td>
                      <td className={`p-3 ${isRTL ? 'text-left' : 'text-right'}`}>{formatCurrency(item.unit_price || 0)}</td>
                      <td className={`p-3 ${isRTL ? 'text-left' : 'text-right'} font-medium`}>{formatCurrency(item.total_price || 0)}</td>
                    </tr>
                  ))}
                  {(!order.order_items || order.order_items.length === 0) && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-muted-foreground">
                        No items found for this order
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payments */}
          {payments.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold mb-4">{t("paymentHistory")}:</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className={`p-3 ${isRTL ? 'text-right' : 'text-left'}`}>{t("paymentMethod")}</th>
                      <th className={`p-3 ${isRTL ? 'text-left' : 'text-right'}`}>{t("amount")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-t">
                        <td className={`p-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                          {payment.payment_method === 'cash' ? t("cash") :
                            payment.payment_method === 'customer_balance' ? t("customerBalance") :
                              payment.payment_method}
                        </td>
                        <td className={`p-3 font-medium ${isRTL ? 'text-left' : 'text-right'}`}>
                          {formatCurrency(payment.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Order Total */}
          <div className="flex justify-end">
            <div className="w-64">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{t("total")}:</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>{t("amountPaid")}:</span>
                  <span>{formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}</span>
                </div>
                {(() => {
                  const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0)
                  const remainingAmount = order.total_amount - paidAmount
                  return remainingAmount > 0 ? (
                    <div className="flex justify-between text-red-600 font-semibold border-t pt-2">
                      <span>{t("remainingAmount")}:</span>
                      <span>{formatCurrency(remainingAmount)}</span>
                    </div>
                  ) : null
                })()}
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="mt-8 pt-8 border-t">
              <h3 className="font-semibold mb-2">Notes:</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{order.notes}</p>
            </div>
          )}

          {/* Customer Transaction History */}
          {order.customers && customerTransactions.length > 0 && (
            <div className="mt-8 pt-8 border-t">
              <h3 className="font-semibold mb-4">{t("transactions")}:</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className={`p-3 ${isRTL ? 'text-right' : 'text-left'}`}>{t("orderHash")}</th>
                      <th className={`p-3 ${isRTL ? 'text-right' : 'text-left'}`}>{t("date")}</th>
                      <th className={`p-3 ${isRTL ? 'text-left' : 'text-right'}`}>{t("amountPaid")}</th>
                      <th className={`p-3 ${isRTL ? 'text-left' : 'text-right'}`}>{t("balance")}</th>
                      <th className={`p-3 ${isRTL ? 'text-right' : 'text-left'}`}>{t("paymentMethod")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerTransactions.slice(0, 10).map((transaction) => (
                      <tr key={transaction.id} className="border-t">
                        <td className={`p-3 font-mono ${isRTL ? 'text-right' : 'text-left'}`}>{transaction.invoice_number}</td>
                        <td className={`p-3 ${isRTL ? 'text-right' : 'text-left'}`}>{formatDate(transaction.transaction_date)}</td>
                        <td className={`p-3 ${isRTL ? 'text-left' : 'text-right'}`}>{formatCurrency(transaction.amount_paid)}</td>
                        <td
                          className={`p-3 ${isRTL ? 'text-left' : 'text-right'} ${transaction.balance_after >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatCurrency(transaction.balance_after)}
                        </td>
                        <td className={`p-3 capitalize ${isRTL ? 'text-right' : 'text-left'}`}>{transaction.payment_method.replace("_", " ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>Thank you for your business!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

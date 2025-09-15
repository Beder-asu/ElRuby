"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus, AlertTriangle, DollarSign } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

interface Payment {
  id: string
  amount: number
  method: 'cash' | 'customer_balance' | 'credit_card' | 'debit_card'
}

interface PaymentSectionProps {
  orderTotal: number
  payments: Payment[]
  onPaymentsChange: (payments: Payment[]) => void
  customerBalance?: number
  customerId: string
}

export function PaymentSection({
  orderTotal,
  payments,
  onPaymentsChange,
  customerBalance = 0,
  customerId,
}: PaymentSectionProps) {
  const { t } = useLanguage()
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
    }).format(amount)
  }

  const addPayment = () => {
    const newPayment: Payment = {
      id: Math.random().toString(36).substr(2, 9),
      amount: 0,
      method: "cash",
    }
    onPaymentsChange([...payments, newPayment])
  }

  const updatePayment = (id: string, field: keyof Payment, value: string | number) => {
    const updatedPayments = payments.map((payment) => (payment.id === id ? { ...payment, [field]: value } : payment))
    onPaymentsChange(updatedPayments)
  }

  const removePayment = (id: string) => {
    onPaymentsChange(payments.filter((payment) => payment.id !== id))
  }

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const remainingBalance = orderTotal - totalPaid
  const isFullyPaid = remainingBalance <= 0.01

  const cashPaid = payments.filter((p) => p.method === "cash").reduce((sum, payment) => sum + payment.amount, 0)

  const balanceUsed = payments
    .filter((p) => p.method === "customer_balance")
    .reduce((sum, payment) => sum + payment.amount, 0)

  const remainingAfterBalance = orderTotal - balanceUsed
  const cashOverpayment = Math.max(0, cashPaid - remainingAfterBalance)
  const cashShortfall = Math.max(0, remainingAfterBalance - cashPaid)
  const newCustomerBalance = customerBalance - balanceUsed + cashOverpayment - cashShortfall

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("paymentDetails")}</CardTitle>
        <CardDescription>
          {customerId === "walk-in"
            ? t("walkInPaymentRequired")
            : t("addPaymentMethodsDesc")
          }
        </CardDescription>
        {customerId === "walk-in" && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-orange-800 font-medium">
              {t("walkInCustomerPaymentNotice")}
            </span>
          </div>
        )}
        {customerId !== "walk-in" && remainingBalance > 0 && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <DollarSign className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800 font-medium">
              {t("registeredCustomerPartialPayment")}
            </span>
          </div>
        )}
        {customerId !== "walk-in" && totalPaid === 0 && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800 font-medium">
              {t("registeredCustomerZeroPayment")}
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {payments.map((payment, index) => (
            <div key={payment.id} className="flex items-end gap-2 p-3 border rounded-lg">
              <div className="flex-1">
                <Label>{t("paymentMethod")}</Label>
                <Select value={payment.method} onValueChange={(value) => updatePayment(payment.id, "method", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">{t("cash")}</SelectItem>
                    <SelectItem value="customer_balance">{t("customerBalance")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-32">
                <Label>{t("amount")}</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={payment.amount || ""}
                  onChange={(e) => updatePayment(payment.id, "amount", Number.parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              {payments.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => removePayment(payment.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button type="button" variant="outline" size="sm" onClick={addPayment} className="w-full bg-transparent">
          <Plus className="mr-2 h-4 w-4" />
          {t("addPaymentMethod")}
        </Button>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t("orderTotal")}:</span>
            <span>{formatCurrency(orderTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>{t("totalPaid")}:</span>
            <span className={totalPaid >= orderTotal ? "text-green-600" : "text-orange-600"}>
              {formatCurrency(totalPaid)}
            </span>
          </div>
          <Separator />

          {remainingBalance > 0 ? (
            <div className="flex justify-between font-medium">
              <span>{t("remainingBalance")}:</span>
              <span className={customerId === "walk-in" ? "text-red-600" : "text-orange-600"}>
                {formatCurrency(remainingBalance)}
                {customerId === "walk-in" && (
                  <span className="text-xs ml-1 font-normal">(Required)</span>
                )}
              </span>
            </div>
          ) : (
            <div className="flex justify-between font-medium">
              <span>{t("status")}:</span>
              <span className="text-green-600">{t("fullyPaid")}</span>
            </div>
          )}

          {cashShortfall > 0 && (
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">{t("cashShortfallAddedToDebt")}:</span>
              </div>
              <span className="font-bold text-red-600">-{formatCurrency(cashShortfall)}</span>
            </div>
          )}

          {cashOverpayment > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">{t("cashOverpaymentAddedToBalance")}:</span>
              </div>
              <span className="font-bold text-blue-600">{formatCurrency(cashOverpayment)}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="font-medium">{t("currentCustomerBalance")}:</span>
                <span className={customerBalance >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatCurrency(customerBalance)}
                </span>
              </div>
              {balanceUsed > 0 && (
                <div className="flex justify-between">
                  <span>{t("balanceUsed")}:</span>
                  <span className="text-orange-600">-{formatCurrency(balanceUsed)}</span>
                </div>
              )}
              {cashOverpayment > 0 && (
                <div className="flex justify-between">
                  <span>{t("cashOverpaymentAdded")}:</span>
                  <span className="text-blue-600">+{formatCurrency(cashOverpayment)}</span>
                </div>
              )}
              {cashShortfall > 0 && (
                <div className="flex justify-between">
                  <span>{t("cashShortfallAddedToDebtLong")}:</span>
                  <span className="text-red-600">-{formatCurrency(cashShortfall)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-medium">
                <span>{t("newCustomerBalance")}:</span>
                <span className={newCustomerBalance >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatCurrency(newCustomerBalance)}
                </span>
              </div>
            </div>
          </div>

          {newCustomerBalance < 0 && balanceUsed > 0 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <div className="text-sm text-yellow-800">
                <span className="font-medium">{t("warning")}:</span> {t("warningDebtBalance")}{" "}
                {formatCurrency(Math.abs(newCustomerBalance))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

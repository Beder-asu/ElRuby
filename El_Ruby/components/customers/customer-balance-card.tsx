"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"

interface CustomerBalanceCardProps {
  balance: number
  totalOrders?: number
  totalPaid?: number
  totalOwed?: number
}

export function CustomerBalanceCard({
  balance,
  totalOrders = 0,
  totalPaid = 0,
  totalOwed = 0,
}: CustomerBalanceCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
    }).format(amount)
  }

  const isPositive = balance >= 0
  const BalanceIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Customer Balance</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <BalanceIcon className={`h-4 w-4 ${isPositive ? "text-green-600" : "text-red-600"}`} />
            <div className="text-2xl font-bold">
              <span className={isPositive ? "text-green-600" : "text-red-600"}>{formatCurrency(balance)}</span>
            </div>
            <Badge variant={isPositive ? "default" : "destructive"}>{isPositive ? "Credit" : "Debt"}</Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div>
              <div className="font-medium">{totalOrders}</div>
              <div>Total Orders</div>
            </div>
            <div>
              <div className="font-medium text-green-600">{formatCurrency(totalPaid)}</div>
              <div>Total Paid</div>
            </div>
            <div>
              <div className="font-medium text-red-600">{formatCurrency(totalOwed)}</div>
              <div>Total Owed</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

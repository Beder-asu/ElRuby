"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BadgeDollarSign } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

interface FinancialSummaryCardProps {
  totalCustomerBalances: number
  totalNetProfit: number
}

export function FinancialSummaryCard({
  totalCustomerBalances,
  totalNetProfit,
}: FinancialSummaryCardProps) {
  const { t } = useLanguage()
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t("financialSummary")}</CardTitle>
        <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">{t("totalCustomerBalances")}</p>
            <p className="text-2xl font-bold">{formatCurrency(totalCustomerBalances)}</p>
          </div>
          {/* Net Profit temporarily hidden
          <div>
            <p className="text-sm text-muted-foreground">{t("totalNetProfit")}</p>
            <p className="text-2xl font-bold">{formatCurrency(totalNetProfit)}</p>
          </div>
          */}
        </div>
      </CardContent>
    </Card>
  )
}

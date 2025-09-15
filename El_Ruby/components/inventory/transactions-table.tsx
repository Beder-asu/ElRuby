"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, TrendingUp, TrendingDown, RotateCcw } from "lucide-react"
import { InventoryTransactionWithProduct } from "@/types/database"
import { useLanguage } from "@/lib/language-context"

interface InventoryTransactionsTableProps {
  transactions: InventoryTransactionWithProduct[]
}

export function TransactionsTable({ transactions }: InventoryTransactionsTableProps) {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.products?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase())

    const transactionType = transaction.quantity_change > 0 ? 'increase' : 'decrease'
    const matchesType = typeFilter === "all" || transactionType === typeFilter

    return matchesSearch && matchesType
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "restock":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "sale":
        return <TrendingDown className="h-4 w-4 text-blue-600" />
      case "adjustment":
        return <RotateCcw className="h-4 w-4 text-orange-600" />
      default:
        return null
    }
  }

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case "purchase":
        return <Badge className="bg-green-100 text-green-800">Purchase</Badge>
      case "sale":
        return <Badge className="bg-blue-100 text-blue-800">{t("sale")}</Badge>
      case "adjustment":
        return <Badge className="bg-orange-100 text-orange-800">{t("adjustment")}</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  const getQuantityDisplay = (transaction: InventoryTransactionWithProduct) => {
    const isPositive = transaction.quantity_change > 0
    const color = isPositive ? "text-green-600" : "text-red-600"
    const sign = isPositive ? "+" : ""

    return (
      <span className={`font-medium ${color}`}>
        {sign}
        {transaction.quantity_change}
      </span>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("transactionHistory")}</CardTitle>
        <CardDescription>{transactions.length} {t("totalTransactionsRecorded")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by product name or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t("transactionType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allTypes")}</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="sale">{t("sale")}</SelectItem>
                  <SelectItem value="adjustment">{t("adjustment")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || typeFilter !== "all"
                  ? "No transactions found matching your filters."
                  : "No matching transactions found."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity Change</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => {
                    const transactionType = transaction.quantity_change > 0 ? 'increase' : 'decrease';
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.products?.name || "Unknown Product"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(transactionType)}
                            {getTransactionBadge(transactionType)}
                          </div>
                        </TableCell>
                        <TableCell>{getQuantityDisplay(transaction)}</TableCell>
                        <TableCell className="max-w-xs truncate">{transaction.notes || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(transaction.created_at)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, Search } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { Order, OrderWithCustomer, Customer, computeOrderRemainingAmount, computePaymentStatus } from "@/types/database"
import { DeleteOrderDialog } from "./delete-order-dialog"

interface OrdersTableProps {
  orders: OrderWithCustomer[]
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const customerParam = searchParams.get("customer")
    if (customerParam) {
      setSearchTerm(decodeURIComponent(customerParam))
    }
  }, [searchParams])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customers?.name.toLowerCase().includes(searchTerm.toLowerCase())

    // Use payment status instead of non-existent status field
    let orderPaymentStatus = "unpaid"
    if (order.paid_amount >= order.total_amount) {
      orderPaymentStatus = "completed"
    } else if (order.paid_amount > 0) {
      orderPaymentStatus = "partial"
    }

    const matchesStatus = statusFilter === "all" || orderPaymentStatus === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (totalAmount: number, paidAmount: number) => {
    const paymentStatus = computePaymentStatus(totalAmount, paidAmount)

    switch (paymentStatus) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">{t("completed")}</Badge>
      case "partial":
        return <Badge variant="secondary">{t("partialPayment")}</Badge>
      default:
        return <Badge variant="outline">{t("unpaid")}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchOrdersByNumber")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={t("status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allStatus")}</SelectItem>
              <SelectItem value="unpaid">{t("unpaid")}</SelectItem>
              <SelectItem value="partial">{t("partiallyPaid")}</SelectItem>
              <SelectItem value="completed">{t("completed")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all" ? t("noOrdersFound") : t("noOrdersCreated")}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Button asChild className="mt-4">
              <Link href="/dashboard/orders/new">{t("createYourFirstOrder")}</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("orderHash")}</TableHead>
                <TableHead>{t("customer")}</TableHead>
                <TableHead>{t("total")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("payment")}</TableHead>
                <TableHead>{t("date")}</TableHead>
                <TableHead>{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono font-medium">{order.order_number}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customers?.name || t("walkInCustomer")}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(order.total_amount)}</TableCell>
                  <TableCell>{getStatusBadge(order.total_amount, order.paid_amount)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {computePaymentStatus(order.total_amount, order.paid_amount)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/orders/${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DeleteOrderDialog
                        order={order}
                        onOrderDeleted={() => router.refresh()}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Plus, ExternalLink } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import formatCurrency from "@/lib/format-currency"

interface Purchase {
  id: string
  total_amount: number
  paid_amount: number
  status: "pending" | "partially_paid" | "completed"
  notes: string | null
  created_at: string
  company: {
    id: string
    name: string
    email: string | null
  } | null
}

interface PurchasesTableProps {
  purchases: Purchase[]
  error: string | null
}

export function PurchasesTable({ purchases, error }: PurchasesTableProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "partially_paid" | "completed">("all")

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (status: Purchase["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">{t("completed")}</Badge>
      case "partially_paid":
        return <Badge variant="warning">{t("partiallyPaid")}</Badge>
      default:
        return <Badge variant="secondary">{t("pending")}</Badge>
    }
  }

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch = purchase.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.company?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.notes?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || purchase.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">{t("purchaseHistory")}</h1>
          <p className="text-muted-foreground">{t("purchaseHistoryDescription")}</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/inventory/purchase/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("newPurchase")}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("purchases")}</CardTitle>
          <CardDescription>
            {error ? t("databaseTablesNotFound") : `${filteredPurchases.length} ${t("purchasesInSystem")}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="mb-4 flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder={t("searchPurchasesPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="w-48 rounded-md border p-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">{t("allStatus")}</option>
              <option value="pending">{t("pending")}</option>
              <option value="partially_paid">{t("partiallyPaid")}</option>
              <option value="completed">{t("completed")}</option>
            </select>
          </div>

          {/* Purchases Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("supplier")}</TableHead>
                  <TableHead>{t("date")}</TableHead>
                  <TableHead>{t("total")}</TableHead>
                  <TableHead>{t("paid")}</TableHead>
                  <TableHead>{t("remaining")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {t("noPurchasesFound")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        <div>
                          {purchase.company?.name || t("unknownSupplier")}
                          <br />
                          <span className="text-sm text-muted-foreground">
                            {purchase.company?.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(purchase.created_at)}</TableCell>
                      <TableCell>{formatCurrency(purchase.total_amount)}</TableCell>
                      <TableCell>{formatCurrency(purchase.paid_amount)}</TableCell>
                      <TableCell>{formatCurrency(purchase.total_amount - purchase.paid_amount)}</TableCell>
                      <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                      <TableCell>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/dashboard/inventory/purchases/${purchase.id}`}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            {t("view")}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

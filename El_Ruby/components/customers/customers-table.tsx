"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Search, Phone, ShoppingCart, Eye } from "lucide-react"
import Link from "next/link"
import { DeleteCustomerDialog } from "./delete-customer-dialog"
import { useLanguage } from "@/lib/language-context"
import { Customer } from "@/types/database"

interface CustomersTableProps {
  customers: Customer[]
}

export function CustomersTable({ customers }: CustomersTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null)
  const { t } = useLanguage()

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm),
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchCustomers")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm ? t("noResults") : t("noData")}
          </p>
          {!searchTerm && (
            <Button asChild className="mt-4">
              <Link href="/dashboard/customers/new">{t("addCustomer")}</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("phone")}</TableHead>
                <TableHead>{t("balance")}</TableHead>
                <TableHead>{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>
                    {customer.phone && (
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={customer.balance > 0 ? "default" : customer.balance < 0 ? "destructive" : "secondary"}
                    >
                      {formatCurrency(customer.balance)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="ghost" size="sm" title={t("viewOrders")}>
                        <Link href={`/dashboard/orders?customer=${encodeURIComponent(customer.name)}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm" title="Create Order">
                        <Link href={`/dashboard/orders/new?customer=${customer.id}`}>
                          <ShoppingCart className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/customers/${customer.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteCustomerId(customer.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DeleteCustomerDialog customerId={deleteCustomerId} onClose={() => setDeleteCustomerId(null)} />
    </div>
  )
}

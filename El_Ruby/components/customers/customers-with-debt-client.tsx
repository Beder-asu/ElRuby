"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Phone, Mail } from "lucide-react"
import formatCurrency from "@/lib/format-currency"
import { useLanguage } from "@/lib/language-context"

type Customer = {
    id: string
    name: string
    phone: string | null
    email: string | null
    balance: number
    created_at: string
}

type Order = {
    id: string
    order_number: number
    total_amount: number
    paid_amount: number
    created_at: string
}

interface CustomersWithDebtClientProps {
    customersWithOrders: (Customer & { unpaidOrders: Order[] })[]
}

export function CustomersWithDebtClient({ customersWithOrders }: CustomersWithDebtClientProps) {
    const { t, isRTL } = useLanguage()

    return (
        <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
            <main className="container mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t("customersWithDebtTitle")}</CardTitle>
                        <CardDescription>{t("customersWithDebtDescription")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {customersWithOrders.length > 0 ? (
                            <div className="space-y-6">
                                {customersWithOrders.map((customer) => (
                                    <Card key={customer.id}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-lg">
                                                        <Link href={`/dashboard/customers/${customer.id}/edit`} className="hover:underline">
                                                            {customer.name}
                                                        </Link>
                                                    </CardTitle>
                                                    <CardDescription>
                                                        <div className="flex flex-col gap-1 mt-1">
                                                            {customer.phone && (
                                                                <div className="flex items-center gap-1">
                                                                    <Phone className="h-3 w-3" />
                                                                    {customer.phone}
                                                                </div>
                                                            )}
                                                            {customer.email && (
                                                                <div className="flex items-center gap-1">
                                                                    <Mail className="h-3 w-3" />
                                                                    {customer.email}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardDescription>
                                                </div>
                                                <Badge variant="destructive" className="text-base">
                                                    {formatCurrency(Math.abs(customer.balance))}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                                                    {t("unpaidOrders")} ({customer.unpaidOrders.length})
                                                </h4>
                                                {customer.unpaidOrders.length > 0 ? (
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t("orderNumberLabel")}</TableHead>
                                                                <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t("dateLabel")}</TableHead>
                                                                <TableHead className={isRTL ? 'text-left' : 'text-right'}>{t("totalLabel")}</TableHead>
                                                                <TableHead className={isRTL ? 'text-left' : 'text-right'}>{t("paidLabel")}</TableHead>
                                                                <TableHead className={isRTL ? 'text-left' : 'text-right'}>{t("remainingLabel")}</TableHead>
                                                                <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t("actions")}</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {customer.unpaidOrders.map((order) => (
                                                                <TableRow key={order.id}>
                                                                    <TableCell className={isRTL ? 'text-right' : 'text-left'}>#{order.order_number}</TableCell>
                                                                    <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                                                                        {new Date(order.created_at).toLocaleDateString()}
                                                                    </TableCell>
                                                                    <TableCell className={isRTL ? 'text-left' : 'text-right'}>
                                                                        {formatCurrency(order.total_amount)}
                                                                    </TableCell>
                                                                    <TableCell className={isRTL ? 'text-left' : 'text-right'}>
                                                                        {formatCurrency(order.paid_amount)}
                                                                    </TableCell>
                                                                    <TableCell className={isRTL ? 'text-left' : 'text-right'}>
                                                                        <span className="text-destructive font-medium">
                                                                            {formatCurrency(order.total_amount - order.paid_amount)}
                                                                        </span>
                                                                    </TableCell>
                                                                    <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                                                                        <Button variant="outline" size="sm" asChild>
                                                                            <Link href={`/dashboard/orders/${order.id}`}>
                                                                                {t("viewOrderLabel")}
                                                                            </Link>
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                ) : (
                                                    <div className="text-muted-foreground text-center py-4">
                                                        {t("noUnpaidOrders")}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-muted-foreground mb-4">{t("customersWithDebtEmpty")}</div>
                                <Button asChild>
                                    <Link href="/dashboard/customers">{t("backToCustomers")}</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
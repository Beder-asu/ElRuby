"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"
import { OrdersTable } from "@/components/orders/orders-table"
import { useLanguage } from "@/lib/language-context"
import type { OrderWithCustomer } from "@/types/database"
import { computeOrderStatus } from "@/types/database"

interface OrdersPageContentProps {
    orders: OrderWithCustomer[]
    ordersError: any
}

export function OrdersPageContent({ orders, ordersError }: OrdersPageContentProps) {
    const { t, language } = useLanguage()

    // Calculate stats - using payment status instead of order status since status field doesn't exist
    const totalOrders = orders?.length || 0
    const unpaidOrders = orders?.filter((o) => (o.total_amount - o.paid_amount) > 0).length || 0
    const completedOrders = orders?.filter((o) => o.paid_amount >= o.total_amount).length || 0
    const totalRevenue = orders?.filter((o) => o.paid_amount >= o.total_amount).reduce((sum, o) => sum + o.total_amount, 0) || 0

    return (
        <div className={`min-h-screen bg-background ${language === "ar" ? "rtl" : "ltr"}`}>
            <main className="container mx-auto p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-balance">{t("orderManagement")}</h1>
                        <p className="text-muted-foreground">
                            {ordersError
                                ? t("databaseTablesNotFound")
                                : t("processSalesManageInvoices")}
                        </p>
                    </div>
                    <Button asChild disabled={!!ordersError}>
                        <Link href="/dashboard/orders/new">
                            <Plus className="mr-2 h-4 w-4" />
                            {t("newOrder")}
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="mb-6 grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">{t("totalOrders")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalOrders}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">{t("unpaidOrders")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{unpaidOrders}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">{t("completedOrders")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{completedOrders}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">{t("revenue")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t("allOrders")}</CardTitle>
                        <CardDescription>{totalOrders} {t("ordersInSystem")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <OrdersTable orders={orders || []} />
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}

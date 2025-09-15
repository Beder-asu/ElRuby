"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, TrendingUp, AlertTriangle, Package } from "lucide-react"
import Link from "next/link"
import { InventoryTable } from "@/components/inventory/inventory-table"
import { useLanguage } from "@/lib/language-context"
import { cn } from "@/lib/utils"
import formatCurrency from "@/lib/format-currency"

interface InventoryPageContentProps {
    products: any[]
    totalProducts: number
    lowStockProducts: number
    outOfStockProducts: number
    totalValue: number
    productsError: any
    totalCustomerDebt: number
    totalCompanyOwed: number
}

export function InventoryPageContent({
    products,
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
    totalValue,
    productsError,
    totalCustomerDebt,
    totalCompanyOwed
}: InventoryPageContentProps) {
    const { t } = useLanguage()

    return (
        <main className="container mx-auto p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-balance">{t("inventory")}</h1>
                    <p className="text-muted-foreground">{t("currentStockLevels")}</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link href="/dashboard/inventory/transactions">{t("transactions")}</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/inventory/purchase/new">
                            <TrendingUp className="mr-2 h-4 w-4" />
                            {t("newPurchase")}
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/dashboard/inventory/adjust">
                            <Plus className="mr-2 h-4 w-4" />
                            {t("stockAlert")}
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Financial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Link href="/dashboard/customers/with-debt" className="block">
                    <Card className="border-red-200 bg-red-50/50 hover:bg-red-100/50 transition-colors cursor-pointer">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center text-red-700">
                                <AlertTriangle className="mr-2 h-5 w-5" />
                                {t("customerDebt")}
                            </CardTitle>
                            <CardDescription className="text-red-600/90">
                                {t("outstandingBalances")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-700">
                                {formatCurrency(totalCustomerDebt)}
                            </div>
                            <p className="text-sm text-red-600/75 mt-1">
                                {t("clickToViewCustomers")}
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/companies/with-debt" className="block">
                    <Card className="border-green-200 bg-green-50/50 hover:bg-green-100/50 transition-colors cursor-pointer">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center text-green-700">
                                <Package className="mr-2 h-5 w-5" />
                                {t("companyReceivables")}
                            </CardTitle>
                            <CardDescription className="text-green-600/90">
                                {t("amountOwedToCompany")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-700">
                                {formatCurrency(totalCompanyOwed)}
                            </div>
                            <p className="text-sm text-green-600/75 mt-1">
                                {t("clickToViewCompanies")}
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Inventory Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("totalProducts")}</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalProducts}</div>
                        <p className="text-xs text-muted-foreground">{t("itemsInInventory")}</p>
                    </CardContent>
                </Card>
                <Card className={cn(lowStockProducts > 0 && "border-yellow-200 bg-yellow-50/50")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("lowStock")}</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-2xl font-bold", lowStockProducts > 0 && "text-yellow-600")}>
                            {lowStockProducts}
                        </div>
                        <p className="text-xs text-muted-foreground">{t("needRestocking")}</p>
                    </CardContent>
                </Card>
                <Card className={cn(outOfStockProducts > 0 && "border-red-200 bg-red-50/50")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("outOfStock")}</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-2xl font-bold", outOfStockProducts > 0 && "text-red-600")}>
                            {outOfStockProducts}
                        </div>
                        <p className="text-xs text-muted-foreground">{t("urgentAttention")}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("inventoryValue")}</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(totalValue)}
                        </div>
                        <p className="text-xs text-muted-foreground">{t("totalStockValue")}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Inventory Table */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("inventoryOverview")}</CardTitle>
                    <CardDescription>{t("currentStockLevels")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <InventoryTable products={products || []} />
                </CardContent>
            </Card>
        </main>
    )
}

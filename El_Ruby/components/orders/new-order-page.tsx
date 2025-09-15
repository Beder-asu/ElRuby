"use client"

import Link from "next/link"
import { OrderForm } from "@/components/orders/order-form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

interface NewOrderPageProps {
    customers: any[]
    products: any[]
    preselectedCustomerId?: string
}

export default function NewOrderPage({ customers, products, preselectedCustomerId }: NewOrderPageProps) {
    const { t } = useLanguage()

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-balance">{t("newOrder")}</h1>
                        <p className="text-muted-foreground">{t("processNewSale")}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/dashboard/orders/company-proposal">
                            <Button variant="outline" className="gap-2">
                                <Plus className="h-4 w-4" />
                                {t("companyProposal")}
                            </Button>
                        </Link>
                        <Link href="/dashboard/products/new">
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                {t("addProduct")}
                            </Button>
                        </Link>
                    </div>
                </div>

                <OrderForm
                    customers={customers}
                    products={products}
                    preselectedCustomerId={preselectedCustomerId}
                />
            </main>
        </div>
    )
}

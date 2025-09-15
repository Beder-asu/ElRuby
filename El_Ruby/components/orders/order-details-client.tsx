"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OrderInvoice } from "@/components/orders/order-invoice"
import { DeleteOrderDialog } from "@/components/orders/delete-order-dialog"
import { useLanguage } from "@/lib/language-context"

interface OrderDetailsClientProps {
  order: any
  payments: any[]
  customerTransactions: any[]
}

export function OrderDetailsClient({ order, payments, customerTransactions }: OrderDetailsClientProps) {
  const router = useRouter()
  const { t } = useLanguage()

  const handleOrderDeleted = () => {
    router.push("/dashboard/orders")
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("backToOrders")}
            </Button>
          </Link>
          <DeleteOrderDialog 
            order={order} 
            onOrderDeleted={handleOrderDeleted}
          />
        </div>
        <OrderInvoice 
          order={order} 
          payments={payments} 
          customerTransactions={customerTransactions} 
        />
      </main>
    </div>
  )
}
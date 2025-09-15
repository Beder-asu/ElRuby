"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { OrderWithCustomer } from "@/types/database"
import { toast } from "@/hooks/use-toast"

interface DeleteOrderDialogProps {
  order: OrderWithCustomer
  onOrderDeleted?: () => void
}

export function DeleteOrderDialog({ order, onOrderDeleted }: DeleteOrderDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { t } = useLanguage()
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      const supabase = createClient()

      // First, restore customer balance if there were balance payments
      if (order.customers && order.paid_amount > 0) {
        // Get payments for this order to see if there were balance payments
        const { data: payments } = await supabase
          .from('payments')
          .select('amount, payment_method')
          .eq('order_id', order.id)

        if (payments) {
          const balancePayments = payments
            .filter((p: any) => p.payment_method === 'customer_balance')
            .reduce((sum: number, p: any) => sum + p.amount, 0)
          
          const cashPayments = payments
            .filter((p: any) => p.payment_method === 'cash')
            .reduce((sum: number, p: any) => sum + p.amount, 0)

          // Calculate cash overpayment that was added to balance
          const remainingAfterBalance = order.total_amount - balancePayments
          const cashOverpayment = Math.max(0, cashPayments - remainingAfterBalance)
          
          // Calculate shortfall that was deducted from balance
          const cashShortfall = Math.max(0, remainingAfterBalance - cashPayments)

          if (balancePayments > 0 || cashOverpayment > 0 || cashShortfall > 0) {
            // Reverse the balance changes
            const currentCustomer = await supabase
              .from('customers')
              .select('balance')
              .eq('id', order.customers.id)
              .single()

            if (currentCustomer.data) {
              const restoredBalance = currentCustomer.data.balance + balancePayments - cashOverpayment + cashShortfall

              await supabase
                .from('customers')
                .update({ balance: restoredBalance })
                .eq('id', order.customers.id)
            }
          }
        }
      }

      // Restore stock quantities for products in this order
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id, quantity, products(stock_quantity)')
        .eq('order_id', order.id)

      if (orderItems) {
        for (const item of orderItems) {
          if (item.products) {
            const newStock = (item.products as any).stock_quantity + item.quantity
            await supabase
              .from('products')
              .update({ stock_quantity: newStock })
              .eq('id', item.product_id)
          }
        }
      }

      // Delete customer transactions
      await supabase
        .from('customer_transactions')
        .delete()
        .eq('order_id', order.id)

      // Delete payments
      await supabase
        .from('payments')
        .delete()
        .eq('order_id', order.id)

      // Delete order items
      await supabase
        .from('order_items')
        .delete()
        .eq('order_id', order.id)

      // Finally, delete the order
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', order.id)

      if (error) throw error

      toast({
        title: t("orderDeleted"),
        description: t("orderDeletedSuccessfully"),
      })

      if (onOrderDeleted) {
        onOrderDeleted()
      } else {
        router.refresh()
      }
    } catch (error: any) {
      console.error('Error deleting order:', error)
      toast({
        title: t("error"),
        description: error.message || t("failedToDeleteOrder"),
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteOrder")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteOrderConfirmation")
              .replace("%1", order.order_number)
              .replace("%2", order.customers?.name || t("walkInCustomer"))}
            <br />
            <br />
            {t("deleteOrderWarning")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? t("deleting") : t("deleteOrder")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
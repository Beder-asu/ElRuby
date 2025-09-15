"use client"
import { Combobox } from "@/components/ui/new-combobox"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { Customer } from "@/types/database"

interface CustomerSearchProps {
  customers: Customer[]
  value: string
  onValueChange: (value: string) => void
  onAddCustomer: () => void
}

export function CustomerSearch({ customers, value, onValueChange, onAddCustomer }: CustomerSearchProps) {
  const { t } = useLanguage()

  // Debug logging
  console.log('[DEBUG] CustomerSearch - customers:', customers.length, customers.slice(0, 2))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
    }).format(amount)
  }

  const customerOptions = [
    { value: "walk-in", label: t("walkInCustomer") },
    ...customers.map((customer) => ({
      value: customer.id,
      label: `${customer.name}${customer.phone ? ` (${customer.phone})` : ""} - Balance: ${formatCurrency(customer.balance)}`,
    })),
  ]

  console.log('[DEBUG] CustomerSearch - customerOptions:', customerOptions.length, customerOptions.slice(0, 3))

  return (
    <div className="flex gap-2">
      <Combobox
        options={customerOptions}
        value={value}
        onValueChange={onValueChange}
        placeholder={t("searchCustomersPlaceholder")}
        searchPlaceholder={t("typeToSearchCustomers")}
        emptyText={t("noCustomersFoundCombobox")}
        className="flex-1"
      />
      <Button type="button" variant="outline" size="icon" onClick={onAddCustomer}>
        <UserPlus className="h-4 w-4" />
      </Button>
    </div>
  )
}

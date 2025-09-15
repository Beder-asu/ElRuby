"use client"
import { Combobox } from "@/components/ui/new-combobox"
import { useLanguage } from "@/lib/language-context"

interface Company {
  id: string
  name: string
  phone?: string
  description?: string
  products_description?: string
  balance: number
}

interface CompanySearchProps {
  companies: Company[]
  value: string
  onValueChange: (value: string) => void
}

export function CompanySearch({ companies, value, onValueChange }: CompanySearchProps) {
  const { t } = useLanguage()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
    }).format(amount)
  }

  const companyOptions = companies.map((company) => ({
    value: company.id,
    label: `${company.name}${company.balance ? ` (${formatCurrency(company.balance)})` : ""}`
  }))

  return (
    <Combobox
      options={companyOptions}
      value={value}
      onValueChange={onValueChange}
      placeholder={t("selectCompany")}
      emptyText={t("purchaseNoCompaniesFound")}
    />
  )
}

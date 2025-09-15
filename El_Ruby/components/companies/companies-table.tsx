"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Building2, Phone, Edit, Trash2, Search } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { DeleteCompanyDialog } from "./delete-company-dialog"
import { Company } from "@/types/database"

interface CompaniesTableProps {
  companies: Company[]
}

export function CompaniesTable({ companies }: CompaniesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteCompanyId, setDeleteCompanyId] = useState<string | null>(null)
  const { t } = useLanguage()

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.products_description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
    }).format(amount)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchCompanies")}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button asChild>
          <Link href="/dashboard/companies/new">
            <Building2 className="mr-2 h-4 w-4" />
            {t("addNewCompany")}
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("companyName")}</TableHead>
              <TableHead>{t("phone")}</TableHead>
              <TableHead>{t("productsWeGet")}</TableHead>
              <TableHead>{t("balance")}</TableHead>
              <TableHead>{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompanies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  {t("noCompaniesFound")}
                </TableCell>
              </TableRow>
            ) : (
              filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="font-medium">{company.name}</div>
                  </TableCell>
                  <TableCell>
                    {company.phone && (
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {company.phone}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[300px] text-sm">
                      {company.products_description || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={company.balance > 0 ? "destructive" : company.balance < 0 ? "default" : "secondary"}>
                      {formatCurrency(Math.abs(company.balance))}
                      {company.balance !== 0 && (
                        <span className="ml-1 text-xs">
                          ({company.balance > 0 ? t("weOwe") : t("theyOwe")})
                        </span>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/companies/${company.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">{t("edit")}</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteCompanyId(company.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">{t("delete")}</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DeleteCompanyDialog
        open={!!deleteCompanyId}
        onOpenChange={(open) => !open && setDeleteCompanyId(null)}
        companyId={deleteCompanyId}
      />
    </div>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Phone, Mail } from "lucide-react"
import formatCurrency from "@/lib/format-currency"
import { useLanguage } from "@/lib/language-context"

type Company = {
    id: string
    name: string
    contact_person: string | null
    phone: string | null
    email: string | null
    address: string | null
    balance: number
    created_at: string
}

interface CompaniesWithDebtClientProps {
    companies: Company[]
}

export function CompaniesWithDebtClient({ companies }: CompaniesWithDebtClientProps) {
    const { t, isRTL } = useLanguage()

    return (
        <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
            <main className="container mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t("companiesWeOweTitle")}</CardTitle>
                        <CardDescription>{t("companiesWeOweDescription")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {companies.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t("companyName")}</TableHead>
                                        <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t("contactPerson")}</TableHead>
                                        <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t("contactInfo")}</TableHead>
                                        <TableHead className={isRTL ? 'text-left' : 'text-right'}>{t("amountWeOwe")}</TableHead>
                                        <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t("actions")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {companies.map((company) => (
                                        <TableRow key={company.id}>
                                            <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                                                <div className="font-medium">{company.name}</div>
                                                {company.address && (
                                                    <div className="text-sm text-muted-foreground">{company.address}</div>
                                                )}
                                            </TableCell>
                                            <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                                                {company.contact_person || t("notSpecified")}
                                            </TableCell>
                                            <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                                                <div className="flex flex-col gap-1">
                                                    {company.phone && (
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            <span className="text-sm">{company.phone}</span>
                                                        </div>
                                                    )}
                                                    {company.email && (
                                                        <div className="flex items-center gap-1">
                                                            <Mail className="h-3 w-3" />
                                                            <span className="text-sm">{company.email}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className={isRTL ? 'text-left' : 'text-right'}>
                                                <span className="text-destructive font-medium">
                                                    {formatCurrency(company.balance)}
                                                </span>
                                            </TableCell>
                                            <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/dashboard/companies/${company.id}/edit`}>
                                                        {t("edit")}
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-muted-foreground mb-4">{t("companiesWithDebtEmpty")}</div>
                                <Button asChild>
                                    <Link href="/dashboard/companies">{t("backToCompanies")}</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
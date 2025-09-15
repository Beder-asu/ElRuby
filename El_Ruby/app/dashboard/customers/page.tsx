"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"
import { CustomersTable } from "@/components/customers/customers-table"
import { useLanguage } from "@/lib/language-context"
import type { Customer } from "@/types/database"

export default function CustomersPage() {
  const { t, language } = useLanguage()
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [tableExists, setTableExists] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      if (supabase) {
        const { data, error } = await supabase.auth.getUser()
        if (error || !data?.user) {
          router.push("/auth/login")
          return
        }
      }

      if (supabase) {
        try {
          const { data: customersData, error } = await supabase
            .from("customers")
            .select("*")

          setCustomers(customersData || [])
          if (error) {
            console.error("Error fetching customers:", error)
          }
        } catch (error: any) {
          console.error("Error fetching customers:", error)
          if (error.message?.includes("Could not find the table")) {
            setTableExists(false)
          }
        }
      }
      setLoading(false)
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">{t("loading")}</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-background ${language === "ar" ? "rtl" : "ltr"}`}>
      <main className="container mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">{t("customers")}</h1>
            <p className="text-muted-foreground">{t("manageCustomerDatabase")}</p>
          </div>
          <Button asChild disabled={!tableExists}>
            <Link href="/dashboard/customers/new">
              <Plus className="mr-2 h-4 w-4" />
              {t("addCustomer")}
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("customers")}</CardTitle>
            <CardDescription>
              {!tableExists ? t("databaseTablesNotFound") : `${customers?.length || 0} ${t("customersInDatabase")}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CustomersTable customers={customers || []} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

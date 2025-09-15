import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CompaniesWithDebtClient } from "@/components/companies/companies-with-debt-client"

type Company = {
  id: string
  name: string
  contact_person: string | null
  phone: string | null
  email: string | null
  address: string | null
  balance: number
  description: string | null
  products_description: string | null
  created_at: string
}

export default async function CompaniesWithDebtPage() {
  const supabase = await createClient()
  const authClient: any = supabase.auth
  const sessionRes = (await authClient.getSession?.()) || (await authClient.getUser?.())
  const currentUser = sessionRes?.data?.session?.user || sessionRes?.data?.user
  if (!currentUser) redirect("/auth/login")

  const companiesRes = await ((supabase.from("companies") as any)
    .select("*")
    .gt("balance", 0)
    .order("balance", { ascending: false }))

  const companies = (companiesRes?.data || []) as Company[]

  return <CompaniesWithDebtClient companies={companies} />
}

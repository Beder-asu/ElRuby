import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CompaniesTable } from "@/components/companies/companies-table"

export default async function CompaniesPage() {
  const supabase = await createClient()
  const { data: session, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session?.session?.user) {
    redirect("/auth/login")
  }

  const { data: companies, error: companiesError } = await supabase
    .from("companies")
    .select("*")
    .order("name")

  if (companiesError) {
    console.error("Error loading companies:", companiesError)
    return <div>Error loading companies</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto p-6">
        <CompaniesTable companies={companies || []} />
      </main>
    </div>
  )
}

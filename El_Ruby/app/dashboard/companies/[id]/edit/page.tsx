import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CompanyForm } from "@/components/companies/company-form"

interface EditCompanyPageProps {
  params: {
    id: string
  }
}

export default async function EditCompanyPage({ params }: EditCompanyPageProps) {
  const supabase = await createClient()
  const { data: session, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session?.session?.user) {
    redirect("/auth/login")
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("*")
    .eq("id", params.id)
    .single()

  if (companyError || !company) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto p-6">
        <CompanyForm company={company} />
      </main>
    </div>
  )
}

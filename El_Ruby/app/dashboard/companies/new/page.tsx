import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { CompanyForm } from "@/components/companies/company-form"
import { useLanguage } from "@/lib/language-context"

export default async function NewCompanyPage() {
  const supabase = await createClient()
  const { data: session, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session?.session?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto p-6">
        <CompanyForm />
      </main>
    </div>
  )
}

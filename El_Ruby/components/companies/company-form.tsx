"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

interface CompanyFormProps {
  company?: {
    id: string
    name: string
    phone: string | null
    description: string | null
    products_description: string | null
    balance: number
  }
}

export function CompanyForm({ company }: CompanyFormProps) {
  const [formData, setFormData] = useState({
    name: company?.name || "",
    phone: company?.phone || "",
    description: company?.description || "",
    products_description: company?.products_description || "",
    balance: company?.balance?.toString() || "0",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError(t("companyNameRequired"))
      return
    }

    setIsSubmitting(true)
    setError(null)

    const supabase = createClient()
    try {
      const data = {
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        description: formData.description.trim() || null,
        products_description: formData.products_description.trim() || null,
        balance: Number(formData.balance) || 0,
      }

      if (company) {
        const { error: updateError } = await supabase
          .from("companies")
          .update(data)
          .eq("id", company.id)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from("companies").insert([data])
        if (insertError) throw insertError
      }

      router.push("/dashboard/companies")
      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{company ? t("editCompany") : t("createNewCompany")}</CardTitle>
          <CardDescription>
            {company ? t("updateCompanyDetails") : t("enterCompanyDetails")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="name">{t("companyName")}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">{t("phone")}</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="products_description">{t("productsWeGet")}</Label>
            <Textarea
              id="products_description"
              value={formData.products_description}
              onChange={(e) =>
                setFormData({ ...formData, products_description: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">{t("additionalNotes")}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="balance">{t("balance")}</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">{t("balanceDescription")}</p>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? company
                  ? t("updating")
                  : t("creating")
                : company
                  ? t("update")
                  : t("create")}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/companies">{t("cancel")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

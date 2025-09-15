"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useLanguage } from "@/lib/language-context"
import { createClient } from "@/lib/supabase/client"

interface DeleteCompanyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: string | null
}

export function DeleteCompanyDialog({
  open,
  onOpenChange,
  companyId,
}: DeleteCompanyDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()

  async function handleDelete() {
    if (!companyId) return

    setIsDeleting(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("companies").delete().eq("id", companyId)
      if (error) throw error

      router.refresh()
      onOpenChange(false)
    } catch (error) {
      console.error("Error deleting company:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteCompany")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteCompanyConfirmation")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? t("deleting") : t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

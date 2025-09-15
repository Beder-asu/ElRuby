"use client"

import { Button } from "@/components/ui/button"
import { Home, Users, Package, ShoppingCart, FileText, Menu, Languages, User } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { createClient } from "@/lib/supabase/client"
import { User as SupabaseUser, Session, AuthChangeEvent } from "@supabase/supabase-js"

export function NavigationHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const { language, setLanguage, t, isRTL } = useLanguage()

  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), icon: Home },
    { href: "/dashboard/customers/with-debt", label: t("customersWithDebt"), icon: Users },
    { href: "/dashboard/companies/with-debt", label: t("companiesWeOwe"), icon: Package },
    { href: "/dashboard/customers", label: t("customers"), icon: Users },
    { href: "/dashboard/companies", label: t("companies"), icon: Package },
    { href: "/dashboard/inventory", label: t("inventory"), icon: Package },
    { href: "/dashboard/products", label: t("products"), icon: Package },
    { href: "/dashboard/orders", label: t("orders"), icon: ShoppingCart },
    { href: "/dashboard/orders/new", label: t("newOrder"), icon: FileText },
  ]

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en")
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">{t("systemName")}</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile menu */}
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link href="/dashboard" className="flex items-center space-x-2 md:hidden">
              <span className="font-bold">{t("systemName")}</span>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            {user && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">{user.email}</span>
              </div>
            )}

            <Button variant="ghost" size="sm" onClick={toggleLanguage} className="flex items-center space-x-1">
              <Languages className="h-4 w-4" />
              <span className="text-sm font-medium">{language === "en" ? "عربي" : "EN"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="border-t md:hidden">
          <nav className="flex flex-col space-y-3 p-4">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}

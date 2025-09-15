"use client"

import { Button } from "@/components/ui/button"
import { Home, Users, Package, ShoppingCart, FileText, Menu, Languages, LogOut, User } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { createClient } from "@/lib/supabase/client"
import { User as SupabaseUser, Session, AuthChangeEvent } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

export function NavigationHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const { language, setLanguage, t, isRTL } = useLanguage()
  const router = useRouter()

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

  const handleLogout = async () => {
    try {
      const response = await fetch('/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.redirected) {
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/auth/login')
    }
  }

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), icon: Home },
    {
      href: "/dashboard/customers",
      label: t("customers"),
      icon: Users,
      children: [
        { href: "/dashboard/customers/with-debt", label: t("customersWithDebt") }
      ]
    },
    {
      href: "/dashboard/companies",
      label: t("companies"),
      icon: Package,
      children: [
        { href: "/dashboard/companies/with-debt", label: t("companiesWeOwe") }
      ]
    },
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
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className={`absolute mt-2 w-48 rounded-md shadow-lg bg-background border opacity-0 group-hover:opacity-100 transition-opacity z-50 ${isRTL ? 'right-0' : 'left-0'
                    }`}>
                    <div className="py-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-foreground/60 hover:text-foreground/80 hover:bg-accent"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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

            {user && (
              <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center space-x-1">
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">{t("logout")}</span>
              </Button>
            )}
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

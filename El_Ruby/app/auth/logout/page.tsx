"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, LogOut } from "lucide-react"

export default function LogoutPage() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setError(null)

    try {
      const supabase = createClient()

      if (!supabase || typeof supabase.auth?.signOut !== "function") {
        console.log("[v0] Supabase not configured, simulating logout")
        router.push("/auth/login")
        return
      }

      const { error } = await supabase.auth.signOut()

      if (error) {
        console.log("[v0] Client logout error:", error.message)
        setError(error.message)
        setIsLoggingOut(false)
        return
      }

      console.log("[v0] Client logout successful")
      // Redirect to login page after successful logout
      router.push("/auth/login")
    } catch (err) {
      console.log("[v0] Logout page error:", err)
      setError("An unexpected error occurred")
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <LogOut className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">Sign Out</CardTitle>
          <CardDescription>Are you sure you want to sign out of your account?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => router.back()}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button onClick={handleLogout} disabled={isLoggingOut} className="flex-1">
              {isLoggingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

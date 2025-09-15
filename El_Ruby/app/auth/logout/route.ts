import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = await createClient()

    if (!supabase || typeof supabase.auth?.signOut !== "function") {
      console.log("[v0] Supabase not configured, simulating logout")
      return NextResponse.redirect(new URL("/auth/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"))
    }

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.log("[v0] Logout error:", error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log("[v0] Logout successful")
    return NextResponse.redirect(new URL("/auth/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"))
  } catch (error) {
    console.log("[v0] Logout route error:", error)
    return NextResponse.redirect(new URL("/auth/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"))
  }
}

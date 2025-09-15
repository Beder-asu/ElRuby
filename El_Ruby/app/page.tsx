import { redirect } from "next/navigation"

const BYPASS_AUTH = true // Set to true to skip login, false to require login

export default async function HomePage() {
  if (BYPASS_AUTH) {
    redirect("/dashboard")
  }

  // Supabase auth code will be enabled once environment variables are configured
  redirect("/auth/login")
}

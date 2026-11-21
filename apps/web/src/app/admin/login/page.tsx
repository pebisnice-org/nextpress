import type { Metadata } from "next"
import { hasUsers } from "@/lib/auth"
import { LoginForm } from "./login-form"

export const dynamic = "force-dynamic"

export const metadata: Metadata = { title: "Sign in" }

export default async function LoginPage() {
  return <LoginForm needsSetup={!(await hasUsers())} />
}

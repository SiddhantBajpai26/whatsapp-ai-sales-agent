"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-transparent px-3 py-2 text-[13px] text-[var(--text-muted)] transition-colors hover:border-red-500/40 hover:text-red-400 md:justify-start"
    >
      <LogOut className="size-4 shrink-0" />
      <span className="hidden md:inline">Sign Out</span>
    </button>
  )
}

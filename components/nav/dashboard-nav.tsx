import Link from "next/link"
import { SignOutButton } from "@/components/nav/signout-button"
import { BobaLogo } from "@/components/brand/boba-logo"

export function DashboardNav() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <BobaLogo size={22} />
          <span className="font-heading text-sm font-semibold text-foreground">Bobafied</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/dashboard/conversations" className="hover:text-foreground">
            Conversations
          </Link>
          <Link href="/dashboard/settings" className="hover:text-foreground">
            Settings
          </Link>
        </nav>
      </div>
      <SignOutButton />
    </header>
  )
}

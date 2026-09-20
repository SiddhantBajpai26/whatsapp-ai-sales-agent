"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageSquare, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { SignOutButton } from "@/components/nav/signout-button"

const NAV_ITEMS = [
  { href: "/dashboard/conversations", label: "Conversations", icon: MessageSquare },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function DashboardSidebar({ userEmail }: { userEmail: string | null }) {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-10 flex-col border-r border-white/[0.06] bg-[#13151A] md:w-[260px]">
      <div
        className="h-0.5 w-full shrink-0"
        style={{ background: "linear-gradient(90deg, #00FF88, transparent)" }}
      />

      {/* Logo — full lockup on desktop, mark-only on mobile */}
      <div className="hidden flex-col gap-2 px-5 py-6 md:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#00FF88]/15 text-base">
            🧋
          </span>
          <span className="text-base font-bold text-white">Bobaafied</span>
        </Link>
        <div className="flex items-center gap-1.5 pl-0.5">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00FF88] opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-[#00FF88]" />
          </span>
          <span className="text-[10px] font-medium text-[#00FF88]">Live</span>
        </div>
      </div>
      <Link href="/" className="flex flex-col items-center py-6 md:hidden">
        <span className="flex size-8 items-center justify-center rounded-lg bg-[#00FF88]/15 text-base">
          🧋
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 px-3 py-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-center gap-3 rounded-[10px] border-l-[3px] border-transparent px-3.5 py-2.5 text-sm transition-all duration-200 ease-in-out md:justify-start",
                active
                  ? "border-l-[#00FF88] bg-[#00FF88]/[0.08] text-[#00FF88]"
                  : "text-[var(--text-muted)] hover:bg-white/[0.04] hover:text-[var(--text-primary)]"
              )}
            >
              <Icon className={cn("size-4 shrink-0", active && "text-[#00FF88]")} />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User + sign out, pinned to bottom */}
      <div className="mt-auto border-t border-white/[0.06] px-3 py-4">
        <div className="mb-3 hidden items-center gap-2 px-1 md:flex">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#00FF88]/20 text-xs font-semibold text-[#00FF88]">
            {(userEmail?.[0] ?? "?").toUpperCase()}
          </span>
          <span className="truncate text-xs text-[var(--text-muted)]">{userEmail ?? "Unknown"}</span>
        </div>
        <SignOutButton />
      </div>
    </aside>
  )
}

const FLOATING_LINKS = [
  { href: "/dashboard/conversations", label: "Conversations", emoji: "💬", filled: true },
  { href: "#", label: "Website", emoji: "🌐", filled: false },
  { href: "#", label: "About Us", emoji: "🫧", filled: false },
  { href: "#", label: "Email Us", emoji: "✉️", filled: false },
]

export function FloatingActionNav() {
  return (
    <div
      className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full p-1.5 backdrop-blur-[16px]"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {FLOATING_LINKS.map((link) =>
        link.filled ? (
          <Link
            key={link.label}
            href={link.href}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium text-[#0F1117] transition-shadow hover:shadow-[0_0_16px_rgba(0,255,136,0.35)]"
            style={{ backgroundColor: "#00FF88" }}
          >
            <span aria-hidden="true">{link.emoji}</span>
            <span className="hidden md:inline">{link.label}</span>
          </Link>
        ) : (
          <Link
            key={link.label}
            href={link.href}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.15] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-white/[0.06]"
          >
            <span aria-hidden="true">{link.emoji}</span>
            <span className="hidden md:inline">{link.label}</span>
          </Link>
        )
      )}
    </div>
  )
}

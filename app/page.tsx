"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MessageSquare, Zap, TrendingUp, type LucideIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { AboutUsModal } from "@/components/modals/about-us-modal"
import { EmailUsModal } from "@/components/modals/email-us-modal"

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: LucideIcon
  label: string
  value: string | number
  loading?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 text-center backdrop-blur-md">
      <Icon className="size-6 text-[var(--accent-green)]" />
      {loading ? (
        <div className="h-8 w-16 animate-pulse rounded-md bg-white/10" />
      ) : (
        <p className="text-3xl font-bold text-[var(--text-primary)]">{value}</p>
      )}
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
    </div>
  )
}

export default function Home() {
  const [totalConversations, setTotalConversations] = useState(0)
  const [messagesToday, setMessagesToday] = useState(0)
  const [loadingStats, setLoadingStats] = useState(true)
  const [showAbout, setShowAbout] = useState(false)
  const [showEmail, setShowEmail] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadStats() {
      const supabase = createClient()
      const todayMidnightUtc = new Date()
      todayMidnightUtc.setUTCHours(0, 0, 0, 0)

      const [conversationsResult, messagesResult] = await Promise.all([
        supabase.from("conversations").select("*", { count: "exact", head: true }),
        supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .gte("created_at", todayMidnightUtc.toISOString()),
      ])

      if (cancelled) return
      setTotalConversations(conversationsResult.error ? 0 : conversationsResult.count ?? 0)
      setMessagesToday(messagesResult.error ? 0 : messagesResult.count ?? 0)
      setLoadingStats(false)
    }

    loadStats().catch(() => {
      if (!cancelled) {
        setTotalConversations(0)
        setMessagesToday(0)
        setLoadingStats(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-[#0F1117]">
      <style>{`
        @keyframes meshDrift {
          0%, 100% { transform: translate(-10%, -8%) scale(1); opacity: 0.5; }
          50% { transform: translate(8%, 6%) scale(1.15); opacity: 0.8; }
        }
        @keyframes meshDriftReverse {
          0%, 100% { transform: translate(8%, 10%) scale(1.1); opacity: 0.35; }
          50% { transform: translate(-6%, -8%) scale(1); opacity: 0.65; }
        }
        .mesh-blob-a { animation: meshDrift 18s ease-in-out infinite; }
        .mesh-blob-b { animation: meshDriftReverse 22s ease-in-out infinite; }
      `}</style>

      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="mesh-blob-a absolute -top-1/4 -left-1/4 h-[60vw] w-[60vw] rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, var(--accent-green) 0%, transparent 70%)" }}
          />
          <div
            className="mesh-blob-b absolute -right-1/4 -bottom-1/4 h-[55vw] w-[55vw] rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, var(--accent-purple) 0%, transparent 70%)" }}
          />
        </div>

        <div className="relative flex flex-col items-center gap-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-green)]/30 bg-[var(--accent-green)]/10 px-3 py-1 text-xs font-medium text-[var(--accent-green)]">
            🧋 Bobaafied AI Agent · Live
          </span>

          <h1 className="max-w-3xl text-balance text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
            Your 24/7 WhatsApp AI Sales Assistant
          </h1>

          <p className="max-w-xl text-balance text-lg text-[var(--text-muted)]">
            Never miss a customer conversation. Powered by OpenAI + WhatsApp.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard/conversations"
              className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium text-[#0F1117] transition-shadow hover:shadow-[0_0_20px_rgba(0,255,136,0.4)]"
              style={{ backgroundColor: "#00FF88" }}
            >
              💬 Go to Conversations
            </Link>
            <Link
              href="#"
              className="inline-flex items-center justify-center rounded-full border border-[var(--accent-green)] px-6 py-3 text-sm font-medium text-[var(--accent-green)] transition-colors hover:bg-[var(--accent-green)]/10"
            >
              🌐 Visit Website
            </Link>
            <button
              type="button"
              onClick={() => setShowAbout(true)}
              className="inline-flex items-center justify-center rounded-full border border-[var(--accent-green)] px-6 py-3 text-sm font-medium text-[var(--accent-green)] transition-colors hover:bg-[var(--accent-green)]/10"
            >
              🫧 About Us
            </button>
            <button
              type="button"
              onClick={() => setShowEmail(true)}
              className="inline-flex items-center justify-center rounded-full border border-[var(--accent-green)] px-6 py-3 text-sm font-medium text-[var(--accent-green)] transition-colors hover:bg-[var(--accent-green)]/10"
            >
              ✉️ Email Us
            </button>
          </div>
        </div>
      </section>

      <section className="relative px-4 pb-20">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={MessageSquare}
            label="Total Conversations"
            value={totalConversations}
            loading={loadingStats}
          />
          <StatCard icon={Zap} label="Messages Today" value={messagesToday} loading={loadingStats} />
          <StatCard icon={TrendingUp} label="AI Response Rate" value="98%" />
        </div>
      </section>

      <footer className="border-t border-[var(--border-subtle)] px-4 py-6 text-center text-xs text-[var(--text-muted)]">
        Powered by OpenAI · Meta WhatsApp Cloud API · Supabase
      </footer>

      <AboutUsModal open={showAbout} onClose={() => setShowAbout(false)} />
      <EmailUsModal open={showEmail} onClose={() => setShowEmail(false)} />
    </div>
  )
}

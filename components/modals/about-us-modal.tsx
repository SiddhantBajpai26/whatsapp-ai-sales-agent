"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import { EmailUsModal } from "@/components/modals/email-us-modal"

const FEATURE_CARDS = [
  {
    emoji: "🍃",
    title: "Real Tea, Real Flavor",
    text: "We source premium, whole-leaf teas brewed fresh daily. No shortcuts, no sad tea bags.",
  },
  {
    emoji: "🧋",
    title: "Fresh Boba, Always",
    text: "Our tapioca pearls are cooked in small batches throughout the day — always warm, soft, and perfectly qq (bouncy and chewy).",
  },
  {
    emoji: "✨",
    title: "Your Drink, Your Way",
    text: "Sweetness levels, dairy alternatives, extra toppings — you call the shots. We just make the magic happen.",
  },
  {
    emoji: "🎓",
    title: "Hands-On Boba Experience",
    text: "Want to learn the secrets? Visit us and make boba teas with us! Craft your own signature blend or shake up a fresh batch.",
  },
]

const MENU_ITEMS = [
  { emoji: "🧋", name: "Classic Brown Sugar Boba Milk Tea" },
  { emoji: "🍠", name: "Taro Milk Tea" },
  { emoji: "🍵", name: "Matcha Green Tea Latte Boba" },
  { emoji: "🥭", name: "Mango Green Tea with Popping Boba" },
  { emoji: "🧡", name: "Thai Milk Tea" },
]

export function AboutUsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose()
          setMenuOpen(false)
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-[560px] flex-col gap-0 overflow-y-auto rounded-[24px] border border-white/[0.08] bg-[rgba(13,15,20,0.95)] p-8 text-[var(--text-primary)] sm:max-w-[560px]"
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-0.5 rounded-t-[24px]"
          style={{ background: "linear-gradient(90deg, #00FF88, transparent)" }}
        />

        <DialogClose
          render={
            <button
              type="button"
              aria-label="Close"
              className="absolute top-5 right-5 text-[var(--text-muted)] transition-colors hover:text-white"
            />
          }
        >
          <X className="size-5" />
        </DialogClose>

        <div className="flex flex-col items-center gap-3 text-center">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
            style={{
              background: "rgba(0,255,136,0.1)",
              border: "1px solid rgba(0,255,136,0.2)",
              color: "#00FF88",
            }}
          >
            🧋 Our Story
          </span>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Welcome to Bobaafied</h2>
          <p className="text-sm text-[var(--text-muted)]">
            We take tea seriously, but ourselves? Not so much.
          </p>
        </div>

        <div className="my-5 h-px w-full bg-white/[0.06]" />

        <p className="text-sm leading-[1.7] text-[var(--text-muted)]">
          It all started with a simple, unmistakable craving: high-quality tea, perfectly chewy
          boba, and zero artificial nonsense. We got tired of sad, powdery milk teas and
          underwhelming tapioca, so we decided to brew the change we wanted to see in the cup.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {FEATURE_CARDS.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 transition-all duration-200 ease-in-out hover:border-[rgba(0,255,136,0.2)]"
            >
              <span className="mb-2 block text-2xl">{card.emoji}</span>
              <p className="text-[13px] font-bold text-white">{card.title}</p>
              <p className="mt-1 text-xs leading-[1.6] text-[var(--text-muted)]">{card.text}</p>
            </div>
          ))}
        </div>

        <p className="mt-5 text-center text-[13px] text-[var(--text-muted)] italic">
          Come for the boba, stay for the good vibes! 🧡
        </p>

        <div className="my-5 h-px w-full bg-white/[0.06]" />

        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-full px-6 py-2.5 text-sm font-semibold text-[#0F1117] transition-shadow hover:shadow-[0_0_16px_rgba(0,255,136,0.35)]"
            style={{ backgroundColor: "#00FF88" }}
          >
            Visit Our Menu →
          </button>

          <div
            className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${
              menuOpen ? "mt-2 max-h-[420px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="rounded-2xl border border-white/[0.08] bg-[rgba(13,15,20,0.98)] p-2">
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-xs font-bold text-white">Our Menu</span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px]"
                  style={{ background: "rgba(124,110,250,0.15)", color: "#7C6EFA" }}
                >
                  Coming Soon 🚀
                </span>
              </div>
              {MENU_ITEMS.map((item) => (
                <div
                  key={item.name}
                  className="flex cursor-default items-center gap-2.5 rounded-[10px] border-l-2 border-transparent px-3 py-2.5 text-[13px] text-[var(--text-primary)] transition-all duration-150 ease-in-out hover:border-l-[#00FF88] hover:bg-white/[0.04]"
                >
                  <span aria-hidden="true">{item.emoji}</span>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Bridges the existing (unmodified) FloatingActionNav's "About Us" / "Email Us"
 * placeholder links to these modals, without editing components/nav/dashboard-nav.tsx
 * — that file is out of scope for this stage. Since layout.tsx renders that nav as a
 * plain Server Component tree, there's no prop path to wire real onClick handlers into
 * it; this wraps it in a client boundary and delegates clicks by matching the emoji
 * already present in its (unchanged) button labels. Fragile if that emoji ever changes,
 * but avoids touching a file outside this stage's allowed list.
 */
export function DashboardNavModalTriggers({ children }: { children: React.ReactNode }) {
  const [showAbout, setShowAbout] = useState(false)
  const [showEmail, setShowEmail] = useState(false)

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const link = (e.target as HTMLElement).closest("a")
    if (!link) return
    const text = link.textContent ?? ""
    if (text.includes("🫧")) {
      e.preventDefault()
      setShowAbout(true)
    } else if (text.includes("✉️")) {
      e.preventDefault()
      setShowEmail(true)
    }
  }

  return (
    <>
      <div onClick={handleClick}>{children}</div>
      <AboutUsModal open={showAbout} onClose={() => setShowAbout(false)} />
      <EmailUsModal open={showEmail} onClose={() => setShowEmail(false)} />
    </>
  )
}

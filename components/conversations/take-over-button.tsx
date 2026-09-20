"use client"

import { useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function TakeOverButton({
  conversationId,
  aiEnabled,
  onChange,
}: {
  conversationId: string
  aiEnabled: boolean
  onChange: (aiEnabled: boolean) => void
}) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    const action = aiEnabled ? "takeover" : "resume"
    setLoading(true)

    try {
      const res = await fetch(`/api/conversations/${conversationId}/takeover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (!res.ok) {
        throw new Error("Request failed")
      }

      onChange(!aiEnabled)
      toast.success(aiEnabled ? "You're now handling this conversation." : "AI resumed.")
    } catch {
      toast.error("Failed to update conversation. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-60",
        aiEnabled
          ? "bg-[rgba(255,107,107,0.15)] border-[rgba(255,107,107,0.3)] text-[#FF6B6B] hover:bg-[rgba(255,107,107,0.25)]"
          : "bg-[rgba(0,255,136,0.12)] border-[rgba(0,255,136,0.2)] text-[#00FF88]"
      )}
    >
      {loading ? "Updating..." : aiEnabled ? "⚡ Take Over" : "🤖 Return to AI"}
    </button>
  )
}

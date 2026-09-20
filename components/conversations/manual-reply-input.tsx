"use client"

import { useState } from "react"
import { toast } from "sonner"
import { SendHorizontal } from "lucide-react"

export function ManualReplyInput({ conversationId }: { conversationId: string }) {
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)

  async function handleSend() {
    if (!text.trim()) return
    setSending(true)

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      })

      if (!res.ok) {
        throw new Error("Request failed")
      }

      setText("")
    } catch {
      toast.error("Failed to send message. Please try again.")
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className="shrink-0 border-t border-white/[0.06] px-5 py-4 backdrop-blur-[12px]"
      style={{ background: "rgba(13,15,20,0.9)" }}
    >
      <span
        className="mb-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
        style={{ background: "rgba(255,107,107,0.12)", color: "#FF6B6B" }}
      >
        👤 Human mode active
      </span>
      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your reply..."
          rows={2}
          disabled={sending}
          className="flex-1 resize-none rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-[15px] text-[var(--text-primary)] transition-colors placeholder:text-[var(--text-muted)] focus:border-[rgba(0,255,136,0.3)] focus:outline-none disabled:opacity-60"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !text.trim()}
          aria-label="Send reply"
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-[#0F1117] transition-shadow hover:shadow-[0_0_16px_rgba(0,255,136,0.45)] disabled:opacity-50"
          style={{ backgroundColor: "#00FF88" }}
        >
          <SendHorizontal className="size-4" />
        </button>
      </div>
    </div>
  )
}

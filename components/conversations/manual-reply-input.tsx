"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

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
    <div className="flex items-end gap-2">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a manual reply..."
        className="min-h-10"
        disabled={sending}
      />
      <Button onClick={handleSend} disabled={sending || !text.trim()}>
        {sending ? "Sending..." : "Send"}
      </Button>
    </div>
  )
}

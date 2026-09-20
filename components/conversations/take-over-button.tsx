"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

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
    <Button variant={aiEnabled ? "outline" : "secondary"} size="sm" disabled={loading} onClick={handleClick}>
      {loading ? "Updating..." : aiEnabled ? "Take Over" : "Resume AI"}
    </Button>
  )
}

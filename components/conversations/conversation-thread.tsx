"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { maskPhoneNumber } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageBubble } from "@/components/conversations/message-bubble"
import { TakeOverButton } from "@/components/conversations/take-over-button"
import { ManualReplyInput } from "@/components/conversations/manual-reply-input"
import { AiEnabledBadge } from "@/components/conversations/ai-enabled-badge"
import type { Conversation, Message } from "@/lib/types"

export function ConversationThread({
  conversation,
  initialMessages,
}: {
  conversation: Conversation
  initialMessages: Message[]
}) {
  const [messages, setMessages] = useState(initialMessages)
  const [aiEnabled, setAiEnabled] = useState(conversation.ai_enabled)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages(initialMessages)
    setAiEnabled(conversation.ai_enabled)
  }, [conversation.id, initialMessages, conversation.ai_enabled])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`conversation-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const row = payload.new as Message
          setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]))
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: `id=eq.${conversation.id}`,
        },
        (payload) => {
          const row = payload.new as Conversation
          setAiEnabled(row.ai_enabled)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversation.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const maskedNumber = maskPhoneNumber(conversation.wa_id)
  const title = conversation.contact_name || maskedNumber

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{maskedNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          <AiEnabledBadge aiEnabled={aiEnabled} />
          <TakeOverButton conversationId={conversation.id} aiEnabled={aiEnabled} onChange={setAiEnabled} />
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1 p-4">
        <div className="flex flex-col gap-3">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {!aiEnabled && (
        <div className="shrink-0 border-t border-border p-3">
          <ManualReplyInput conversationId={conversation.id} />
        </div>
      )}
    </div>
  )
}

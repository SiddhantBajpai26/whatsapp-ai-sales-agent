"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { isSameDay, isToday, isYesterday, format } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { maskName, maskPhoneNumber } from "@/lib/utils"
import { getAvatarColor, getAvatarInitials } from "@/components/conversations/conversation-list-item"
import { MessageBubble } from "@/components/conversations/message-bubble"
import { TakeOverButton } from "@/components/conversations/take-over-button"
import { ManualReplyInput } from "@/components/conversations/manual-reply-input"
import { AiEnabledBadge } from "@/components/conversations/ai-enabled-badge"
import type { Conversation, Message } from "@/lib/types"

function formatDateSeparator(dateString: string): string {
  const date = new Date(dateString)
  if (isToday(date)) return "Today"
  if (isYesterday(date)) return "Yesterday"
  return format(date, "EEE d MMM")
}

function MessageSkeletons() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
          <div className="h-12 w-2/5 animate-pulse rounded-2xl bg-white/[0.06]" />
        </div>
      ))}
    </div>
  )
}

export function ConversationThread({
  conversation,
  initialMessages,
}: {
  conversation: Conversation
  initialMessages: Message[]
}) {
  const [messages, setMessages] = useState(initialMessages)
  const [aiEnabled, setAiEnabled] = useState(conversation.ai_enabled)
  const [nameRevealed, setNameRevealed] = useState(false)
  const [numberRevealed, setNumberRevealed] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages(initialMessages)
    setAiEnabled(conversation.ai_enabled)
    setNameRevealed(false)
    setNumberRevealed(false)
    setLoading(false)
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

  const displayNumber = numberRevealed ? conversation.wa_id : maskPhoneNumber(conversation.wa_id)
  const title = conversation.contact_name
    ? nameRevealed
      ? conversation.contact_name
      : maskName(conversation.contact_name)
    : displayNumber
  const avatarColor = getAvatarColor(conversation.contact_name || conversation.wa_id)
  const avatarInitials = getAvatarInitials(conversation.contact_name, conversation.wa_id)

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-[#0F1117]">
      <div
        className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.06] px-5 backdrop-blur-[12px]"
        style={{ background: "rgba(13,15,20,0.8)" }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard/conversations"
            aria-label="Back to conversations"
            className="shrink-0 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] md:hidden"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[#0F1117]"
            style={{ backgroundColor: avatarColor }}
          >
            {avatarInitials}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <p className="truncate text-sm font-medium text-[var(--text-primary)]">{title}</p>
              {conversation.contact_name && (
                <button
                  type="button"
                  aria-label={nameRevealed ? "Hide contact name" : "Show contact name"}
                  className="shrink-0 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                  onClick={() => setNameRevealed((r) => !r)}
                >
                  {nameRevealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              )}
            </div>
            <div className="flex items-center gap-1">
              <p className="truncate text-xs text-[var(--text-muted)]">{displayNumber}</p>
              <button
                type="button"
                aria-label={numberRevealed ? "Hide phone number" : "Show phone number"}
                className="shrink-0 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                onClick={() => setNumberRevealed((r) => !r)}
              >
                {numberRevealed ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
              </button>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <AiEnabledBadge aiEnabled={aiEnabled} />
          <TakeOverButton conversationId={conversation.id} aiEnabled={aiEnabled} onChange={setAiEnabled} />
        </div>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
        {loading ? (
          <MessageSkeletons />
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message, index) => {
              const prev = messages[index - 1]
              const showSeparator =
                !prev || !isSameDay(new Date(prev.created_at), new Date(message.created_at))
              return (
                <div key={message.id} className="flex flex-col gap-3">
                  {showSeparator && (
                    <div className="my-1 flex justify-center">
                      <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[11px] text-[var(--text-muted)]">
                        {formatDateSeparator(message.created_at)}
                      </span>
                    </div>
                  )}
                  <MessageBubble
                    message={message}
                    contactName={conversation.contact_name}
                    waId={conversation.wa_id}
                  />
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {!aiEnabled && <ManualReplyInput conversationId={conversation.id} />}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent; }
      `}</style>
    </div>
  )
}

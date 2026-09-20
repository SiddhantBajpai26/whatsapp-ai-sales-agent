"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Search } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { maskPhoneNumber } from "@/lib/utils"
import {
  ConversationListItem,
  type ConversationListItemData,
} from "@/components/conversations/conversation-list-item"
import type { Conversation, Message } from "@/lib/types"

function sortByLastMessage(list: ConversationListItemData[]) {
  return [...list].sort(
    (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
  )
}

export function ConversationList({
  conversations,
  selectedId,
}: {
  conversations: ConversationListItemData[]
  selectedId: string | null
}) {
  const [list, setList] = useState(conversations)
  const [query, setQuery] = useState("")
  const listRef = useRef(list)

  useEffect(() => {
    setList(conversations)
  }, [conversations])

  useEffect(() => {
    listRef.current = list
  }, [list])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("conversation-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        (payload) => {
          const row = payload.new as Conversation
          if (!row?.id) return

          setList((prev) => {
            const exists = prev.some((c) => c.id === row.id)
            const next = exists
              ? prev.map((c) => (c.id === row.id ? { ...c, ...row } : c))
              : [...prev, { ...row, lastMessagePreview: null }]
            return sortByLastMessage(next)
          })
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const row = payload.new as Message
          if (!row?.conversation_id) return

          if (row.role === "user") {
            const known = listRef.current.find((c) => c.id === row.conversation_id)
            const name = known ? known.contact_name || maskPhoneNumber(known.wa_id) : "a customer"
            toast.info(`New message from ${name}`, { description: row.content })
          }

          setList((prev) => {
            const exists = prev.some((c) => c.id === row.conversation_id)
            if (!exists) return prev
            const next = prev.map((c) =>
              c.id === row.conversation_id
                ? {
                    ...c,
                    lastMessagePreview: row.content,
                    last_message_at: row.created_at,
                  }
                : c
            )
            return sortByLastMessage(next)
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredList = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter((c) => {
      const haystack = `${c.contact_name ?? ""} ${c.wa_id} ${c.lastMessagePreview ?? ""}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [list, query])

  return (
    <div className="flex h-full w-full min-h-0 flex-col border-r border-white/[0.06] bg-[#0D0F14] md:w-80">
      <div className="shrink-0 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full rounded-full border border-white/[0.08] bg-white/[0.04] py-2.5 pr-4 pl-10 text-[13px] text-[var(--text-primary)] transition-colors placeholder:text-[var(--text-muted)] focus:border-[rgba(0,255,136,0.3)] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between px-4 pb-2">
        <span className="text-[11px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
          All Conversations
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ background: "rgba(0,255,136,0.12)", color: "#00FF88" }}
        >
          {list.length} {list.length === 1 ? "chat" : "chats"}
        </span>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        {list.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <span className="text-4xl">🧋</span>
            <p className="text-sm font-medium text-[var(--text-primary)]">No conversations yet</p>
            <p className="text-xs text-[var(--text-muted)]">
              Messages will appear here when customers contact you on WhatsApp
            </p>
          </div>
        ) : filteredList.length === 0 ? (
          <p className="p-6 text-center text-sm text-[var(--text-muted)]">No conversations found</p>
        ) : (
          filteredList.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              selected={conversation.id === selectedId}
            />
          ))
        )}
      </div>

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

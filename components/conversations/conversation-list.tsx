"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { maskPhoneNumber } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
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

  return (
    <div className="flex min-h-0 w-80 shrink-0 flex-col border-r border-border">
      <ScrollArea className="min-h-0 flex-1">
        {list.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No conversations yet.</p>
        ) : (
          list.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              selected={conversation.id === selectedId}
            />
          ))
        )}
      </ScrollArea>
    </div>
  )
}

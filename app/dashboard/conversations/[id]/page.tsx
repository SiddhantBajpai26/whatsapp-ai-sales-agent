import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ConversationList } from "@/components/conversations/conversation-list"
import { ConversationThread } from "@/components/conversations/conversation-thread"
import type { ConversationListItemData } from "@/components/conversations/conversation-list-item"
import type { Conversation, Message } from "@/lib/types"

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: rows }, { data: conversation }, { data: messages }] = await Promise.all([
    supabase
      .from("conversations")
      .select("*, messages(content, created_at)")
      .order("last_message_at", { ascending: false })
      .order("created_at", { ascending: false, referencedTable: "messages" })
      .limit(1, { referencedTable: "messages" }),
    supabase.from("conversations").select("*").eq("id", id).single(),
    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true }),
  ])

  if (!conversation) notFound()

  const conversations: ConversationListItemData[] = (rows ?? []).map((row) => {
    const { messages: preview, ...rest } = row as typeof row & {
      messages: { content: string; created_at: string }[]
    }
    return { ...rest, lastMessagePreview: preview?.[0]?.content ?? null }
  })

  return (
    <div className="flex h-full min-h-0">
      <div className="hidden min-h-0 md:flex">
        <ConversationList conversations={conversations} selectedId={id} />
      </div>
      <ConversationThread
        conversation={conversation as Conversation}
        initialMessages={(messages as Message[]) ?? []}
      />
    </div>
  )
}

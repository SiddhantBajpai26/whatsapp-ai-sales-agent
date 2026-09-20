import { createClient } from "@/lib/supabase/server"
import { ConversationList } from "@/components/conversations/conversation-list"
import type { ConversationListItemData } from "@/components/conversations/conversation-list-item"

export default async function ConversationsPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from("conversations")
    .select("*, messages(content, created_at)")
    .order("last_message_at", { ascending: false })
    .order("created_at", { ascending: false, referencedTable: "messages" })
    .limit(1, { referencedTable: "messages" })

  const conversations: ConversationListItemData[] = (data ?? []).map((row) => {
    const { messages, ...conversation } = row as typeof row & {
      messages: { content: string; created_at: string }[]
    }
    return { ...conversation, lastMessagePreview: messages?.[0]?.content ?? null }
  })

  return (
    <div className="flex h-full min-h-0">
      <ConversationList conversations={conversations} selectedId={null} />
      <div className="hidden min-h-0 flex-1 flex-col items-center justify-center gap-2 bg-[#0F1117] px-6 text-center md:flex">
        <span className="text-5xl">💬</span>
        <p className="text-base font-medium text-[var(--text-primary)]">Select a conversation</p>
        <p className="max-w-xs text-sm text-[var(--text-muted)]">
          Choose a conversation from the left to view messages
        </p>
      </div>
    </div>
  )
}

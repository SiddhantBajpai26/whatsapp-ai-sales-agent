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
    <div className="flex h-full">
      <ConversationList conversations={conversations} selectedId={null} />
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Select a conversation to view messages.
      </div>
    </div>
  )
}

import Link from "next/link"
import { cn, formatRelativeTime, maskPhoneNumber } from "@/lib/utils"
import { AiEnabledBadge } from "@/components/conversations/ai-enabled-badge"
import type { Conversation } from "@/lib/types"

export interface ConversationListItemData extends Conversation {
  lastMessagePreview: string | null
}

export function ConversationListItem({
  conversation,
  selected,
}: {
  conversation: ConversationListItemData
  selected: boolean
}) {
  const title = conversation.contact_name || maskPhoneNumber(conversation.wa_id)

  return (
    <Link
      href={`/dashboard/conversations/${conversation.id}`}
      className={cn(
        "flex flex-col gap-1 border-b border-border px-4 py-3 transition-colors hover:bg-muted",
        selected && "bg-muted"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium">{title}</span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {formatRelativeTime(conversation.last_message_at)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs text-muted-foreground">
          {conversation.lastMessagePreview ?? "No messages yet"}
        </span>
        <AiEnabledBadge aiEnabled={conversation.ai_enabled} />
      </div>
    </Link>
  )
}

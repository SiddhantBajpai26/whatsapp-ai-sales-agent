import { getAvatarColor, getAvatarInitials } from "@/components/conversations/conversation-list-item"
import type { Message } from "@/lib/types"

function formatBubbleTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
}

export function MessageBubble({
  message,
  contactName,
  waId,
}: {
  message: Message
  contactName: string | null
  waId: string
}) {
  const time = formatBubbleTime(message.created_at)

  if (message.role === "user") {
    const color = getAvatarColor(contactName || waId)
    const initials = getAvatarInitials(contactName, waId)

    return (
      <div className="flex items-end justify-start gap-2">
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-[#0F1117]"
          style={{ backgroundColor: color }}
        >
          {initials}
        </span>
        <div className="flex max-w-[70%] flex-col items-start gap-1">
          <div className="rounded-[4px_18px_18px_18px] border border-white/[0.08] bg-white/[0.06] px-3.5 py-2.5 text-[15px] text-[var(--text-primary)]">
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          <span className="pl-1 text-[11px] text-[var(--text-muted)]">{time}</span>
        </div>
      </div>
    )
  }

  const isAssistant = message.role === "assistant"

  return (
    <div className="flex items-end justify-end gap-2">
      <div className="flex max-w-[70%] flex-col items-end gap-1">
        <div
          className="rounded-[18px_4px_18px_18px] border px-3.5 py-2.5 text-[15px] text-[var(--text-primary)]"
          style={
            isAssistant
              ? { background: "rgba(0,255,136,0.08)", borderColor: "rgba(0,255,136,0.15)" }
              : { background: "rgba(124,110,250,0.12)", borderColor: "rgba(124,110,250,0.2)" }
          }
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <span className="pr-1 text-[11px] text-[var(--text-muted)]">{time}</span>
      </div>
      <span className="shrink-0 pb-1 text-base leading-none" aria-hidden="true">
        {isAssistant ? "🤖" : "👤"}
      </span>
    </div>
  )
}

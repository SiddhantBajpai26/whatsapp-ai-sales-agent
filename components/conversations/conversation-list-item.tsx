"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { formatDistanceToNowStrict, isYesterday } from "date-fns"
import { cn, maskName, maskPhoneNumber } from "@/lib/utils"
import { AiEnabledBadge } from "@/components/conversations/ai-enabled-badge"
import type { Conversation } from "@/lib/types"

export interface ConversationListItemData extends Conversation {
  lastMessagePreview: string | null
}

export const AVATAR_COLORS = ["#7C6EFA", "#00FF88", "#FF6B6B", "#FFB347", "#4FC3F7"]

/** Deterministically picks a color from AVATAR_COLORS for a given name/id. */
export function getAvatarColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i)) % AVATAR_COLORS.length
  }
  return AVATAR_COLORS[hash]
}

/** Initials derived from the masked name (e.g. "Pri*** Raj***" -> "PR"), or the last 2 digits of the number. */
export function getAvatarInitials(name: string | null, waId: string): string {
  if (name) {
    const letters = maskName(name)
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
    return letters.slice(0, 2) || "?"
  }
  return waId.slice(-2)
}

/** Compact relative time, e.g. "2m ago", "1h ago", "Yesterday". */
export function formatCompactTime(dateString: string): string {
  const date = new Date(dateString)
  if (isYesterday(date)) return "Yesterday"
  return formatDistanceToNowStrict(date, { addSuffix: true })
    .replace(/ seconds?/, "s")
    .replace(/ minutes?/, "m")
    .replace(/ hours?/, "h")
    .replace(/ days?/, "d")
    .replace(/ months?/, "mo")
    .replace(/ years?/, "y")
}

export function ConversationListItem({
  conversation,
  selected,
}: {
  conversation: ConversationListItemData
  selected: boolean
}) {
  const [nameRevealed, setNameRevealed] = useState(false)
  const [numberRevealed, setNumberRevealed] = useState(false)

  const hasName = Boolean(conversation.contact_name)
  const revealed = hasName ? nameRevealed : numberRevealed
  const displayName = hasName
    ? nameRevealed
      ? conversation.contact_name!
      : maskName(conversation.contact_name!)
    : numberRevealed
      ? conversation.wa_id
      : maskPhoneNumber(conversation.wa_id)

  const avatarColor = getAvatarColor(conversation.contact_name || conversation.wa_id)
  const avatarInitials = getAvatarInitials(conversation.contact_name, conversation.wa_id)

  return (
    <Link
      href={`/dashboard/conversations/${conversation.id}`}
      className={cn(
        "mx-2 my-1 flex items-center gap-3 rounded-xl border-l-[3px] border-transparent px-4 py-3.5 transition-all duration-150 ease-in-out",
        selected ? "border-l-[#00FF88] bg-[rgba(0,255,136,0.06)]" : "hover:bg-white/[0.03]"
      )}
    >
      <span
        className="flex size-[42px] shrink-0 items-center justify-center rounded-full text-sm font-bold text-[#0F1117]"
        style={{ backgroundColor: avatarColor }}
      >
        {avatarInitials}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1">
            <span className="truncate text-sm font-medium text-[var(--text-primary)]">{displayName}</span>
            <button
              type="button"
              aria-label={
                revealed
                  ? hasName
                    ? "Hide contact name"
                    : "Hide phone number"
                  : hasName
                    ? "Show contact name"
                    : "Show phone number"
              }
              className="shrink-0 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (hasName) {
                  setNameRevealed((r) => !r)
                } else {
                  setNumberRevealed((r) => !r)
                }
              }}
            >
              {revealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
          </span>
          <span className="shrink-0 text-[11px] text-[var(--text-muted)]">
            {formatCompactTime(conversation.last_message_at)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[13px] text-[var(--text-muted)]">
            {conversation.lastMessagePreview ?? "No messages yet"}
          </span>
          <AiEnabledBadge aiEnabled={conversation.ai_enabled} />
        </div>
      </div>
    </Link>
  )
}

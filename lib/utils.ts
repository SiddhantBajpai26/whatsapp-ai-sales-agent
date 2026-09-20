import { formatDistanceToNowStrict } from "date-fns"

export { cn } from "cn"

export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNowStrict(new Date(dateString), { addSuffix: true })
}

/** Masks all but the last 4 digits of a phone number, e.g. "919876543210" -> "********3210". */
export function maskPhoneNumber(waId: string): string {
  if (waId.length <= 4) return "*".repeat(waId.length)
  return "*".repeat(waId.length - 4) + waId.slice(-4)
}

/** Masks a contact name to first 3 chars + "***" per word, e.g. "Priyanka Rajeev" -> "Pri*** Raj***". */
export function maskName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ""

  const maskPart = (part: string) => `${part.slice(0, 3)}***`

  if (parts.length === 1) return maskPart(parts[0])
  return `${maskPart(parts[0])} ${maskPart(parts[parts.length - 1])}`
}

import { formatDistanceToNowStrict } from "date-fns"

export { cn } from "cn"

export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNowStrict(new Date(dateString), { addSuffix: true })
}

/** Masks the first 6 characters of a phone number, e.g. "919876543210" -> "******543210". */
export function maskPhoneNumber(waId: string): string {
  if (waId.length <= 6) return "*".repeat(waId.length)
  return "*".repeat(6) + waId.slice(6)
}

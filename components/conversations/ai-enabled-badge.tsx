import { Badge } from "@/components/ui/badge"

export function AiEnabledBadge({ aiEnabled }: { aiEnabled: boolean }) {
  if (aiEnabled) {
    return (
      <Badge variant="default" className="bg-emerald-600 text-white hover:bg-emerald-600">
        AI Active
      </Badge>
    )
  }

  return (
    <Badge variant="default" className="bg-amber-500 text-white hover:bg-amber-500">
      Human
    </Badge>
  )
}

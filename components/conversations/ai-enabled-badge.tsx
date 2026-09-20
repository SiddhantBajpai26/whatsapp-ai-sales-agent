export function AiEnabledBadge({ aiEnabled }: { aiEnabled: boolean }) {
  if (aiEnabled) {
    return (
      <span
        className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
        style={{ background: "rgba(0,255,136,0.12)", color: "#00FF88" }}
      >
        ● AI
      </span>
    )
  }

  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
      style={{ background: "rgba(255,107,107,0.12)", color: "#FF6B6B" }}
    >
      ● Human
    </span>
  )
}

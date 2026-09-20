import { cn } from "@/lib/utils"
import type { UiTheme } from "@/lib/types"

const THEMES: {
  id: UiTheme
  name: string
  description: string
  swatches: [string, string, string]
  headingFont: string
}[] = [
  {
    id: "boba-green",
    name: "Boba Green",
    description: "Playful & bubbly — the original brew.",
    swatches: ["#F5F8F6", "#17974C", "#16211C"],
    headingFont: "var(--font-boba-heading)",
  },
  {
    id: "milk-tea",
    name: "Milk Tea",
    description: "Warm brown-sugar boba tones.",
    swatches: ["#FBF3EB", "#8C5A2B", "#3A2A1E"],
    headingFont: "var(--font-milktea-heading)",
  },
  {
    id: "classic-slate",
    name: "Classic Slate",
    description: "Clean, calm, and professional.",
    swatches: ["#F4F6F8", "#3457D5", "#1B2430"],
    headingFont: "var(--font-slate-heading)",
  },
]

export function ThemePicker({
  value,
  onChange,
}: {
  value: UiTheme
  onChange: (theme: UiTheme) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {THEMES.map((theme) => {
        const selected = theme.id === value
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => onChange(theme.id)}
            aria-pressed={selected}
            className={cn(
              "flex flex-col gap-2.5 rounded-xl border p-3.5 text-left transition-colors",
              selected
                ? "border-primary ring-2 ring-primary/30"
                : "border-border hover:border-muted-foreground/40 hover:bg-muted/40"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {theme.swatches.map((color, i) => (
                  <span
                    key={i}
                    className="size-4 rounded-full border border-black/10"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              {selected && (
                <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  ✓
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ fontFamily: theme.headingFont }}>
                {theme.name}
              </p>
              <p className="text-xs text-muted-foreground">{theme.description}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

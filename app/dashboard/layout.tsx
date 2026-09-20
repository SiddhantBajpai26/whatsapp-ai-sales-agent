import { DashboardNav } from "@/components/nav/dashboard-nav"
import { createClient } from "@/lib/supabase/server"
import type { UiTheme } from "@/lib/types"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: config } = await supabase
    .from("business_config")
    .select("ui_theme")
    .eq("id", 1)
    .single()

  const theme: UiTheme = (config?.ui_theme as UiTheme) ?? "boba-green"

  return (
    <div data-brand-theme={theme} className="flex h-screen flex-col bg-background">
      <DashboardNav />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}

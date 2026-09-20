import { DashboardSidebar, FloatingActionNav } from "@/components/nav/dashboard-nav"
import { DashboardNavModalTriggers } from "@/components/modals/about-us-modal"
import { createClient } from "@/lib/supabase/server"
import type { UiTheme } from "@/lib/types"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const [{ data: config }, { data: userData }] = await Promise.all([
    supabase.from("business_config").select("ui_theme").eq("id", 1).single(),
    supabase.auth.getUser(),
  ])

  const theme: UiTheme = (config?.ui_theme as UiTheme) ?? "boba-green"

  return (
    <div data-brand-theme={theme}>
      <DashboardSidebar userEmail={userData?.user?.email ?? null} />
      <DashboardNavModalTriggers>
        <FloatingActionNav />
      </DashboardNavModalTriggers>
      <main className="ml-10 h-screen overflow-y-auto bg-[#0F1117] pt-20 md:ml-[260px]">
        {children}
      </main>
    </div>
  )
}

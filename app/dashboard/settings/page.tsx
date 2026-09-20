import { createClient } from "@/lib/supabase/server"
import { SettingsForm } from "@/components/settings/settings-form"
import type { BusinessConfig } from "@/lib/types"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: config } = await supabase
    .from("business_config")
    .select("*")
    .eq("id", 1)
    .single()

  return (
    <div className="h-full overflow-auto bg-[#0F1117] px-4 py-8 sm:px-8">
      <SettingsForm config={config as BusinessConfig} />
    </div>
  )
}

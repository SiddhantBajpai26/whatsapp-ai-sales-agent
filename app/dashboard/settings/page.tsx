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
    <div className="flex h-full items-start justify-center overflow-auto p-6">
      <SettingsForm config={config as BusinessConfig} />
    </div>
  )
}

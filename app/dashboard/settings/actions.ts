"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { settingsBodySchema } from "@/lib/validation"

export async function saveBusinessConfig(input: {
  business_name: string
  system_prompt: string
  tone: string
  ui_theme: string
}): Promise<{ error?: string }> {
  const parsed = settingsBodySchema.safeParse(input)
  if (!parsed.success) {
    return { error: "Please fill in all fields." }
  }

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) {
    return { error: "Unauthorized" }
  }

  const { error } = await supabase
    .from("business_config")
    .update({
      business_name: parsed.data.business_name,
      system_prompt: parsed.data.system_prompt,
      tone: parsed.data.tone,
      ui_theme: parsed.data.ui_theme,
    })
    .eq("id", 1)

  if (error) {
    console.error("[settings] failed to save business_config", error)
    return { error: "Failed to save settings." }
  }

  revalidatePath("/dashboard/settings")
  revalidatePath("/dashboard", "layout")
  return {}
}

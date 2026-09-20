import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { takeoverBodySchema } from "@/lib/validation"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const json = await request.json().catch(() => null)
  const parsed = takeoverBodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const aiEnabled = parsed.data.action === "resume"

  const admin = createAdminClient()
  const { data, error } = await admin
    .from("conversations")
    .update({ ai_enabled: aiEnabled })
    .eq("id", id)
    .select()
    .single()

  if (error || !data) {
    console.error("[takeover] failed to update conversation", error)
    return NextResponse.json({ error: "Failed to update conversation" }, { status: 500 })
  }

  return NextResponse.json({ conversation: data }, { status: 200 })
}

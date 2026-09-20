import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendWhatsAppMessage } from "@/lib/whatsapp"
import { manualSendBodySchema } from "@/lib/validation"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const json = await request.json().catch(() => null)
  const parsed = manualSendBodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: conversation, error: fetchError } = await admin
    .from("conversations")
    .select("wa_id")
    .eq("id", id)
    .single()

  if (fetchError || !conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
  }

  const sendResult = await sendWhatsAppMessage(conversation.wa_id, parsed.data.text)

  const { data: message, error: insertError } = await admin
    .from("messages")
    .insert({
      conversation_id: id,
      role: "human",
      content: parsed.data.text,
      message_type: "text",
      delivered: sendResult.ok,
    })
    .select()
    .single()

  if (insertError || !message) {
    console.error("[manual-send] failed to insert message", insertError)
    return NextResponse.json({ error: "Failed to record message" }, { status: 500 })
  }

  await admin
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", id)

  return NextResponse.json({ message, sent: sendResult.ok }, { status: 200 })
}

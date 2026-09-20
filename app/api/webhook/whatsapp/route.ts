import { NextRequest, NextResponse } from "next/server"
import { waitUntil } from "@vercel/functions"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendWhatsAppFallback } from "@/lib/whatsapp"
import { buildAndSendAiReply } from "@/lib/ai"
import { webhookPayloadSchema } from "@/lib/validation"

export const maxDuration = 30

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 })
  }

  return new NextResponse("Forbidden", { status: 403 })
}

export async function POST(request: NextRequest) {
  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ status: "ignored" }, { status: 200 })
  }

  const parsed = webhookPayloadSchema.safeParse(json)
  if (!parsed.success) {
    console.error("[webhook] invalid payload", parsed.error)
    return NextResponse.json({ status: "ignored" }, { status: 200 })
  }

  const value = parsed.data.entry?.[0]?.changes?.[0]?.value
  const message = value?.messages?.[0]

  if (!message || !message.from || !message.id) {
    // No inbound message (e.g. a delivery-status callback) — nothing to do.
    return NextResponse.json({ status: "ok" }, { status: 200 })
  }

  const waId = message.from
  const waMessageId = message.id
  const contactName = value?.contacts?.[0]?.profile?.name ?? null
  const messageType = message.type ?? "text"

  const admin = createAdminClient()

  const { data: conversation, error: upsertError } = await admin
    .from("conversations")
    .upsert(
      {
        wa_id: waId,
        contact_name: contactName,
        last_message_at: new Date().toISOString(),
      },
      { onConflict: "wa_id" }
    )
    .select()
    .single()

  if (upsertError || !conversation) {
    console.error("[webhook] failed to upsert conversation", upsertError)
    return NextResponse.json({ status: "error" }, { status: 200 })
  }

  const { error: insertError } = await admin.from("messages").insert({
    conversation_id: conversation.id,
    wa_message_id: waMessageId,
    role: "user",
    content: messageType === "text" ? message.text?.body ?? "" : `[${messageType} message]`,
    message_type: messageType,
    delivered: true,
  })

  if (insertError) {
    if (insertError.code === "23505") {
      // Duplicate wa_message_id — Meta retried delivery, already processed.
      return NextResponse.json({ status: "duplicate" }, { status: 200 })
    }
    console.error("[webhook] failed to insert message", insertError)
    return NextResponse.json({ status: "error" }, { status: 200 })
  }

  if (messageType !== "text") {
    await sendWhatsAppFallback(waId)
    return NextResponse.json({ status: "ok" }, { status: 200 })
  }

  if (conversation.ai_enabled) {
    waitUntil(buildAndSendAiReply(conversation.id, waId))
  }

  return NextResponse.json({ status: "ok" }, { status: 200 })
}

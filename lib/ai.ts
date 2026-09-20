import { createAdminClient } from "@/lib/supabase/admin"
import { getOpenAI } from "@/lib/openai"
import { sendWhatsAppMessage } from "@/lib/whatsapp"
import type { BusinessConfig, Message } from "@/lib/types"

const TROUBLE_TEXT =
  "We're having trouble responding right now — we'll get back to you shortly."

export async function buildAndSendAiReply(conversationId: string, waId: string) {
  const admin = createAdminClient()

  // Re-check right before acting, in case a human took over between the
  // webhook receiving this message and this deferred work actually running.
  const { data: conversation } = await admin
    .from("conversations")
    .select("ai_enabled")
    .eq("id", conversationId)
    .single()

  if (!conversation?.ai_enabled) return

  const { data: config } = await admin
    .from("business_config")
    .select("*")
    .eq("id", 1)
    .single<BusinessConfig>()

  const contextWindow = config?.context_window ?? 10

  const { data: history } = await admin
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(contextWindow)

  const orderedHistory = ((history as Pick<Message, "role" | "content">[] | null) ?? [])
    .slice()
    .reverse()

  const businessName = config?.business_name ?? "this business"
  const tone = config?.tone ?? "friendly"
  const systemPrompt = `You are an AI assistant for ${businessName}. Tone: ${tone}. ${config?.system_prompt ?? ""}`

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: config?.ai_model ?? "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...orderedHistory.map((m) => ({
          role: (m.role === "human" ? "assistant" : m.role) as "user" | "assistant",
          content: m.content,
        })),
      ],
    })

    const reply = completion.choices[0]?.message?.content?.trim()
    if (!reply) throw new Error("Empty completion from OpenAI")

    const sendResult = await sendWhatsAppMessage(waId, reply)

    await admin.from("messages").insert({
      conversation_id: conversationId,
      role: "assistant",
      content: reply,
      message_type: "text",
      delivered: sendResult.ok,
    })

    await admin
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId)
  } catch (err) {
    console.error("[ai] failed to generate/send reply", err)
    await sendWhatsAppMessage(waId, TROUBLE_TEXT)
  }
}

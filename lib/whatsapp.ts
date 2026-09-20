type SendResult = { ok: boolean; error?: string }

const FALLBACK_TEXT =
  "Thanks for your message! We can only understand text messages right now — could you type your question instead?"

export async function sendWhatsAppMessage(to: string, text: string): Promise<SendResult> {
  const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => "")
      console.error("[whatsapp] send failed", res.status, body)
      return { ok: false, error: `HTTP ${res.status}` }
    }

    return { ok: true }
  } catch (err) {
    console.error("[whatsapp] send threw", err)
    return { ok: false, error: (err as Error).message }
  }
}

export async function sendWhatsAppFallback(to: string): Promise<SendResult> {
  return sendWhatsAppMessage(to, FALLBACK_TEXT)
}

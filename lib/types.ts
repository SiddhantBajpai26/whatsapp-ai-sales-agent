export type MessageRole = "user" | "assistant" | "human"

export interface Conversation {
  id: string
  wa_id: string
  contact_name: string | null
  status: string
  ai_enabled: boolean
  last_message_at: string
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  wa_message_id: string | null
  role: MessageRole
  content: string
  message_type: string
  delivered: boolean
  created_at: string
}

export type UiTheme = "boba-green" | "milk-tea" | "classic-slate"

export interface BusinessConfig {
  id: number
  business_name: string
  system_prompt: string
  tone: string
  ai_model: string
  context_window: number
  ui_theme: UiTheme
  updated_at: string
}

export interface WhatsAppWebhookPayload {
  object?: string
  entry?: Array<{
    id?: string
    changes?: Array<{
      value?: {
        messaging_product?: string
        metadata?: { display_phone_number?: string; phone_number_id?: string }
        contacts?: Array<{ profile?: { name?: string }; wa_id?: string }>
        messages?: Array<{
          from?: string
          id?: string
          timestamp?: string
          type?: string
          text?: { body?: string }
        }>
      }
      field?: string
    }>
  }>
}

import { z } from "zod"

export const webhookPayloadSchema = z.object({
  object: z.string().optional(),
  entry: z
    .array(
      z.object({
        id: z.string().optional(),
        changes: z
          .array(
            z.object({
              value: z
                .object({
                  messaging_product: z.string().optional(),
                  metadata: z
                    .object({
                      display_phone_number: z.string().optional(),
                      phone_number_id: z.string().optional(),
                    })
                    .optional(),
                  contacts: z
                    .array(
                      z.object({
                        profile: z.object({ name: z.string().optional() }).optional(),
                        wa_id: z.string().optional(),
                      })
                    )
                    .optional(),
                  messages: z
                    .array(
                      z.object({
                        from: z.string().optional(),
                        id: z.string().optional(),
                        timestamp: z.string().optional(),
                        type: z.string().optional(),
                        text: z.object({ body: z.string().optional() }).optional(),
                      })
                    )
                    .optional(),
                })
                .optional(),
              field: z.string().optional(),
            })
          )
          .optional(),
      })
    )
    .optional(),
})

export const takeoverBodySchema = z.object({
  action: z.enum(["takeover", "resume"]),
})

export const manualSendBodySchema = z.object({
  text: z.string().trim().min(1).max(4096),
})

export const settingsBodySchema = z.object({
  business_name: z.string().trim().min(1).max(200),
  system_prompt: z.string().trim().min(1).max(8000),
  tone: z.string().trim().min(1).max(100),
  ui_theme: z.enum(["boba-green", "milk-tea", "classic-slate"]),
})

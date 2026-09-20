"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ThemePicker } from "@/components/settings/theme-picker"
import { saveBusinessConfig } from "@/app/dashboard/settings/actions"
import type { BusinessConfig, UiTheme } from "@/lib/types"

const TONE_OPTIONS = ["friendly", "professional", "casual", "formal", "enthusiastic"]

export function SettingsForm({ config }: { config: BusinessConfig }) {
  const [businessName, setBusinessName] = useState(config.business_name)
  const [systemPrompt, setSystemPrompt] = useState(config.system_prompt)
  const [tone, setTone] = useState(config.tone)
  const [uiTheme, setUiTheme] = useState<UiTheme>(config.ui_theme)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const result = await saveBusinessConfig({
      business_name: businessName,
      system_prompt: systemPrompt,
      tone,
      ui_theme: uiTheme,
    })

    setSaving(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }

    toast.success("Settings saved.")
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Business Settings</CardTitle>
        <CardDescription>
          This context is used by the AI when replying to WhatsApp messages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label>Dashboard theme</Label>
            <p className="text-xs text-muted-foreground">
              Changes the colors and fonts for everyone using this dashboard.
            </p>
            <div className="mt-1">
              <ThemePicker value={uiTheme} onChange={setUiTheme} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="business_name">Business name</Label>
            <Input
              id="business_name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tone">Tone</Label>
            <Select value={tone} onValueChange={(value) => value && setTone(value)}>
              <SelectTrigger id="tone" className="w-full">
                <SelectValue placeholder="Select a tone" />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="system_prompt">System prompt</Label>
            <Textarea
              id="system_prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="min-h-40"
              required
            />
          </div>

          <Button type="submit" disabled={saving} className="mt-2 self-start">
            {saving ? "Saving..." : "Save settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Store,
  Bot,
  MessageSquare,
  TriangleAlert,
  ChevronDown,
  LoaderCircle,
  CircleCheck,
  X,
} from "lucide-react"
import { saveBusinessConfig } from "@/app/dashboard/settings/actions"
import type { BusinessConfig, UiTheme } from "@/lib/types"

const DEFAULT_SYSTEM_PROMPT = "You are a helpful assistant for our business. Be concise and friendly."

const TONE_OPTIONS = [
  { value: "friendly", label: "😊 Friendly (default)" },
  { value: "professional", label: "💼 Professional" },
  { value: "playful", label: "🎉 Playful" },
  { value: "formal", label: "🤝 Formal" },
]

const MODEL_OPTIONS = [
  { value: "gpt-4o", label: "⚡ GPT-4o (Recommended)" },
  { value: "gpt-4o-mini", label: "🚀 GPT-4o Mini (Faster, cheaper)" },
]

const inputClass =
  "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-[var(--text-primary)] transition-all duration-200 ease-in-out placeholder:text-[var(--text-muted)] focus:border-[rgba(0,255,136,0.4)] focus:shadow-[0_0_0_3px_rgba(0,255,136,0.08)] focus:outline-none"

const selectClass =
  "w-full appearance-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 pr-10 text-sm text-[var(--text-primary)] transition-all duration-200 ease-in-out focus:border-[rgba(0,255,136,0.4)] focus:shadow-[0_0_0_3px_rgba(0,255,136,0.08)] focus:outline-none"

const labelClass = "mb-2 block text-[11px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase"

const helperClass = "mt-1.5 text-xs leading-[1.5] text-[var(--text-muted)]"

const cardClass =
  "mb-5 rounded-[20px] border border-white/[0.07] bg-white/[0.03] p-7 transition-colors duration-200 ease-in-out hover:border-white/[0.12]"

function CardHeader({
  icon: Icon,
  title,
  badge,
}: {
  icon: typeof Store
  title: string
  badge: string
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Icon className="size-5 text-[#00FF88]" />
          <span className="text-base font-bold text-white">{title}</span>
        </div>
        <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-[var(--text-muted)]">
          {badge}
        </span>
      </div>
      <div className="my-4 h-px w-full bg-white/[0.06]" />
    </>
  )
}

function SelectField({
  id,
  value,
  onChange,
  options,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={selectClass}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#13151A]">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-2 h-8 w-40 animate-pulse rounded-md bg-white/[0.06]" />
      <div className="mb-8 h-4 w-72 animate-pulse rounded-md bg-white/[0.06]" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="mb-5 h-40 animate-pulse rounded-[20px] bg-white/[0.03]" />
      ))}
    </div>
  )
}

type SaveState = "idle" | "saving" | "success" | "error"

export function SettingsForm({ config }: { config: BusinessConfig }) {
  const [loading, setLoading] = useState(true)
  const [businessName, setBusinessName] = useState(config.business_name)
  const [systemPrompt, setSystemPrompt] = useState(config.system_prompt)
  const [tone, setTone] = useState(config.tone)
  const [aiModel, setAiModel] = useState(config.ai_model)
  const [contextWindow, setContextWindow] = useState(config.context_window)
  // Theme selection is intentionally not exposed in this redesign (see summary note) —
  // the original stored value is preserved unchanged so saves keep validating correctly.
  const [uiTheme] = useState<UiTheme>(config.ui_theme)
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const [confirmingClear, setConfirmingClear] = useState(false)

  useEffect(() => {
    setLoading(false)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaveState("saving")

    const result = await saveBusinessConfig({
      business_name: businessName,
      system_prompt: systemPrompt,
      tone,
      ui_theme: uiTheme,
    })

    if (result?.error) {
      setSaveState("error")
      toast.error(result.error)
      setTimeout(() => setSaveState("idle"), 3000)
      return
    }

    setSaveState("success")
    toast.success("Settings saved.")
    setTimeout(() => setSaveState("idle"), 2000)
  }

  function handleResetPrompt() {
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT)
    toast.info("System prompt reset — click Save Changes to keep it.")
  }

  function handleClearAll() {
    setConfirmingClear(false)
    toast.error("Clearing conversations isn't available in this build yet.", {
      description: "This needs a dedicated backend endpoint that this settings redesign doesn't include.",
    })
  }

  if (loading) {
    return <SettingsSkeleton />
  }

  const promptLength = systemPrompt.length
  const counterColor =
    promptLength > 2000 ? "text-red-400" : promptLength > 1800 ? "text-amber-400" : "text-[var(--text-muted)]"
  const isPromptCustom = systemPrompt.trim() !== DEFAULT_SYSTEM_PROMPT

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Manage your Bobaafied AI agent configuration
        </p>
        <div className="mt-2 h-[3px] w-10 rounded-full bg-[#00FF88]" />
      </div>

      <form onSubmit={handleSubmit}>
        {/* Card 1: Business Identity */}
        <div className={cardClass}>
          <CardHeader icon={Store} title="Business Identity" badge={businessName || "Unnamed"} />

          <div className="mb-5">
            <label htmlFor="business_name" className={labelClass}>
              Business Name
            </label>
            <input
              id="business_name"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Bobaafied"
              className={inputClass}
              required
            />
            <p className={helperClass}>This name appears in AI responses to your customers</p>
          </div>

          <div>
            <label htmlFor="tone" className={labelClass}>
              Conversation Tone
            </label>
            <SelectField id="tone" value={tone} onChange={setTone} options={TONE_OPTIONS} />
          </div>
        </div>

        {/* Card 2: AI Configuration */}
        <div className={cardClass}>
          <CardHeader icon={Bot} title="AI Configuration" badge={aiModel} />

          <div className="mb-5">
            <label htmlFor="ai_model" className={labelClass}>
              AI Model
            </label>
            <SelectField id="ai_model" value={aiModel} onChange={setAiModel} options={MODEL_OPTIONS} />
          </div>

          <div>
            <label htmlFor="context_window" className={labelClass}>
              Context Window
            </label>
            <p className={helperClass}>
              Number of previous messages AI reads for context (recommended: 10)
            </p>
            <div className="mt-2 flex items-center gap-3">
              <input
                id="context_window"
                type="number"
                min={5}
                max={20}
                value={contextWindow}
                onChange={(e) => setContextWindow(Number(e.target.value))}
                className={`${inputClass} max-w-[120px]`}
              />
              <span className="text-lg font-semibold text-[var(--text-primary)]">
                {contextWindow} messages
              </span>
            </div>
          </div>

          <p className="mt-4 text-xs text-amber-400/90">
            AI model and context window editing isn&apos;t saved yet in this build — see summary.
          </p>
        </div>

        {/* Card 3: System Prompt */}
        <div className={cardClass}>
          <CardHeader
            icon={MessageSquare}
            title="System Prompt"
            badge={isPromptCustom ? "Custom" : "Default"}
          />

          <p className="mb-4 text-[13px] text-[var(--text-muted)]">
            This is the core instruction your AI agent follows. Be specific about your products,
            tone, and what the AI should or shouldn&apos;t say.
          </p>

          <textarea
            id="system_prompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={8}
            placeholder={
              "You are a helpful sales assistant for Bobaafied.\nYour tone is friendly and warm.\nYou help customers with:\n- Our boba tea menu and flavors\n- Store hours and location\n- Custom orders and sweetness levels\nNever make up prices. If unsure, say: 'Let me check that for you!'"
            }
            className="w-full resize-y rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 font-mono text-sm text-[#00FF88] transition-colors duration-200 ease-in-out placeholder:text-[var(--text-muted)] focus:border-[rgba(0,255,136,0.3)] focus:outline-none"
            required
          />
          <p className={`mt-1.5 text-right text-xs ${counterColor}`}>
            {promptLength} / 2000 characters
          </p>
        </div>

        {/* Card 4: Danger Zone */}
        <div
          className="mb-5 rounded-[20px] p-7"
          style={{ border: "1px solid rgba(255,107,107,0.15)", background: "rgba(255,107,107,0.03)" }}
        >
          <div className="flex items-center gap-2.5">
            <TriangleAlert className="size-5 text-[#FF6B6B]" />
            <span className="text-base font-bold text-white">Danger Zone</span>
          </div>
          <div className="my-4 h-px w-full bg-[rgba(255,107,107,0.1)]" />

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-white">Reset System Prompt</p>
              <p className="text-xs text-[var(--text-muted)]">Restore AI instructions to default</p>
            </div>
            <button
              type="button"
              onClick={handleResetPrompt}
              className="shrink-0 rounded-full px-4 py-2 text-sm font-medium text-[#FF6B6B] transition-colors hover:bg-[rgba(255,107,107,0.1)]"
              style={{ border: "1px solid rgba(255,107,107,0.3)" }}
            >
              Reset
            </button>
          </div>

          <div className="my-4 h-px w-full bg-[rgba(255,107,107,0.1)]" />

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-white">Clear All Conversations</p>
              <p className="text-xs text-[var(--text-muted)]">Permanently delete all chat history</p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmingClear(true)}
              className="shrink-0 rounded-full px-4 py-2 text-sm font-medium text-[#FF6B6B] transition-colors hover:bg-[rgba(255,107,107,0.1)]"
              style={{ border: "1px solid rgba(255,107,107,0.3)" }}
            >
              Clear All
            </button>
          </div>

          {confirmingClear && (
            <div className="mt-4 rounded-2xl border border-[rgba(255,107,107,0.2)] bg-[rgba(13,15,20,0.6)] p-4">
              <p className="text-sm text-white">Are you sure? This cannot be undone.</p>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmingClear(false)}
                  className="rounded-full px-4 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-white/[0.06]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="rounded-full bg-[#FF6B6B] px-4 py-2 text-sm font-semibold text-[#0F1117] transition-opacity hover:opacity-90"
                >
                  Confirm
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saveState === "saving"}
            className="inline-flex items-center gap-2 rounded-full px-10 py-3.5 text-[15px] font-bold text-[#0F1117] transition-shadow hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] disabled:opacity-70"
            style={{
              backgroundColor:
                saveState === "error" ? "#FF6B6B" : saveState === "success" ? "#00FF88" : "#00FF88",
            }}
          >
            {saveState === "saving" && <LoaderCircle className="size-4 animate-spin" />}
            {saveState === "success" && <CircleCheck className="size-4" />}
            {saveState === "error" && <X className="size-4" />}
            {saveState === "idle" && "Save Changes"}
            {saveState === "saving" && "Saving..."}
            {saveState === "success" && "Saved!"}
            {saveState === "error" && "Failed to save"}
          </button>
        </div>
      </form>
    </div>
  )
}

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # install dependencies
npm run dev         # start dev server (localhost:3000)
npm run build        # production build — also runs typecheck + lint
npm run lint         # ESLint only
npx tsc --noEmit       # typecheck only, faster than a full build
```

There is no test suite configured (no test script in `package.json`, no test framework installed). Don't invent test commands.

**Do not run `npm run build` while a `npm run dev` server is already running against the same `.next` directory** — a production build and a dev server corrupt each other's build cache, and the dev server will start 404ing on real routes until it's restarted (`rm -rf .next && npm run dev`). Prefer `npx tsc --noEmit` + `npm run lint` for verification while a dev server is live.

## Architecture

This is a Next.js 14 (App Router) app that runs a GPT-4o-powered WhatsApp auto-reply agent plus a staff dashboard, backed by Supabase (Postgres + Auth + Realtime).

### Request flow: WhatsApp → AI → WhatsApp

1. Meta POSTs inbound messages to `app/api/webhook/whatsapp/route.ts`. It upserts a `conversations` row by `wa_id`, inserts the message (relying on `messages.wa_message_id`'s unique constraint to silently dedupe Meta retries — a `23505` Postgres error there is treated as a normal no-op, not a failure).
2. If the message is text and `ai_enabled` is true on the conversation, the route calls `waitUntil(buildAndSendAiReply(...))` from `@vercel/functions` instead of awaiting it — this lets the route return `200` to Meta immediately while the OpenAI call + WhatsApp send happen after the response is sent. The webhook always returns `200` even on internal errors, to avoid Meta's retry/backoff behavior (duplicates are handled by the dedupe above regardless).
3. `lib/ai.ts` (`buildAndSendAiReply`) re-checks `ai_enabled` itself (closes a race against a human taking over mid-flight), builds the OpenAI messages array from `business_config` (system prompt/tone/model) plus the last `context_window` messages, and sends the reply via `lib/whatsapp.ts`.
4. `lib/whatsapp.ts`'s `sendWhatsAppMessage` never throws — it returns `{ ok, error }` and callers log/branch on it, since a failed WhatsApp send shouldn't crash message processing.

### Three Supabase clients — don't mix them up

- `lib/supabase/client.ts` — browser client (anon key). Used in Client Components for auth forms and Realtime subscriptions.
- `lib/supabase/server.ts` — cookie-aware server client (anon key). Used in Server Components/Server Actions/route handlers to read/write as the logged-in user, respecting RLS.
- `lib/supabase/admin.ts` — service-role client, bypasses RLS entirely. Only used server-side: the webhook, `lib/ai.ts`, and the two `app/api/conversations/[id]/*` mutation routes (after those routes confirm a session via the server client first). Never import this into a Client Component.

RLS on `conversations`/`messages`/`business_config` only grants `select`/`insert`/`update` to the `authenticated` role — there is **no delete policy on any table**. A "delete all conversations" feature would need a new service-role API route; it can't be done from a Client Component.

### Auth gating

`middleware.ts` redirects unauthenticated requests to `/dashboard/*` → `/login`, and redirects an already-authenticated visit to `/login` → `/` (the home page, not straight into the dashboard — home page has a "Go to Conversations" button instead). There's no self-service sign-up; staff users are created manually in the Supabase dashboard.

### The shadcn/ui setup here is non-standard — read before touching `components/ui/*`

This project's `shadcn` CLI version generated components on **`@base-ui/react` primitives, not Radix**, and a `cn` npm package (Tailwind-merge-aware) instead of a hand-rolled `clsx`+`tailwind-merge` combo. Concretely:
- No `asChild` prop exists on these components (that's a Radix convention). Polymorphism uses a `render` prop instead (see `DialogClose`'s usage in `components/ui/dialog.tsx`, or use `buttonVariants()` directly on a plain element, as done in `app/page.tsx`).
- The project also runs **Tailwind v4** (CSS-first config, `@theme inline` in `app/globals.css`), not v3 — `create-next-app@14` scaffolds v3 by default, but the shadcn output required upgrading. There is no `tailwind.config.ts`; all theme tokens live in `app/globals.css`.
- `components/ui/*` files are shadcn-generated; treat them as vendored unless a task specifically asks you to change one.

### Dashboard visual system

`app/globals.css` defines semantic color tokens (`--background`, `--primary`, `--border`, etc.) at `:root`, plus theme-preset overrides scoped under `[data-brand-theme="milk-tea"]` / `[data-brand-theme="classic-slate"]` (chosen via `business_config.ui_theme` and applied by `app/dashboard/layout.tsx`). **In practice this token system is now vestigial** — every page from the sidebar/navbar redesign onward (`components/nav/dashboard-nav.tsx`, all of `components/conversations/*`, `components/settings/settings-form.tsx`, `app/page.tsx`) was rebuilt with hardcoded dark-theme hex values (`#0F1117`, `#00FF88`, etc.) and a separate set of raw CSS custom properties added on top (`--bg-primary`, `--accent-green`, `--text-muted`, ...), also defined at `:root` in `globals.css`. The `ThemePicker` component (`components/settings/theme-picker.tsx`) and the 3-theme switcher are no longer rendered anywhere in the UI (removed from `settings-form.tsx`), even though `business_config.ui_theme` is still read, written, and validated end-to-end. Don't assume switching that DB value changes anything visible.

Several components embed a `<style>` tag with raw `@keyframes`/`::-webkit-scrollbar` rules directly in the `.tsx` file (e.g. the gradient mesh in `app/page.tsx`, the custom scrollbar in `conversation-thread.tsx`/`conversation-list.tsx`) rather than adding to `globals.css`. This was a deliberate pattern from scoped redesign passes that were restricted to touching only specific files — follow it for consistency rather than centralizing into global CSS, unless asked otherwise.

### Known incomplete wiring (intentional, not bugs)

- `components/settings/settings-form.tsx`: the AI Model and Context Window fields are rendered and interactive but **not persisted** — `saveBusinessConfig` (`app/dashboard/settings/actions.ts`) and `settingsBodySchema` (`lib/validation.ts`) only handle `business_name`, `system_prompt`, `tone`, `ui_theme`. Wiring those two fields up requires extending both.
- The "Clear All Conversations" danger-zone action shows a confirm dialog but does not delete anything (see the RLS note above for why) — it surfaces an explanatory toast instead of failing silently or faking success.
- `components/modals/about-us-modal.tsx` also exports `DashboardNavModalTriggers`, a click-delegation wrapper around the floating navbar's About Us/Email Us links. It matches clicks by the 🫧/✉️ emoji already in `dashboard-nav.tsx`'s (unmodified) button labels, because a Server Component (`app/dashboard/layout.tsx`) can't pass live `onClick` closures into a Client Component. If those labels/emoji ever change, this wiring silently breaks.
- Message masking: `lib/utils.ts`'s `maskPhoneNumber` (last-4-digits-visible) and `maskName` (first-3-chars-per-word) drive the eye-icon reveal/hide toggles in the conversations UI — per-conversation `useState`, not persisted, resets on navigation.

### Environment variables

`WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`, `OPENAI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — see `.env.local.example`. `WHATSAPP_ACCESS_TOKEN` should be a permanent System User token (Meta's temporary tokens from the "Try it out" panel expire in ~24h and have bitten this project before); see README for how to generate one.

`X-Hub-Signature-256` webhook signature verification is **not implemented** — only the `hub.verify_token` handshake on `GET`. This is a known gap, not an oversight to silently "fix" without being asked.

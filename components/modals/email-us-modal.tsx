"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"

const inputClass =
  "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-[var(--text-primary)] transition-all duration-200 ease-in-out placeholder:text-[var(--text-muted)] focus:border-[rgba(0,255,136,0.4)] focus:shadow-[0_0_0_3px_rgba(0,255,136,0.08)] focus:outline-none"

const labelClass = "mb-1.5 block text-xs font-medium tracking-wider text-[var(--text-muted)] uppercase"

interface FormErrors {
  name?: string
  email?: string
  message?: string
}

export function EmailUsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [sent, setSent] = useState(false)

  function resetForm() {
    setName("")
    setEmail("")
    setSubject("")
    setMessage("")
    setErrors({})
    setSent(false)
  }

  function handleClose() {
    onClose()
    resetForm()
  }

  function handleSend() {
    const nextErrors: FormErrors = {}
    if (!name.trim()) nextErrors.name = "Please enter your name."
    if (!email.trim()) nextErrors.email = "Please enter your email."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      nextErrors.email = "Please enter a valid email address."
    if (!message.trim()) nextErrors.message = "Please enter a message."

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    const mailtoLink = `mailto:hello@bobaafied.com?subject=${encodeURIComponent(
      subject.trim() || "Message from website"
    )}&body=${encodeURIComponent(body)}`

    window.location.href = mailtoLink
    setSent(true)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-[480px] flex-col gap-0 overflow-y-auto rounded-[24px] border border-white/[0.08] bg-[rgba(13,15,20,0.95)] p-8 text-[var(--text-primary)] sm:max-w-[480px]"
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-0.5 rounded-t-[24px]"
          style={{ background: "linear-gradient(90deg, #00FF88, transparent)" }}
        />

        <DialogClose
          render={
            <button
              type="button"
              aria-label="Close"
              className="absolute top-5 right-5 text-[var(--text-muted)] transition-colors hover:text-white"
            />
          }
        >
          <X className="size-5" />
        </DialogClose>

        {sent ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <span className="text-5xl">✅</span>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Message sent!</h2>
            <p className="text-sm text-[var(--text-muted)]">
              We&apos;ll get back to you soon. Thanks for reaching out! 🧋
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-4 rounded-full px-6 py-2.5 text-sm font-semibold text-[#0F1117] transition-shadow hover:shadow-[0_0_16px_rgba(0,255,136,0.35)]"
              style={{ backgroundColor: "#00FF88" }}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-3 text-center">
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  background: "rgba(0,255,136,0.1)",
                  border: "1px solid rgba(0,255,136,0.2)",
                  color: "#00FF88",
                }}
              >
                💬 Get In Touch
              </span>
              <h2 className="text-[22px] font-bold text-[var(--text-primary)]">Contact Bobaafied</h2>
              <p className="text-sm text-[var(--text-muted)]">
                We&apos;d love to hear from you. Drop us a message!
              </p>
            </div>

            <div className="my-5 h-px w-full bg-white/[0.06]" />

            <div className="mb-4">
              <label className={labelClass}>Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className={inputClass}
              />
              {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>}
            </div>

            <div className="mb-4">
              <label className={labelClass}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
            </div>

            <div className="mb-4">
              <label className={labelClass}>Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What's on your mind?"
                className={inputClass}
              />
            </div>

            <div className="mb-5">
              <label className={labelClass}>Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us anything — we read every message 🧋"
                rows={4}
                className={`${inputClass} resize-none`}
              />
              {errors.message && <p className="mt-1.5 text-xs text-red-400">{errors.message}</p>}
            </div>

            <button
              type="button"
              onClick={handleSend}
              className="w-full rounded-full py-3.5 text-[15px] font-semibold text-[#0F1117] transition-shadow hover:shadow-[0_0_16px_rgba(0,255,136,0.35)]"
              style={{ backgroundColor: "#00FF88" }}
            >
              Send Message →
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

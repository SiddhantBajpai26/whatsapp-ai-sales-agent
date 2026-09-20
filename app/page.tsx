import Link from "next/link"
import { BobaLogo } from "@/components/brand/boba-logo"
import { buttonVariants } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-background px-4 py-16 text-center">
      <div className="flex flex-col items-center gap-4">
        <BobaLogo size={56} className="text-primary" />
        <div>
          <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            Bobafied
          </h1>
          <p className="mt-2 max-w-md text-balance text-sm text-muted-foreground sm:text-base">
            Your AI sales agent for WhatsApp — chatting with customers, brewing replies, one
            order at a time.
          </p>
        </div>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
        <Link
          href="/dashboard/conversations"
          className={buttonVariants({ size: "lg", className: "sm:min-w-56" })}
        >
          Go to Conversations
        </Link>
        <button
          type="button"
          disabled
          title="Coming soon"
          className={buttonVariants({
            size: "lg",
            variant: "outline",
            className: "sm:min-w-56",
          })}
        >
          Visit Bobafied Website
          <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            Soon
          </span>
        </button>
      </div>
    </div>
  )
}

import { cn } from "@/lib/utils"
import type { Message } from "@/lib/types"

export function MessageBubble({ message }: { message: Message }) {
  const isCustomer = message.role === "user"

  return (
    <div className={cn("flex", isCustomer ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[70%] rounded-xl px-3 py-2 text-sm",
          isCustomer && "bg-muted text-foreground",
          message.role === "assistant" && "bg-primary text-primary-foreground",
          message.role === "human" && "bg-blue-600 text-white"
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        {message.role !== "user" && (
          <p className="mt-1 text-[10px] uppercase opacity-70">
            {message.role === "human" ? "Staff" : "AI"}
          </p>
        )}
      </div>
    </div>
  )
}

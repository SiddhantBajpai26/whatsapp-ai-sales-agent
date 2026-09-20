import type { Metadata } from "next"
import { Inter, Baloo_2, Nunito_Sans, Fraunces, Karla, Sora, Work_Sans } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
})
const bobaHeading = Baloo_2({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-boba-heading",
})
const bobaBody = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-boba-body",
})
const milkTeaHeading = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-milktea-heading",
})
const milkTeaBody = Karla({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-milktea-body",
})
const slateHeading = Sora({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-slate-heading",
})
const slateBody = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-slate-body",
})

export const metadata: Metadata = {
  title: "Bobafied — WhatsApp AI Sales Agent",
  description: "Business dashboard for the WhatsApp AI sales agent.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn(
        "light",
        inter.variable,
        bobaHeading.variable,
        bobaBody.variable,
        milkTeaHeading.variable,
        milkTeaBody.variable,
        slateHeading.variable,
        slateBody.variable
      )}
      style={{ colorScheme: "light" }}
    >
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}

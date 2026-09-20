import { LoginForm } from "@/components/auth/login-form"
import { BobaLogo } from "@/components/brand/boba-logo"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-4">
      <div className="flex items-center gap-2 text-primary">
        <BobaLogo size={30} />
        <span className="font-heading text-xl font-semibold text-foreground">Bobafied</span>
      </div>
      <LoginForm />
    </div>
  )
}

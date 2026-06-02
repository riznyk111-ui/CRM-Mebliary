import { logout } from "@/app/login/actions"
import { Button } from "@/components/ui/button"
import { Armchair, Clock, LogOut } from "lucide-react"

export const metadata = {
  title: "Очікування активації | MEBLIARY CRM",
}

export default function PendingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4 text-zinc-100 font-sans selection:bg-emerald-950 selection:text-emerald-400">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-md">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-900/20">
            <Armchair className="size-7 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-100">
            MEBLIARY CRM
          </h2>
        </div>

        {/* Pending Icon and Text */}
        <div className="mt-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative flex size-16 items-center justify-center rounded-full bg-zinc-800/50 border border-zinc-700/50 text-warning animate-pulse">
            <Clock className="size-8 text-amber-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-zinc-100">
            Акаунт очікує активації
          </h1>
          
          <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
            Ваш обліковий запис успішно створено, але він потребує підтвердження та надання прав доступу адміністратором.
          </p>
          
          <p className="text-xs text-emerald-500 bg-emerald-950/30 border border-emerald-900/30 px-3 py-1.5 rounded-full font-medium">
            Будь ласка, зверніться до керівника.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-zinc-800/80">
          <form action={logout}>
            <Button
              type="submit"
              variant="outline"
              className="w-full justify-center gap-2 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 text-zinc-400"
            >
              <LogOut className="size-4" />
              <span>Вийти з акаунта</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

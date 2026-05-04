import { login, signup, signInWithGoogle } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

function GoogleIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams
  const error = searchParams?.error

  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <Card className="w-full max-w-sm border-zinc-800 bg-zinc-950/50 shadow-2xl backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-zinc-100">Вхід у CRM</CardTitle>
          <CardDescription className="text-zinc-400">
            Введіть свій email та пароль для доступу до системи.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            {error && (
              <Alert variant="destructive" className="border-rose-900/50 bg-rose-950/50 text-rose-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-zinc-300">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                className="border-zinc-800 bg-zinc-900/50 text-zinc-100 placeholder:text-zinc-500"
                suppressHydrationWarning
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-zinc-300">Пароль</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                className="border-zinc-800 bg-zinc-900/50 text-zinc-100"
                suppressHydrationWarning
              />
            </div>
            <div className="flex flex-col gap-3 mt-2">
              <Button formAction={login} className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
                Увійти
              </Button>
              <Button formAction={signup} variant="outline" className="w-full border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                Зареєструвати новий акаунт
              </Button>
            </div>
          </form>
          
          <div className="mt-4 flex items-center justify-center">
            <span className="bg-zinc-950/50 px-2 text-xs text-zinc-500">АБО</span>
          </div>

          <form className="mt-4">
            <Button 
              formAction={signInWithGoogle} 
              variant="outline" 
              className="w-full border-zinc-800 bg-white text-black hover:bg-gray-100 hover:text-black"
            >
              <GoogleIcon className="mr-2 h-4 w-4" />
              Увійти через Google
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

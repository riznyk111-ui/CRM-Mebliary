'use client'

import { useState } from 'react'
import { Database, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react'

export default function DatabaseErrorPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      window.location.href = '/'
    }, 1000)
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background gradients for premium ambient look */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-xl backdrop-blur-xl bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/50">
        
        {/* Header section with Database status illustration */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-6">
            {/* Outer soft pulse ring */}
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-md animate-pulse" />
            
            {/* Main icon container */}
            <div className="relative flex items-center justify-center w-20 h-20 bg-slate-900 border border-red-500/30 rounded-2xl text-red-400">
              <Database className="w-10 h-10" />
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 rounded-full p-1 border border-slate-900">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-3">
            База даних недоступна
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-md">
            Схоже, що ваш проект бази даних на Supabase було призупинено через неактивність або виникли труднощі зі з'єднанням.
          </p>
        </div>

        {/* Step by Step recovery instructions */}
        <div className="space-y-4 mb-8 bg-slate-950/50 rounded-2xl p-5 border border-slate-800/50">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Як відновити роботу системи:
          </h2>
          
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-amber-400">
              1
            </div>
            <div className="text-sm text-slate-300">
              Увійдіть до особистого кабінету <span className="font-semibold text-white">Supabase Dashboard</span>.
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-amber-400">
              2
            </div>
            <div className="text-sm text-slate-300">
              Оберіть ваш проект та натисніть кнопку <span className="font-semibold text-white">"Restore project"</span> (Відновити проект).
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-amber-400">
              3
            </div>
            <div className="text-sm text-slate-300">
              Зачекайте 1-2 хвилини, доки база даних запуститься, і поверніться сюди для перевірки.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-750 text-white font-medium rounded-xl border border-slate-700/50 transition-colors shadow-sm duration-200"
          >
            Панель Supabase
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </a>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Перевірка з\'єднання...' : 'Спробувати знову'}
          </button>
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center text-xs text-slate-600">
          Якщо ви вже відновили проект у Supabase, але помилка залишається, будь ласка, зачекайте ще кілька хвилин або перевірте ваші API ключі в налаштуваннях Vercel.
        </div>
      </div>
    </main>
  )
}

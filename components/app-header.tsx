"use client"

import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

interface AppHeaderProps {
  title: string
}

export function AppHeader({ title }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background px-4">
      <SidebarTrigger />
      <h1 className="text-lg font-semibold">{title}</h1>
      
      <div className="ml-auto flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Пошук клієнтів..."
            className="w-64 bg-secondary pl-9"
          />
        </div>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          <Badge className="absolute -right-1 -top-1 size-5 rounded-full p-0 text-[10px] bg-destructive text-destructive-foreground">
            3
          </Badge>
          <span className="sr-only">Сповіщення</span>
        </Button>
      </div>
    </header>
  )
}

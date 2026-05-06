"use client"

import {
  LayoutDashboard,
  FolderKanban,
  Package,
  Wallet,
  Users,
  Settings,
  Armchair,
  LogOut,
  Calculator
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { logout } from "@/app/login/actions"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const navigationItems = [
  {
    title: "Дашборд",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Проєкти",
    url: "/projects",
    icon: FolderKanban,
  },
  {
    title: "Кошториси",
    url: "/estimates",
    icon: Calculator,
  },
  {
    title: "Склад",
    url: "/inventory",
    icon: Package,
  },
  {
    title: "Фінанси",
    url: "/finance",
    icon: Wallet,
  },
  {
    title: "Команда",
    url: "/team",
    icon: Users,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600">
            <Armchair className="size-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight group-data-[collapsible=icon]:hidden text-zinc-100">
            MEBLIARY
          </span>
        </Link>
      </SidebarHeader>
      <SidebarSeparator className="bg-zinc-800" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className="hover:bg-zinc-800 hover:text-emerald-400 data-[active=true]:bg-emerald-900/30 data-[active=true]:text-emerald-400"
                  >
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Налаштування" className="hover:bg-zinc-800 hover:text-zinc-200">
              <Link href="/settings">
                <Settings className="size-4" />
                <span>Налаштування</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <form action={logout}>
              <SidebarMenuButton tooltip="Вийти" type="submit" className="w-full hover:bg-rose-950/50 hover:text-rose-400 text-zinc-400">
                <LogOut className="size-4" />
                <span>Вийти</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('allowed_sections')
    .eq('id', user.id)
    .single()

  const allowedSections = profile?.allowed_sections || []

  return (
    <SidebarProvider>
      <AppSidebar allowedSections={allowedSections} />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

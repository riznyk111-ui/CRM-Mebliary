'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getAppSettings(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('app_settings')
    .select('data')
    .eq('id', id)
    .single()

  if (error) return null
  return data.data
}

export async function updateAppSettings(id: string, settings: any) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('app_settings')
    .upsert({ id, data: settings, updated_at: new Date().toISOString() })

  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}

export async function getCurrentUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return null
  return data
}

export async function updateCurrentUserProfile(profileData: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Користувач не авторизований" }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: profileData.name,
      phone: profileData.phone,
      role: profileData.role
    })
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}

export async function clearAllData() {
  const supabase = await createClient()
  
  // Видаляємо дані з основних таблиць
  await supabase.from('project_materials').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('project_team').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('project_files').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('inventory').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  revalidatePath('/')
  return { success: true }
}

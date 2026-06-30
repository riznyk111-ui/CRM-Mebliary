'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@/lib/supabase/server'
import { TeamMember } from '@/components/team-table'
import { fetchWithTimeout } from '@/lib/supabase/timeout-fetch'

// Використовуємо Service Role Key для створення користувачів та обходу RLS
const supabaseAdmin = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    global: {
      fetch: fetchWithTimeout,
    },
    cookies: {
      getAll() { return [] },
      setAll() {}
    }
  }
)

export async function getTeamMembers() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  
  if (error) {
    console.error('Помилка завантаження команди:', error)
    return []
  }

  return data.map((profile: any) => ({
    id: profile.id,
    name: profile.full_name || 'Без імені',
    role: profile.role || 'other',
    phone: profile.phone || '',
    email: profile.email || '',
    salary: profile.salary || 0,
    salaryType: profile.salary_type || 'fixed',
    percentageRate: profile.percentage_rate || 70,
    status: profile.status || 'active',
    photoUrl: profile.photo_url || '',
    allowedSections: profile.allowed_sections || [],
    hireDate: profile.hire_date || new Date().toISOString().split('T')[0],
    projectsCompleted: profile.projects_completed || 0,
    totalEarnings: profile.total_earnings || 0,
  })) as TeamMember[]
}

export async function addTeamMember(data: Omit<TeamMember, 'id' | 'projectsCompleted' | 'totalEarnings'>) {
  // 1. Створюємо користувача в Auth. Якщо email не вказано - генеруємо тимчасовий
  const userEmail = data.email && data.email.trim() !== '' 
    ? data.email 
    : `employee_${Date.now()}@mebliary.local`

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: userEmail,
    password: 'Password123!', // Дефолтний пароль для нових працівників
    email_confirm: true,
  })

  if (authError) {
    return { error: authError.message }
  }

  const userId = authData.user.id

  // 2. Додаємо/Оновлюємо дані в profiles
  const profileData = {
    id: userId,
    full_name: data.name,
    role: data.role,
    phone: data.phone || null,
    email: data.email || null,
    salary: data.salary,
    salary_type: data.salaryType,
    percentage_rate: data.percentageRate,
    status: data.status,
    hire_date: data.hireDate,
    photo_url: data.photoUrl,
    allowed_sections: data.allowedSections || [],
    projects_completed: 0,
    total_earnings: 0,
  }

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert(profileData)

  if (profileError) {
    return { error: profileError.message }
  }

  revalidatePath('/team')
  return { success: true }
}

export async function updateTeamMember(data: TeamMember) {
  const profileData = {
    full_name: data.name,
    role: data.role,
    phone: data.phone || null,
    email: data.email || null,
    salary: data.salary,
    salary_type: data.salaryType,
    percentage_rate: data.percentageRate,
    status: data.status,
    hire_date: data.hireDate,
    photo_url: data.photoUrl,
    allowed_sections: data.allowedSections || [],
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update(profileData)
    .eq('id', data.id)

  if (error) {
    return { error: error.message }
  }

  // Опціонально: оновити email в Auth, якщо він змінився і не порожній
  if (data.email && data.email.trim() !== '') {
    await supabaseAdmin.auth.admin.updateUserById(data.id, { email: data.email })
  }

  revalidatePath('/team')
  return { success: true }
}

export async function deleteTeamMember(id: string) {
  // Видалення з auth.users автоматично видалить запис з profiles (on delete cascade)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/team')
  return { success: true }
}

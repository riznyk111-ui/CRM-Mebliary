'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { Project } from '@/components/projects-table'
import { logInventoryAction } from '@/app/(dashboard)/inventory/actions'

export async function getProjects() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
  
  if (error) {
    console.error('Помилка завантаження проєктів:', error)
    return []
  }

  // Fetch all completed income transactions for paidAmount calculation
  const { data: transactions } = await supabase
    .from('transactions')
    .select('project_id, amount')
    .eq('type', 'income')
    .eq('status', 'completed')

  return data.map((p: any) => {
    const deadline = new Date(p.deadline)
    const today = new Date()
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const calculatedTotalAmount = (p.material_client_price || 0) + (p.hardware_client_price || 0) + (p.work_price || 0)
    
    // Sum transactions for this project
    const projectTxs = transactions?.filter((t: any) => t.project_id === p.id) || []
    const calculatedPaidAmount = projectTxs.reduce((sum: number, t: any) => sum + Number(t.amount), 0)

    const finalTotalAmount = calculatedTotalAmount > 0 ? calculatedTotalAmount : (p.total_amount || 0)

    return {
      id: p.id,
      projectNumber: p.project_number,
      name: p.name,
      client: p.client,
      status: p.status,
      deadline: p.deadline,
      totalAmount: finalTotalAmount,
      paidAmount: calculatedPaidAmount,
      daysLeft: diffDays > 0 ? diffDays : 0,
      materialClientPrice: p.material_client_price || 0,
      materialOurCost: p.material_our_cost || 0,
      hardwareClientPrice: p.hardware_client_price || 0,
      hardwareOurCost: p.hardware_our_cost || 0,
      workPrice: p.work_price || 0,
      clientPhone: p.client_phone || '',
      clientEmail: p.client_email || '',
    }
  }) as Project[]
}

export async function addProject(data: Omit<Project, 'id' | 'daysLeft'>) {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').insert({
    name: data.name,
    client: data.client,
    status: data.status,
    deadline: data.deadline,
    total_amount: data.totalAmount,
    paid_amount: data.paidAmount,
  })

  if (error) return { error: error.message }
  revalidatePath('/projects')
  return { success: true }
}

export async function updateProject(data: Project) {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').update({
    name: data.name,
    client: data.client,
    status: data.status,
    deadline: data.deadline,
    total_amount: data.totalAmount,
    paid_amount: data.paidAmount,
  }).eq('id', data.id)

  if (error) return { error: error.message }
  revalidatePath('/projects')
  return { success: true }
}

export async function updateProjectStatus(id: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').update({ status }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/projects')
  return { success: true }
}

export async function deleteProject(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').delete().eq('id', id)
  
  if (error) return { error: error.message }
  revalidatePath('/projects')
  return { success: true }
}

export async function getProjectMaterials(projectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('project_materials')
    .select(`
      id,
      quantity,
      unit_price,
      inventory:inventory_id (
        id,
        name,
        category,
        unit
      )
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Помилка завантаження матеріалів:', error)
    return []
  }

  return data.map((item: any) => ({
    id: item.id,
    inventoryId: item.inventory?.id,
    name: item.inventory?.name || 'Невідомий товар',
    category: item.inventory?.category || 'Інше',
    unit: item.inventory?.unit || 'шт',
    quantity: item.quantity,
    unitPrice: item.unit_price,
    totalCost: item.quantity * item.unit_price
  }))
}

export async function addMaterialToProject(projectId: string, inventoryId: string, quantity: number) {
  const supabase = await createClient()

  // 1. Отримуємо дані товару зі складу
  const { data: invData, error: invError } = await supabase
    .from('inventory')
    .select('quantity, price_per_unit')
    .eq('id', inventoryId)
    .single()

  if (invError || !invData) return { error: 'Товар не знайдено' }
  if (invData.quantity < quantity) return { error: `Недостатньо товару на складі. Доступно: ${invData.quantity}` }

  // 2. Списуємо зі складу
  const { error: updateError } = await supabase
    .from('inventory')
    .update({ quantity: invData.quantity - quantity })
    .eq('id', inventoryId)

  if (updateError) return { error: 'Помилка оновлення складу' }

  // 3. Додаємо до проєкту
  const { error: insertError } = await supabase
    .from('project_materials')
    .insert({
      project_id: projectId,
      inventory_id: inventoryId,
      quantity: quantity,
      unit_price: invData.price_per_unit || 0
    })

  if (insertError) {
    // Відкат у разі помилки
    await supabase.from('inventory').update({ quantity: invData.quantity }).eq('id', inventoryId)
    return { error: insertError.message }
  }

  // 4. Логування дії
  try {
    const { data: projectData } = await supabase.from('projects').select('name').eq('id', projectId).single()
    const { data: itemData } = await supabase.from('inventory').select('name, unit').eq('id', inventoryId).single()
    const pName = projectData?.name || 'Невідомий проєкт'
    const unit = itemData?.unit || 'шт'
    
    await logInventoryAction({
      inventoryId,
      actionType: 'move',
      quantityChanged: -quantity,
      projectId,
      projectName: pName,
      details: `Переміщено ${quantity} ${unit} в проєкт "${pName}"`
    })
  } catch (e) {
    console.error('Помилка логування списання на проєкт:', e)
  }

  revalidatePath('/projects')
  return { success: true }
}

export async function removeMaterialFromProject(materialId: string, inventoryId: string, quantity: number) {
  const supabase = await createClient()

  // 1. Отримуємо поточний залишок на складі
  const { data: invData, error: invError } = await supabase
    .from('inventory')
    .select('quantity, unit')
    .eq('id', inventoryId)
    .single()

  if (!invError && invData) {
    // 2. Повертаємо товар на склад
    await supabase
      .from('inventory')
      .update({ quantity: Number(invData.quantity) + Number(quantity) })
      .eq('id', inventoryId)
  }

  // Отримуємо ID проєкту та ім'я перед видаленням зв'язку
  let projectId = null
  let projectName = 'Невідомий проєкт'
  try {
    const { data: matData } = await supabase
      .from('project_materials')
      .select('project_id, projects(name)')
      .eq('id', materialId)
      .single()
    if (matData) {
      projectId = matData.project_id
      projectName = (matData.projects as any)?.name || 'Невідомий проєкт'
    }
  } catch (e) {
    console.error('Не вдалося отримати дані проєкту перед видаленням матеріалу:', e)
  }

  // 3. Видаляємо зв'язок з проєктом
  const { error: deleteError } = await supabase
    .from('project_materials')
    .delete()
    .eq('id', materialId)

  if (deleteError) return { error: deleteError.message }

  // 4. Логування повернення
  try {
    const unit = invData?.unit || 'шт'
    await logInventoryAction({
      inventoryId,
      actionType: 'return',
      quantityChanged: quantity,
      projectId: projectId || undefined,
      projectName,
      details: `Повернено ${quantity} ${unit} з проєкту "${projectName}"`
    })
  } catch (e) {
    console.error('Помилка логування повернення товару на склад:', e)
  }

  revalidatePath('/projects')
  return { success: true }
}

// ------------------------------------
// ЕКОНОМІКА (КОШТОРИС)
// ------------------------------------
export async function updateProjectBasicInfo(projectId: string, data: Partial<Project>) {
  const supabase = await createClient()
  
  // Map camelCase to snake_case for DB
  const dbData: any = {}
  if (data.name !== undefined) dbData.name = data.name
  if (data.client !== undefined) dbData.client = data.client
  if (data.clientPhone !== undefined) dbData.client_phone = data.clientPhone
  if (data.clientEmail !== undefined) dbData.client_email = data.clientEmail
  if (data.deadline !== undefined) dbData.deadline = data.deadline

  const { error } = await supabase.from('projects').update(dbData).eq('id', projectId)
  
  if (error) return { error: error.message }
  revalidatePath('/projects')
  return { success: true }
}

export async function updateProjectEstimate(projectId: string, data: {
  material_client_price: number,
  material_our_cost: number,
  hardware_client_price: number,
  hardware_our_cost: number,
  work_price: number,
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').update(data).eq('id', projectId)
  if (error) return { error: error.message }
  revalidatePath('/projects')
  return { success: true }
}

// ------------------------------------
// КОМАНДА ПРОЄКТУ
// ------------------------------------
export async function getProjectTeam(projectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('project_team')
    .select(`
      id,
      role,
      percentage,
      salary_type,
      fixed_amount,
      profile:profile_id (
        id,
        full_name
      )
    `)
    .eq('project_id', projectId)

  if (error) {
    console.error('Помилка завантаження команди проєкту:', error)
    return []
  }

  return data.map((item: any) => ({
    id: item.id,
    profileId: item.profile?.id,
    name: item.profile?.full_name || 'Невідомо',
    role: item.role,
    percentage: item.percentage,
    salary_type: item.salary_type,
    fixed_amount: item.fixed_amount
  }))
}

export async function addProjectTeamMember(
  projectId: string, 
  profileId: string, 
  role: string, 
  percentage: number,
  salaryType: string = 'percent',
  fixedAmount: number = 0
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('project_team')
    .insert({
      project_id: projectId,
      profile_id: profileId,
      role: role,
      percentage: percentage,
      salary_type: salaryType,
      fixed_amount: fixedAmount
    })

  if (error) return { error: error.message }
  revalidatePath('/projects')
  return { success: true }
}

export async function removeProjectTeamMember(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('project_team').delete().eq('id', id)
  
  if (error) return { error: error.message }
  revalidatePath('/projects')
  return { success: true }
}

// FILE ACTIONS
export async function getProjectFiles(projectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('project_files')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function uploadProjectFile(projectId: string, formData: FormData) {
  const supabase = await createClient()
  const file = formData.get('file') as File
  if (!file) return { error: "Файл не знайдено" }

  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `${projectId}/${fileName}`

  // 1. Upload to Storage
  const { error: uploadError } = await supabase.storage
    .from('project-files')
    .upload(filePath, file)

  if (uploadError) return { error: uploadError.message }

  // 2. Save metadata to DB
  const { error: dbError } = await supabase
    .from('project_files')
    .insert({
      project_id: projectId,
      name: file.name,
      file_path: filePath,
      file_type: file.type,
      file_size: file.size
    })

  if (dbError) return { error: dbError.message }

  revalidatePath('/projects')
  return { success: true }
}

export async function removeProjectFile(fileId: string, filePath: string) {
  const supabase = await createClient()
  
  // 1. Remove from Storage
  const { error: storageError } = await supabase.storage
    .from('project-files')
    .remove([filePath])

  if (storageError) return { error: storageError.message }

  // 2. Remove from DB
  const { error: dbError } = await supabase
    .from('project_files')
    .delete()
    .eq('id', fileId)

  if (dbError) return { error: dbError.message }

  revalidatePath('/projects')
  return { success: true }
}

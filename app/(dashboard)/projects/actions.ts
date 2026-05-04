'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { Project } from '@/components/projects-table'

export async function getProjects() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
  
  if (error) {
    console.error('Помилка завантаження проєктів:', error)
    return []
  }

  return data.map((p: any) => {
    const deadline = new Date(p.deadline)
    const today = new Date()
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return {
      id: p.id,
      name: p.name,
      client: p.client,
      status: p.status,
      deadline: p.deadline,
      totalAmount: p.total_amount,
      paidAmount: p.paid_amount,
      daysLeft: diffDays > 0 ? diffDays : 0,
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

  revalidatePath('/projects')
  return { success: true }
}

export async function removeMaterialFromProject(materialId: string, inventoryId: string, quantity: number) {
  const supabase = await createClient()

  // 1. Отримуємо поточний залишок на складі
  const { data: invData, error: invError } = await supabase
    .from('inventory')
    .select('quantity')
    .eq('id', inventoryId)
    .single()

  if (!invError && invData) {
    // 2. Повертаємо товар на склад
    await supabase
      .from('inventory')
      .update({ quantity: Number(invData.quantity) + Number(quantity) })
      .eq('id', inventoryId)
  }

  // 3. Видаляємо зв'язок з проєктом
  const { error: deleteError } = await supabase
    .from('project_materials')
    .delete()
    .eq('id', materialId)

  if (deleteError) return { error: deleteError.message }

  revalidatePath('/projects')
  return { success: true }
}

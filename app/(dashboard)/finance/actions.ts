'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { Transaction } from '@/components/finance-table'

export async function getTransactions() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('transactions')
    .select('*, projects(name)')
    .order('date', { ascending: false })
  
  if (error) {
    console.error('Помилка завантаження транзакцій:', error)
    return []
  }

  return data.map((t: any) => ({
    id: t.id,
    date: t.date,
    type: t.type,
    category: t.category,
    description: t.description || '',
    amount: t.amount,
    projectId: t.project_id,
    projectName: t.projects?.name || t.project_name || '',
    paymentMethod: t.payment_method,
    status: t.status,
  })) as Transaction[]
}

export async function getProjectTransactions(projectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('transactions')
    .select('*')
    .eq('project_id', projectId)
    .order('date', { ascending: false })
  
  if (error) return []

  return data.map((t: any) => ({
    id: t.id,
    date: t.date,
    type: t.type,
    category: t.category,
    description: t.description || '',
    amount: t.amount,
    projectId: t.project_id,
    projectName: t.project_name || '',
    paymentMethod: t.payment_method,
    status: t.status,
  })) as Transaction[]
}

export async function addTransaction(data: Omit<Transaction, 'id'>) {
  const supabase = await createClient()
  const { error } = await supabase.from('transactions').insert({
    date: data.date,
    type: data.type,
    category: data.category,
    description: data.description,
    amount: data.amount,
    project_id: data.projectId || null,
    project_name: data.projectName,
    payment_method: data.paymentMethod,
    status: data.status,
  })

  if (error) return { error: error.message }
  revalidatePath('/finance')
  return { success: true }
}

export async function updateTransaction(data: Transaction) {
  const supabase = await createClient()
  const { error } = await supabase.from('transactions').update({
    date: data.date,
    type: data.type,
    category: data.category,
    description: data.description,
    amount: data.amount,
    project_id: data.projectId || null,
    project_name: data.projectName,
    payment_method: data.paymentMethod,
    status: data.status,
  }).eq('id', data.id)

  if (error) return { error: error.message }
  revalidatePath('/finance')
  return { success: true }
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  
  if (error) return { error: error.message }
  revalidatePath('/finance')
  return { success: true }
}

export async function importTransactions(items: Omit<Transaction, 'id'>[]) {
  const supabase = await createClient()
  const insertData = items.map(data => ({
    date: data.date,
    type: data.type,
    category: data.category,
    description: data.description,
    amount: data.amount,
    project_name: data.projectName,
    payment_method: data.paymentMethod,
    status: data.status,
  }))

  const { error } = await supabase.from('transactions').insert(insertData)

  if (error) return { error: error.message }
  revalidatePath('/finance')
  return { success: true }
}

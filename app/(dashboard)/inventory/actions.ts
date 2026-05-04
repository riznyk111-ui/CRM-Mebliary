'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { InventoryItem } from '@/components/inventory-table'

export async function getInventory() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('inventory').select('*').order('created_at', { ascending: false })
  
  if (error) {
    console.error('Помилка завантаження складу:', error)
    return []
  }

  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
    sku: item.sku || '',
    category: item.category || 'Інше',
    unit: item.unit || 'шт',
    quantity: item.quantity || 0,
    minQuantity: item.min_quantity || 0,
    pricePerUnit: item.price_per_unit || 0,
    supplier: item.supplier || '',
    imageUrl: item.image_url || '',
    lastUpdated: item.last_updated || new Date().toISOString().split('T')[0],
  })) as InventoryItem[]
}

export async function addInventoryItem(data: Omit<InventoryItem, 'id' | 'lastUpdated'>) {
  const supabase = await createClient()
  const { error } = await supabase.from('inventory').insert({
    name: data.name,
    sku: data.sku,
    category: data.category,
    unit: data.unit,
    quantity: data.quantity,
    min_quantity: data.minQuantity,
    price_per_unit: data.pricePerUnit,
    supplier: data.supplier,
    image_url: data.imageUrl,
    last_updated: new Date().toISOString().split('T')[0],
  })

  if (error) return { error: error.message }
  revalidatePath('/inventory')
  return { success: true }
}

export async function updateInventoryItem(data: InventoryItem) {
  const supabase = await createClient()
  const { error } = await supabase.from('inventory').update({
    name: data.name,
    sku: data.sku,
    category: data.category,
    unit: data.unit,
    quantity: data.quantity,
    min_quantity: data.minQuantity,
    price_per_unit: data.pricePerUnit,
    supplier: data.supplier,
    image_url: data.imageUrl,
    last_updated: new Date().toISOString().split('T')[0],
  }).eq('id', data.id)

  if (error) return { error: error.message }
  revalidatePath('/inventory')
  return { success: true }
}

export async function deleteInventoryItem(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('inventory').delete().eq('id', id)
  
  if (error) return { error: error.message }
  revalidatePath('/inventory')
  return { success: true }
}

export async function importInventoryItems(items: Omit<InventoryItem, 'id' | 'lastUpdated'>[]) {
  const supabase = await createClient()
  
  const insertData = items.map(data => ({
    name: data.name,
    sku: data.sku,
    category: data.category,
    unit: data.unit,
    quantity: data.quantity,
    min_quantity: data.minQuantity,
    price_per_unit: data.pricePerUnit,
    supplier: data.supplier,
    image_url: data.imageUrl,
    last_updated: new Date().toISOString().split('T')[0],
  }))

  const { error } = await supabase.from('inventory').insert(insertData)

  if (error) return { error: error.message }
  revalidatePath('/inventory')
  return { success: true }
}

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
    sellingPrice: item.selling_price || 0,
    supplier: item.supplier || '',
    imageUrl: item.image_url || '',
    lastUpdated: item.last_updated || new Date().toISOString().split('T')[0],
  })) as InventoryItem[]
}

export async function addInventoryItem(itemData: Omit<InventoryItem, 'id' | 'lastUpdated'>) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('inventory').insert({
    name: itemData.name,
    sku: itemData.sku,
    category: itemData.category,
    unit: itemData.unit,
    quantity: itemData.quantity,
    min_quantity: itemData.minQuantity,
    price_per_unit: itemData.pricePerUnit,
    selling_price: itemData.sellingPrice || 0,
    supplier: itemData.supplier,
    image_url: itemData.imageUrl,
    last_updated: new Date().toISOString().split('T')[0],
  }).select('id').single()

  if (error) return { error: error.message }

  if (data?.id) {
    await logInventoryAction({
      inventoryId: data.id,
      actionType: 'create',
      quantityChanged: itemData.quantity,
      details: `Товар додано на склад (початковий залишок: ${itemData.quantity} ${itemData.unit || 'шт'})`
    })
  }

  revalidatePath('/inventory')
  return { success: true }
}

export async function updateInventoryItem(itemData: InventoryItem) {
  const supabase = await createClient()

  // Отримуємо попередній залишок для визначення різниці
  const { data: oldData } = await supabase
    .from('inventory')
    .select('quantity, name, unit')
    .eq('id', itemData.id)
    .single()

  const { error } = await supabase.from('inventory').update({
    name: itemData.name,
    sku: itemData.sku,
    category: itemData.category,
    unit: itemData.unit,
    quantity: itemData.quantity,
    min_quantity: itemData.minQuantity,
    price_per_unit: itemData.pricePerUnit,
    selling_price: itemData.sellingPrice || 0,
    supplier: itemData.supplier,
    image_url: itemData.imageUrl,
    last_updated: new Date().toISOString().split('T')[0],
  }).eq('id', itemData.id)

  if (error) return { error: error.message }

  const oldQty = oldData?.quantity || 0
  const qtyDiff = itemData.quantity - oldQty
  const unit = itemData.unit || oldData?.unit || 'шт'

  let details = 'Оновлено дані товару'
  if (qtyDiff !== 0) {
    details = `Зміна кількості: ${qtyDiff > 0 ? '+' : ''}${qtyDiff} ${unit} (попередній залишок: ${oldQty} ${unit}, новий: ${itemData.quantity} ${unit})`
  }

  await logInventoryAction({
    inventoryId: itemData.id,
    actionType: 'update',
    quantityChanged: qtyDiff,
    details
  })

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

export async function deleteMultipleInventoryItems(ids: string[]) {
  const supabase = await createClient()
  const { error } = await supabase.from('inventory').delete().in('id', ids)
  
  if (error) return { error: error.message }
  revalidatePath('/inventory')
  return { success: true }
}

export async function importInventoryItems(items: Omit<InventoryItem, 'id' | 'lastUpdated'>[]) {
  const supabase = await createClient()
  
  // 1. Отримуємо всі поточні товари для порівняння
  const { data: existingItems } = await supabase.from('inventory').select('*')
  const existingMap = new Map(existingItems?.map(i => [i.sku?.toLowerCase(), i]) || [])

  const itemsToUpsert = []

  for (const item of items) {
    const sku = item.sku?.toLowerCase()
    const existing = sku ? existingMap.get(sku) : null

    if (existing) {
      // Якщо товар є — оновлюємо кількість та ціну
      itemsToUpsert.push({
        id: existing.id, // Важливо для upsert
        name: item.name,
        sku: item.sku,
        category: item.category,
        unit: item.unit,
        quantity: (existing.quantity || 0) + item.quantity,
        min_quantity: item.minQuantity,
        price_per_unit: item.pricePerUnit,
        selling_price: item.sellingPrice || 0,
        supplier: item.supplier,
        image_url: item.imageUrl || existing.image_url,
        last_updated: new Date().toISOString().split('T')[0],
      })
      // Оновлюємо мапу, щоб при декількох однакових рядках у файлі кількість теж сумувалася
      existingMap.set(sku, { ...existing, quantity: (existing.quantity || 0) + item.quantity })
    } else {
      // Якщо нового товару немає — готуємо до вставки
      itemsToUpsert.push({
        name: item.name,
        sku: item.sku,
        category: item.category,
        unit: item.unit,
        quantity: item.quantity,
        min_quantity: item.minQuantity,
        price_per_unit: item.pricePerUnit,
        selling_price: item.sellingPrice || 0,
        supplier: item.supplier,
        image_url: item.imageUrl,
        last_updated: new Date().toISOString().split('T')[0],
      })
    }
  }

  const { data: upsertedData, error } = await supabase
    .from('inventory')
    .upsert(itemsToUpsert)
    .select('id, sku, quantity, name, unit')

  if (error) return { error: error.message }

  // Логуємо імпорт по кожній позиції
  if (upsertedData) {
    for (const upserted of upsertedData) {
      const skuLower = upserted.sku?.toLowerCase()
      const existing = skuLower ? existingMap.get(skuLower) : null
      
      if (existing) {
        const importItem = items.find(i => i.sku?.toLowerCase() === skuLower || i.name === upserted.name)
        const addedQty = importItem ? importItem.quantity : 0
        await logInventoryAction({
          inventoryId: upserted.id,
          actionType: 'import',
          quantityChanged: addedQty,
          details: `Оновлено кількість через імпорт Excel (+${addedQty} ${upserted.unit || 'шт'})`
        })
      } else {
        await logInventoryAction({
          inventoryId: upserted.id,
          actionType: 'import',
          quantityChanged: upserted.quantity,
          details: `Товар додано на склад через імпорт Excel (початковий залишок: ${upserted.quantity} ${upserted.unit || 'шт'})`
        })
      }
    }
  }

  revalidatePath('/inventory')
  return { success: true }
}

export async function getInventoryLogs(inventoryId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inventory_logs')
    .select('*')
    .eq('inventory_id', inventoryId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Помилка завантаження логів складу:', error)
    return []
  }
  
  return data.map((log: any) => ({
    id: log.id,
    inventoryId: log.inventory_id,
    actionType: log.action_type,
    quantityChanged: Number(log.quantity_changed),
    projectId: log.project_id,
    projectName: log.project_name || '',
    details: log.details || '',
    createdBy: log.created_by,
    createdByName: log.created_by_name || 'Користувач',
    createdAt: log.created_at,
  }))
}

export async function logInventoryAction(data: {
  inventoryId: string
  actionType: 'create' | 'update' | 'move' | 'return' | 'import'
  quantityChanged: number
  projectId?: string
  projectName?: string
  details: string
}) {
  const supabase = await createClient()
  
  let createdBy = null
  let createdByName = ''
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      createdBy = user.id
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      createdByName = profile?.full_name || user.email || 'Користувач'
    }
  } catch (e) {
    console.error('Не вдалося отримати поточного користувача для логування:', e)
  }

  const { error } = await supabase.from('inventory_logs').insert({
    inventory_id: data.inventoryId,
    action_type: data.actionType,
    quantity_changed: data.quantityChanged,
    project_id: data.projectId || null,
    project_name: data.projectName || null,
    details: data.details,
    created_by: createdBy,
    created_by_name: createdByName || null
  })

  if (error) {
    console.error('Помилка запису логу складу:', error)
  }
}

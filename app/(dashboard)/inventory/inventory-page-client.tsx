"use client"

import { AppHeader } from "@/components/app-header"
import { InventoryTable, InventoryItem } from "@/components/inventory-table"
import { addInventoryItem, updateInventoryItem, deleteInventoryItem, importInventoryItems, deleteMultipleInventoryItems } from "./actions"
import { useToast } from "@/hooks/use-toast"

export function InventoryPageClient({ items }: { items: InventoryItem[] }) {
  const { toast } = useToast()

  const handleAddItem = async (item: Omit<InventoryItem, "id" | "lastUpdated">) => {
    const result = await addInventoryItem(item)
    if (result?.error) {
      toast({ variant: "destructive", title: "Помилка", description: result.error })
    } else {
      toast({ title: "Успіх", description: "Товар додано на склад" })
    }
  }

  const handleUpdateItem = async (item: InventoryItem) => {
    const result = await updateInventoryItem(item)
    if (result?.error) {
      toast({ variant: "destructive", title: "Помилка", description: result.error })
    } else {
      toast({ title: "Успіх", description: "Дані товару оновлено" })
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цей товар?")) return
    const result = await deleteInventoryItem(id)
    if (result?.error) {
      toast({ variant: "destructive", title: "Помилка", description: result.error })
    } else {
      toast({ title: "Успіх", description: "Товар видалено" })
    }
  }

  const handleImportItems = async (importedItems: Omit<InventoryItem, "id" | "lastUpdated">[]) => {
    const result = await importInventoryItems(importedItems)
    if (result?.error) {
      toast({ variant: "destructive", title: "Помилка імпорту", description: result.error })
    } else {
      toast({ title: "Успіх", description: `Успішно імпортовано ${importedItems.length} товарів` })
    }
  }

  const handleDeleteMultipleItems = async (ids: string[]) => {
    const result = await deleteMultipleInventoryItems(ids)
    if (result?.error) {
      toast({ variant: "destructive", title: "Помилка", description: result.error })
    } else {
      toast({ title: "Успіх", description: `Видалено ${ids.length} товарів` })
    }
  }

  return (
    <>
      <AppHeader title="Склад" />
      <main className="flex-1 overflow-auto p-6">
        <InventoryTable
          items={items}
          onAddItem={handleAddItem}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onImportItems={handleImportItems}
          onDeleteMultipleItems={handleDeleteMultipleItems}
        />
      </main>
    </>
  )
}

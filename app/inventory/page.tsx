"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { InventoryTable, InventoryItem } from "@/components/inventory-table"

// Sample data - in real app this would come from database
const initialInventory: InventoryItem[] = [
  {
    id: "1",
    name: "ДСП Egger H3325 ST28 Дуб Гладстоун пісочний",
    sku: "DSP-001",
    category: "ДСП",
    unit: "м²",
    quantity: 45.5,
    minQuantity: 20,
    pricePerUnit: 850,
    supplier: "Kronospan Ukraine",
    lastUpdated: "2024-01-15",
  },
  {
    id: "2",
    name: "ДСП Egger W980 ST2 Білий платиновий",
    sku: "DSP-002",
    category: "ДСП",
    unit: "м²",
    quantity: 32,
    minQuantity: 15,
    pricePerUnit: 720,
    supplier: "Kronospan Ukraine",
    lastUpdated: "2024-01-14",
  },
  {
    id: "3",
    name: "МДФ AGT Soft Touch Антрацит",
    sku: "MDF-001",
    category: "МДФ",
    unit: "м²",
    quantity: 18,
    minQuantity: 10,
    pricePerUnit: 1450,
    supplier: "AGT Україна",
    lastUpdated: "2024-01-13",
  },
  {
    id: "4",
    name: "Петля Blum CLIP top 110°",
    sku: "FUR-001",
    category: "Фурнітура",
    unit: "шт",
    quantity: 48,
    minQuantity: 50,
    pricePerUnit: 125,
    supplier: "Blum Україна",
    lastUpdated: "2024-01-12",
  },
  {
    id: "5",
    name: "Напрямна Hettich Quadro V6 400mm",
    sku: "FUR-002",
    category: "Фурнітура",
    unit: "шт",
    quantity: 24,
    minQuantity: 20,
    pricePerUnit: 680,
    supplier: "Hettich Україна",
    lastUpdated: "2024-01-11",
  },
  {
    id: "6",
    name: "Кромка ПВХ 2мм Дуб Гладстоун",
    sku: "KRM-001",
    category: "Кромка",
    unit: "м.п.",
    quantity: 120,
    minQuantity: 50,
    pricePerUnit: 28,
    supplier: "Rehau Україна",
    lastUpdated: "2024-01-10",
  },
  {
    id: "7",
    name: "Стільниця Egger F812 ST9 Мармур Леванто білий",
    sku: "STL-001",
    category: "Стільниці",
    unit: "м.п.",
    quantity: 8,
    minQuantity: 5,
    pricePerUnit: 2400,
    supplier: "Kronospan Ukraine",
    lastUpdated: "2024-01-09",
  },
  {
    id: "8",
    name: "Скло загартоване 4мм",
    sku: "SKL-001",
    category: "Скло",
    unit: "м²",
    quantity: 12,
    minQuantity: 8,
    pricePerUnit: 450,
    supplier: "СклоПром",
    lastUpdated: "2024-01-08",
  },
  {
    id: "9",
    name: "Профіль алюмінієвий Т-подібний",
    sku: "MET-001",
    category: "Метал",
    unit: "м.п.",
    quantity: 35,
    minQuantity: 20,
    pricePerUnit: 180,
    supplier: "АлюПрофіль",
    lastUpdated: "2024-01-07",
  },
  {
    id: "10",
    name: "Фасад МДФ плівка Soft Touch Сірий",
    sku: "FAS-001",
    category: "Фасади",
    unit: "м²",
    quantity: 5,
    minQuantity: 10,
    pricePerUnit: 1800,
    supplier: "AGT Україна",
    lastUpdated: "2024-01-06",
  },
]

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory)

  const handleAddItem = (item: Omit<InventoryItem, "id" | "lastUpdated">) => {
    const newItem: InventoryItem = {
      ...item,
      id: crypto.randomUUID(),
      lastUpdated: new Date().toISOString().split("T")[0],
    }
    setInventory((prev) => [...prev, newItem])
  }

  const handleUpdateItem = (updatedItem: InventoryItem) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    )
  }

  const handleDeleteItem = (id: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== id))
  }

  const handleImportItems = (items: Omit<InventoryItem, "id" | "lastUpdated">[]) => {
    const newItems: InventoryItem[] = items.map((item) => ({
      ...item,
      id: crypto.randomUUID(),
      lastUpdated: new Date().toISOString().split("T")[0],
    }))
    setInventory((prev) => [...prev, ...newItems])
  }

  return (
    <>
      <AppHeader title="Склад" />
      <main className="flex-1 overflow-auto p-6">
        <InventoryTable
          items={inventory}
          onAddItem={handleAddItem}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onImportItems={handleImportItems}
        />
      </main>
    </>
  )
}

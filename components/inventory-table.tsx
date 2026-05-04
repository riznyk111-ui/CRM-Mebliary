"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Plus,
  Search,
  FileSpreadsheet,
  MoreHorizontal,
  Pencil,
  Trash2,
  AlertTriangle,
  Package,
  ImageIcon,
  Link,
  Upload,
  X,
} from "lucide-react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import * as XLSX from "xlsx"

export interface InventoryItem {
  id: string
  name: string
  sku: string
  category: string
  unit: string
  quantity: number
  minQuantity: number
  pricePerUnit: number
  supplier: string
  lastUpdated: string
  imageUrl?: string
}

const categories = [
  "ДСП",
  "МДФ",
  "Фурнітура",
  "Кромка",
  "Фасади",
  "Стільниці",
  "Скло",
  "Метал",
  "Інше",
]

const units = ["шт", "м²", "м.п.", "кг", "л", "упак"]

function formatCurrency(amount: number): string {
  const formatted = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  return `${formatted} грн`
}

interface InventoryTableProps {
  items: InventoryItem[]
  onAddItem: (item: Omit<InventoryItem, "id" | "lastUpdated">) => void
  onUpdateItem: (item: InventoryItem) => void
  onDeleteItem: (id: string) => void
  onImportItems: (items: Omit<InventoryItem, "id" | "lastUpdated">[]) => void
}

export function InventoryTable({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onImportItems,
}: InventoryTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    unit: "шт",
    quantity: 0,
    minQuantity: 0,
    pricePerUnit: 0,
    supplier: "",
    imageUrl: "",
  })
  const [imageInputMode, setImageInputMode] = useState<"url" | "file">("url")
  const [imagePreview, setImagePreview] = useState<string>("")

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const lowStockItems = items.filter((item) => item.quantity <= item.minQuantity)

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const data = event.target?.result
      const workbook = XLSX.read(data, { type: "binary" })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet)

      const importedItems: Omit<InventoryItem, "id" | "lastUpdated">[] = jsonData.map((row) => ({
        name: String(row["Назва"] || row["name"] || ""),
        sku: String(row["Артикул"] || row["sku"] || row["SKU"] || ""),
        category: String(row["Категорія"] || row["category"] || "Інше"),
        unit: String(row["Одиниця"] || row["unit"] || "шт"),
        quantity: Number(row["Кількість"] || row["quantity"] || 0),
        minQuantity: Number(row["Мін. кількість"] || row["minQuantity"] || 0),
        pricePerUnit: Number(row["Ціна"] || row["price"] || row["pricePerUnit"] || 0),
        supplier: String(row["Постачальник"] || row["supplier"] || ""),
        imageUrl: String(row["Фото"] || row["imageUrl"] || row["image"] || ""),
      }))

      onImportItems(importedItems.filter((item) => item.name))
    }
    reader.readAsBinaryString(file)
    e.target.value = ""
  }

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setFormData({ ...formData, imageUrl: dataUrl })
      setImagePreview(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, imageUrl: url })
    setImagePreview(url)
  }

  const clearImage = () => {
    setFormData({ ...formData, imageUrl: "" })
    setImagePreview("")
  }

  const handleSubmit = () => {
    if (editingItem) {
      onUpdateItem({
        ...editingItem,
        ...formData,
        lastUpdated: new Date().toISOString().split("T")[0],
      })
      setEditingItem(null)
    } else {
      onAddItem(formData)
    }
    setFormData({
      name: "",
      sku: "",
      category: "",
      unit: "шт",
      quantity: 0,
      minQuantity: 0,
      pricePerUnit: 0,
      supplier: "",
      imageUrl: "",
    })
    setImagePreview("")
    setIsAddDialogOpen(false)
  }

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      sku: item.sku,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      pricePerUnit: item.pricePerUnit,
      supplier: item.supplier,
      imageUrl: item.imageUrl || "",
    })
    setImagePreview(item.imageUrl || "")
    setIsAddDialogOpen(true)
  }

  const totalValue = items.reduce((sum, item) => sum + item.quantity * item.pricePerUnit, 0)

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="size-4" />
            Всього позицій
          </div>
          <div className="mt-1 text-2xl font-bold">{items.length}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Загальна вартість</div>
          <div className="mt-1 text-2xl font-bold text-income">{formatCurrency(totalValue)}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Категорій</div>
          <div className="mt-1 text-2xl font-bold">
            {new Set(items.map((i) => i.category)).size}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="size-4 text-expense" />
            Закінчується
          </div>
          <div className="mt-1 text-2xl font-bold text-expense">{lowStockItems.length}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Пошук за назвою, артикулом..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Категорія" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі категорії</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="excel-import">
            <input
              id="excel-import"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleExcelImport}
              className="hidden"
            />
            <Button variant="outline" asChild>
              <span className="cursor-pointer">
                <FileSpreadsheet className="mr-2 size-4" />
                Імпорт Excel
              </span>
            </Button>
          </label>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) {
              setEditingItem(null)
              setFormData({
                name: "",
                sku: "",
                category: "",
                unit: "шт",
                quantity: 0,
                minQuantity: 0,
                pricePerUnit: 0,
                supplier: "",
                imageUrl: "",
              })
              setImagePreview("")
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 size-4" />
                Додати товар
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Редагувати товар" : "Додати новий товар"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Назва</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">Артикул</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Категорія</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Оберіть категорію" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Одиниця</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => setFormData({ ...formData, unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Кількість</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minQuantity">Мін. запас</Label>
                    <Input
                      id="minQuantity"
                      type="number"
                      min="0"
                      value={formData.minQuantity}
                      onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Ціна</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      value={formData.pricePerUnit}
                      onChange={(e) => setFormData({ ...formData, pricePerUnit: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier">Постачальник</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Фото товару</Label>
                  <Tabs value={imageInputMode} onValueChange={(v) => setImageInputMode(v as "url" | "file")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="url" className="flex items-center gap-2">
                        <Link className="size-4" />
                        Посилання
                      </TabsTrigger>
                      <TabsTrigger value="file" className="flex items-center gap-2">
                        <Upload className="size-4" />
                        Завантажити
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="url" className="mt-2">
                      <Input
                        placeholder="https://example.com/image.jpg"
                        value={formData.imageUrl?.startsWith("data:") ? "" : formData.imageUrl}
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                      />
                    </TabsContent>
                    <TabsContent value="file" className="mt-2">
                      <label htmlFor="image-upload" className="block">
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                        <div className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
                          <Upload className="size-4" />
                          Обрати файл
                        </div>
                      </label>
                    </TabsContent>
                  </Tabs>
                  {imagePreview && (
                    <div className="relative mt-2 inline-block">
                      <div className="relative size-20 overflow-hidden rounded-md border border-border">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                          unoptimized={imagePreview.startsWith("data:")}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-expense text-white"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Скасувати
                </Button>
                <Button onClick={handleSubmit} disabled={!formData.name}>
                  {editingItem ? "Зберегти" : "Додати"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Фото</TableHead>
              <TableHead>Назва</TableHead>
              <TableHead>Артикул</TableHead>
              <TableHead>Категорія</TableHead>
              <TableHead className="text-right">Кількість</TableHead>
              <TableHead className="text-right">Ціна</TableHead>
              <TableHead className="text-right">Вартість</TableHead>
              <TableHead>Постачальник</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center gap-2">
                      <Package className="size-8 text-muted-foreground/50" />
                      <p>Склад порожній</p>
                      <p className="text-sm">Додайте товар�� вручну або імпортуйте з Excel</p>
                    </div>
                  ) : (
                    "Нічого не знайдено"
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => {
                const isLowStock = item.quantity <= item.minQuantity
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="relative size-10 overflow-hidden rounded-md border border-border bg-muted">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                            unoptimized={item.imageUrl.startsWith("data:")}
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <ImageIcon className="size-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {isLowStock && (
                          <AlertTriangle className="size-4 text-expense" />
                        )}
                        {item.name}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {item.sku}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={isLowStock ? "text-expense font-medium" : ""}>
                        {item.quantity} {item.unit}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.pricePerUnit)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.quantity * item.pricePerUnit)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.supplier}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(item)}>
                            <Pencil className="mr-2 size-4" />
                            Редагувати
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDeleteItem(item.id)}
                            className="text-expense"
                          >
                            <Trash2 className="mr-2 size-4" />
                            Видалити
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Import Instructions */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h4 className="font-medium">Формат імпорту Excel</h4>
        <p className="mt-1 text-sm text-muted-foreground">
          Файл повинен містити стовпці: Назва, Артикул, Категорія, Одиниця, Кількість, Мін. кількість, Ціна, Постачальник, Фото (URL посилання на зображення)
        </p>
      </div>
    </div>
  )
}

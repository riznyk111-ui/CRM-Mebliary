"use client"

import { useState } from "react"
import {
  Plus,
  Search,
  FileSpreadsheet,
  MoreHorizontal,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
} from "lucide-react"
import * as XLSX from "xlsx"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface Transaction {
  id: string
  date: string
  type: "income" | "expense"
  category: string
  description: string
  amount: number
  projectId?: string
  projectName?: string
  paymentMethod: string
  status: "completed" | "pending" | "cancelled"
}

interface FinanceTableProps {
  transactions: Transaction[]
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void
  onUpdateTransaction: (transaction: Transaction) => void
  onDeleteTransaction: (id: string) => void
  onImportTransactions?: (transactions: Omit<Transaction, "id">[]) => void
}

const incomeCategories = [
  "Оплата за проєкт",
  "Передоплата",
  "Доплата",
  "Продаж матеріалів",
  "Інший дохід",
]

const expenseCategories = [
  "Матеріали",
  "Зарплата монтажникам",
  "Зарплата співробітникам",
  "Оренда",
  "Комунальні послуги",
  "Транспорт",
  "Інструменти",
  "Реклама",
  "Інші витрати",
]

const paymentMethods = [
  "Готівка",
  "Банківський переказ",
  "Картка",
  "ФОП рахунок",
]

function formatCurrency(amount: number): string {
  const formatted = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  return `${formatted} грн`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function FinanceTable({
  transactions,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onImportTransactions,
}: FinanceTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending" | "cancelled">("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "income" as "income" | "expense",
    category: "",
    description: "",
    amount: 0,
    projectName: "",
    paymentMethod: "Банківський переказ",
    status: "completed" as "completed" | "pending" | "cancelled",
  })

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    const matchesType = typeFilter === "all" || transaction.type === typeFilter
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const totalIncome = transactions
    .filter((t) => t.type === "income" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter((t) => t.type === "expense" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)

  const pendingIncome = transactions
    .filter((t) => t.type === "income" && t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0)

  const pendingExpense = transactions
    .filter((t) => t.type === "expense" && t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  const handleExportExcel = () => {
    const exportData = transactions.map((t) => ({
      "Дата": formatDate(t.date),
      "Тип": t.type === "income" ? "Дохід" : "Витрата",
      "Категорія": t.category,
      "Опис": t.description,
      "Сума": t.amount,
      "Проєкт": t.projectName || "",
      "Спосіб оплати": t.paymentMethod,
      "Статус": t.status === "completed" ? "Завершено" : t.status === "pending" ? "Очікується" : "Скасовано",
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Транзакції")
    XLSX.writeFile(workbook, `transactions_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const data = event.target?.result
      const workbook = XLSX.read(data, { type: "binary" })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[]

      const importedTxs: Omit<Transaction, "id">[] = []

      jsonData.forEach((row) => {
        const typeValue = String(row["Тип"] || row["type"] || "income").toLowerCase()
        const statusValue = String(row["Статус"] || row["status"] || "completed").toLowerCase()
        
        const newTransaction: Omit<Transaction, "id"> = {
          date: String(row["Дата"] || row["date"] || new Date().toISOString().split("T")[0]),
          type: typeValue.includes("дохід") || typeValue === "income" ? "income" : "expense",
          category: String(row["Категорія"] || row["category"] || ""),
          description: String(row["Опис"] || row["description"] || ""),
          amount: Number(row["Сума"] || row["amount"] || 0),
          projectName: String(row["Проєкт"] || row["project"] || ""),
          paymentMethod: String(row["Спосіб оплати"] || row["paymentMethod"] || "Банківський переказ"),
          status: statusValue.includes("очік") || statusValue === "pending" 
            ? "pending" 
            : statusValue.includes("скас") || statusValue === "cancelled" 
            ? "cancelled" 
            : "completed",
        }
        importedTxs.push(newTransaction)
      })

      if (onImportTransactions && importedTxs.length > 0) {
        onImportTransactions(importedTxs)
      } else {
        importedTxs.forEach(t => onAddTransaction(t))
      }
    }
    reader.readAsBinaryString(file)
    e.target.value = ""
  }

  const handleSubmit = () => {
    if (editingTransaction) {
      onUpdateTransaction({
        ...editingTransaction,
        ...formData,
      })
      setEditingTransaction(null)
    } else {
      onAddTransaction(formData)
    }
    setFormData({
      date: new Date().toISOString().split("T")[0],
      type: "income",
      category: "",
      description: "",
      amount: 0,
      projectName: "",
      paymentMethod: "Банківський переказ",
      status: "completed",
    })
    setIsAddDialogOpen(false)
  }

  const openEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      date: transaction.date,
      type: transaction.type,
      category: transaction.category,
      description: transaction.description,
      amount: transaction.amount,
      projectName: transaction.projectName || "",
      paymentMethod: transaction.paymentMethod,
      status: transaction.status,
    })
    setIsAddDialogOpen(true)
  }

  const currentCategories = formData.type === "income" ? incomeCategories : expenseCategories

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Загальний дохід
            </CardTitle>
            <TrendingUp className="size-4 text-income" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-income">{formatCurrency(totalIncome)}</div>
            {pendingIncome > 0 && (
              <p className="text-xs text-muted-foreground">
                + {formatCurrency(pendingIncome)} очікується
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Загальні витрати
            </CardTitle>
            <TrendingDown className="size-4 text-expense" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-expense">{formatCurrency(totalExpense)}</div>
            {pendingExpense > 0 && (
              <p className="text-xs text-muted-foreground">
                + {formatCurrency(pendingExpense)} очікується
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Баланс
            </CardTitle>
            {balance >= 0 ? (
              <ArrowUpRight className="size-4 text-income" />
            ) : (
              <ArrowDownRight className="size-4 text-expense" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-income" : "text-expense"}`}>
              {formatCurrency(balance)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Транзакцій
            </CardTitle>
            <Filter className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter((t) => t.status === "pending").length} очікується
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Пошук транзакцій..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі типи</SelectItem>
              <SelectItem value="income">Доходи</SelectItem>
              <SelectItem value="expense">Витрати</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі статуси</SelectItem>
              <SelectItem value="completed">Завершено</SelectItem>
              <SelectItem value="pending">Очікується</SelectItem>
              <SelectItem value="cancelled">Скасовано</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <Download className="mr-2 size-4" />
            Експорт
          </Button>
          <label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleImportExcel}
              className="hidden"
            />
            <Button variant="outline" size="sm" asChild>
              <span className="cursor-pointer">
                <FileSpreadsheet className="mr-2 size-4" />
                Імпорт
              </span>
            </Button>
          </label>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 size-4" />
            Додати
          </Button>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open)
        if (!open) {
          setEditingTransaction(null)
          setFormData({
            date: new Date().toISOString().split("T")[0],
            type: "income",
            category: "",
            description: "",
            amount: 0,
            projectName: "",
            paymentMethod: "Банківський переказ",
            status: "completed",
          })
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? "Редагувати транзакцію" : "Додати транзакцію"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Дата</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Тип</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as "income" | "expense", category: "" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Дохід</SelectItem>
                    <SelectItem value="expense">Витрата</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Категорія</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Оберіть категорію" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Сума (грн)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount || ""}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Опис</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Проєкт (опціонально)</Label>
                <Input
                  id="projectName"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="Назва проєкту"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Спосіб оплати</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(v) => setFormData({ ...formData, paymentMethod: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>{method}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v as "completed" | "pending" | "cancelled" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Завершено</SelectItem>
                  <SelectItem value="pending">Очікується</SelectItem>
                  <SelectItem value="cancelled">Скасовано</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.category || !formData.amount}>
              {editingTransaction ? "Зберегти" : "Додати"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transactions Table */}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Категорія</TableHead>
              <TableHead>Опис</TableHead>
              <TableHead>Проєкт</TableHead>
              <TableHead className="text-right">Сума</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  Транзакції не знайдено
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(transaction.date)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {transaction.type === "income" ? (
                        <ArrowUpRight className="size-4 text-income" />
                      ) : (
                        <ArrowDownRight className="size-4 text-expense" />
                      )}
                      <span className={transaction.type === "income" ? "text-income" : "text-expense"}>
                        {transaction.type === "income" ? "Дохід" : "Витрата"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {transaction.description}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {transaction.projectName || "—"}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${
                    transaction.type === "income" ? "text-income" : "text-expense"
                  }`}>
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.status === "completed"
                          ? "default"
                          : transaction.status === "pending"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {transaction.status === "completed"
                        ? "Завершено"
                        : transaction.status === "pending"
                        ? "Очікується"
                        : "Скасовано"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(transaction)}>
                          <Pencil className="mr-2 size-4" />
                          Редагувати
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteTransaction(transaction.id)}
                          className="text-expense"
                        >
                          <Trash2 className="mr-2 size-4" />
                          Видалити
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

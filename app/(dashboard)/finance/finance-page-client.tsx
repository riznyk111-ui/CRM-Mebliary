"use client"

import { AppHeader } from "@/components/app-header"
import { FinanceTable, Transaction } from "@/components/finance-table"
import { Project } from "@/components/projects-table"
import { addTransaction, updateTransaction, deleteTransaction, importTransactions } from "./actions"
import { useToast } from "@/hooks/use-toast"

export function FinancePageClient({ transactions, projects }: { transactions: Transaction[], projects: Project[] }) {
  const { toast } = useToast()

  const handleAddTransaction = async (data: Omit<Transaction, "id">) => {
    const result = await addTransaction(data)
    if (result?.error) {
      toast({ variant: "destructive", title: "Помилка", description: result.error })
    } else {
      toast({ title: "Успіх", description: "Транзакцію додано" })
    }
  }

  const handleUpdateTransaction = async (data: Transaction) => {
    const result = await updateTransaction(data)
    if (result?.error) {
      toast({ variant: "destructive", title: "Помилка", description: result.error })
    } else {
      toast({ title: "Успіх", description: "Транзакцію оновлено" })
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Видалити цю транзакцію?")) return
    const result = await deleteTransaction(id)
    if (result?.error) {
      toast({ variant: "destructive", title: "Помилка", description: result.error })
    } else {
      toast({ title: "Успіх", description: "Транзакцію видалено" })
    }
  }

  const handleDeleteMultipleTransactions = async (ids: string[]) => {
    const { deleteMultipleTransactions } = await import("./actions")
    const result = await deleteMultipleTransactions(ids)
    if (result?.error) {
      toast({ variant: "destructive", title: "Помилка", description: result.error })
    } else {
      toast({ title: "Успіх", description: `Видалено ${ids.length} транзакцій` })
    }
  }

  const handleImportTransactions = async (items: Omit<Transaction, "id">[]) => {
    const result = await importTransactions(items)
    if (result?.error) {
      toast({ variant: "destructive", title: "Помилка імпорту", description: result.error })
    } else {
      toast({ title: "Успіх", description: `Успішно імпортовано ${items.length} транзакцій` })
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader title="Фінанси" />
      <main className="flex-1 p-6">
        <FinanceTable
          transactions={transactions}
          projects={projects}
          onAddTransaction={handleAddTransaction}
          onUpdateTransaction={handleUpdateTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          onImportTransactions={handleImportTransactions}
          onDeleteMultipleTransactions={handleDeleteMultipleTransactions}
        />
      </main>
    </div>
  )
}

"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { FinanceTable, Transaction } from "@/components/finance-table"

// Sample data
const initialTransactions: Transaction[] = [
  {
    id: "1",
    date: "2026-05-01",
    type: "income",
    category: "Оплата за проєкт",
    description: "Кухня Іваненко - фінальна оплата",
    amount: 85000,
    projectName: "Кухня Іваненко",
    paymentMethod: "Банківський переказ",
    status: "completed",
  },
  {
    id: "2",
    date: "2026-05-01",
    type: "expense",
    category: "Матеріали",
    description: "ДСП Egger 18мм - 15 листів",
    amount: 22500,
    projectName: "Кухня Петренко",
    paymentMethod: "ФОП рахунок",
    status: "completed",
  },
  {
    id: "3",
    date: "2026-04-30",
    type: "expense",
    category: "Зарплата монтажникам",
    description: "Монтаж кухні - бригада Коваленко (70%)",
    amount: 8400,
    projectName: "Кухня Іваненко",
    paymentMethod: "Готівка",
    status: "completed",
  },
  {
    id: "4",
    date: "2026-04-28",
    type: "income",
    category: "Передоплата",
    description: "Шафа-купе Сидоренко - 50% передоплата",
    amount: 45000,
    projectName: "Шафа-купе Сидоренко",
    paymentMethod: "Банківський переказ",
    status: "completed",
  },
  {
    id: "5",
    date: "2026-04-28",
    type: "expense",
    category: "Транспорт",
    description: "Доставка матеріалів зі складу",
    amount: 1500,
    paymentMethod: "Готівка",
    status: "completed",
  },
  {
    id: "6",
    date: "2026-04-25",
    type: "expense",
    category: "Оренда",
    description: "Оренда цеху - травень",
    amount: 15000,
    paymentMethod: "Банківський переказ",
    status: "completed",
  },
  {
    id: "7",
    date: "2026-04-24",
    type: "income",
    category: "Доплата",
    description: "Комод Мельник - доплата за додаткові ящики",
    amount: 4500,
    projectName: "Комод Мельник",
    paymentMethod: "Картка",
    status: "completed",
  },
  {
    id: "8",
    date: "2026-04-22",
    type: "expense",
    category: "Інструменти",
    description: "Фреза для ЧПУ",
    amount: 3200,
    paymentMethod: "Картка",
    status: "completed",
  },
  {
    id: "9",
    date: "2026-05-05",
    type: "income",
    category: "Оплата за проєкт",
    description: "Шафа-купе Сидоренко - залишок оплати",
    amount: 45000,
    projectName: "Шафа-купе Сидоренко",
    paymentMethod: "Банківський переказ",
    status: "pending",
  },
  {
    id: "10",
    date: "2026-05-03",
    type: "expense",
    category: "Зарплата співробітникам",
    description: "Зарплата дизайнеру - квітень",
    amount: 25000,
    paymentMethod: "Банківський переказ",
    status: "pending",
  },
]

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)

  const handleAddTransaction = (newTransaction: Omit<Transaction, "id">) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: `t-${Date.now()}`,
    }
    setTransactions([transaction, ...transactions])
  }

  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(
      transactions.map((t) =>
        t.id === updatedTransaction.id ? updatedTransaction : t
      )
    )
  }

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id))
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader title="Фінанси" />
      <main className="flex-1 p-6">
        <FinanceTable
          transactions={transactions}
          onAddTransaction={handleAddTransaction}
          onUpdateTransaction={handleUpdateTransaction}
          onDeleteTransaction={handleDeleteTransaction}
        />
      </main>
    </div>
  )
}

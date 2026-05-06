import { getTransactions } from "./actions"
import { getProjects } from "@/app/(dashboard)/projects/actions"
import { FinancePageClient } from "./finance-page-client"

export default async function FinancePage() {
  const [transactions, projects] = await Promise.all([
    getTransactions(),
    getProjects()
  ])
  
  return <FinancePageClient transactions={transactions} projects={projects} />
}

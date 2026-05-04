import { getTransactions } from "./actions"
import { FinancePageClient } from "./finance-page-client"

export default async function FinancePage() {
  const transactions = await getTransactions()
  
  return <FinancePageClient transactions={transactions} />
}

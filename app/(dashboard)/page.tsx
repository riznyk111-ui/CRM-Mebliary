import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Wallet,
  FolderKanban,
  AlertCircle,
} from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

function formatCurrency(amount: number): string {
  const formatted = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  return `${formatted} грн`
}

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch Projects
  const { data: projectsData } = await supabase.from('projects').select('*')
  const projects = projectsData || []

  // Fetch Transactions
  const { data: transactionsData } = await supabase.from('transactions').select('*')
  const transactions = transactionsData || []

  // Calculate Balance
  const completedIncome = transactions.filter(t => t.type === 'income' && t.status === 'completed').reduce((sum, t) => sum + Number(t.amount), 0)
  const completedExpense = transactions.filter(t => t.type === 'expense' && t.status === 'completed').reduce((sum, t) => sum + Number(t.amount), 0)
  const balance = completedIncome - completedExpense

  // Calculate Balance Change
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  const thisMonthIncome = transactions.filter(t => {
    const d = new Date(t.date)
    return t.type === 'income' && t.status === 'completed' && d.getMonth() === currentMonth && d.getFullYear() === currentYear
  }).reduce((sum, t) => sum + Number(t.amount), 0)
  
  const thisMonthExpense = transactions.filter(t => {
    const d = new Date(t.date)
    return t.type === 'expense' && t.status === 'completed' && d.getMonth() === currentMonth && d.getFullYear() === currentYear
  }).reduce((sum, t) => sum + Number(t.amount), 0)
  
  const lastMonthIncome = transactions.filter(t => {
    const d = new Date(t.date)
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
    return t.type === 'income' && t.status === 'completed' && d.getMonth() === prevMonth && d.getFullYear() === prevYear
  }).reduce((sum, t) => sum + Number(t.amount), 0)
  
  const lastMonthExpense = transactions.filter(t => {
    const d = new Date(t.date)
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
    return t.type === 'expense' && t.status === 'completed' && d.getMonth() === prevMonth && d.getFullYear() === prevYear
  }).reduce((sum, t) => sum + Number(t.amount), 0)

  const thisMonthNet = thisMonthIncome - thisMonthExpense
  const lastMonthNet = lastMonthIncome - lastMonthExpense
  let balanceChange = 0
  if (lastMonthNet !== 0) {
    balanceChange = Math.round(((thisMonthNet - lastMonthNet) / Math.abs(lastMonthNet)) * 100)
  } else if (thisMonthNet > 0) {
    balanceChange = 100
  }

  // Active Projects
  const activeProjects = projects.filter(p => p.status !== 'zaversheno')
  
  // Receivables (Очікувані надходження від активних проєктів)
  const receivables = activeProjects.reduce((sum, p) => sum + (Number(p.total_amount) - Number(p.paid_amount)), 0)

  // Urgent Projects
  const urgentProjects = activeProjects.filter(p => {
    const diffTime = new Date(p.deadline).getTime() - new Date().getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays >= 0
  }).length

  // Upcoming deadlines (Top 5)
  const upcomingProjects = activeProjects.map(p => {
    const diffTime = new Date(p.deadline).getTime() - new Date().getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return {
      id: p.id,
      name: p.name,
      client: p.client,
      daysLeft: diffDays > 0 ? diffDays : 0,
      progress: p.total_amount > 0 ? Math.round((Number(p.paid_amount) / Number(p.total_amount)) * 100) : 0
    }
  }).sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 5)

  // Cash Flow (Last 5 months)
  const monthNames = ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"]
  const cashFlowData = []
  for (let i = 4; i >= 0; i--) {
    let d = new Date()
    d.setMonth(d.getMonth() - i)
    const m = d.getMonth()
    const y = d.getFullYear()
    
    const inc = transactions.filter(t => t.type === 'income' && t.status === 'completed' && new Date(t.date).getMonth() === m && new Date(t.date).getFullYear() === y).reduce((s, t) => s + Number(t.amount), 0)
    const exp = transactions.filter(t => t.type === 'expense' && t.status === 'completed' && new Date(t.date).getMonth() === m && new Date(t.date).getFullYear() === y).reduce((s, t) => s + Number(t.amount), 0)
    
    cashFlowData.push({
      month: monthNames[m],
      income: inc,
      expenses: exp
    })
  }

  const maxValue = Math.max(...cashFlowData.flatMap(d => [d.income, d.expenses]), 1)

  return (
    <>
      <AppHeader title="Дашборд" />
      <main className="flex-1 p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Баланс
              </CardTitle>
              <Wallet className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? "text-income" : "text-expense"}`}>{formatCurrency(balance)}</div>
              <div className={`flex items-center text-xs mt-1 ${balanceChange >= 0 ? "text-success" : "text-expense"}`}>
                {balanceChange >= 0 ? <TrendingUp className="mr-1 size-3" /> : <TrendingDown className="mr-1 size-3" />}
                {balanceChange >= 0 ? "+" : ""}{balanceChange}% від минулого місяця
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Активні проєкти
              </CardTitle>
              <FolderKanban className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProjects.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {urgentProjects} з терміновим дедлайном
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Дебіторська заборгованість
              </CardTitle>
              <Clock className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(receivables)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Очікувані надходження
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Прогноз (30 днів)
              </CardTitle>
              <TrendingUp className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(balance + receivables * 0.7)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                На основі очікуваних оплат
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Cash Flow Chart */}
          <Card className="bg-card border-border lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base font-medium">Рух коштів (Cash Flow)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-success" />
                    <span className="text-muted-foreground">Доходи</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-destructive" />
                    <span className="text-muted-foreground">Витрати</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {cashFlowData.map((item) => (
                    <div key={item.month} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground w-10">{item.month}</span>
                        <div className="flex-1 mx-4 flex gap-1 h-6 items-center">
                          <div 
                            className="h-3 bg-success rounded-sm"
                            style={{ width: `${(item.income / maxValue) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-success w-20 text-right">
                          {formatCurrency(item.income)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="w-10" />
                        <div className="flex-1 mx-4 flex gap-1 h-6 items-center">
                          <div 
                            className="h-3 bg-destructive rounded-sm"
                            style={{ width: `${(item.expenses / maxValue) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-destructive w-20 text-right">
                          {formatCurrency(item.expenses)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card className="bg-card border-border lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-medium">Найближчі дедлайни</CardTitle>
              <Link 
                href="/projects" 
                className="text-xs text-primary hover:underline"
              >
                Всі проєкти
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingProjects.length === 0 ? (
                 <p className="text-sm text-muted-foreground">Активних проєктів немає</p>
              ) : upcomingProjects.map((project) => (
                <div key={project.id} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.client}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={
                        project.daysLeft <= 3 
                          ? "bg-destructive/20 text-destructive border-destructive/30" 
                          : project.daysLeft <= 7 
                          ? "bg-warning/20 text-warning border-warning/30"
                          : "bg-muted text-muted-foreground border-border"
                      }
                    >
                      {project.daysLeft <= 3 && <AlertCircle className="mr-1 size-3" />}
                      {project.daysLeft} дн.
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Прогрес оплати</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-1.5 bg-secondary" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}

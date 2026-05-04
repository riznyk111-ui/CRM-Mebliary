"use client"

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

function formatCurrency(amount: number): string {
  const formatted = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  return `${formatted} грн`
}

// Mock data
const stats = {
  balance: 245000,
  balanceChange: 12.5,
  activeProjects: 5,
  receivables: 127400,
  urgentProjects: 2,
}

const upcomingProjects = [
  {
    id: "3",
    name: "Офісні меблі StartUp",
    client: "ТОВ \"Інновації\"",
    daysLeft: 2,
    progress: 70,
  },
  {
    id: "2",
    name: "Спальня Scandinavian",
    client: "Петренко Марія",
    daysLeft: 4,
    progress: 30,
  },
  {
    id: "1",
    name: "Кухня Modern Loft",
    client: "Іванов Олександр",
    daysLeft: 11,
    progress: 70,
  },
]

const cashFlowData = [
  { month: "Січ", income: 320000, expenses: 280000 },
  { month: "Лют", income: 285000, expenses: 245000 },
  { month: "Бер", income: 410000, expenses: 320000 },
  { month: "Кві", income: 380000, expenses: 340000 },
  { month: "Тра", income: 245000, expenses: 198000 },
]

export default function DashboardPage() {
  const maxValue = Math.max(...cashFlowData.flatMap(d => [d.income, d.expenses]))

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
              <div className="text-2xl font-bold">{formatCurrency(stats.balance)}</div>
              <div className="flex items-center text-xs text-success mt-1">
                <TrendingUp className="mr-1 size-3" />
                +{stats.balanceChange}% від минулого місяця
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
              <div className="text-2xl font-bold">{stats.activeProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.urgentProjects} з терміновим дедлайном
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
              <div className="text-2xl font-bold">{formatCurrency(stats.receivables)}</div>
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
              <div className="text-2xl font-bold">{formatCurrency(stats.balance + stats.receivables * 0.7)}</div>
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
              <CardTitle className="text-base font-medium">Cash Flow</CardTitle>
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
              {upcomingProjects.map((project) => (
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
                      <span className="text-muted-foreground">Прогрес</span>
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

"use client"

import { X, FileImage, FileText } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import type { Project, ProjectStatus } from "@/components/projects-table"

interface ProjectDetailModalProps {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  zamır: {
    label: "Замір",
    className: "bg-warning/20 text-warning border-warning/30",
  },
  vyrobnytstvo: {
    label: "Виробництво",
    className: "bg-primary/20 text-primary border-primary/30",
  },
  montazh: {
    label: "Монтаж",
    className: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  },
  zaversheno: {
    label: "Завершено",
    className: "bg-success/20 text-success border-success/30",
  },
}

// Mock data for specifications
const mockSpecifications = [
  { id: "1", name: "Петлі Blum", category: "Фурнітура", quantity: 12, unit: "шт" },
  { id: "2", name: "Направляючі Hettich", category: "Фурнітура", quantity: 6, unit: "комп" },
  { id: "3", name: "ДСП Egger W1000", category: "Матеріал", quantity: 4.5, unit: "м²" },
  { id: "4", name: "МДФ фарбований", category: "Матеріал", quantity: 2.8, unit: "м²" },
  { id: "5", name: "Ручки Gamet", category: "Фурнітура", quantity: 8, unit: "шт" },
]

// Mock data for finances
interface FinanceItem {
  id: string
  description: string
  amount: number
  type: "income" | "expense"
  date: string
  status?: "paid" | "pending"
}

function formatCurrency(amount: number): string {
  const formatted = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  return `${formatted} грн`
}

export function ProjectDetailModal({
  project,
  open,
  onOpenChange,
}: ProjectDetailModalProps) {
  if (!project) return null

  const config = statusConfig[project.status]
  const paymentProgress = (project.paidAmount / project.totalAmount) * 100

  // Calculate 70/30 split for installers
  const installerTotal = project.totalAmount * 0.15 // 15% of project goes to installers
  const installer70 = installerTotal * 0.7
  const installer30 = installerTotal * 0.3
  const isPaid70 = project.status !== "zamır"
  const isPaid30 = project.status === "zaversheno"

  const mockFinances: FinanceItem[] = [
    {
      id: "1",
      description: "Аванс від клієнта (30%)",
      amount: project.totalAmount * 0.3,
      type: "income",
      date: "2026-04-15",
      status: "paid",
    },
    {
      id: "2",
      description: "Закупівля матеріалів",
      amount: project.totalAmount * 0.25,
      type: "expense",
      date: "2026-04-18",
      status: "paid",
    },
    {
      id: "3",
      description: "Другий платіж (40%)",
      amount: project.totalAmount * 0.4,
      type: "income",
      date: "2026-04-28",
      status: project.paidAmount > project.totalAmount * 0.5 ? "paid" : "pending",
    },
    {
      id: "4",
      description: "ЗП монтажникам (70%)",
      amount: installer70,
      type: "expense",
      date: "2026-05-01",
      status: isPaid70 ? "paid" : "pending",
    },
    {
      id: "5",
      description: "Залишок оплати (30%)",
      amount: project.totalAmount * 0.3,
      type: "income",
      date: project.deadline,
      status: project.status === "zaversheno" ? "paid" : "pending",
    },
    {
      id: "6",
      description: "ЗП монтажникам (30%)",
      amount: installer30,
      type: "expense",
      date: project.deadline,
      status: isPaid30 ? "paid" : "pending",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{project.name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Клієнт: {project.client}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={config.className}>
                {config.label}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="specs" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="specs">Специфікація</TabsTrigger>
              <TabsTrigger value="finance">Фінанси</TabsTrigger>
              <TabsTrigger value="files">Файли</TabsTrigger>
            </TabsList>

            <TabsContent value="specs" className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Матеріали та фурнітура, списані на цей проєкт зі складу.
              </p>
              <div className="rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Найменування</TableHead>
                      <TableHead className="text-muted-foreground">Категорія</TableHead>
                      <TableHead className="text-muted-foreground text-right">Кількість</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockSpecifications.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-muted-foreground">{item.category}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity} {item.unit}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="finance" className="mt-4 space-y-6">
              {/* Payment Progress */}
              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Прогрес оплати</span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(project.paidAmount)} з {formatCurrency(project.totalAmount)}
                  </span>
                </div>
                <Progress value={paymentProgress} className="h-2 bg-secondary" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Аванс (30%)</span>
                  <span>Другий платіж (40%)</span>
                  <span>Залишок (30%)</span>
                </div>
              </div>

              {/* 70/30 Installer Split */}
              <div className="rounded-lg border border-border p-4 space-y-3">
                <h4 className="text-sm font-medium">ЗП монтажникам (70/30)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">70% при виробництві</span>
                      <Badge 
                        variant="outline" 
                        className={isPaid70 ? "bg-success/20 text-success border-success/30" : "bg-warning/20 text-warning border-warning/30"}
                      >
                        {isPaid70 ? "Виплачено" : "Очікує"}
                      </Badge>
                    </div>
                    <p className="text-lg font-semibold">{formatCurrency(installer70)}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">30% після монтажу</span>
                      <Badge 
                        variant="outline" 
                        className={isPaid30 ? "bg-success/20 text-success border-success/30" : "bg-warning/20 text-warning border-warning/30"}
                      >
                        {isPaid30 ? "Виплачено" : "Очікує"}
                      </Badge>
                    </div>
                    <p className="text-lg font-semibold">{formatCurrency(installer30)}</p>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div className="rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Операція</TableHead>
                      <TableHead className="text-muted-foreground">Дата</TableHead>
                      <TableHead className="text-muted-foreground text-right">Сума</TableHead>
                      <TableHead className="text-muted-foreground text-right">Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockFinances.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(item.date).toLocaleDateString("uk-UA")}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${item.type === "income" ? "text-success" : "text-destructive"}`}>
                          {item.type === "income" ? "+" : "-"}{formatCurrency(item.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge 
                            variant="outline" 
                            className={item.status === "paid" ? "bg-success/20 text-success border-success/30" : "bg-muted text-muted-foreground border-border"}
                          >
                            {item.status === "paid" ? "Оплачено" : "Очікує"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="files" className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Фото об&apos;єкта, креслення та інші документи проєкту.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-video rounded-lg border border-border bg-secondary flex items-center justify-center cursor-pointer hover:bg-accent transition-colors"
                  >
                    <FileImage className="size-8 text-muted-foreground" />
                  </div>
                ))}
                <div className="aspect-video rounded-lg border border-dashed border-border bg-secondary/50 flex flex-col items-center justify-center cursor-pointer hover:bg-accent transition-colors">
                  <FileText className="size-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Завантажити</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

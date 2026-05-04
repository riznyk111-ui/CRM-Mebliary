"use client"

import { useState } from "react"
import {
  MoreHorizontal,
  Eye,
  FileText,
  Trash2,
  ChevronDown,
  Plus,
} from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { ProjectDetailModal } from "@/components/project-detail-modal"

export type ProjectStatus = "zamır" | "vyrobnytstvo" | "montazh" | "zaversheno"

export interface Project {
  id: string
  name: string
  client: string
  status: ProjectStatus
  deadline: string
  totalAmount: number
  paidAmount: number
  daysLeft: number
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

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Кухня Modern Loft",
    client: "Іванов Олександр",
    status: "vyrobnytstvo",
    deadline: "2026-05-15",
    totalAmount: 85000,
    paidAmount: 59500,
    daysLeft: 11,
  },
  {
    id: "2",
    name: "Спальня Scandinavian",
    client: "Петренко Марія",
    status: "zamır",
    deadline: "2026-05-08",
    totalAmount: 42000,
    paidAmount: 12600,
    daysLeft: 4,
  },
  {
    id: "3",
    name: "Офісні меблі StartUp",
    client: "ТОВ \"Інновації\"",
    status: "montazh",
    deadline: "2026-05-06",
    totalAmount: 156000,
    paidAmount: 109200,
    daysLeft: 2,
  },
  {
    id: "4",
    name: "Дитяча Веселка",
    client: "Сидоренко Анна",
    status: "vyrobnytstvo",
    deadline: "2026-05-20",
    totalAmount: 38000,
    paidAmount: 26600,
    daysLeft: 16,
  },
  {
    id: "5",
    name: "Вітальня Classic",
    client: "Коваленко Петро",
    status: "zaversheno",
    deadline: "2026-04-28",
    totalAmount: 120000,
    paidAmount: 120000,
    daysLeft: 0,
  },
  {
    id: "6",
    name: "Гардеробна Premium",
    client: "Мельник Ольга",
    status: "zamır",
    deadline: "2026-05-25",
    totalAmount: 67000,
    paidAmount: 20100,
    daysLeft: 21,
  },
]

function formatCurrency(amount: number): string {
  const formatted = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  return `${formatted} грн`
}

export function ProjectsTable() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openProjectDetail = (project: Project) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Всі статуси
              <ChevronDown className="ml-1 size-3" />
            </Button>
            <Button variant="outline" size="sm">
              Цей місяць
              <ChevronDown className="ml-1 size-3" />
            </Button>
          </div>
          <Button size="sm" className="gap-1">
            <Plus className="size-4" />
            Новий проєкт
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-muted-foreground">Проєкт</TableHead>
                <TableHead className="text-muted-foreground">Клієнт</TableHead>
                <TableHead className="text-muted-foreground">Статус</TableHead>
                <TableHead className="text-muted-foreground">Дедлайн</TableHead>
                <TableHead className="text-muted-foreground">Оплата</TableHead>
                <TableHead className="text-muted-foreground w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProjects.map((project) => {
                const paymentProgress = (project.paidAmount / project.totalAmount) * 100
                const isUrgent = project.daysLeft <= 7 && project.status !== "zaversheno"
                const config = statusConfig[project.status]

                return (
                  <TableRow 
                    key={project.id} 
                    className="cursor-pointer"
                    onClick={() => openProjectDetail(project)}
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{project.name}</span>
                        {isUrgent && (
                          <span className="text-xs text-destructive">
                            {project.daysLeft} дн. до дедлайну
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {project.client}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={config.className}>
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(project.deadline).toLocaleDateString("uk-UA")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5 min-w-[140px]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {formatCurrency(project.paidAmount)}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(project.totalAmount)}
                          </span>
                        </div>
                        <Progress 
                          value={paymentProgress} 
                          className="h-1.5 bg-secondary"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Меню</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openProjectDetail(project)}>
                            <Eye className="mr-2 size-4" />
                            Переглянути
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 size-4" />
                            Документи
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 size-4" />
                            Видалити
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <ProjectDetailModal
        project={selectedProject}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  )
}

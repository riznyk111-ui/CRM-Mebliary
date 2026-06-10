"use client"

import { useState } from "react"
import {
  MoreHorizontal,
  Eye,
  FileText,
  Trash2,
  ChevronDown,
  Plus,
  Pencil,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type ProjectStatus = "zamır" | "vyrobnytstvo" | "montazh" | "zaversheno"

export interface Project {
  id: string
  projectNumber?: number
  name: string
  client: string
  clientPhone?: string
  clientEmail?: string
  status: ProjectStatus
  deadline: string
  totalAmount: number
  paidAmount: number
  daysLeft: number
  materialClientPrice?: number
  materialOurCost?: number
  hardwareClientPrice?: number
  hardwareOurCost?: number
  workPrice?: number
  mountingPrice?: number
}

interface ProjectsTableProps {
  projects: Project[]
  onAddProject: (p: Omit<Project, "id" | "daysLeft">) => void
  onUpdateProject: (p: Project) => void
  onDeleteProject: (id: string) => void
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

function formatCurrency(amount: number): string {
  const formatted = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  return `${formatted} грн`
}

export function ProjectsTable({ projects, onAddProject, onUpdateProject, onDeleteProject }: ProjectsTableProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    client: "",
    status: "zamır" as ProjectStatus,
    deadline: new Date().toISOString().split("T")[0],
    totalAmount: 0,
    paidAmount: 0,
  })

  const [editFormData, setEditFormData] = useState({
    name: "",
    client: "",
    status: "zamır" as ProjectStatus,
    deadline: "",
    totalAmount: 0,
    paidAmount: 0,
  })

  const handleOpenEditDialog = (project: Project) => {
    setEditingProject(project)
    setEditFormData({
      name: project.name,
      client: project.client,
      status: project.status,
      deadline: project.deadline.split("T")[0],
      totalAmount: project.totalAmount || 0,
      paidAmount: project.paidAmount || 0,
    })
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = () => {
    if (editingProject) {
      onUpdateProject({
        ...editingProject,
        ...editFormData,
      })
      setIsEditDialogOpen(false)
      setEditingProject(null)
    }
  }

  const openProjectDetail = (project: Project) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  const handleSubmit = () => {
    onAddProject(formData)
    setIsAddDialogOpen(false)
    setFormData({
      name: "",
      client: "",
      status: "zamır",
      deadline: new Date().toISOString().split("T")[0],
      totalAmount: 0,
      paidAmount: 0,
    })
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
          </div>
          <Button size="sm" className="gap-1" onClick={() => setIsAddDialogOpen(true)}>
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
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    Проєктів немає
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => {
                  const paymentProgress = project.totalAmount > 0 ? (project.paidAmount / project.totalAmount) * 100 : 0
                  const isUrgent = project.daysLeft <= 7 && project.status !== "zaversheno"
                  const config = statusConfig[project.status] || statusConfig["zamır"]

                  return (
                    <TableRow 
                      key={project.id} 
                      className="cursor-pointer"
                      onClick={() => openProjectDetail(project)}
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-emerald-500 font-bold">#{project.projectNumber?.toString().padStart(3, '0')}</span>
                            <span className="font-medium">{project.name}</span>
                          </div>
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
                            <DropdownMenuItem onClick={() => handleOpenEditDialog(project)}>
                              <Pencil className="mr-2 size-4" />
                              Редагувати
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => onDeleteProject(project.id)}>
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
      </div>

      <ProjectDetailModal
        project={selectedProject}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />

      {/* Dialog Add Project */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Створити новий проєкт</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Назва проєкту</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Кухня Loft"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Клієнт</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                placeholder="Іван Петренко"
              />
            </div>
            <div className="space-y-2">
              <Label>Статус</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as ProjectStatus })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zamır">Замір</SelectItem>
                  <SelectItem value="vyrobnytstvo">Виробництво</SelectItem>
                  <SelectItem value="montazh">Монтаж</SelectItem>
                  <SelectItem value="zaversheno">Завершено</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Дедлайн</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Загальна вартість</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  value={formData.totalAmount || ""}
                  onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paidAmount">Оплачено</Label>
                <Input
                  id="paidAmount"
                  type="number"
                  value={formData.paidAmount || ""}
                  onChange={(e) => setFormData({ ...formData, paidAmount: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Скасувати</Button>
            <Button onClick={handleSubmit} disabled={!formData.name || !formData.client}>Створити</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit Project */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Редагувати проєкт</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Назва проєкту</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-client">Клієнт</Label>
              <Input
                id="edit-client"
                value={editFormData.client}
                onChange={(e) => setEditFormData({ ...editFormData, client: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Статус</Label>
              <Select value={editFormData.status} onValueChange={(v) => setEditFormData({ ...editFormData, status: v as ProjectStatus })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zamır">Замір</SelectItem>
                  <SelectItem value="vyrobnytstvo">Виробництво</SelectItem>
                  <SelectItem value="montazh">Монтаж</SelectItem>
                  <SelectItem value="zaversheno">Завершено</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-deadline">Дедлайн</Label>
              <Input
                id="edit-deadline"
                type="date"
                value={editFormData.deadline}
                onChange={(e) => setEditFormData({ ...editFormData, deadline: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-totalAmount">Загальна вартість</Label>
                <Input
                  id="edit-totalAmount"
                  type="number"
                  value={editFormData.totalAmount || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, totalAmount: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-paidAmount">Оплачено</Label>
                <Input
                  id="edit-paidAmount"
                  type="number"
                  value={editFormData.paidAmount || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, paidAmount: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Скасувати</Button>
            <Button onClick={handleEditSubmit} disabled={!editFormData.name || !editFormData.client}>Зберегти</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Phone,
  Mail,
  User,
  Briefcase,
} from "lucide-react"
import Image from "next/image"

export interface TeamMember {
  id: string
  name: string
  role: "manager" | "installer" | "designer" | "driver" | "other"
  phone: string
  email: string
  salary: number
  salaryType: "fixed" | "percentage"
  percentageRate?: number
  status: "active" | "inactive" | "pending"
  photoUrl?: string
  allowedSections?: string[]
  hireDate: string
  projectsCompleted: number
  totalEarnings: number
}

interface TeamTableProps {
  members: TeamMember[]
  onAddMember: (member: Omit<TeamMember, "id" | "projectsCompleted" | "totalEarnings">) => void
  onUpdateMember: (member: TeamMember) => void
  onDeleteMember: (id: string) => void
}

const roleLabels: Record<TeamMember["role"], string> = {
  manager: "Менеджер",
  installer: "Монтажник",
  designer: "Дизайнер",
  driver: "Водій",
  other: "Інше",
}

const sectionLabels: Record<string, string> = {
  dashboard: "Дашборд",
  projects: "Проєкти",
  estimates: "Кошториси",
  inventory: "Склад",
  finance: "Фінанси",
  team: "Команда",
  settings: "Налаштування",
}

const roleColors: Record<TeamMember["role"], string> = {
  manager: "bg-primary/20 text-primary",
  installer: "bg-income/20 text-income",
  designer: "bg-purple-500/20 text-purple-400",
  driver: "bg-amber-500/20 text-amber-400",
  other: "bg-muted text-muted-foreground",
}

function formatCurrency(amount: number): string {
  const formatted = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  return `${formatted} грн`
}

export function TeamTable({ members, onAddMember, onUpdateMember, onDeleteMember }: TeamTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    role: "installer" as TeamMember["role"],
    phone: "",
    email: "",
    salary: 0,
    salaryType: "fixed" as "fixed" | "percentage",
    percentageRate: 70,
    status: "active" as TeamMember["status"],
    photoUrl: "",
    allowedSections: [] as string[],
    hireDate: new Date().toISOString().split("T")[0],
  })

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || member.role === roleFilter
    const matchesStatus = statusFilter === "all" || member.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleSubmit = () => {
    if (editingMember) {
      onUpdateMember({
        ...editingMember,
        ...formData,
      })
      setEditingMember(null)
    } else {
      onAddMember({
        ...formData,
      })
    }
    resetForm()
    setIsAddDialogOpen(false)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      role: "installer",
      phone: "",
      email: "",
      salary: 0,
      salaryType: "fixed",
      percentageRate: 70,
      status: "active",
      photoUrl: "",
      allowedSections: [],
      hireDate: new Date().toISOString().split("T")[0],
    })
  }

  const openEditDialog = (member: TeamMember) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      role: member.role,
      phone: member.phone,
      email: member.email,
      salary: member.salary,
      salaryType: member.salaryType,
      percentageRate: member.percentageRate || 70,
      status: member.status,
      photoUrl: member.photoUrl || "",
      allowedSections: member.allowedSections || [],
      hireDate: member.hireDate,
    })
    setIsAddDialogOpen(true)
  }

  const activeMembers = members.filter((m) => m.status === "active").length
  const totalSalaries = members
    .filter((m) => m.status === "active" && m.salaryType === "fixed")
    .reduce((sum, m) => sum + m.salary, 0)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="size-4" />
            <span className="text-sm">Всього працівників</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{members.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="size-4" />
            <span className="text-sm">Активні</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-income">{activeMembers}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-sm">Фіксовані зарплати</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(totalSalaries)}</p>
          <p className="text-xs text-muted-foreground">на місяць</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-sm">Монтажники</span>
          </div>
          <p className="mt-2 text-2xl font-bold">
            {members.filter((m) => m.role === "installer").length}
          </p>
          <p className="text-xs text-muted-foreground">70/30 оплата</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Пошук за іменем, телефоном, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Всі посади" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі посади</SelectItem>
            <SelectItem value="manager">Менеджери</SelectItem>
            <SelectItem value="installer">Монтажники</SelectItem>
            <SelectItem value="designer">Дизайнери</SelectItem>
            <SelectItem value="driver">Водії</SelectItem>
            <SelectItem value="other">Інше</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Всі статуси" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі статуси</SelectItem>
            <SelectItem value="active">Активні</SelectItem>
            <SelectItem value="inactive">Неактивні</SelectItem>
            <SelectItem value="pending">Очікують</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 size-4" />
          Додати працівника
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Фото</TableHead>
              <TableHead>Ім&apos;я</TableHead>
              <TableHead>Посада</TableHead>
              <TableHead>Контакти</TableHead>
              <TableHead>Проєктів</TableHead>
              <TableHead>Зароблено</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  Працівників не знайдено
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="relative size-10 overflow-hidden rounded-full border border-border bg-muted">
                      {member.photoUrl ? (
                        <Image
                          src={member.photoUrl}
                          alt={member.name}
                          fill
                          className="object-cover"
                          unoptimized={member.photoUrl.startsWith("data:")}
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center">
                          <User className="size-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>
                    <Badge className={roleColors[member.role]}>
                      {roleLabels[member.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="size-3" />
                        {member.phone}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="size-3" />
                        {member.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{member.projectsCompleted}</TableCell>
                  <TableCell className="text-income">{formatCurrency(member.totalEarnings)}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        member.status === "active"
                          ? "bg-income/20 text-income"
                          : member.status === "pending"
                          ? "bg-warning/20 text-warning"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {member.status === "active" ? "Активний" : member.status === "pending" ? "Очікує" : "Неактивний"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(member)}>
                          <Pencil className="mr-2 size-4" />
                          Редагувати
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-expense"
                          onClick={() => onDeleteMember(member.id)}
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

      {/* Add/Edit Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open)
          if (!open) {
            setEditingMember(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Редагувати працівника" : "Додати працівника"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="name">Ім&apos;я</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Іван Петренко"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Посада</Label>
                <Select
                  value={formData.role}
                  onValueChange={(v) => setFormData({ ...formData, role: v as TeamMember["role"] })}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Менеджер</SelectItem>
                    <SelectItem value="installer">Монтажник</SelectItem>
                    <SelectItem value="designer">Дизайнер</SelectItem>
                    <SelectItem value="driver">Водій</SelectItem>
                    <SelectItem value="other">Інше</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Статус</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v as TeamMember["status"] })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Активний</SelectItem>
                    <SelectItem value="inactive">Неактивний</SelectItem>
                    <SelectItem value="pending">Очікує</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+380 XX XXX XX XX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
 
              <div className="space-y-2">
                <Label htmlFor="hireDate">Дата найму</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photoUrl">Фото (URL)</Label>
                <Input
                  id="photoUrl"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="col-span-2 space-y-2 pt-2 border-t border-border">
                <Label>Доступні розділи CRM</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {Object.entries(sectionLabels).map(([key, label]) => {
                    const checked = formData.allowedSections.includes(key)
                    return (
                      <label key={key} className="flex items-center gap-2 text-sm font-normal cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const nextSections = e.target.checked
                              ? [...formData.allowedSections, key]
                              : formData.allowedSections.filter((s) => s !== key)
                            setFormData({ ...formData, allowedSections: nextSections })
                          }}
                          className="rounded border-zinc-800 bg-zinc-950 text-emerald-600 focus:ring-emerald-600 size-4"
                        />
                        <span>{label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.name}>
              {editingMember ? "Зберегти" : "Додати"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

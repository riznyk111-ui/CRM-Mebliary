"use client"

import { X, FileImage, FileText, Trash2, Plus, Users } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import type { Project, ProjectStatus } from "@/components/projects-table"
import type { InventoryItem } from "@/components/inventory-table"
import { useState, useEffect } from "react"
import { 
  getProjectMaterials, 
  addMaterialToProject, 
  removeMaterialFromProject,
  getProjectTeam,
  removeProjectTeamMember,
  updateProjectStatus,
  getProjectFiles,
  uploadProjectFile,
  removeProjectFile,
  updateProjectBasicInfo
} from "@/app/(dashboard)/projects/actions"
import { getInventory } from "@/app/(dashboard)/inventory/actions"
import { getProjectTransactions, addTransaction } from "@/app/(dashboard)/finance/actions"
import { getTeamMembers } from "@/app/(dashboard)/team/actions"
import type { Transaction } from "@/components/finance-table"
import type { TeamMember } from "@/components/team-table"
import { useToast } from "@/hooks/use-toast"

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

function formatCurrency(amount: number): string {
  const formatted = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  return `${formatted} грн`
}

export function ProjectDetailModal({
  project,
  open,
  onOpenChange,
}: ProjectDetailModalProps) {
  const [materials, setMaterials] = useState<any[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [projectTransactions, setProjectTransactions] = useState<Transaction[]>([])
  const [projectTeam, setProjectTeam] = useState<any[]>([])
  const [projectFiles, setProjectFiles] = useState<any[]>([])
  const [availableTeam, setAvailableTeam] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<string>("")
  const [quantity, setQuantity] = useState<number | "">("")
  const [txFormData, setTxFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "income" as "income" | "expense",
    category: "Оплата за проєкт",
    description: "",
  })
  
  const [editForm, setEditForm] = useState({
    name: "",
    client: "",
    clientPhone: "",
    clientEmail: "",
    deadline: "",
  })
  
  const [currentStatus, setCurrentStatus] = useState<ProjectStatus>("zamır")

  // Team
  const [selectedProfile, setSelectedProfile] = useState("")
  const [teamRole, setTeamRole] = useState("")
  const [teamPercentage, setTeamPercentage] = useState<number | "">("")
  const [salaryType, setSalaryType] = useState<"percent" | "fixed">("percent")
  const [fixedAmount, setFixedAmount] = useState<number | "">("")



  const { toast } = useToast()

  useEffect(() => {
    if (open && project) {
      setCurrentStatus(project.status)
      setEditForm({
        name: project.name,
        client: project.client,
        clientPhone: project.clientPhone || "",
        clientEmail: project.clientEmail || "",
        deadline: project.deadline.split('T')[0],
      })
      loadData()
    }
  }, [open, project])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [mats, inv, txs, pTeam, teamList, files] = await Promise.all([
        getProjectMaterials(project!.id),
        getInventory(),
        getProjectTransactions(project!.id),
        getProjectTeam(project!.id),
        getTeamMembers(),
        getProjectFiles(project!.id)
      ])
      setMaterials(mats)
      setInventory(inv)
      setProjectTransactions(txs)
      setProjectTeam(pTeam)
      setAvailableTeam(teamList)
      setProjectFiles(files)


    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMaterial = async () => {
    if (!project || !selectedItem || !quantity || quantity <= 0) return
    setIsLoading(true)
    const result = await addMaterialToProject(project.id, selectedItem, Number(quantity))
    if (result.error) {
      toast({ variant: "destructive", title: "Помилка", description: result.error })
    } else {
      toast({ title: "Успіх", description: "Матеріал додано до проєкту" })
      setSelectedItem("")
      setQuantity("")
      await loadData()
    }
    setIsLoading(false)
  }

  const handleRemoveMaterial = async (materialId: string, inventoryId: string, qty: number) => {
    if (!confirm("Дійсно повернути цей матеріал на склад?")) return
    setIsLoading(true)
    const result = await removeMaterialFromProject(materialId, inventoryId, qty)
    if (result.error) {
      toast({ variant: "destructive", title: "Помилка", description: result.error })
    } else {
      toast({ title: "Успіх", description: "Матеріал повернуто на склад" })
      await loadData()
    }
    setIsLoading(false)
  }

  const handleAddProjectTransaction = async () => {
    if (!project || !txFormData.amount || !txFormData.category) return
    setIsLoading(true)
    const result = await addTransaction({
      date: txFormData.date,
      type: txFormData.type,
      category: txFormData.category,
      description: txFormData.description,
      amount: Number(txFormData.amount),
      projectId: project.id,
      projectName: project.name,
      paymentMethod: "Банківський переказ",
      status: "completed",
    })
    if (result.error) {
      toast({ variant: "destructive", title: "Помилка", description: result.error })
    } else {
      toast({ title: "Успіх", description: "Транзакцію додано до проєкту" })
      setTxFormData({ ...txFormData, amount: "", description: "" })
      await loadData()
    }
    setIsLoading(false)
  }

  const handleAddTeamMember = async () => {
    if (!project || !selectedProfile || !teamRole) return
    setIsLoading(true)
    const result = await addProjectTeamMember(
      project.id, 
      selectedProfile, 
      teamRole, 
      salaryType === "percent" ? Number(teamPercentage) : 0,
      salaryType,
      salaryType === "fixed" ? Number(fixedAmount) : 0
    )
    if (result.error) {
      toast({ variant: "destructive", title: "Помилка", description: result.error })
    } else {
      toast({ title: "Успіх", description: "Працівника додано" })
      setSelectedProfile("")
      setTeamRole("")
      setTeamPercentage("")
      setFixedAmount("")
      await loadData()
    }
    setIsLoading(false)
  }

  const handleRemoveTeamMember = async (id: string) => {
    setIsLoading(true)
    const result = await removeProjectTeamMember(id)
    if (result.error) {
      toast({ variant: "destructive", title: "Помилка", description: result.error })
    } else {
      toast({ title: "Успіх", description: "Працівника видалено" })
      await loadData()
    }
    setIsLoading(false)
  }



  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!project) return
    setIsLoading(true)
    const result = await updateProjectStatus(project.id, newStatus)
    if (result.error) {
      toast({ variant: "destructive", title: "Помилка", description: result.error })
    } else {
      toast({ title: "Успіх", description: "Статус оновлено" })
      setCurrentStatus(newStatus)
      if (project) project.status = newStatus
    }
    setIsLoading(false)
  }

  const handleUpdateBasicInfo = async () => {
    if (!project) return
    setIsLoading(true)
    const result = await updateProjectBasicInfo(project.id, editForm)
    if (result.error) {
      toast({ variant: "destructive", title: "Помилка", description: result.error })
    } else {
      toast({ title: "Успіх", description: "Дані проєкту оновлено" })
      // Update local object to reflect changes without reload if possible
      project.name = editForm.name
      project.client = editForm.client
      project.clientPhone = editForm.clientPhone
      project.clientEmail = editForm.clientEmail
      project.deadline = editForm.deadline
    }
    setIsLoading(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !project) return
    
    setIsLoading(true)
    const formData = new FormData()
    formData.append("file", file)
    
    const result = await uploadProjectFile(project.id, formData)
    if (result.error) {
      toast({ variant: "destructive", title: "Помилка", description: result.error })
    } else {
      toast({ title: "Успіх", description: "Файл завантажено" })
      await loadData()
    }
    setIsLoading(false)
  }

  const handleFileDelete = async (fileId: string, filePath: string) => {
    if (!confirm("Видалити цей файл?")) return
    setIsLoading(true)
    const result = await removeProjectFile(fileId, filePath)
    if (result.error) {
      toast({ variant: "destructive", title: "Помилка", description: result.error })
    } else {
      toast({ title: "Успіх", description: "Файл видалено" })
      await loadData()
    }
    setIsLoading(false)
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <FileImage className="size-8 text-emerald-500" />
    if (type.startsWith("video/")) return <FileText className="size-8 text-rose-500" />
    if (type.includes("word") || type.includes("pdf")) return <FileText className="size-8 text-blue-500" />
    if (type.includes("excel") || type.includes("spreadsheet")) return <FileText className="size-8 text-green-500" />
    return <FileText className="size-8 text-muted-foreground" />
  }

  if (!project) return null

  const config = statusConfig[currentStatus]
  
  // Client Material Total for Team calculations
  const clientMaterialTotal = (project.materialClientPrice || 0) + (project.hardwareClientPrice || 0)

  // Dynamic Finance Calculations
  const calculatedTotalAmount = clientMaterialTotal + (project.workPrice || 0)
  const finalTotalAmount = calculatedTotalAmount > 0 ? calculatedTotalAmount : (project.totalAmount || 0)

  const paidAmount = projectTransactions
    .filter(tx => tx.type === "income" && tx.status === "completed")
    .reduce((sum, tx) => sum + Number(tx.amount), 0)

  const paymentProgress = finalTotalAmount > 0 ? (paidAmount / finalTotalAmount) * 100 : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-emerald-500 font-bold">#{project.projectNumber?.toString().padStart(3, '0')}</span>
                <DialogTitle className="text-xl">{project.name}</DialogTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Клієнт: {project.client}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={currentStatus} onValueChange={(v) => handleStatusChange(v as ProjectStatus)}>
                <SelectTrigger className={`w-[140px] ${config.className}`}>
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
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="info">Інфо</TabsTrigger>
              <TabsTrigger value="team"><Users className="size-4 mr-2" />Команда</TabsTrigger>
              <TabsTrigger value="specs">Специфікація</TabsTrigger>
              <TabsTrigger value="finance">Фінанси</TabsTrigger>
              <TabsTrigger value="files">Файли</TabsTrigger>
            </TabsList>

            {/* INFO TAB */}
            <TabsContent value="info" className="mt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider">Дані об&apos;єкта</h4>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Назва проєкту</label>
                    <Input 
                      value={editForm.name} 
                      onChange={e => setEditForm({...editForm, name: e.target.value})} 
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Дедлайн</label>
                    <Input 
                      type="date"
                      value={editForm.deadline} 
                      onChange={e => setEditForm({...editForm, deadline: e.target.value})} 
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider">Контакти клієнта</h4>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Ім&apos;я клієнта</label>
                    <Input 
                      value={editForm.client} 
                      onChange={e => setEditForm({...editForm, client: e.target.value})} 
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Телефон</label>
                    <Input 
                      value={editForm.clientPhone} 
                      onChange={e => setEditForm({...editForm, clientPhone: e.target.value})} 
                      placeholder="+380..."
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Email</label>
                    <Input 
                      type="email"
                      value={editForm.clientEmail} 
                      onChange={e => setEditForm({...editForm, clientEmail: e.target.value})} 
                      placeholder="example@mail.com"
                      className="bg-background"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button 
                  onClick={handleUpdateBasicInfo} 
                  disabled={isLoading || !editForm.name || !editForm.client}
                  className="w-full md:w-auto"
                >
                  Зберегти зміни
                </Button>
              </div>
            </TabsContent>



            {/* TEAM TAB */}
            <TabsContent value="team" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Працівники, залучені до проєкту. Їх ЗП розраховується як відсоток від загальної вартості матеріалів клієнта ({formatCurrency(clientMaterialTotal)}).
                </p>
              </div>

              <div className="flex flex-wrap items-end gap-3 bg-secondary/30 p-3 rounded-lg border border-border">
                <div className="flex-1 min-w-[200px] space-y-1">
                  <label className="text-xs text-muted-foreground">Працівник</label>
                  <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Оберіть..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTeam.map(item => (
                        <SelectItem key={item.id} value={item.id}>{item.name} ({item.role})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-muted-foreground">Роль на проєкті</label>
                  <Input value={teamRole} onChange={e => setTeamRole(e.target.value)} placeholder="Напр. Монтажник" className="bg-background"/>
                </div>
                <div className="w-32 space-y-1">
                  <label className="text-xs text-muted-foreground">Тип оплати</label>
                  <Select value={salaryType} onValueChange={(v: any) => setSalaryType(v)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Відсоток (%)</SelectItem>
                      <SelectItem value="fixed">Фікс (грн)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24 space-y-1">
                  <label className="text-xs text-muted-foreground">
                    {salaryType === "percent" ? "Відсоток" : "Сума"}
                  </label>
                  <Input 
                    type="number" 
                    value={salaryType === "percent" ? teamPercentage : fixedAmount} 
                    onChange={e => salaryType === "percent" ? setTeamPercentage(Number(e.target.value)) : setFixedAmount(Number(e.target.value))} 
                    className="bg-background"
                    placeholder={salaryType === "percent" ? "15" : "5000"}
                  />
                </div>
                <Button 
                  onClick={handleAddTeamMember} 
                  disabled={!selectedProfile || !teamRole || (salaryType === "percent" ? !teamPercentage : !fixedAmount) || isLoading}
                  className="gap-1"
                >
                  <Plus className="size-4" />
                  Додати
                </Button>
              </div>

              <div className="rounded-lg border border-border overflow-x-auto w-full">
                <Table className="min-w-max">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Працівник</TableHead>
                      <TableHead className="text-muted-foreground">Роль</TableHead>
                      <TableHead className="text-muted-foreground text-right">Умови</TableHead>
                      <TableHead className="text-muted-foreground text-right">Сума ЗП</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectTeam.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                          Команду ще не призначено
                        </TableCell>
                      </TableRow>
                    ) : (
                      projectTeam.map((member) => {
                        const calculatedSalary = member.salary_type === "fixed" 
                          ? member.fixed_amount 
                          : clientMaterialTotal * (member.percentage / 100)
                        return (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell className="text-muted-foreground">{member.role}</TableCell>
                            <TableCell className="text-right font-medium">
                              {member.salary_type === "fixed" ? "Фікс" : `${member.percentage}%`}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground font-bold">
                              {formatCurrency(calculatedSalary)}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="size-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveTeamMember(member.id)}
                                disabled={isLoading}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="specs" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Матеріали та фурнітура, списані на цей проєкт зі складу (автоматично оновлюється з Інвентаря).
                </p>
              </div>

              {/* Add Material Form */}
              <div className="flex flex-wrap items-end gap-3 bg-secondary/30 p-3 rounded-lg border border-border">
                <div className="flex-1 min-w-[200px] space-y-1">
                  <label className="text-xs text-muted-foreground">Обрати товар зі складу</label>
                  <Select value={selectedItem} onValueChange={setSelectedItem}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Оберіть товар..." />
                    </SelectTrigger>
                    <SelectContent>
                      {inventory.map(item => (
                        <SelectItem key={item.id} value={item.id} disabled={item.quantity <= 0}>
                          {item.name} (Залишок: {item.quantity} {item.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24 space-y-1">
                  <label className="text-xs text-muted-foreground">Кількість</label>
                  <Input 
                    type="number" 
                    min="1" 
                    value={quantity} 
                    onChange={e => setQuantity(Number(e.target.value))} 
                    className="bg-background"
                  />
                </div>
                <Button 
                  onClick={handleAddMaterial} 
                  disabled={!selectedItem || !quantity || isLoading}
                  className="gap-1"
                >
                  <Plus className="size-4" />
                  Додати
                </Button>
              </div>

              <div className="rounded-lg border border-border overflow-x-auto w-full">
                <Table className="min-w-max">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Найменування</TableHead>
                      <TableHead className="text-muted-foreground">Категорія</TableHead>
                      <TableHead className="text-muted-foreground text-right">Кількість</TableHead>
                      <TableHead className="text-muted-foreground text-right">Сума</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                          Специфікація порожня. Додайте матеріали зі складу.
                        </TableCell>
                      </TableRow>
                    ) : (
                      materials.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-muted-foreground">{item.category}</TableCell>
                          <TableCell className="text-right">
                            {item.quantity} {item.unit}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatCurrency(item.totalCost)}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="size-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleRemoveMaterial(item.id, item.inventoryId, item.quantity)}
                              disabled={isLoading}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
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
                    {formatCurrency(paidAmount)} з {formatCurrency(finalTotalAmount)}
                  </span>
                </div>
                <Progress value={paymentProgress} className="h-2 bg-secondary" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Аванс (30%)</span>
                  <span>Другий платіж (40%)</span>
                  <span>Залишок (30%)</span>
                </div>
              </div>

              {/* Transaction History */}
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Історія транзакцій</h4>
              </div>

              {/* Add Transaction Form */}
              <div className="flex flex-wrap items-end gap-3 bg-secondary/30 p-3 rounded-lg border border-border">
                <div className="w-24 space-y-1">
                  <label className="text-xs text-muted-foreground">Тип</label>
                  <Select 
                    value={txFormData.type} 
                    onValueChange={(v) => setTxFormData({ ...txFormData, type: v as "income" | "expense", category: v === "income" ? "Оплата за проєкт" : "Матеріали" })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Дохід</SelectItem>
                      <SelectItem value="expense">Витрата</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-36 space-y-1">
                  <label className="text-xs text-muted-foreground">Категорія</label>
                  <Select 
                    value={txFormData.category} 
                    onValueChange={(v) => setTxFormData({ ...txFormData, category: v })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {txFormData.type === "income" ? (
                        <>
                          <SelectItem value="Оплата за проєкт">Оплата за проєкт</SelectItem>
                          <SelectItem value="Передоплата">Передоплата</SelectItem>
                          <SelectItem value="Доплата">Доплата</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="Матеріали">Матеріали</SelectItem>
                          <SelectItem value="Зарплата монтажникам">Зарплата монтажникам</SelectItem>
                          <SelectItem value="Інші витрати">Інші витрати</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24 space-y-1">
                  <label className="text-xs text-muted-foreground">Сума</label>
                  <Input 
                    type="number" 
                    value={txFormData.amount} 
                    onChange={e => setTxFormData({ ...txFormData, amount: Number(e.target.value) })} 
                    className="bg-background"
                  />
                </div>
                <div className="flex-1 space-y-1 min-w-[150px]">
                  <label className="text-xs text-muted-foreground">Опис (опціонально)</label>
                  <Input 
                    value={txFormData.description} 
                    onChange={e => setTxFormData({ ...txFormData, description: e.target.value })} 
                    className="bg-background"
                  />
                </div>
                <Button 
                  onClick={handleAddProjectTransaction} 
                  disabled={!txFormData.amount || isLoading}
                  className="gap-1"
                >
                  <Plus className="size-4" />
                  Додати
                </Button>
              </div>

              <div className="rounded-lg border border-border overflow-x-auto w-full">
                <Table className="min-w-max">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Операція</TableHead>
                      <TableHead className="text-muted-foreground">Дата</TableHead>
                      <TableHead className="text-muted-foreground text-right">Сума</TableHead>
                      <TableHead className="text-muted-foreground text-right">Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          Транзакцій поки немає
                        </TableCell>
                      </TableRow>
                    ) : (
                      projectTransactions.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{item.category}</span>
                              {item.description && <span className="text-xs text-muted-foreground">{item.description}</span>}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(item.date).toLocaleDateString("uk-UA")}
                          </TableCell>
                          <TableCell className={`text-right font-medium ${item.type === "income" ? "text-success" : "text-destructive"}`}>
                            {item.type === "income" ? "+" : "-"}{formatCurrency(item.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge 
                              variant="outline" 
                              className={item.status === "completed" ? "bg-success/20 text-success border-success/30" : "bg-muted text-muted-foreground border-border"}
                            >
                              {item.status === "completed" ? "Оплачено" : "Очікує"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="files" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Документи (Word, Excel), фото з об&apos;єкта та відео проєкту.
                </p>
                <div className="relative">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isLoading}
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    asChild
                  >
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Plus className="size-4" /> Завантажити файл
                    </label>
                  </Button>
                </div>
              </div>

              {projectFiles.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center border border-dashed border-border rounded-xl bg-secondary/10">
                   <FileText className="size-10 mb-2 opacity-20" />
                   <p className="text-sm text-muted-foreground">Файлів ще немає</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {projectFiles.map((file) => {
                    // Check if it's an image to show preview
                    const isImage = file.file_type.startsWith("image/")
                    const publicUrl = `https://ioythyavbcrygzfcjaio.supabase.co/storage/v1/object/public/project-files/${file.file_path}` // Adjust domain if needed

                    return (
                      <div
                        key={file.id}
                        className="group relative aspect-square rounded-lg border border-border bg-card flex flex-col items-center justify-center p-4 hover:border-emerald-500/50 transition-all shadow-sm overflow-hidden"
                      >
                        {isImage ? (
                          <img 
                            src={publicUrl} 
                            alt={file.name} 
                            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                          />
                        ) : (
                          <div className="mb-2">{getFileIcon(file.file_type)}</div>
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                           <p className="text-[10px] text-white font-medium truncate w-full mb-1">{file.name}</p>
                           <div className="flex items-center justify-between gap-2">
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                className="h-6 text-[10px] flex-1 px-1 bg-white/10 hover:bg-white/20 text-white border-0"
                                asChild
                              >
                                <a href={publicUrl} target="_blank" rel="noreferrer">Відкрити</a>
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="h-6 w-6 p-0"
                                onClick={() => handleFileDelete(file.id, file.file_path)}
                              >
                                <Trash2 className="size-3" />
                              </Button>
                           </div>
                        </div>

                        {!isImage && <span className="text-[10px] text-muted-foreground text-center line-clamp-2 mt-2">{file.name}</span>}
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

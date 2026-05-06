"use client"

import { useState, useEffect } from "react"
import { AppHeader } from "@/components/app-header"
import { Project } from "@/components/projects-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Save, Calculator } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getProjectTeam, updateProjectEstimate } from "@/app/(dashboard)/projects/actions"

function formatCurrency(amount: number): string {
  const formatted = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  return `${formatted} грн`
}

export function EstimatesClient({ initialProjects }: { initialProjects: Project[] }) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [projectTeam, setProjectTeam] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const [estimate, setEstimate] = useState({
    materialClientPrice: 0,
    materialOurCost: 0,
    hardwareClientPrice: 0,
    hardwareOurCost: 0,
    workPrice: 0,
    workPriceType: "fixed" as "fixed" | "percent",
    workPricePercent: 15,
  })

  // When a project is selected, load its team and set its estimate
  useEffect(() => {
    if (!selectedProjectId) return

    const loadProjectData = async () => {
      setIsLoading(true)
      const project = initialProjects.find(p => p.id === selectedProjectId)
      if (project) {
        setEstimate({
          materialClientPrice: project.materialClientPrice || 0,
          materialOurCost: project.materialOurCost || 0,
          hardwareClientPrice: project.hardwareClientPrice || 0,
          hardwareOurCost: project.hardwareOurCost || 0,
          workPrice: project.workPrice || 0,
          workPriceType: "fixed",
          workPricePercent: 15,
        })
      }

      const team = await getProjectTeam(selectedProjectId)
      setProjectTeam(team)
      setIsLoading(false)
    }

    loadProjectData()
  }, [selectedProjectId, initialProjects])

  const handleSaveEstimate = async () => {
    if (!selectedProjectId) return
    setIsLoading(true)
    const result = await updateProjectEstimate(selectedProjectId, {
      material_client_price: estimate.materialClientPrice,
      material_our_cost: estimate.materialOurCost,
      hardware_client_price: estimate.hardwareClientPrice,
      hardware_our_cost: estimate.hardwareOurCost,
      work_price: currentWorkPrice,
    })

    if (result.error) {
      toast({ variant: "destructive", title: "Помилка", description: result.error })
    } else {
      toast({ title: "Успіх", description: "Кошторис збережено" })
      // Update local array visually
      const project = initialProjects.find(p => p.id === selectedProjectId)
      if (project) {
        project.materialClientPrice = estimate.materialClientPrice
        project.materialOurCost = estimate.materialOurCost
        project.hardwareClientPrice = estimate.hardwareClientPrice
        project.hardwareOurCost = estimate.hardwareOurCost
        project.workPrice = currentWorkPrice
      }
    }
    setIsLoading(false)
  }

  // Calculations
  const clientMaterialTotal = estimate.materialClientPrice + estimate.hardwareClientPrice
  
  const currentWorkPrice = estimate.workPriceType === "percent" 
    ? Math.round(clientMaterialTotal * (estimate.workPricePercent / 100))
    : estimate.workPrice

  const totalClientPrice = clientMaterialTotal + currentWorkPrice

  const teamSalaryTotal = projectTeam.reduce((sum, member) => {
    return sum + (clientMaterialTotal * (member.percentage / 100))
  }, 0)

  const ourMaterialTotal = estimate.materialOurCost + estimate.hardwareOurCost
  const profitMaterials = clientMaterialTotal - ourMaterialTotal
  const profitWork = currentWorkPrice - teamSalaryTotal
  const netProfit = profitMaterials + profitWork
  const marginPercent = totalClientPrice > 0 ? (netProfit / totalClientPrice) * 100 : 0

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader title="Кошториси та Економіка" />
      <main className="flex-1 p-6 space-y-6">
        
        {/* Project Selector */}
        <div className="flex flex-col space-y-2 max-w-md">
          <label className="text-sm font-medium text-muted-foreground">Оберіть проєкт для розрахунку</label>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Виберіть проєкт..." />
            </SelectTrigger>
            <SelectContent>
              {initialProjects.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name} ({p.client})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProjectId ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Estimate Inputs */}
            <div className="space-y-4 rounded-xl border border-border p-6 bg-secondary/10">
              <h4 className="font-semibold flex items-center justify-between text-lg">
                <span className="flex items-center gap-2"><Calculator className="size-5 text-emerald-500" /> Дані кошторису</span>
                <Button onClick={handleSaveEstimate} disabled={isLoading}>
                  <Save className="size-4 mr-2" />
                  Зберегти
                </Button>
              </h4>
              
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">ДСП/МДФ (Для клієнта)</label>
                    <Input type="number" className="text-lg bg-background" value={estimate.materialClientPrice} onChange={e => setEstimate({...estimate, materialClientPrice: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">ДСП/МДФ (Наша закупка)</label>
                    <Input type="number" className="text-lg bg-background" value={estimate.materialOurCost} onChange={e => setEstimate({...estimate, materialOurCost: Number(e.target.value)})} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Фурнітура (Для клієнта)</label>
                    <Input type="number" className="text-lg bg-background" value={estimate.hardwareClientPrice} onChange={e => setEstimate({...estimate, hardwareClientPrice: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Фурнітура (Наша закупка)</label>
                    <Input type="number" className="text-lg bg-background" value={estimate.hardwareOurCost} onChange={e => setEstimate({...estimate, hardwareOurCost: Number(e.target.value)})} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 pt-2 border-t border-border">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Вартість робіт (Виготовлення + Монтаж)</label>
                      <div className="flex bg-secondary rounded-lg p-1">
                        <button 
                          onClick={() => setEstimate({...estimate, workPriceType: "fixed"})}
                          className={`px-3 py-1 text-xs rounded-md transition-all ${estimate.workPriceType === "fixed" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                        >
                          Фіксована
                        </button>
                        <button 
                          onClick={() => setEstimate({...estimate, workPriceType: "percent"})}
                          className={`px-3 py-1 text-xs rounded-md transition-all ${estimate.workPriceType === "percent" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                        >
                          Відсоток
                        </button>
                      </div>
                    </div>
                    
                    {estimate.workPriceType === "fixed" ? (
                      <Input 
                        type="number" 
                        className="text-lg bg-background" 
                        value={estimate.workPrice} 
                        onChange={e => setEstimate({...estimate, workPrice: Number(e.target.value)})} 
                        placeholder="Наприклад: 30000"
                      />
                    ) : (
                      <div className="flex gap-4">
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] text-muted-foreground">Відсоток від матеріалів (%)</label>
                          <Input 
                            type="number" 
                            className="text-lg bg-background" 
                            value={estimate.workPricePercent} 
                            onChange={e => setEstimate({...estimate, workPricePercent: Number(e.target.value)})} 
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] text-muted-foreground">Розрахована сума</label>
                          <div className="h-11 flex items-center px-3 rounded-md bg-secondary/30 text-lg font-semibold">
                            {formatCurrency(currentWorkPrice)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Results */}
            <div className="space-y-6">
              <div className="rounded-xl border border-emerald-900/30 p-6 bg-gradient-to-br from-emerald-950/20 to-zinc-950 space-y-6 shadow-sm">
                <div className="flex justify-between items-end border-b border-border/50 pb-6">
                  <div>
                    <p className="text-sm text-emerald-400 font-medium mb-1">Очікуваний чистий прибуток</p>
                    <p className="text-4xl font-bold text-emerald-500">{formatCurrency(netProfit)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Рентабельність</p>
                    <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-xl">
                      {marginPercent.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm bg-secondary/20 p-3 rounded-lg">
                    <span className="text-muted-foreground">Загальна вартість для клієнта</span>
                    <span className="font-bold text-lg">{formatCurrency(totalClientPrice)}</span>
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Структура прибутку</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-400">Прибуток на знижках (Матеріали)</span>
                      <span className="text-emerald-400 font-medium">+{formatCurrency(profitMaterials)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-400">Прибуток на роботі</span>
                      <span className="text-emerald-400 font-medium">+{formatCurrency(profitWork)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-border/50">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Структура витрат</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-400">Собівартість матеріалів (Закупка)</span>
                      <span className="text-rose-400 font-medium">-{formatCurrency(ourMaterialTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-400 flex items-center gap-1">
                        Зарплатний фонд команди
                        {projectTeam.length > 0 && <span className="text-xs text-muted-foreground">({projectTeam.length} чол.)</span>}
                      </span>
                      <span className="text-rose-400 font-medium">-{formatCurrency(teamSalaryTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border rounded-xl bg-card/50 text-muted-foreground">
            <Calculator className="size-10 mb-3 opacity-20" />
            <p>Оберіть проєкт вище, щоб розпочати роботу з кошторисом</p>
          </div>
        )}
      </main>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Package, 
  Tag, 
  User, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Plus, 
  FileSpreadsheet, 
  TrendingUp,
  Percent,
  Coins,
  History,
  DollarSign
} from "lucide-react"
import { getInventoryLogs } from "@/app/(dashboard)/inventory/actions"
import { InventoryItem } from "./inventory-table"

interface InventoryDetailModalProps {
  item: InventoryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface InventoryLog {
  id: string
  inventoryId: string
  actionType: "create" | "update" | "move" | "return" | "import"
  quantityChanged: number
  projectId?: string
  projectName?: string
  details: string
  createdBy?: string
  createdByName?: string
  createdAt: string
}

function formatCurrency(amount: number): string {
  const formatted = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  return `${formatted} грн`
}

export function InventoryDetailModal({ item, open, onOpenChange }: InventoryDetailModalProps) {
  const [logs, setLogs] = useState<InventoryLog[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && item?.id) {
      setLoading(true)
      getInventoryLogs(item.id)
        .then((data) => setLogs(data as InventoryLog[]))
        .catch((err) => console.error("Помилка завантаження логів:", err))
        .finally(() => setLoading(false))
    }
  }, [open, item?.id])

  if (!item) return null

  // Розрахунок аналітики товару
  const totalPurchaseValue = item.quantity * item.pricePerUnit
  const totalSellingValue = item.quantity * item.sellingPrice
  const profitMarginVal = item.sellingPrice - item.pricePerUnit
  const profitMarginPercent = item.pricePerUnit > 0 
    ? Math.round((profitMarginVal / item.pricePerUnit) * 100) 
    : 0
  const expectedProfit = item.quantity * profitMarginVal

  const getActionBadge = (type: InventoryLog["actionType"]) => {
    switch (type) {
      case "create":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1">
            <Plus className="size-3" />
            Додано
          </Badge>
        )
      case "update":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1">
            <RefreshCw className="size-3" />
            Оновлено
          </Badge>
        )
      case "move":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1">
            <ArrowUpRight className="size-3" />
            Списано
          </Badge>
        )
      case "return":
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20 gap-1">
            <ArrowDownLeft className="size-3" />
            Повернено
          </Badge>
        )
      case "import":
        return (
          <Badge variant="outline" className="bg-teal-500/10 text-teal-500 border-teal-500/20 gap-1">
            <FileSpreadsheet className="size-3" />
            Імпорт
          </Badge>
        )
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col bg-background text-foreground border-border">
        <DialogHeader className="flex-shrink-0 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Package className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">{item.name}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Артикул: <span className="font-mono text-foreground">{item.sku || "немає"}</span> • Категорія: <span className="text-emerald-500">{item.category}</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-1 grid grid-cols-1 md:grid-cols-12 gap-6 py-4">
          {/* ЛІВА КОЛОНКА - ДЕТАЛІ ТА МАРЖИНАЛЬНІСТЬ */}
          <div className="md:col-span-5 space-y-6">
            {/* Основні дані товару */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
              <h3 className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Характеристики</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-muted-foreground block">На складі</label>
                  <span className={`text-base font-bold ${item.quantity <= item.minQuantity ? "text-rose-500" : "text-foreground"}`}>
                    {item.quantity} {item.unit}
                  </span>
                  {item.quantity <= item.minQuantity && (
                    <span className="text-[10px] text-rose-500 block mt-0.5 font-medium">Критичний запас!</span>
                  )}
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground block">Постачальник</label>
                  <span className="text-sm font-semibold text-foreground truncate block">
                    {item.supplier || "Не вказано"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/60">
                <div>
                  <label className="text-[10px] text-muted-foreground block">Ціна закупівлі</label>
                  <span className="text-sm font-bold text-foreground">
                    {formatCurrency(item.pricePerUnit)}
                  </span>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-bold block text-emerald-500">Ціна продажу (ринкова)</label>
                  <span className="text-sm font-bold text-emerald-500">
                    {formatCurrency(item.sellingPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Блок маржинальності та вартості */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-4">
              <h3 className="text-xs font-semibold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="size-4" />
                Економіка залишку
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-muted-foreground block">Ринкова маржа (од.)</label>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-sm font-bold text-foreground">
                      {formatCurrency(profitMarginVal)}
                    </span>
                    {profitMarginPercent > 0 && (
                      <span className="text-[10px] font-bold text-emerald-500">
                        (+{profitMarginPercent}%)
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground block">Очікуваний прибуток</label>
                  <span className="text-sm font-bold text-emerald-500">
                    {formatCurrency(expectedProfit)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-emerald-500/10">
                <div>
                  <label className="text-[10px] text-muted-foreground block">Собівартість залишку</label>
                  <span className="text-sm font-bold text-foreground">
                    {formatCurrency(totalPurchaseValue)}
                  </span>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground block">Ринкова вартість</label>
                  <span className="text-sm font-bold text-emerald-500">
                    {formatCurrency(totalSellingValue)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ПРАВА КОЛОНКА - ЛОГИ РУХУ */}
          <div className="md:col-span-7 flex flex-col h-full border border-border rounded-xl bg-muted/10 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/40">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <History className="size-4 text-emerald-500" />
                Історія руху товару
              </h3>
              <span className="text-xs text-muted-foreground">Всього записів: {logs.length}</span>
            </div>

            <ScrollArea className="flex-1 p-4 max-h-[45vh] md:max-h-[50vh]">
              {loading ? (
                <div className="flex h-32 flex-col items-center justify-center gap-2">
                  <RefreshCw className="size-6 animate-spin text-emerald-500" />
                  <p className="text-xs text-muted-foreground">Завантаження історії...</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center text-center p-4">
                  <History className="size-8 text-muted-foreground/60 mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">Логи пересування порожні</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">Операції по цьому товару ще не фіксувалися в системі.</p>
                </div>
              ) : (
                <div className="space-y-4 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {logs.map((log) => {
                    const isNegative = log.quantityChanged < 0
                    const qtyString = log.quantityChanged !== 0
                      ? `${isNegative ? "" : "+"}${log.quantityChanged} ${item.unit}`
                      : ""
                    return (
                      <div key={log.id} className="relative pl-10 group">
                        {/* Точка на лінії часу */}
                        <div className="absolute left-[9px] top-1.5 size-4 rounded-full border-2 border-background bg-muted group-hover:bg-emerald-500 transition-colors flex items-center justify-center">
                          <div className="size-1.5 rounded-full bg-muted-foreground/60 group-hover:bg-background transition-colors" />
                        </div>

                        <div className="space-y-1 bg-muted/20 rounded-lg p-2.5 border border-border/40 hover:border-border transition-all">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            {getActionBadge(log.actionType)}
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                              <Calendar className="size-3" />
                              {new Date(log.createdAt).toLocaleString("uk-UA", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </div>
                          </div>

                          <p className="text-xs text-foreground leading-relaxed font-medium">
                            {log.details}
                          </p>

                          <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground border-t border-border/20">
                            <span className="flex items-center gap-1">
                              <User className="size-3 text-muted-foreground/80" />
                              {log.createdByName || "Користувач"}
                            </span>
                            {qtyString && (
                              <span className={`font-mono font-bold ${isNegative ? "text-rose-500" : "text-emerald-500"}`}>
                                {qtyString}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

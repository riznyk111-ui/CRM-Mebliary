"use client"

import { useState, useEffect } from "react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Building2, User, Bell, Palette, Database, Shield, Save, AlertTriangle } from "lucide-react"
import { 
  getAppSettings, 
  updateAppSettings, 
  getCurrentUserProfile, 
  updateCurrentUserProfile,
  clearAllData 
} from "./actions"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const [companySettings, setCompanySettings] = useState({
    name: "MEBLIARY",
    address: "м. Київ, вул. Меблева, 15",
    phone: "+380 44 123 4567",
    email: "info@mebliary.ua",
    website: "www.mebliary.ua",
    taxId: "12345678",
    description: "Виробництво та монтаж меблів на замовлення",
  })

  const [userSettings, setUserSettings] = useState({
    name: "Адміністратор",
    email: "admin@mebliary.ua",
    phone: "+380 67 123 4567",
    role: "admin",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    projectUpdates: true,
    paymentReminders: true,
    lowStockAlerts: true,
    deadlineReminders: true,
  })

  const [systemSettings, setSystemSettings] = useState({
    currency: "UAH",
    language: "uk",
    dateFormat: "DD.MM.YYYY",
    installerSplitPercent: 70,
    defaultPaymentTerms: 14,
    lowStockThreshold: 10,
  })

  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function loadSettings() {
      const [company, user, notify, system] = await Promise.all([
        getAppSettings('company'),
        getCurrentUserProfile(),
        getAppSettings('notifications'),
        getAppSettings('system')
      ])

      if (company) setCompanySettings(company)
      if (user) {
        setUserSettings({
          name: user.full_name,
          email: user.email,
          phone: user.phone || "",
          role: user.role
        })
      }
      if (notify) setNotificationSettings(notify)
      if (system) setSystemSettings(system)
    }
    loadSettings()
  }, [])

  const handleSave = async (type: 'company' | 'user' | 'notifications' | 'system') => {
    setIsSaving(true)
    let result: any

    if (type === 'company') result = await updateAppSettings('company', companySettings)
    if (type === 'notifications') result = await updateAppSettings('notifications', notificationSettings)
    if (type === 'system') result = await updateAppSettings('system', systemSettings)
    if (type === 'user') result = await updateCurrentUserProfile(userSettings)

    if (result?.error) {
      toast({ variant: "destructive", title: "Помилка", description: result.error })
    } else {
      toast({ title: "Успіх", description: "Налаштування збережено" })
    }
    setIsSaving(false)
  }

  const handleClearData = async () => {
    if (!confirm("Ви впевнені? Це видалить ВСІ дані (проєкти, склад, транзакції) назавжди!")) return
    setIsSaving(true)
    const result = await clearAllData()
    if (result.success) {
      toast({ title: "Успіх", description: "Всі дані видалено" })
      window.location.reload()
    }
    setIsSaving(false)
  }

  return (
    <main className="flex min-h-screen flex-col">
      <AppHeader title="Налаштування" />

      <div className="flex-1 space-y-6 p-6">
        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="size-4" />
              <span className="hidden sm:inline">Компанія</span>
            </TabsTrigger>
            <TabsTrigger value="user" className="flex items-center gap-2">
              <User className="size-4" />
              <span className="hidden sm:inline">Профіль</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="size-4" />
              <span className="hidden sm:inline">Сповіщення</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Palette className="size-4" />
              <span className="hidden sm:inline">Система</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="size-4" />
              <span className="hidden sm:inline">Дані</span>
            </TabsTrigger>
          </TabsList>

          {/* Company Settings */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="size-5" />
                  Інформація про компанію
                </CardTitle>
                <CardDescription>
                  Основна інформація про вашу компанію, яка відображається в документах
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Назва компанії</Label>
                    <Input
                      id="company-name"
                      value={companySettings.name}
                      onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax-id">ЄДРПОУ / ІПН</Label>
                    <Input
                      id="tax-id"
                      value={companySettings.taxId}
                      onChange={(e) => setCompanySettings({ ...companySettings, taxId: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Адреса</Label>
                  <Input
                    id="address"
                    value={companySettings.address}
                    onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company-phone">Телефон</Label>
                    <Input
                      id="company-phone"
                      value={companySettings.phone}
                      onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-email">Email</Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={companySettings.email}
                      onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Веб-сайт</Label>
                  <Input
                    id="website"
                    value={companySettings.website}
                    onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Опис діяльності</Label>
                  <Textarea
                    id="description"
                    value={companySettings.description}
                    onChange={(e) => setCompanySettings({ ...companySettings, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button onClick={() => handleSave('company')} disabled={isSaving}>
                  <Save className="mr-2 size-4" />
                  {isSaving ? "Збереження..." : "Зберегти зміни"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Profile */}
          <TabsContent value="user">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="size-5" />
                  Профіль користувача
                </CardTitle>
                <CardDescription>
                  Ваші персональні дані та налаштування облікового запису
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="user-name">{"Ім'я"}</Label>
                    <Input
                      id="user-name"
                      value={userSettings.name}
                      onChange={(e) => setUserSettings({ ...userSettings, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-role">Роль</Label>
                    <Select
                      value={userSettings.role}
                      onValueChange={(value) => setUserSettings({ ...userSettings, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Адміністратор</SelectItem>
                        <SelectItem value="manager">Менеджер</SelectItem>
                        <SelectItem value="accountant">Бухгалтер</SelectItem>
                        <SelectItem value="viewer">Переглядач</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="user-email">Email</Label>
                    <Input
                      id="user-email"
                      type="email"
                      value={userSettings.email}
                      onChange={(e) => setUserSettings({ ...userSettings, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-phone">Телефон</Label>
                    <Input
                      id="user-phone"
                      value={userSettings.phone}
                      onChange={(e) => setUserSettings({ ...userSettings, phone: e.target.value })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Shield className="size-4" />
                    Безпека
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Поточний пароль</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Новий пароль</Label>
                      <Input id="new-password" type="password" />
                    </div>
                  </div>
                </div>

                <Button onClick={() => handleSave('user')} disabled={isSaving}>
                  <Save className="mr-2 size-4" />
                  {isSaving ? "Збереження..." : "Зберегти зміни"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="size-5" />
                  Сповіщення
                </CardTitle>
                <CardDescription>
                  Налаштуйте, які сповіщення ви хочете отримувати
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email сповіщення</Label>
                      <p className="text-sm text-muted-foreground">
                        Отримувати сповіщення на електронну пошту
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Оновлення проєктів</Label>
                      <p className="text-sm text-muted-foreground">
                        Сповіщення про зміни статусу проєктів
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.projectUpdates}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, projectUpdates: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Нагадування про оплату</Label>
                      <p className="text-sm text-muted-foreground">
                        Сповіщення про очікувані платежі та заборгованості
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.paymentReminders}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, paymentReminders: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Низький запас товарів</Label>
                      <p className="text-sm text-muted-foreground">
                        Попередження про товари з низьким залишком на складі
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.lowStockAlerts}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, lowStockAlerts: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Нагадування про дедлайни</Label>
                      <p className="text-sm text-muted-foreground">
                        Сповіщення про наближення термінів здачі проєктів
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.deadlineReminders}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, deadlineReminders: checked })
                      }
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave('notifications')} disabled={isSaving}>
                  <Save className="mr-2 size-4" />
                  {isSaving ? "Збереження..." : "Зберегти зміни"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="size-5" />
                  Системні налаштування
                </CardTitle>
                <CardDescription>
                  Налаштування валюти, формату дати та бізнес-логіки
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Валюта</Label>
                    <Select
                      value={systemSettings.currency}
                      onValueChange={(value) => setSystemSettings({ ...systemSettings, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UAH">Гривня (грн)</SelectItem>
                        <SelectItem value="USD">Долар США ($)</SelectItem>
                        <SelectItem value="EUR">Євро (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Мова інтерфейсу</Label>
                    <Select
                      value={systemSettings.language}
                      onValueChange={(value) => setSystemSettings({ ...systemSettings, language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uk">Українська</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date-format">Формат дати</Label>
                    <Select
                      value={systemSettings.dateFormat}
                      onValueChange={(value) => setSystemSettings({ ...systemSettings, dateFormat: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD.MM.YYYY">DD.MM.YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment-terms">Термін оплати за замовчуванням (днів)</Label>
                    <Input
                      id="payment-terms"
                      type="number"
                      value={systemSettings.defaultPaymentTerms}
                      onChange={(e) =>
                        setSystemSettings({ ...systemSettings, defaultPaymentTerms: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Бізнес-налаштування</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="installer-split">Відсоток монтажникам (%)</Label>
                      <Input
                        id="installer-split"
                        type="number"
                        min={0}
                        max={100}
                        value={systemSettings.installerSplitPercent}
                        onChange={(e) =>
                          setSystemSettings({ ...systemSettings, installerSplitPercent: parseInt(e.target.value) || 0 })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Поточне налаштування: {systemSettings.installerSplitPercent}/{100 - systemSettings.installerSplitPercent} (монтажник/компанія)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="low-stock">Поріг низького запасу</Label>
                      <Input
                        id="low-stock"
                        type="number"
                        min={0}
                        value={systemSettings.lowStockThreshold}
                        onChange={(e) =>
                          setSystemSettings({ ...systemSettings, lowStockThreshold: parseInt(e.target.value) || 0 })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Попередження при залишку менше {systemSettings.lowStockThreshold} одиниць
                      </p>
                    </div>
                  </div>
                </div>

                <Button onClick={() => handleSave('system')} disabled={isSaving}>
                  <Save className="mr-2 size-4" />
                  {isSaving ? "Збереження..." : "Зберегти зміни"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Management */}
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="size-5" />
                  Управління даними
                </CardTitle>
                <CardDescription>
                  Експорт, імпорт та резервне копіювання даних
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <Database className="mb-2 size-8 text-muted-foreground" />
                      <h4 className="font-medium">Експорт даних</h4>
                      <p className="mb-4 text-sm text-muted-foreground">
                        Завантажити всі дані у форматі Excel
                      </p>
                      <Button variant="outline">Експортувати</Button>
                    </CardContent>
                  </Card>
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <Database className="mb-2 size-8 text-muted-foreground" />
                      <h4 className="font-medium">Імпорт даних</h4>
                      <p className="mb-4 text-sm text-muted-foreground">
                        Завантажити дані з Excel файлу
                      </p>
                      <Button variant="outline">Імпортувати</Button>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-expense">Небезпечна зона</h4>
                  <Card className="border-expense/50">
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <h5 className="font-medium">Очистити всі дані</h5>
                        <p className="text-sm text-muted-foreground">
                          Видалити всі проєкти, транзакції та дані складу. Цю дію неможливо скасувати.
                        </p>
                      </div>
                      <Button variant="destructive" onClick={handleClearData} disabled={isSaving}>
                        <AlertTriangle className="mr-2 size-4" />
                        Очистити базу даних
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

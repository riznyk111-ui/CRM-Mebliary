"use client"

import { AppHeader } from "@/components/app-header"
import { TeamTable, TeamMember } from "@/components/team-table"
import { addTeamMember, updateTeamMember, deleteTeamMember } from "./actions"
import { useToast } from "@/hooks/use-toast"

export function TeamPageClient({ members }: { members: TeamMember[] }) {
  const { toast } = useToast()

  const handleAddMember = async (memberData: Omit<TeamMember, "id" | "projectsCompleted" | "totalEarnings">) => {
    const result = await addTeamMember(memberData)
    if (result?.error) {
      toast({ variant: "destructive", title: "Помилка додавання", description: result.error })
    } else {
      toast({ title: "Успіх", description: "Працівника успішно додано. Дефолтний пароль: Password123!" })
    }
  }

  const handleUpdateMember = async (updatedMember: TeamMember) => {
    const result = await updateTeamMember(updatedMember)
    if (result?.error) {
      toast({ variant: "destructive", title: "Помилка оновлення", description: result.error })
    } else {
      toast({ title: "Успіх", description: "Дані працівника оновлено" })
    }
  }

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цього працівника?")) return
    const result = await deleteTeamMember(id)
    if (result?.error) {
      toast({ variant: "destructive", title: "Помилка видалення", description: result.error })
    } else {
      toast({ title: "Успіх", description: "Працівника видалено" })
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader title="Команда" />
      <main className="flex-1 p-6">
        <TeamTable
          members={members}
          onAddMember={handleAddMember}
          onUpdateMember={handleUpdateMember}
          onDeleteMember={handleDeleteMember}
        />
      </main>
    </div>
  )
}

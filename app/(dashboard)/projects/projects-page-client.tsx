"use client"

import { AppHeader } from "@/components/app-header"
import { ProjectsTable, Project } from "@/components/projects-table"
import { addProject, updateProject, deleteProject } from "./actions"
import { useToast } from "@/hooks/use-toast"

export function ProjectsPageClient({ projects }: { projects: Project[] }) {
  const { toast } = useToast()

  const handleAddProject = async (data: Omit<Project, "id" | "daysLeft">) => {
    const result = await addProject(data)
    if (result?.error) {
      toast({ variant: "destructive", title: "Помилка", description: result.error })
    } else {
      toast({ title: "Успіх", description: "Проєкт додано" })
    }
  }

  const handleUpdateProject = async (data: Project) => {
    const result = await updateProject(data)
    if (result?.error) {
      toast({ variant: "destructive", title: "Помилка", description: result.error })
    } else {
      toast({ title: "Успіх", description: "Проєкт оновлено" })
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Видалити проєкт?")) return
    const result = await deleteProject(id)
    if (result?.error) {
      toast({ variant: "destructive", title: "Помилка", description: result.error })
    } else {
      toast({ title: "Успіх", description: "Проєкт видалено" })
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader title="Проєкти" />
      <main className="flex-1 p-6">
        <ProjectsTable
          projects={projects}
          onAddProject={handleAddProject}
          onUpdateProject={handleUpdateProject}
          onDeleteProject={handleDeleteProject}
        />
      </main>
    </div>
  )
}

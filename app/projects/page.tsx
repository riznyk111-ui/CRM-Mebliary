import { AppHeader } from "@/components/app-header"
import { ProjectsTable } from "@/components/projects-table"

export default function ProjectsPage() {
  return (
    <>
      <AppHeader title="Проєкти" />
      <main className="flex-1 p-6">
        <ProjectsTable />
      </main>
    </>
  )
}

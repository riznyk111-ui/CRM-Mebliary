import { getProjects } from "./actions"
import { ProjectsPageClient } from "./projects-page-client"

export default async function ProjectsPage() {
  const projects = await getProjects()
  
  return <ProjectsPageClient projects={projects} />
}

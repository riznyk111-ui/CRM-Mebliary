import { getProjects } from "@/app/(dashboard)/projects/actions"
import { EstimatesClient } from "./estimates-client"

export default async function EstimatesPage() {
  const projects = await getProjects()
  
  return <EstimatesClient initialProjects={projects} />
}

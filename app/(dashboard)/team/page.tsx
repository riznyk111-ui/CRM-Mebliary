import { getTeamMembers } from "./actions"
import { TeamPageClient } from "./team-page-client"

export default async function TeamPage() {
  const members = await getTeamMembers()
  
  return <TeamPageClient members={members} />
}

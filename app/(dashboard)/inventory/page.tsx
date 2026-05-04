import { getInventory } from "./actions"
import { InventoryPageClient } from "./inventory-page-client"

export default async function InventoryPage() {
  const items = await getInventory()
  
  return <InventoryPageClient items={items} />
}

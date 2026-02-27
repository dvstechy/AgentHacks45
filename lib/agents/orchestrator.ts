import { prisma } from "@/lib/prisma"

import { getLowStockProducts } from "./inventory.agent"
import { forecastDemand } from "./forecast.agent"
import { calculateReorder } from "./reorder.agent"
import { selectBestSupplier } from "./supplier.agent"

export async function runAgentSystem(userId: string) {
  console.log("🚀 Agent system started")

  const lowStockProducts = await getLowStockProducts()
  console.log("Low stock products:", lowStockProducts)

  for (const productId of lowStockProducts) {
    console.log("Processing product:", productId)

    const forecast = await forecastDemand(productId)
    console.log("Forecast:", forecast)

    const reorder = await calculateReorder(productId, forecast)
    console.log("Reorder result:", reorder)

    if (!reorder) continue

    const supplier = await selectBestSupplier()
    console.log("Selected supplier:", supplier?.contactId)

    await prisma.stockTransfer.create({
      data: {
        reference: `AUTO-${Date.now()}`,
        type: "INCOMING",
        status: "DRAFT",
        contactId: supplier?.contactId,
        userId,
        stockMoves: {
          create: {
            productId,
            quantity: reorder.quantity,
            userId
          }
        }
      }
    })

    console.log("✅ Auto StockTransfer created")
  }

  console.log("🏁 Agent system finished")
}
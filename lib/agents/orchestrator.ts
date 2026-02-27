import { prisma } from "@/lib/prisma"
import { forecastDemand } from "./forecast.agent"
import { calculateReorder } from "./reorder.agent"
import { selectBestSupplier } from "./supplier.agent"

export async function runAgentSystem(userId: string) {
  console.log("🚀 Agent system started")

  const products = await prisma.product.findMany({
    where: { userId }
  })

  for (const product of products) {
    console.log("Processing product:", product.id)

    const forecast = await forecastDemand(product.id)
    console.log("Forecast:", forecast)

    const reorder = await calculateReorder(product.id, forecast)
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
            productId: product.id,
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
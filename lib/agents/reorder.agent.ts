import { prisma } from "@/lib/prisma"

export async function calculateReorder(productId: string, forecast: number) {
  // Get stock and product
  const stock = await prisma.stockLevel.findFirst({
    where: { productId },
    include: { product: true }
  })

  if (!stock) return null

  // Get last 60 days demand
  const demandHistory = await prisma.demandHistory.findMany({
    where: { productId },
    orderBy: { date: "desc" },
    take: 60
  })

  if (demandHistory.length === 0) return null

  // ===============================
  // STATISTICAL CALCULATIONS
  // ===============================

  const demands = demandHistory.map(d => d.quantity)

  // Mean demand
  const mean =
    demands.reduce((sum, val) => sum + val, 0) / demands.length

  // Standard deviation
  const variance =
    demands.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    demands.length

  const stdDev = Math.sqrt(variance)

  // Assumptions (can later make dynamic)
  const leadTime = 5 // days
  const Z = 1.65 // 95% service level

  // Safety Stock Formula
  const safetyStock = Z * stdDev * Math.sqrt(leadTime)

  // Reorder Point
  const reorderPoint = mean * leadTime + safetyStock

  if (stock.quantity < reorderPoint) {
    return {
      productId,
      quantity: Math.ceil(reorderPoint - stock.quantity),
      reorderPoint: Math.ceil(reorderPoint),
      safetyStock: Math.ceil(safetyStock),
    }
  }

  return null
}
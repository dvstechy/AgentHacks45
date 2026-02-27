import { prisma } from "@/lib/prisma"

export async function calculateReorder(
  productId: string,
  forecast: {
    mean: number
    stdDev: number
    trendFactor: number
  }
){
  const stock = await prisma.stockLevel.findFirst({
    where: { productId },
    include: { product: true }
  })

  if (!stock) return null

  const { mean, stdDev, trendFactor } = forecast

// 🔥 Apply seasonal trend adjustment
const adjustedMean = mean * trendFactor

  if (mean === 0) return null

  // Dynamic lead time (use default)
  const leadTime = 5

  // Service level can be dynamic later
  const serviceLevel = 0.95

  // Convert service level to Z value
  const Z = serviceLevel === 0.95 ? 1.65 :
            serviceLevel === 0.99 ? 2.33 :
            1.28 // default 90%

  // ✅ Proper Safety Stock Formula
  const safetyStock = Z * stdDev * Math.sqrt(leadTime)

  const reorderPoint = adjustedMean * leadTime + safetyStock

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
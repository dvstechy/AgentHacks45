import { prisma } from "@/lib/prisma"

export async function forecastDemand(productId: string) {
  const history = await prisma.demandHistory.findMany({
    where: { productId },
    orderBy: { date: "asc" }, // ascending for trend
    take: 60
  })

  if (history.length === 0) {
    return {
      mean: 0,
      stdDev: 0,
      trendFactor: 1
    }
  }

  const demands = history.map(h => h.quantity)

  // -------------------------
  // Basic Mean & StdDev
  // -------------------------
  const mean =
    demands.reduce((sum, val) => sum + val, 0) / demands.length

  const variance =
    demands.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    demands.length

  const stdDev = Math.sqrt(variance)

  // -------------------------
  // 7-day moving average
  // -------------------------
  const last7 = demands.slice(-7)
  const avg7 =
    last7.reduce((sum, val) => sum + val, 0) / last7.length

  // 30-day moving average
  const last30 = demands.slice(-30)
  const avg30 =
    last30.reduce((sum, val) => sum + val, 0) / last30.length

  // -------------------------
  // Trend detection
  // -------------------------
  const trendFactor = avg30 > 0 ? avg7 / avg30 : 1

  return {
    mean,
    stdDev,
    trendFactor
  }
}
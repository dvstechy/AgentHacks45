import { prisma } from "@/lib/prisma"

export async function forecastDemand(productId: string) {
  const history = await prisma.demandHistory.findMany({
    where: { productId },
    orderBy: { date: "desc" },
    take: 30
  })

  if (!history.length) return 10

  const total = history.reduce((sum, h) => sum + h.quantity, 0)
  return total / history.length
}
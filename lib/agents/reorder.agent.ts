import { prisma } from "@/lib/prisma"

export async function calculateReorder(productId: string, forecast: number) {
  const stock = await prisma.stockLevel.findFirst({
    where: { productId },
    include: { product: true }
  })

  if (!stock) return null

  const leadTime = 5
  const safetyStock = stock.product.minStock

  const reorderPoint = forecast * leadTime + safetyStock

  if (stock.quantity < reorderPoint) {
    return {
      productId,
      quantity: Math.ceil(reorderPoint - stock.quantity)
    }
  }

  return null
}
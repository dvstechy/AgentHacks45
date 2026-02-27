import { prisma } from "@/lib/prisma"

export async function getLowStockProducts() {
  const stockLevels = await prisma.stockLevel.findMany({
    include: {
      product: true
    }
  })

  const lowStock: string[] = []

  for (const stock of stockLevels) {
    if (stock.quantity < stock.product.minStock) {
      lowStock.push(stock.productId)
    }
  }

  return lowStock
}
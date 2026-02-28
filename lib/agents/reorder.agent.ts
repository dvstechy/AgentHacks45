/**
 * Reorder Agent — ML.js Decision Tree optimizer for reorder quantity
 *
 * Uses ml-cart Decision Tree regression when training data is available,
 * falls back to classical safety-stock formula otherwise.
 */

import { prisma } from "@/lib/prisma"
import { optimizeReorder, type ReorderOptimizationResult } from "@/lib/ml/ml-engine"

export interface ReorderOutput {
  productId: string
  quantity: number
  reorderPoint: number
  safetyStock: number
  mlResult: ReorderOptimizationResult
}

export async function calculateReorder(
  productId: string,
  forecast: {
    mean: number
    stdDev: number
    trendFactor: number
  }
): Promise<ReorderOutput | null> {
  const stock = await prisma.stockLevel.findFirst({
    where: { productId },
    include: { product: true }
  })

  if (!stock) return null

  const { mean, stdDev, trendFactor } = forecast

  if (mean === 0) return null

  // Dynamic lead time (use default)
  const leadTime = 5

  // ─────────────────────────────
  // ML.js Decision Tree Optimization
  // ─────────────────────────────
  const mlResult = optimizeReorder(
    stock.quantity,
    mean,
    stdDev,
    leadTime,
    trendFactor,
    productId
    // trainingData would come from historical reorder records
    // when available — for now uses the built-in fallback formula
  )

  if (stock.quantity < mlResult.reorderPoint) {
    return {
      productId,
      quantity: mlResult.optimalQuantity,
      reorderPoint: mlResult.reorderPoint,
      safetyStock: mlResult.safetyStock,
      mlResult,
    }
  }

  return null
}
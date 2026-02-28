/**
 * Forecast Agent — ML.js powered demand forecasting + anomaly detection
 *
 * Uses polynomial regression (auto-selects degree 1→3 by R²) for
 * demand prediction and K-Means clustering for anomaly detection.
 * Falls back to simple mean/stdDev when data is insufficient.
 */

import { prisma } from "@/lib/prisma"
import {
  trainDemandForecast,
  detectAnomalies,
  demandToFeatures,
  type DemandForecastResult,
  type AnomalyDetectionResult,
} from "@/lib/ml/ml-engine"

export interface ForecastOutput {
  mean: number
  stdDev: number
  trendFactor: number
  // ML.js enhanced fields
  mlForecast: DemandForecastResult | null
  anomaly: AnomalyDetectionResult | null
  modelUsed: "ml_regression" | "simple_average"
}

export async function forecastDemand(productId: string): Promise<ForecastOutput> {
  const history = await prisma.demandHistory.findMany({
    where: { productId },
    orderBy: { date: "asc" },
    take: 90, // increased from 60 → 90 for better ML training
  })

  if (history.length === 0) {
    return {
      mean: 0,
      stdDev: 0,
      trendFactor: 1,
      mlForecast: null,
      anomaly: null,
      modelUsed: "simple_average",
    }
  }

  const demands = history.map(h => h.quantity)

  // ─────────────────────────────
  // Basic Mean & StdDev (always compute for backwards compat)
  // ─────────────────────────────
  const mean = demands.reduce((sum, val) => sum + val, 0) / demands.length

  const variance =
    demands.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    demands.length

  const stdDev = Math.sqrt(variance)

  // ─────────────────────────────
  // Moving averages for trend
  // ─────────────────────────────
  const last7 = demands.slice(-7)
  const avg7 = last7.reduce((sum, val) => sum + val, 0) / last7.length

  const last30 = demands.slice(-30)
  const avg30 = last30.reduce((sum, val) => sum + val, 0) / last30.length

  const trendFactor = avg30 > 0 ? avg7 / avg30 : 1

  // ─────────────────────────────
  // ML.js Polynomial Regression
  // ─────────────────────────────
  let mlForecast: DemandForecastResult | null = null
  let anomaly: AnomalyDetectionResult | null = null
  let modelUsed: "ml_regression" | "simple_average" = "simple_average"

  try {
    mlForecast = trainDemandForecast(demands, productId)
    modelUsed = mlForecast.confidence > 0.3 ? "ml_regression" : "simple_average"
  } catch (err) {
    console.warn(`ML forecast failed for product ${productId}, using fallback:`, err)
  }

  // ─────────────────────────────
  // ML.js Anomaly Detection (K-Means)
  // ─────────────────────────────
  try {
    if (demands.length >= 7) {
      const features = demandToFeatures(demands)
      anomaly = detectAnomalies(features, features.length - 1)
    }
  } catch (err) {
    console.warn(`Anomaly detection failed for product ${productId}:`, err)
  }

  return {
    mean,
    stdDev,
    trendFactor,
    mlForecast,
    anomaly,
    modelUsed,
  }
}
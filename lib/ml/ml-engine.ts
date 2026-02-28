/**
 * ML.js Engine — Unified ML capabilities for SprintStock AI
 *
 * Four capabilities:
 *  1. Demand Forecasting  (Polynomial Regression)
 *  2. Anomaly Detection   (K-Means Clustering)
 *  3. Supplier Scoring    (Random Forest Classifier)
 *  4. Reorder Optimization (Decision Tree Regressor)
 */

import { PolynomialRegression } from "ml-regression-polynomial";
import { RandomForestClassifier as RFClassifier } from "ml-random-forest";
// @ts-expect-error - ml-cart has no type declarations
import { DecisionTreeRegression } from "ml-cart";
import { kmeans } from "ml-kmeans";
import { PCA } from "ml-pca";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface DemandForecastResult {
    predictedDemand: number;
    trend: "rising" | "stable" | "declining";
    confidence: number;
    modelDegree: number;
    r2Score: number;
    nextPeriodEstimates: number[]; // next 7 days
}

export interface AnomalyDetectionResult {
    isAnomaly: boolean;
    anomalyScore: number; // 0..1  (1 = very anomalous)
    clusterAssignment: number;
    dominantClusterSize: number;
    explanation: string;
}

export interface SupplierScoreResult {
    supplierId: string;
    score: number; // 0..1
    rank: number;
    confidence: number;
    factors: {
        reliability: number;
        leadTimeScore: number;
        priceScore: number;
    };
}

export interface ReorderOptimizationResult {
    optimalQuantity: number;
    reorderPoint: number;
    safetyStock: number;
    confidence: number;
    modelUsed: "decision_tree" | "fallback_formula";
}

// ─────────────────────────────────────────────────────────────────
// Model Cache (in-memory, per product)
// ─────────────────────────────────────────────────────────────────

interface CachedModel<T> {
    model: T;
    trainedAt: number;
    dataSize: number;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const demandModelCache = new Map<string, CachedModel<any>>();
const reorderModelCache = new Map<string, CachedModel<any>>();
const supplierModelCache: { model: any; trainedAt: number } = {
    model: null,
    trainedAt: 0,
};
/* eslint-enable @typescript-eslint/no-explicit-any */

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function isCacheValid(trainedAt: number): boolean {
    return Date.now() - trainedAt < CACHE_TTL_MS;
}

// ─────────────────────────────────────────────────────────────────
// 1. Demand Forecasting (Polynomial Regression)
// ─────────────────────────────────────────────────────────────────

/**
 * Trains a polynomial regression (degree 1–3) on historical demand
 * and picks the best by R² score. Returns 7-day forward predictions.
 */
export function trainDemandForecast(
    demandHistory: number[],
    productId: string
): DemandForecastResult {
    if (demandHistory.length < 3) {
        // Not enough data — fallback to simple average
        const avg = demandHistory.length
            ? demandHistory.reduce((a, b) => a + b, 0) / demandHistory.length
            : 0;
        return {
            predictedDemand: Math.round(avg),
            trend: "stable",
            confidence: 0.3,
            modelDegree: 0,
            r2Score: 0,
            nextPeriodEstimates: Array(7).fill(Math.round(avg)),
        };
    }

    const x = demandHistory.map((_, i) => i);
    const y = demandHistory;

    // Try degrees 1, 2, 3 and pick highest R²
    let bestModel: any = null;
    let bestR2 = -Infinity;
    let bestDegree = 1;

    for (const degree of [1, 2, 3]) {
        if (demandHistory.length <= degree + 1) continue;
        try {
            const model = new PolynomialRegression(x, y, degree);
            const r2 = computeR2(model, x, y);
            if (r2 > bestR2) {
                bestR2 = r2;
                bestModel = model;
                bestDegree = degree;
            }
        } catch {
            // degree too high for data size — skip
        }
    }

    if (!bestModel) {
        const avg = y.reduce((a, b) => a + b, 0) / y.length;
        return {
            predictedDemand: Math.round(avg),
            trend: "stable",
            confidence: 0.3,
            modelDegree: 0,
            r2Score: 0,
            nextPeriodEstimates: Array(7).fill(Math.round(avg)),
        };
    }

    // Cache model
    demandModelCache.set(productId, {
        model: bestModel,
        trainedAt: Date.now(),
        dataSize: demandHistory.length,
    });

    // Predict next 7 days
    const n = demandHistory.length;
    const nextPeriodEstimates = Array.from({ length: 7 }, (_, i) =>
        Math.max(0, Math.round(bestModel.predict(n + i)))
    );

    const predictedDemand = nextPeriodEstimates.reduce((a, b) => a + b, 0);

    // Determine trend from slope
    const last = bestModel.predict(n);
    const first = bestModel.predict(0);
    const slope = (last - first) / n;
    const trend: "rising" | "stable" | "declining" =
        slope > 0.5 ? "rising" : slope < -0.5 ? "declining" : "stable";

    const confidence = Math.max(0, Math.min(1, bestR2));

    return {
        predictedDemand,
        trend,
        confidence: Number(confidence.toFixed(3)),
        modelDegree: bestDegree,
        r2Score: Number(bestR2.toFixed(4)),
        nextPeriodEstimates,
    };
}

/**
 * Use cached model if available, otherwise train fresh.
 */
export function predictDemand(
    demandHistory: number[],
    productId: string
): DemandForecastResult {
    const cached = demandModelCache.get(productId);
    if (cached && isCacheValid(cached.trainedAt)) {
        const n = cached.dataSize;
        const nextPeriodEstimates = Array.from({ length: 7 }, (_, i) =>
            Math.max(0, Math.round(cached.model.predict(n + i)))
        );
        const predictedDemand = nextPeriodEstimates.reduce((a, b) => a + b, 0);
        const last = cached.model.predict(n);
        const first = cached.model.predict(0);
        const slope = (last - first) / n;
        const trend: "rising" | "stable" | "declining" =
            slope > 0.5 ? "rising" : slope < -0.5 ? "declining" : "stable";

        return {
            predictedDemand,
            trend,
            confidence: 0.8,
            modelDegree: 1,
            r2Score: 0.8,
            nextPeriodEstimates,
        };
    }
    return trainDemandForecast(demandHistory, productId);
}

// ─────────────────────────────────────────────────────────────────
// 2. Anomaly Detection (K-Means + PCA)
// ─────────────────────────────────────────────────────────────────

/**
 * Detects if the latest demand point is an anomaly by clustering
 * demand history and checking if the latest point belongs to a
 * small/isolated cluster.
 */
export function detectAnomalies(
    features: number[][],  // rows = data points, cols = features
    latestIndex: number
): AnomalyDetectionResult {
    if (features.length < 5) {
        return {
            isAnomaly: false,
            anomalyScore: 0,
            clusterAssignment: 0,
            dominantClusterSize: features.length,
            explanation: "Insufficient data for anomaly detection (need ≥5 points)",
        };
    }

    const k = Math.min(3, Math.floor(features.length / 2));

    // Run PCA to reduce to 2D for clustering
    let clusterInput = features;
    if (features[0].length > 2) {
        try {
            const pca = new PCA(features);
            const projected = pca.predict(features, { nComponents: 2 });
            clusterInput = projected.to2DArray();
        } catch {
            // PCA failed — use raw features (take first 2 dims)
            clusterInput = features.map((r: number[]) => r.slice(0, 2));
        }
    }

    const result = kmeans(clusterInput, k, { initialization: "kmeans++" });
    const clusters: number[] = result.clusters;
    const latestCluster = clusters[latestIndex];

    // Count cluster sizes
    const clusterSizes: Record<number, number> = {};
    for (const c of clusters) {
        clusterSizes[c] = (clusterSizes[c] || 0) + 1;
    }

    const latestClusterSize = clusterSizes[latestCluster] || 1;
    const maxClusterSize = Math.max(...Object.values(clusterSizes));

    // Anomaly score: small cluster relative to largest
    const anomalyScore = 1 - latestClusterSize / maxClusterSize;
    const isAnomaly = anomalyScore > 0.6;

    const explanation = isAnomaly
        ? `Latest data point is in cluster ${latestCluster} (size ${latestClusterSize}) vs dominant cluster (size ${maxClusterSize}). Demand pattern is unusual.`
        : `Latest data point is in cluster ${latestCluster} (size ${latestClusterSize}). Demand pattern is normal.`;

    return {
        isAnomaly,
        anomalyScore: Number(anomalyScore.toFixed(3)),
        clusterAssignment: latestCluster,
        dominantClusterSize: maxClusterSize,
        explanation,
    };
}

// ─────────────────────────────────────────────────────────────────
// 3. Supplier Scoring (Random Forest Classifier)
// ─────────────────────────────────────────────────────────────────

export interface SupplierFeatures {
    supplierId: string;
    reliabilityScore: number; // 0..1
    avgLeadDays: number;
    leadTimeVariance: number;
    priceCompetitiveness: number; // 0..1  (1 = cheapest)
    onTimeDeliveryRate: number; // 0..1
}

/**
 * Scores and ranks suppliers using a Random Forest classifier.
 * If insufficient training data, falls back to weighted scoring.
 */
export function scoreSuppliers(
    suppliers: SupplierFeatures[],
    trainingData?: { features: number[][]; labels: number[] }
): SupplierScoreResult[] {
    if (suppliers.length === 0) return [];

    // Try Random Forest if we have training data
    if (
        trainingData &&
        trainingData.features.length >= 10 &&
        trainingData.labels.length >= 10
    ) {
        try {
            if (
                !supplierModelCache.model ||
                !isCacheValid(supplierModelCache.trainedAt)
            ) {
                const classifier = new RFClassifier({
                    nEstimators: 50,
                    maxFeatures: 0.8,
                    seed: 42,
                });
                classifier.train(trainingData.features, trainingData.labels);
                supplierModelCache.model = classifier;
                supplierModelCache.trainedAt = Date.now();
            }

            // Predict scores for each supplier
            const featureMatrix = suppliers.map((s) => [
                s.reliabilityScore,
                1 / (s.avgLeadDays + 1), // inverse: lower lead = better
                1 / (s.leadTimeVariance + 1),
                s.priceCompetitiveness,
                s.onTimeDeliveryRate,
            ]);

            const predictions: number[] = supplierModelCache.model.predict(featureMatrix);
            const results: SupplierScoreResult[] = suppliers.map((s, i) => ({
                supplierId: s.supplierId,
                score: Number(Math.min(1, predictions[i] / 100).toFixed(3)),
                rank: 0,
                confidence: 0.85,
                factors: {
                    reliability: s.reliabilityScore,
                    leadTimeScore: Number((1 / (s.avgLeadDays + 1)).toFixed(3)),
                    priceScore: s.priceCompetitiveness,
                },
            }));

            // Assign ranks
            results.sort((a, b) => b.score - a.score);
            results.forEach((r, i) => (r.rank = i + 1));
            return results;
        } catch (err) {
            console.warn("Random Forest scoring failed, using fallback:", err);
        }
    }

    // Fallback: weighted formula scoring
    return fallbackSupplierScoring(suppliers);
}

function fallbackSupplierScoring(
    suppliers: SupplierFeatures[]
): SupplierScoreResult[] {
    const results: SupplierScoreResult[] = suppliers.map((s) => {
        const score =
            s.reliabilityScore * 0.3 +
            (1 / (s.avgLeadDays + 1)) * 0.25 +
            s.priceCompetitiveness * 0.2 +
            s.onTimeDeliveryRate * 0.25;

        return {
            supplierId: s.supplierId,
            score: Number(score.toFixed(3)),
            rank: 0,
            confidence: 0.6,
            factors: {
                reliability: s.reliabilityScore,
                leadTimeScore: Number((1 / (s.avgLeadDays + 1)).toFixed(3)),
                priceScore: s.priceCompetitiveness,
            },
        };
    });

    results.sort((a, b) => b.score - a.score);
    results.forEach((r, i) => (r.rank = i + 1));
    return results;
}

// ─────────────────────────────────────────────────────────────────
// 4. Reorder Optimization (Decision Tree Regressor)
// ─────────────────────────────────────────────────────────────────

export interface ReorderTrainingRow {
    avgDemand: number;
    demandStdDev: number;
    currentStock: number;
    leadTimeDays: number;
    seasonalityFactor: number;
    optimalReorderQty: number; // target
}

/**
 * Predicts optimal reorder quantity using a Decision Tree trained
 * on historical reorder outcomes. Falls back to safety-stock formula.
 */
export function optimizeReorder(
    currentStock: number,
    avgDemand: number,
    demandStdDev: number,
    leadTimeDays: number,
    seasonalityFactor: number,
    productId: string,
    trainingData?: ReorderTrainingRow[]
): ReorderOptimizationResult {
    // Try Decision Tree if we have training data
    if (trainingData && trainingData.length >= 10) {
        try {
            const cached = reorderModelCache.get(productId);
            let model: any;

            if (cached && isCacheValid(cached.trainedAt)) {
                model = cached.model;
            } else {
                const features = trainingData.map((r) => [
                    r.avgDemand,
                    r.demandStdDev,
                    r.currentStock,
                    r.leadTimeDays,
                    r.seasonalityFactor,
                ]);
                const targets = trainingData.map((r) => r.optimalReorderQty);

                model = new DecisionTreeRegression({
                    maxDepth: 6,
                    minNumSamples: 3,
                });
                model.train(features, targets);
                reorderModelCache.set(productId, {
                    model,
                    trainedAt: Date.now(),
                    dataSize: trainingData.length,
                });
            }

            const prediction: number[] = model.predict([
                [avgDemand, demandStdDev, currentStock, leadTimeDays, seasonalityFactor],
            ]);
            const optimalQty = Math.max(1, Math.round(prediction[0]));

            // Compute reorder point and safety stock from the DT prediction
            const Z = 1.65; // 95% service level
            const safetyStock = Math.ceil(
                Z * demandStdDev * Math.sqrt(leadTimeDays)
            );
            const reorderPoint = Math.ceil(
                avgDemand * leadTimeDays * seasonalityFactor + safetyStock
            );

            return {
                optimalQuantity: optimalQty,
                reorderPoint,
                safetyStock,
                confidence: 0.82,
                modelUsed: "decision_tree",
            };
        } catch (err) {
            console.warn("Decision Tree reorder failed, using fallback:", err);
        }
    }

    // Fallback: classical safety-stock formula
    const Z = 1.65;
    const adjustedMean = avgDemand * seasonalityFactor;
    const safetyStock = Math.ceil(Z * demandStdDev * Math.sqrt(leadTimeDays));
    const reorderPoint = Math.ceil(adjustedMean * leadTimeDays + safetyStock);
    const optimalQuantity = Math.max(1, reorderPoint - currentStock);

    return {
        optimalQuantity,
        reorderPoint,
        safetyStock,
        confidence: 0.55,
        modelUsed: "fallback_formula",
    };
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function computeR2(
    model: any,
    x: number[],
    y: number[]
): number {
    const yMean = y.reduce((a, b) => a + b, 0) / y.length;
    let ssRes = 0;
    let ssTot = 0;
    for (let i = 0; i < x.length; i++) {
        const pred = model.predict(x[i]);
        ssRes += (y[i] - pred) ** 2;
        ssTot += (y[i] - yMean) ** 2;
    }
    if (ssTot === 0) return 0;
    return 1 - ssRes / ssTot;
}

/**
 * Utility: Convert demand history into feature vectors for anomaly detection.
 * Each row = [demand, rolling_avg_7, rolling_avg_30, day_of_week_sin, day_of_week_cos]
 */
export function demandToFeatures(demands: number[]): number[][] {
    const features: number[][] = [];
    for (let i = 0; i < demands.length; i++) {
        const window7 = demands.slice(Math.max(0, i - 6), i + 1);
        const window30 = demands.slice(Math.max(0, i - 29), i + 1);
        const avg7 = window7.reduce((a, b) => a + b, 0) / window7.length;
        const avg30 = window30.reduce((a, b) => a + b, 0) / window30.length;
        const dayOfWeek = i % 7;
        features.push([
            demands[i],
            avg7,
            avg30,
            Math.sin((2 * Math.PI * dayOfWeek) / 7),
            Math.cos((2 * Math.PI * dayOfWeek) / 7),
        ]);
    }
    return features;
}

/**
 * Get all cached model info for debugging/audit.
 */
export function getModelCacheStatus(): Record<string, unknown> {
    const demandModels: Record<string, unknown> = {};
    demandModelCache.forEach((v, k) => {
        demandModels[k] = {
            trainedAt: new Date(v.trainedAt).toISOString(),
            dataSize: v.dataSize,
            isFresh: isCacheValid(v.trainedAt),
        };
    });

    const reorderModels: Record<string, unknown> = {};
    reorderModelCache.forEach((v, k) => {
        reorderModels[k] = {
            trainedAt: new Date(v.trainedAt).toISOString(),
            dataSize: v.dataSize,
            isFresh: isCacheValid(v.trainedAt),
        };
    });

    return {
        demandModels,
        reorderModels,
        supplierModel: supplierModelCache.model
            ? {
                trainedAt: new Date(supplierModelCache.trainedAt).toISOString(),
                isFresh: isCacheValid(supplierModelCache.trainedAt),
            }
            : null,
    };
}

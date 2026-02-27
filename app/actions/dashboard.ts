'use server'

import { prisma } from '@/lib/prisma'
import { TransferType, TransferStatus } from '@prisma/client'
import { getSession } from '@/lib/session'

export type OperationStats = {
    toProcess: number
    late: number
    waiting: number
    total: number
    completed: number
    pending: number
    issues: number
}

export type DashboardStats = {
    receipts: OperationStats
    deliveries: OperationStats
    internal: OperationStats
    lowStockCount: number
    totalProducts: number
    totalValue: number
    warehouseCount: number
    categoryCount: number
}

export type ReorderRecommendation = {
    productId: string
    productName: string
    sku: string
    currentStock: number
    dailyDemand: number
    reorderPoint: number
    suggestedOrderQty: number
    coverageDays: number | null
    priority: 'HIGH' | 'MEDIUM'
}

async function getOperationStats(type: TransferType, userId: string): Promise<OperationStats> {
    const now = new Date()

    const [toProcess, late, waiting, total, completed, pending, issues] = await prisma.$transaction([
        // To Process: Not done, not canceled
        prisma.stockTransfer.count({
            where: {
                type,
                status: {
                    in: [TransferStatus.DRAFT, TransferStatus.WAITING, TransferStatus.READY]
                },
                userId
            }
        }),
        // Late: Scheduled date is past, and not done/canceled
        prisma.stockTransfer.count({
            where: {
                type,
                status: {
                    in: [TransferStatus.DRAFT, TransferStatus.WAITING, TransferStatus.READY]
                },
                scheduledDate: {
                    lt: now
                },
                userId
            }
        }),
        // Waiting: Specifically waiting status
        prisma.stockTransfer.count({
            where: {
                type,
                status: TransferStatus.WAITING,
                userId
            }
        }),
        // Total: All operations of this type
        prisma.stockTransfer.count({
            where: { type, userId }
        }),
        // Completed: Done status
        prisma.stockTransfer.count({
            where: { type, status: TransferStatus.DONE, userId }
        }),
        // Pending: Not done/canceled
        prisma.stockTransfer.count({
            where: {
                type,
                status: {
                    in: [TransferStatus.DRAFT, TransferStatus.WAITING, TransferStatus.READY]
                },
                userId
            }
        }),
        // Issues: For now, let's say Late = Issues for stats
        prisma.stockTransfer.count({
            where: {
                type,
                status: {
                    in: [TransferStatus.DRAFT, TransferStatus.WAITING, TransferStatus.READY]
                },
                scheduledDate: {
                    lt: now
                },
                userId
            }
        })
    ])

    return { toProcess, late, waiting, total, completed, pending, issues }
}

export async function getDashboardStats() {
    const session = await getSession();
    if (!session?.userId) return { success: false, error: "Unauthorized" };
    const userId = session.userId as string;

    try {
        const [receipts, deliveries, internal] = await Promise.all([
            getOperationStats(TransferType.INCOMING, userId),
            getOperationStats(TransferType.OUTGOING, userId),
            getOperationStats(TransferType.INTERNAL, userId)
        ])

        let lowStockCount = 0
        let totalValue = 0

        // Calculate total value while we're at it (approximate)
        // We need to fetch ALL products for total value, not just those with minStock
        // Let's do a separate aggregation for total value if possible, or just fetch all.
        // Let's just fetch all products for now to be safe and simple.
        const allProducts = await prisma.product.findMany({
            where: { userId },
            include: {
                stockLevels: {
                    where: { userId }
                }
            }
        })

        allProducts.forEach(product => {
            const totalStock = product.stockLevels.reduce((sum, level) => sum + level.quantity, 0)

            // Value
            totalValue += totalStock * Number(product.costPrice)

            // Low Stock Check
            if (product.minStock > 0 && totalStock <= product.minStock) {
                lowStockCount++
            }
        })

        return {
            success: true,
            data: {
                receipts,
                deliveries,
                internal,
                lowStockCount,
                totalProducts: allProducts.length,
                totalValue,
                warehouseCount: await prisma.warehouse.count({ where: { userId } }),
                categoryCount: await prisma.category.count({ where: { userId } })
            }
        }
    } catch (error) {
        console.error('Dashboard stats error:', error)
        return { success: false, error: 'Failed to fetch dashboard stats' }
    }
}

export async function getReorderRecommendations() {
    const session = await getSession();
    if (!session?.userId) return { success: false, error: "Unauthorized" };
    const userId = session.userId as string;

    // Tunable defaults for v1 optimization
    const lookbackDays = 30
    const leadTimeDays = 7
    const extraCoverageDays = 7
    const since = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000)

    try {
        const [products, outgoingTransfers] = await Promise.all([
            prisma.product.findMany({
                where: {
                    userId,
                    type: 'STORABLE'
                },
                include: {
                    stockLevels: {
                        where: { userId }
                    }
                }
            }),
            prisma.stockTransfer.findMany({
                where: {
                    userId,
                    type: TransferType.OUTGOING,
                    status: TransferStatus.DONE,
                    OR: [
                        { effectiveDate: { gte: since } },
                        {
                            AND: [
                                { effectiveDate: null },
                                { createdAt: { gte: since } }
                            ]
                        }
                    ]
                },
                select: {
                    stockMoves: {
                        select: {
                            productId: true,
                            quantity: true
                        }
                    }
                }
            })
        ])

        const demandByProduct = new Map<string, number>()
        for (const transfer of outgoingTransfers) {
            for (const move of transfer.stockMoves) {
                const prev = demandByProduct.get(move.productId) ?? 0
                demandByProduct.set(move.productId, prev + move.quantity)
            }
        }

        const recommendations: ReorderRecommendation[] = []

        for (const product of products) {
            const currentStock = product.stockLevels.reduce((sum, level) => sum + level.quantity, 0)
            const outgoingQty = demandByProduct.get(product.id) ?? 0
            const dailyDemand = outgoingQty / lookbackDays

            // Skip dead-moving SKUs in v1 to reduce noise
            if (dailyDemand <= 0) continue

            const safetyStock = Math.max(product.minStock, Math.ceil(dailyDemand * 3))
            const reorderPoint = Math.ceil(dailyDemand * leadTimeDays + safetyStock)
            const preferredTarget = Math.ceil(dailyDemand * (leadTimeDays + extraCoverageDays))
            const targetStock = Math.max(
                product.maxStock ?? 0,
                product.minStock,
                reorderPoint,
                preferredTarget
            )

            if (currentStock > reorderPoint) continue

            const suggestedOrderQty = Math.max(targetStock - currentStock, 1)
            const coverageDays = dailyDemand > 0 ? Number((currentStock / dailyDemand).toFixed(1)) : null
            const priority: ReorderRecommendation['priority'] = currentStock <= safetyStock ? 'HIGH' : 'MEDIUM'

            recommendations.push({
                productId: product.id,
                productName: product.name,
                sku: product.sku,
                currentStock,
                dailyDemand: Number(dailyDemand.toFixed(2)),
                reorderPoint,
                suggestedOrderQty,
                coverageDays,
                priority
            })
        }

        recommendations.sort((a, b) => {
            if (a.priority !== b.priority) return a.priority === 'HIGH' ? -1 : 1
            return a.coverageDays === null
                ? 1
                : b.coverageDays === null
                    ? -1
                    : a.coverageDays - b.coverageDays
        })

        return {
            success: true,
            data: recommendations.slice(0, 8)
        }
    } catch (error) {
        console.error('Reorder recommendations error:', error)
        return { success: false, error: 'Failed to generate reorder recommendations' }
    }
}

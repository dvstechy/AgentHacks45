'use server'

import { prisma } from '@/lib/prisma'
import { TransferType, TransferStatus } from '@prisma/client'
import { getSession } from '@/lib/session'

export type OperationStats = {
    toProcess: number
    late: number
    waiting: number
}

export type DashboardStats = {
    receipts: OperationStats
    deliveries: OperationStats
    internal: OperationStats
    lowStockCount: number
    totalProducts: number
    totalValue: number
}

async function getOperationStats(type: TransferType, userId: string): Promise<OperationStats> {
    const now = new Date()

    const [toProcess, late, waiting] = await prisma.$transaction([
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
        })
    ])

    return { toProcess, late, waiting }
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

        // Low Stock: Products where any stock level is <= product.minStock
        // Since we can't easily compare fields in Prisma `where`, we'll fetch products with stock levels
        // and filter in memory. For a large DB this is bad, but for this scale it's fine.
        // Optimization: Only fetch products that have minStock > 0
        const productsWithStock = await prisma.product.findMany({
            where: {
                minStock: { gt: 0 },
                userId
            },
            include: {
                stockLevels: {
                    where: { userId }
                }
            }
        })

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
                totalValue
            }
        }
    } catch (error) {
        console.error('Dashboard stats error:', error)
        return { success: false, error: 'Failed to fetch dashboard stats' }
    }
}


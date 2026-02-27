'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { getSession } from '@/lib/session'

// --- Products ---

const productSchema = z.object({
    name: z.string().min(2, "Name is required"),
    sku: z.string().min(2, "SKU is required"),
    description: z.string().optional(),
    type: z.enum(['STORABLE', 'CONSUMABLE', 'SERVICE']),
    unitOfMeasure: z.string().default("Units"),
    costPrice: z.coerce.number().min(0),
    salesPrice: z.coerce.number().min(0),
    categoryId: z.string().optional().nullable(),
    minStock: z.coerce.number().min(0).default(0),
    maxStock: z.coerce.number().min(0).optional(),
})

export async function getProducts() {
    const session = await getSession();
    if (!session?.userId) return { success: false, error: "Unauthorized" };

    try {
        const products = await prisma.product.findMany({
            where: {
                userId: session.userId as string,
            },
            include: {
                category: true,
                stockLevels: {
                    include: {
                        location: true
                    }
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        const serializedProducts = products.map((product) => ({
            ...product,
            costPrice: product.costPrice.toNumber(),
            salesPrice: product.salesPrice.toNumber(),
        }))

        return { success: true, data: serializedProducts }
    } catch (error) {
        return { success: false, error: 'Failed to fetch products' }
    }
}

export async function createProduct(data: z.infer<typeof productSchema>) {
    const session = await getSession();
    if (!session?.userId) return { success: false, error: "Unauthorized" };

    if (data.categoryId === 'none' || data.categoryId === '') data.categoryId = null;

    const validated = productSchema.safeParse(data)
    if (!validated.success) {
        return { success: false, error: validated.error.flatten().fieldErrors }
    }

    try {
        await prisma.product.create({
            data: {
                ...validated.data,
                userId: session.userId as string,
            },
        })
        revalidatePath('/dashboard/inventory')
        return { success: true }
    } catch (error) {
        console.error(error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { success: false, error: `Product with this ${error.meta?.target} already exists` }
            }
        }
        return { success: false, error: 'Failed to create product' }
    }
}

export async function updateProduct(id: string, data: z.infer<typeof productSchema>) {
    const session = await getSession();
    if (!session?.userId) return { success: false, error: "Unauthorized" };

    if (data.categoryId === 'none' || data.categoryId === '') data.categoryId = null;

    const validated = productSchema.safeParse(data)
    if (!validated.success) {
        return { success: false, error: validated.error.flatten().fieldErrors }
    }

    try {
        await prisma.product.update({
            where: {
                id,
                userId: session.userId as string,
            },
            data: validated.data,
        })
        revalidatePath('/dashboard/inventory')
        return { success: true }
    } catch (error) {
        console.error(error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { success: false, error: `Product with this ${error.meta?.target} already exists` }
            }
        }
        return { success: false, error: 'Failed to update product' }
    }
}

export async function deleteProduct(id: string) {
    const session = await getSession();
    if (!session?.userId) return { success: false, error: "Unauthorized" };

    try {
        await prisma.product.delete({
            where: {
                id,
                userId: session.userId as string,
            },
        })
        revalidatePath('/dashboard/inventory')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to delete product' }
    }
}

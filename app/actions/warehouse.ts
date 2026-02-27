'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { getSession } from '@/lib/session'

// --- Warehouses ---

const warehouseSchema = z.object({
    name: z.string().min(2, "Name is required"),
    shortCode: z.string().min(2, "Short code is required").max(10, "Short code too long"),
    address: z.string().optional(),
})

export async function getWarehouses() {
    const session = await getSession();
    if (!session?.userId) return { success: false, error: "Unauthorized" };

    try {
        const warehouses = await prisma.warehouse.findMany({
            where: {
                userId: session.userId as string,
            },
            include: {
                locations: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })
        return { success: true, data: warehouses }
    } catch (error) {
        return { success: false, error: 'Failed to fetch warehouses' }
    }
}

export async function createWarehouse(data: z.infer<typeof warehouseSchema>) {
    const session = await getSession();
    if (!session?.userId) return { success: false, error: "Unauthorized" };

    const validated = warehouseSchema.safeParse(data)
    if (!validated.success) {
        return { success: false, error: validated.error.flatten().fieldErrors }
    }

    try {
        await prisma.warehouse.create({
            data: {
                ...validated.data,
                userId: session.userId as string,
            },
        })
        revalidatePath('/dashboard/warehouses')
        return { success: true }
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { success: false, error: `Warehouse with this ${error.meta?.target} already exists` }
            }
        }
        return { success: false, error: 'Failed to create warehouse' }
    }
}

export async function updateWarehouse(id: string, data: z.infer<typeof warehouseSchema>) {
    const session = await getSession();
    if (!session?.userId) return { success: false, error: "Unauthorized" };

    const validated = warehouseSchema.safeParse(data)
    if (!validated.success) {
        return { success: false, error: validated.error.flatten().fieldErrors }
    }

    try {
        await prisma.warehouse.update({
            where: {
                id,
                userId: session.userId as string,
            },
            data: validated.data,
        })
        revalidatePath('/dashboard/warehouses')
        return { success: true }
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { success: false, error: `Warehouse with this ${error.meta?.target} already exists` }
            }
        }
        return { success: false, error: 'Failed to update warehouse' }
    }
}

export async function deleteWarehouse(id: string) {
    const session = await getSession();
    if (!session?.userId) return { success: false, error: "Unauthorized" };

    try {
        // Check for locations
        const warehouse = await prisma.warehouse.findUnique({
            where: {
                id,
                userId: session.userId as string,
            },
            include: { locations: true },
        })

        if (warehouse && warehouse.locations.length > 0) {
            // In a real app, we might want to force delete or ask user.
            // For now, let's allow it but maybe we should have warned?
            // Actually, the user said "tell user to delete ware house first" when deleting LOCATION.
            // So deleting warehouse is the "master" action.
            // But usually we don't want to orphan locations or delete them implicitly if they have stock.
            // Let's just delete the warehouse and let Prisma handle relations (SetNull or Cascade).
            // Schema says: locations Location[]
            // Location has warehouseId String?
            // Default is SetNull usually if not specified.
        }

        await prisma.warehouse.delete({
            where: {
                id,
                userId: session.userId as string,
            },
        })
        revalidatePath('/dashboard/warehouses')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to delete warehouse' }
    }
}

// --- Locations ---

const locationSchema = z.object({
    name: z.string().min(2, "Name is required"),
    shortCode: z.string().min(2, "Short code is required").max(20, "Short code too long"),
    type: z.enum(['VIEW', 'INTERNAL', 'CUSTOMER', 'VENDOR', 'INVENTORY_LOSS', 'PRODUCTION', 'TRANSIT']),
    warehouseId: z.string().optional().nullable(),
    parentId: z.string().optional().nullable(),
})
export async function getLocations(warehouseId?: string) {
    const session = await getSession();
    if (!session?.userId) return { success: false, error: "Unauthorized" };

    try {
        const where: any = {
            userId: session.userId as string,
        }
        if (warehouseId) {
            where.warehouseId = warehouseId
        }

        const locations = await prisma.location.findMany({
            where,
            include: {
                warehouse: true,
                parent: true,
                children: true,
            },
            orderBy: {
                name: 'asc',
            },
        })
        return { success: true, data: locations }
    } catch (error) {
        return { success: false, error: 'Failed to fetch locations' }
    }
}

export async function createLocation(data: z.infer<typeof locationSchema>) {
    const session = await getSession();
    if (!session?.userId) return { success: false, error: "Unauthorized" };

    // Sanitize inputs
    if (data.parentId === 'none' || data.parentId === '') data.parentId = null;
    if (data.warehouseId === 'none' || data.warehouseId === '') data.warehouseId = null;

    const validated = locationSchema.safeParse(data)
    if (!validated.success) {
        return { success: false, error: validated.error.flatten().fieldErrors }
    }

    try {
        await prisma.location.create({
            data: {
                ...validated.data,
                userId: session.userId as string,
            },
        })
        revalidatePath('/dashboard/inventory/locations')
        revalidatePath('/dashboard/warehouses')
        return { success: true }
    } catch (error) {
        console.error(error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { success: false, error: `Location with this ${error.meta?.target} already exists` }
            }
        }
        return { success: false, error: 'Failed to create location' }
    }
}

export async function updateLocation(id: string, data: z.infer<typeof locationSchema>) {
    const session = await getSession();
    if (!session?.userId) return { success: false, error: "Unauthorized" };

    // Sanitize inputs
    if (data.parentId === 'none' || data.parentId === '') data.parentId = null;
    if (data.warehouseId === 'none' || data.warehouseId === '') data.warehouseId = null;

    const validated = locationSchema.safeParse(data)
    if (!validated.success) {
        return { success: false, error: validated.error.flatten().fieldErrors }
    }

    try {
        await prisma.location.update({
            where: {
                id,
                userId: session.userId as string,
            },
            data: validated.data,
        })
        revalidatePath('/dashboard/inventory/locations')
        revalidatePath('/dashboard/warehouses')
        return { success: true }
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { success: false, error: `Location with this ${error.meta?.target} already exists` }
            }
        }
        return { success: false, error: 'Failed to update location' }
    }
}

export async function deleteLocation(id: string) {
    const session = await getSession();
    if (!session?.userId) return { success: false, error: "Unauthorized" };

    try {
        const location = await prisma.location.findUnique({
            where: {
                id,
                userId: session.userId as string,
            },
            include: { warehouse: true },
        })

        if (location?.warehouseId) {
            // User requirement: "don't delete location directly tell user to delete ware house first"
            // This is a weird requirement, but I will implement it as requested.
            return {
                success: false,
                error: `Cannot delete location directly. Please delete the Warehouse "${location.warehouse?.name}" first.`
            }
        }

        await prisma.location.delete({
            where: {
                id,
                userId: session.userId as string,
            },
        })
        revalidatePath('/dashboard/inventory/locations')
        revalidatePath('/dashboard/warehouses')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to delete location' }
    }
}

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { getSession } from "@/lib/session";

export type Category = {
    id: string;
    name: string;
    description: string | null;
    parentId: string | null;
    parent?: {
        id: string;
        name: string;
    } | null;
    _count?: {
        products: number;
        children: number;
    };
};

export async function getCategories() {
    const session = await getSession();
    if (!session?.userId) return { success: false, error: "Unauthorized" };

    try {
        const categories = await prisma.category.findMany({
            where: {
                userId: session.userId as string,
            },
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                _count: {
                    select: {
                        products: true,
                        children: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });
        return { success: true, data: categories };
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return { success: false, error: "Failed to fetch categories" };
    }
}

export async function createCategory(data: {
    name: string;
    description?: string;
    parentId?: string;
}) {
    const session = await getSession();
    if (!session?.userId) return { success: false, error: "Unauthorized" };

    try {
        const category = await prisma.category.create({
            data: {
                name: data.name,
                description: data.description,
                parentId: data.parentId || null,
                userId: session.userId as string,
            },
        });
        revalidatePath("/dashboard/categories");
        return { success: true, data: category };
    } catch (error) {
        console.error("Failed to create category:", error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return {
                    success: false,
                    error: `Category with this ${error.meta?.target} already exists`,
                };
            }
        }
        return { success: false, error: "Failed to create category" };
    }
}

export async function updateCategory(
    id: string,
    data: {
        name: string;
        description?: string;
        parentId?: string;
    }
) {
    const session = await getSession();
    if (!session?.userId) return { success: false, error: "Unauthorized" };

    try {
        const category = await prisma.category.update({
            where: {
                id,
                userId: session.userId as string,
            },
            data: {
                name: data.name,
                description: data.description,
                parentId: data.parentId || null,
            },
        });
        revalidatePath("/dashboard/categories");
        return { success: true, data: category };
    } catch (error) {
        console.error("Failed to update category:", error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return {
                    success: false,
                    error: `Category with this ${error.meta?.target} already exists`,
                };
            }
        }
        return { success: false, error: "Failed to update category" };
    }
}

export async function deleteCategory(id: string) {
    const session = await getSession();
    if (!session?.userId) return { success: false, error: "Unauthorized" };

    try {
        await prisma.category.delete({
            where: {
                id,
                userId: session.userId as string,
            },
        });
        revalidatePath("/dashboard/categories");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete category:", error);
        return { success: false, error: "Failed to delete category" };
    }
}

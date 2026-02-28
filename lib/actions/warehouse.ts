"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function getWarehouses() {
    const session = await getSession();
    if (!session?.userId) {
        throw new Error("Unauthorized");
    }

    return prisma.warehouse.findMany({
        where: { userId: session.userId },
        include: {
            _count: {
                select: { locations: true }
            }
        }
    });
}

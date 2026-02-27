"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function getCurrentUser() {
    const session = await getSession();
    if (!session?.userId) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.userId as string },
            select: { id: true, name: true, email: true, role: true },
        });
        return user;
    } catch (error) {
        console.error("Failed to fetch user:", error);
        return null;
    }
}

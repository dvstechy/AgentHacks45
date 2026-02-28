import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Append connect_timeout for Neon cold starts if not already present
const dbUrl = process.env.DATABASE_URL || '';
if (dbUrl && !dbUrl.includes('connect_timeout')) {
    const separator = dbUrl.includes('?') ? '&' : '?';
    process.env.DATABASE_URL = `${dbUrl}${separator}connect_timeout=30`;
}

console.log("Initializing Prisma Client...")

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['warn', 'error'],
    })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

console.log("Prisma Client Initialized:", !!prisma)

import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

console.log("Initializing Prisma Client...")
console.log("DATABASE_URL in runtime:", process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'))

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
    })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

console.log("Prisma Client Initialized:", !!prisma)


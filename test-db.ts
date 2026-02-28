import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🔄 Attempting to connect to database...');
        const result = await prisma.$queryRaw`SELECT 1 as result`;
        console.log('✅ Connection successful!', result);
    } catch (error) {
        console.error('❌ Connection failed:');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();

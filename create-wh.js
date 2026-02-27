
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.findUnique({ where: { email: 'bhosvivek123@gmail.com' } });
        if (!user) {
            console.log('User not found');
            return;
        }

        // Check if warehouse already exists
        const existing = await prisma.warehouse.findFirst({
            where: { shortCode: 'WH-MUM', userId: user.id }
        });

        if (existing) {
            console.log('Warehouse already exists');
            return;
        }

        const wh = await prisma.warehouse.create({
            data: {
                name: 'Mumbai Main Warehouse',
                shortCode: 'WH-MUM',
                address: 'Andheri East, Mumbai, Maharashtra 400069',
                userId: user.id,
                status: 'ACTIVE'
            }
        });
        console.log('Created warehouse:', wh.id);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

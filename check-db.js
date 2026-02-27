
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const users = await prisma.user.findMany();
        console.log('Users:', users.map(u => ({ id: u.id, email: u.email })));

        for (const user of users) {
            const count = await prisma.warehouse.count({ where: { userId: user.id } });
            console.log(`Warehouse count for ${user.email} (${user.id}): ${count}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();

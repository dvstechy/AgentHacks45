import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'test2@example.com';
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.log('User not found');
    } else {
        console.log('User found:', user);
        const passwordValid = await bcrypt.compare('password123', user.password);
        console.log('Password valid:', passwordValid);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

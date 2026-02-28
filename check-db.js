const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkStock() {
    const stock = await prisma.stockLevel.findMany({
        include: {
            product: true,
            location: {
                include: {
                    warehouse: true
                }
            }
        }
    });

    console.log("Total Stock Levels:", stock.length);
    stock.forEach(s => {
        console.log(`${s.product.name} @ ${s.location.warehouse?.name}: ${s.quantity} (Min: ${s.product.minStock})`);
    });
}

checkStock().catch(console.error).finally(() => prisma.$disconnect());

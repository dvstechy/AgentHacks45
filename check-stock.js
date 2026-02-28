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

    console.log(`Total Records: ${stock.length}`);
    const lowStock = stock.filter(s => s.product && s.quantity < s.product.minStock);
    console.log(`Low Stock Records: ${lowStock.length}`);
    lowStock.forEach(s => {
        const wName = s.location?.warehouse?.name || "MISSING WH";
        console.log(`LOW: ${s.product.name} @ ${wName}: ${s.quantity}/${s.product.minStock}`);
    });

    const highStock = stock.filter(s => s.product && s.quantity > s.product.minStock * 2);
    console.log(`High Stock Records: ${highStock.length}`);
    highStock.forEach(s => {
        const wName = s.location?.warehouse?.name || "MISSING WH";
        console.log(`HIGH: ${s.product.name} @ ${wName}: ${s.quantity}/${s.product.minStock}`);
    });
}

checkStock().catch(console.error).finally(() => prisma.$disconnect());

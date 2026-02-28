const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkWarehouses() {
    const warehouses = await prisma.warehouse.findMany();
    console.log(`Total Warehouses: ${warehouses.length}`);
    warehouses.forEach(w => {
        console.log(`WH: ${w.name} | Code: ${w.shortCode} | Lat: ${w.latitude} | Lon: ${w.longitude}`);
    });
}

checkWarehouses().catch(console.error).finally(() => prisma.$disconnect());

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function debugMapData() {
    const warehouses = await prisma.warehouse.findMany();
    console.log("--- WAREHOUSES IN DB ---");
    warehouses.forEach(w => {
        console.log(`ID: ${w.id} | Name: ${w.name} | Lat: ${w.latitude} | Lon: ${w.longitude}`);
    });
}

debugMapData().catch(console.error).finally(() => prisma.$disconnect());

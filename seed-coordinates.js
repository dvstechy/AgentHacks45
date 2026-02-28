const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedCoordinates() {
    console.log("Seeding coordinates...");

    // Mumbai
    await prisma.warehouse.updateMany({
        where: { shortCode: "WH-MUM" },
        data: { latitude: 19.0760, longitude: 72.8777 }
    });

    // Delhi
    await prisma.warehouse.updateMany({
        where: { shortCode: "WH-DEL" },
        data: { latitude: 28.6139, longitude: 77.2090 }
    });

    console.log("Done seeding Mumbai & Delhi coordinates.");
}

seedCoordinates().catch(console.error).finally(() => prisma.$disconnect());

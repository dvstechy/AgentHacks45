const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function forceSeed() {
    console.log("Forcing coordinate update...");

    // Mumbai
    await prisma.warehouse.update({
        where: { id: "cmm550e3e0011rzjoj7b3ox7q" },
        data: { latitude: 19.0760, longitude: 72.8777 }
    });

    // Delhi
    await prisma.warehouse.update({
        where: { id: "cmm550elg0013rzjohg5xzjyi" },
        data: { latitude: 28.6139, longitude: 77.2090 }
    });

    console.log("Coordinates forced successfully.");
}

forceSeed().catch(console.error).finally(() => prisma.$disconnect());

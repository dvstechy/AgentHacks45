import { PrismaClient, TransferType, TransferStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDemoData() {
  console.log('🌱 Adding demo data for showcasing...');
  const seedEmail = 'bhosvivek123@gmail.com';

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: seedEmail },
  });

  if (!user) {
    console.log('❌ User not found. Please run initial seed first.');
    process.exit(1);
  }

  console.log(`✅ Found user: ${user.email}`);

  // Get all existing products, warehouses, locations, and contacts
  const allProducts = await prisma.product.findMany({
    where: { userId: user.id },
  });

  const allContacts = await prisma.contact.findMany({
    where: { userId: user.id },
  });

  const allWarehouses = await prisma.warehouse.findMany({
    where: { userId: user.id },
  });

  const allLocations = await prisma.location.findMany({
    where: { userId: user.id },
  });

  console.log(`Found ${allProducts.length} products, ${allWarehouses.length} warehouses, ${allLocations.length} locations`);

  if (allProducts.length === 0 || allWarehouses.length === 0 || allLocations.length === 0) {
    console.log('❌ Not enough existing data. Please run initial seed first.');
    process.exit(1);
  }

  // Get key locations
  const mumStock = allLocations.find(l => l.shortCode === 'WH-MUM/STOCK');
  const mumShelf1 = allLocations.find(l => l.shortCode === 'WH-MUM/STOCK/A1');
  const mumShelf2 = allLocations.find(l => l.shortCode === 'WH-MUM/STOCK/A2');
  const mumShelf3 = allLocations.find(l => l.shortCode === 'WH-MUM/STOCK/B1');
  const mumShelf4 = allLocations.find(l => l.shortCode === 'WH-MUM/STOCK/C1');
  const delStock = allLocations.find(l => l.shortCode === 'WH-DEL/STOCK');
  const vendorLocation = allLocations.find(l => l.shortCode === 'VENDOR');
  const customerLocation = allLocations.find(l => l.shortCode === 'CUSTOMER');

  if (!mumStock || !vendorLocation || !customerLocation || !mumShelf2 || !mumShelf4) {
    console.log('❌ Missing required locations. Please run initial seed first.');
    process.exit(1);
  }

  // ========================================
  // UPDATE STOCK LEVELS FOR LOW STOCK ALERTS
  // ========================================
  console.log('📉 Creating low stock items...');

  const lowStockUpdates = [
    { sku: 'ELEC-LAP-MBP14M3-004', location: mumShelf2, quantity: 2 },
    { sku: 'ELEC-PHONE-GP8P-003', location: mumShelf1, quantity: 1 },
    { sku: 'ELEC-CAM-CR6M2-010', location: mumShelf3, quantity: 1 },
    { sku: 'ELEC-WEAR-SGW6-016', location: mumStock, quantity: 3 },
    { sku: 'ELEC-LAP-DXPS15-005', location: mumShelf2, quantity: 1 },
  ];

  for (const item of lowStockUpdates) {
    const product = allProducts.find(p => p.sku === item.sku);
    if (product && item.location) {
      const existing = await prisma.stockLevel.findUnique({
        where: { productId_locationId: { productId: product.id, locationId: item.location.id } },
      });

      if (existing) {
        await prisma.stockLevel.update({
          where: { productId_locationId: { productId: product.id, locationId: item.location.id } },
          data: { quantity: item.quantity },
        });
      } else {
        await prisma.stockLevel.create({
          data: {
            productId: product.id,
            locationId: item.location.id,
            quantity: item.quantity,
            userId: user.id,
          },
        });
      }
    }
  }

  console.log('✅ Updated stock levels for low stock alerts');

  // ========================================
  // CREATE DELIVERY ORDERS (OUTGOING)
  // ========================================
  console.log('📦 Creating delivery orders...');

  const gadgetWorld = allContacts.find(c => c.name === 'Gadget World Stores');
  const ecommerce = allContacts.find(c => c.name === 'E-Commerce Giant');
  const corporateIT = allContacts.find(c => c.name === 'Corporate IT Solutions');
  const techRetail = allContacts.find(c => c.name === 'Tech Retail Chain');

  // Delivery 2 - WAITING
  if (gadgetWorld && mumShelf3 && customerLocation) {
    const delivery2 = await prisma.stockTransfer.create({
      data: {
        reference: `WH-MUM/OUT/${Date.now()}-01`,
        origin: `SO-DEMO-${Date.now()}-01`,
        type: TransferType.OUTGOING,
        status: TransferStatus.WAITING,
        sourceLocationId: mumShelf3.id,
        destinationLocationId: customerLocation.id,
        contactId: gadgetWorld.id,
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        userId: user.id,
      },
    });

    const sony = allProducts.find(p => p.sku === 'ELEC-AUD-SWXM5-007');
    const jbl = allProducts.find(p => p.sku === 'ELEC-AUD-JBLF6-009');

    if (sony && jbl) {
      await prisma.stockMove.createMany({
        data: [
          {
            transferId: delivery2.id,
            productId: sony.id,
            quantity: 8,
            sourceLocationId: mumShelf3.id,
            destinationLocationId: customerLocation.id,
            status: TransferStatus.WAITING,
            userId: user.id,
          },
          {
            transferId: delivery2.id,
            productId: jbl.id,
            quantity: 15,
            sourceLocationId: mumShelf3.id,
            destinationLocationId: customerLocation.id,
            status: TransferStatus.WAITING,
            userId: user.id,
          },
        ],
      });
    }
  }

  // Delivery 3 - WAITING (Components)
  if (techRetail && mumShelf4 && customerLocation) {
    const delivery3 = await prisma.stockTransfer.create({
      data: {
        reference: `WH-MUM/OUT/${Date.now()}-02`,
        origin: `SO-DEMO-${Date.now()}-02`,
        type: TransferType.OUTGOING,
        status: TransferStatus.WAITING,
        sourceLocationId: mumShelf4.id,
        destinationLocationId: customerLocation.id,
        contactId: techRetail.id,
        scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        userId: user.id,
      },
    });

    const arduino = allProducts.find(p => p.sku === 'ELEC-COMP-ARD-011');
    const esp = allProducts.find(p => p.sku === 'ELEC-COMP-ESP32-013');

    if (arduino && esp) {
      await prisma.stockMove.createMany({
        data: [
          {
            transferId: delivery3.id,
            productId: arduino.id,
            quantity: 50,
            sourceLocationId: mumShelf4.id,
            destinationLocationId: customerLocation.id,
            status: TransferStatus.WAITING,
            userId: user.id,
          },
          {
            transferId: delivery3.id,
            productId: esp.id,
            quantity: 75,
            sourceLocationId: mumShelf4.id,
            destinationLocationId: customerLocation.id,
            status: TransferStatus.WAITING,
            userId: user.id,
          },
        ],
      });
    }
  }

  // Delivery 4 - READY (prepared but not dispatched)
  if (ecommerce && mumShelf1 && customerLocation) {
    const delivery4 = await prisma.stockTransfer.create({
      data: {
        reference: `WH-MUM/OUT/${Date.now()}-03`,
        origin: `SO-DEMO-${Date.now()}-03`,
        type: TransferType.OUTGOING,
        status: TransferStatus.READY,
        sourceLocationId: mumShelf1.id,
        destinationLocationId: customerLocation.id,
        contactId: ecommerce.id,
        scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        userId: user.id,
      },
    });

    const pixel = allProducts.find(p => p.sku === 'ELEC-PHONE-GP8P-003');
    const screenProt = allProducts.find(p => p.sku === 'ELEC-ACC-SPG-021');

    if (pixel && screenProt) {
      await prisma.stockMove.createMany({
        data: [
          {
            transferId: delivery4.id,
            productId: pixel.id,
            quantity: 5,
            sourceLocationId: mumShelf1.id,
            destinationLocationId: customerLocation.id,
            status: TransferStatus.READY,
            userId: user.id,
          },
          {
            transferId: delivery4.id,
            productId: screenProt.id,
            quantity: 25,
            sourceLocationId: mumStock.id,
            destinationLocationId: customerLocation.id,
            status: TransferStatus.READY,
            userId: user.id,
          },
        ],
      });
    }
  }

  // Delivery 5 - LATE (scheduled date is in past)
  if (corporateIT && mumShelf2 && customerLocation) {
    const lateDelivery = await prisma.stockTransfer.create({
      data: {
        reference: `WH-MUM/OUT/${Date.now()}-04`,
        origin: `SO-DEMO-${Date.now()}-04`,
        type: TransferType.OUTGOING,
        status: TransferStatus.WAITING,
        sourceLocationId: mumShelf2.id,
        destinationLocationId: customerLocation.id,
        contactId: corporateIT.id,
        scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago - LATE!
        userId: user.id,
      },
    });

    const thinkpad = allProducts.find(p => p.sku === 'ELEC-LAP-LTX1C-006');
    const fitbit = allProducts.find(p => p.sku === 'ELEC-WEAR-FBC6-017');

    if (thinkpad && fitbit) {
      await prisma.stockMove.createMany({
        data: [
          {
            transferId: lateDelivery.id,
            productId: thinkpad.id,
            quantity: 3,
            sourceLocationId: mumShelf2.id,
            destinationLocationId: customerLocation.id,
            status: TransferStatus.WAITING,
            userId: user.id,
          },
          {
            transferId: lateDelivery.id,
            productId: fitbit.id,
            quantity: 8,
            sourceLocationId: mumStock.id,
            destinationLocationId: customerLocation.id,
            status: TransferStatus.WAITING,
            userId: user.id,
          },
        ],
      });
    }
  }

  console.log('✅ Created delivery orders');

  // ========================================
  // CREATE INCOMING RECEIPTS
  // ========================================
  console.log('📥 Creating incoming receipts...');

  const globalElectronics = allContacts.find(c => c.name === 'Global Electronics Wholesale');
  const techComponents = allContacts.find(c => c.name === 'Tech Components Distributor');

  // Receipt 3 - READY
  if (techComponents && mumShelf3) {
    const receipt3 = await prisma.stockTransfer.create({
      data: {
        reference: `WH-MUM/IN/${Date.now()}-01`,
        origin: `PO-DEMO-${Date.now()}-01`,
        type: TransferType.INCOMING,
        status: TransferStatus.READY,
        sourceLocationId: vendorLocation.id,
        destinationLocationId: mumShelf3.id,
        contactId: techComponents.id,
        scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        userId: user.id,
      },
    });

    const appwatch = allProducts.find(p => p.sku === 'ELEC-WEAR-AWS9-015');
    const camera = allProducts.find(p => p.sku === 'ELEC-CAM-CR6M2-010');

    if (appwatch && camera) {
      await prisma.stockMove.createMany({
        data: [
          {
            transferId: receipt3.id,
            productId: appwatch.id,
            quantity: 12,
            sourceLocationId: vendorLocation.id,
            destinationLocationId: mumStock.id,
            status: TransferStatus.READY,
            userId: user.id,
          },
          {
            transferId: receipt3.id,
            productId: camera.id,
            quantity: 2,
            sourceLocationId: vendorLocation.id,
            destinationLocationId: mumShelf3.id,
            status: TransferStatus.READY,
            userId: user.id,
          },
        ],
      });
    }
  }

  // Receipt 4 - LATE (waiting for a long time)
  if (globalElectronics && mumShelf2) {
    const lateReceipt = await prisma.stockTransfer.create({
      data: {
        reference: `WH-MUM/IN/${Date.now()}-02`,
        origin: `PO-DEMO-${Date.now()}-02`,
        type: TransferType.INCOMING,
        status: TransferStatus.WAITING,
        sourceLocationId: vendorLocation.id,
        destinationLocationId: mumShelf2.id,
        contactId: globalElectronics.id,
        scheduledDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago - LATE!
        userId: user.id,
      },
    });

    const dell = allProducts.find(p => p.sku === 'ELEC-LAP-DXPS15-005');
    const raspi = allProducts.find(p => p.sku === 'ELEC-COMP-RPI5-012');

    if (dell && raspi) {
      await prisma.stockMove.createMany({
        data: [
          {
            transferId: lateReceipt.id,
            productId: dell.id,
            quantity: 4,
            sourceLocationId: vendorLocation.id,
            destinationLocationId: mumShelf2.id,
            status: TransferStatus.WAITING,
            userId: user.id,
          },
          {
            transferId: lateReceipt.id,
            productId: raspi.id,
            quantity: 30,
            sourceLocationId: vendorLocation.id,
            destinationLocationId: mumShelf4.id,
            status: TransferStatus.WAITING,
            userId: user.id,
          },
        ],
      });
    }
  }

  console.log('✅ Created incoming receipts');

  // ========================================
  // CREATE INTERNAL TRANSFERS
  // ========================================
  console.log('🔄 Creating internal transfers...');

  if (mumShelf3 && delStock) {
    const internalTransfer = await prisma.stockTransfer.create({
      data: {
        reference: `WH-INT/${Date.now()}-01`,
        type: TransferType.INTERNAL,
        status: TransferStatus.WAITING,
        sourceLocationId: mumShelf3.id,
        destinationLocationId: delStock.id,
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        userId: user.id,
      },
    });

    const sony = allProducts.find(p => p.sku === 'ELEC-AUD-SWXM5-007');
    const appwatch = allProducts.find(p => p.sku === 'ELEC-WEAR-AWS9-015');

    if (sony && appwatch) {
      await prisma.stockMove.createMany({
        data: [
          {
            transferId: internalTransfer.id,
            productId: sony.id,
            quantity: 15,
            sourceLocationId: mumShelf3.id,
            destinationLocationId: delStock.id,
            status: TransferStatus.WAITING,
            userId: user.id,
          },
          {
            transferId: internalTransfer.id,
            productId: appwatch.id,
            quantity: 10,
            sourceLocationId: mumStock.id,
            destinationLocationId: delStock.id,
            status: TransferStatus.WAITING,
            userId: user.id,
          },
        ],
      });
    }
  }

  console.log('✅ Created internal transfers');

  console.log('🎉 Demo data added successfully!');
  console.log('\n📊 Summary:');
  console.log('   ✅ Low stock alerts added (5 items)');
  console.log('   ✅ Delivery orders created (4 outgoing transfers)');
  console.log('   ✅ Incoming receipts created (2 receipts)');
  console.log('   ✅ Internal transfers created (1 transfer)');
  console.log('   📈 Total new transfers: 7');
}

seedDemoData()
  .catch((e) => {
    console.error('❌ Error seeding demo data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

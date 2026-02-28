import { PrismaClient, UserRole, ProductType, LocationType, TransferType, TransferStatus, ContactType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');
  const seedEmail = 'bhosvivek123@gmail.com';

  // Find existing user or create new one
  console.log(`👤 Checking for user ${seedEmail}...`);
  let user = await prisma.user.findUnique({
    where: { email: seedEmail },
  });

  if (!user) {
    console.log('👤 Creating new user...');
    const hashedPassword = await bcrypt.hash('Vivek@123', 10);
    user = await prisma.user.create({
      data: {
        email: seedEmail,
        password: hashedPassword,
        name: 'Vivek Bhos',
        role: UserRole.ADMIN,
      },
    });
  } else {
    console.log('👤 User already exists, adding more data...');
  }

  // Create Categories with hierarchy
  console.log('📂 Finding or creating categories...');

  // Main Electronics Category
  let electronics = await prisma.category.findFirst({
    where: { userId: user.id, name: 'Electronics' },
  });
  
  if (!electronics) {
    electronics = await prisma.category.create({
      data: {
        name: 'Electronics',
        description: 'All electronic products and components',
        userId: user.id,
      },
    });
  }

  // Subcategories
  let smartphones = await prisma.category.findFirst({
    where: { userId: user.id, name: 'Smartphones' },
  });
  if (!smartphones) {
    smartphones = await prisma.category.create({
      data: {
        name: 'Smartphones',
        description: 'Mobile phones and accessories',
        parentId: electronics.id,
        userId: user.id,
      },
    });
  }

  let laptops = await prisma.category.findFirst({
    where: { userId: user.id, name: 'Laptops & Computers' },
  });
  if (!laptops) {
    laptops = await prisma.category.create({
      data: {
        name: 'Laptops & Computers',
        description: 'Laptops, desktops and computer accessories',
        parentId: electronics.id,
        userId: user.id,
      },
    });
  }

  let audioVideo = await prisma.category.findFirst({
    where: { userId: user.id, name: 'Audio & Video' },
  });
  if (!audioVideo) {
    audioVideo = await prisma.category.create({
      data: {
        name: 'Audio & Video',
        description: 'Headphones, speakers, cameras and accessories',
        parentId: electronics.id,
        userId: user.id,
      },
    });
  }

  let components = await prisma.category.findFirst({
    where: { userId: user.id, name: 'Electronic Components' },
  });
  if (!components) {
    components = await prisma.category.create({
      data: {
        name: 'Electronic Components',
        description: 'PCBs, chips, resistors, capacitors and other components',
        parentId: electronics.id,
        userId: user.id,
      },
    });
  }

  let wearables = await prisma.category.findFirst({
    where: { userId: user.id, name: 'Wearables' },
  });
  if (!wearables) {
    wearables = await prisma.category.create({
      data: {
        name: 'Wearables',
        description: 'Smartwatches, fitness trackers and wearable tech',
        parentId: electronics.id,
        userId: user.id,
      },
    });
  }

  let accessories = await prisma.category.findFirst({
    where: { userId: user.id, name: 'Accessories' },
  });
  if (!accessories) {
    accessories = await prisma.category.create({
      data: {
        name: 'Accessories',
        description: 'Cables, chargers, cases and other accessories',
        parentId: electronics.id,
        userId: user.id,
      },
    });
  }

  // Create Products (using upsert to avoid duplicates)
  console.log('📦 Creating/finding products...');

  const productsData = [
    // Smartphones
    {
      name: 'iPhone 15 Pro',
      sku: 'ELEC-PHONE-IP15P-001',
      description: 'Apple iPhone 15 Pro 256GB - Titanium Black',
      type: ProductType.STORABLE,
      unitOfMeasure: 'Units',
      costPrice: new Decimal(85000),
      salesPrice: new Decimal(129900),
      categoryId: smartphones.id,
      minStock: 5,
      maxStock: 50,
      userId: user.id,
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      sku: 'ELEC-PHONE-SGS24U-002',
      description: 'Samsung Galaxy S24 Ultra 512GB - Phantom Black',
      type: ProductType.STORABLE,
      unitOfMeasure: 'Units',
      costPrice: new Decimal(95000),
      salesPrice: new Decimal(134999),
      categoryId: smartphones.id,
      minStock: 5,
      maxStock: 40,
      userId: user.id,
    },
    {
      name: 'Google Pixel 8 Pro',
      sku: 'ELEC-PHONE-GP8P-003',
      description: 'Google Pixel 8 Pro 128GB - Obsidian',
      type: ProductType.STORABLE,
      unitOfMeasure: 'Units',
      costPrice: new Decimal(65000),
      salesPrice: new Decimal(89999),
      categoryId: smartphones.id,
      minStock: 3,
      maxStock: 30,
      userId: user.id,
    },
    {
      name: 'MacBook Pro 14" M3',
      sku: 'ELEC-LAP-MBP14M3-004',
      description: 'Apple MacBook Pro 14" M3 Chip 16GB 512GB SSD',
      type: ProductType.STORABLE,
      unitOfMeasure: 'Units',
      costPrice: new Decimal(145000),
      salesPrice: new Decimal(199900),
      categoryId: laptops.id,
      minStock: 3,
      maxStock: 25,
      userId: user.id,
    },
    {
      name: 'Dell XPS 15',
      sku: 'ELEC-LAP-DXPS15-005',
      description: 'Dell XPS 15 Intel i7 13th Gen 32GB RAM 1TB SSD',
      type: ProductType.STORABLE,
      unitOfMeasure: 'Units',
      costPrice: new Decimal(125000),
      salesPrice: new Decimal(169999),
      categoryId: laptops.id,
      minStock: 2,
      maxStock: 20,
      userId: user.id,
    },
    {
      name: 'Lenovo ThinkPad X1 Carbon',
      sku: 'ELEC-LAP-LTX1C-006',
      description: 'Lenovo ThinkPad X1 Carbon Gen 11 i7 16GB 512GB',
      type: ProductType.STORABLE,
      unitOfMeasure: 'Units',
      costPrice: new Decimal(95000),
      salesPrice: new Decimal(134999),
      categoryId: laptops.id,
      minStock: 2,
      maxStock: 15,
      userId: user.id,
    },
    {
      name: 'Sony WH-1000XM5',
      sku: 'ELEC-AUD-SWXM5-007',
      description: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
      type: ProductType.STORABLE,
      unitOfMeasure: 'Units',
      costPrice: new Decimal(18000),
      salesPrice: new Decimal(29990),
      categoryId: audioVideo.id,
      minStock: 10,
      maxStock: 80,
      userId: user.id,
    },
    {
      name: 'AirPods Pro 2nd Gen',
      sku: 'ELEC-AUD-APP2-008',
      description: 'Apple AirPods Pro 2nd Generation with MagSafe',
      type: ProductType.STORABLE,
      unitOfMeasure: 'Units',
      costPrice: new Decimal(16000),
      salesPrice: new Decimal(24900),
      categoryId: audioVideo.id,
      minStock: 15,
      maxStock: 100,
      userId: user.id,
    },
    {
      name: 'JBL Flip 6',
      sku: 'ELEC-AUD-JBLF6-009',
      description: 'JBL Flip 6 Portable Bluetooth Speaker - Waterproof',
      type: ProductType.STORABLE,
      unitOfMeasure: 'Units',
      costPrice: new Decimal(7500),
      salesPrice: new Decimal(12999),
      categoryId: audioVideo.id,
      minStock: 20,
      maxStock: 150,
      userId: user.id,
    },
    {
      name: 'Canon EOS R6 Mark II',
      sku: 'ELEC-CAM-CR6M2-010',
      description: 'Canon EOS R6 Mark II Mirrorless Camera Body',
      type: ProductType.STORABLE,
      unitOfMeasure: 'Units',
      costPrice: new Decimal(185000),
      salesPrice: new Decimal(249999),
      categoryId: audioVideo.id,
      minStock: 2,
      maxStock: 10,
      userId: user.id,
    },
    {
      name: 'Arduino Uno R3',
      sku: 'ELEC-COMP-ARD-011',
      description: 'Arduino Uno R3 Microcontroller Board',
      type: ProductType.STORABLE,
      unitOfMeasure: 'Units',
      costPrice: new Decimal(450),
      salesPrice: new Decimal(899),
      categoryId: components.id,
      minStock: 50,
      maxStock: 500,
      userId: user.id,
    },
    {
      name: 'Raspberry Pi 5 8GB',
      sku: 'ELEC-COMP-RPI5-012',
      description: 'Raspberry Pi 5 Single Board Computer 8GB RAM',
      type: ProductType.STORABLE,
      unitOfMeasure: 'Units',
      costPrice: new Decimal(5500),
      salesPrice: new Decimal(8999),
      categoryId: components.id,
      minStock: 30,
      maxStock: 200,
      userId: user.id,
    },
    {
      name: 'ESP32 Development Board',
      sku: 'ELEC-COMP-ESP32-013',
      description: 'ESP32 WiFi + Bluetooth Development Board',
      type: ProductType.STORABLE,
      unitOfMeasure: 'Units',
      costPrice: new Decimal(350),
      salesPrice: new Decimal(699),
      categoryId: components.id,
      minStock: 100,
      maxStock: 800,
      userId: user.id,
    },
    {
      name: 'Resistor Kit 1000pcs',
      sku: 'ELEC-COMP-RESK-014',
      description: 'Resistor Assortment Kit 1/4W 1000 pieces',
      type: ProductType.STORABLE,
      unitOfMeasure: 'Kits',
      costPrice: new Decimal(250),
      salesPrice: new Decimal(499),
      categoryId: components.id,
      minStock: 20,
      maxStock: 100,
      userId: user.id,
    },
    {
      name: 'Apple Watch Series 9',
      sku: 'ELEC-WEAR-AWS9-015',
      description: 'Apple Watch Series 9 GPS 45mm Midnight Aluminum',
      type: ProductType.STORABLE,
      unitOfMeasure: 'Units',
      costPrice: new Decimal(32000),
      salesPrice: new Decimal(45900),
      categoryId: wearables.id,
      minStock: 8,
      maxStock: 60,
      userId: user.id,
    },
    {
      name: 'Samsung Galaxy Watch 6',
      sku: 'ELEC-WEAR-SGW6-016',
      description: 'Samsung Galaxy Watch 6 44mm Bluetooth',
      type: ProductType.STORABLE,
      unitOfMeasure: 'Units',
      costPrice: new Decimal(22000),
      salesPrice: new Decimal(32999),
      categoryId: wearables.id,
      minStock: 5,
      maxStock: 40,
      userId: user.id,
    },
    {
      name: 'Fitbit Charge 6',
      sku: 'ELEC-WEAR-FBC6-017',
      description: 'Fitbit Charge 6 Fitness Tracker with Heart Rate Monitor',
      type: ProductType.STORABLE,
      unitOfMeasure: 'Units',
      costPrice: new Decimal(9000),
      salesPrice: new Decimal(14999),
      categoryId: wearables.id,
      minStock: 10,
      maxStock: 80,
      userId: user.id,
    },
    {
      name: 'USB-C to Lightning Cable',
      sku: 'ELEC-ACC-USBC-018',
      description: 'Apple USB-C to Lightning Cable 1m',
      type: ProductType.STORABLE,
      unitOfMeasure: 'Units',
      costPrice: new Decimal(800),
      salesPrice: new Decimal(1900),
      categoryId: accessories.id,
      minStock: 100,
      maxStock: 1000,
      userId: user.id,
    },
    {
      name: 'Anker PowerBank 20000mAh',
      sku: 'ELEC-ACC-APB20-019',
      description: 'Anker PowerCore 20000mAh Portable Charger',
      type: ProductType.STORABLE,
      unitOfMeasure: 'Units',
      costPrice: new Decimal(2500),
      salesPrice: new Decimal(4999),
      categoryId: accessories.id,
      minStock: 50,
      maxStock: 300,
      userId: user.id,
    },
    {
      name: 'Spigen Phone Case',
      sku: 'ELEC-ACC-SPC-020',
      description: 'Spigen Ultra Hybrid Protective Phone Case',
      type: ProductType.STORABLE,
      unitOfMeasure: 'Units',
      costPrice: new Decimal(450),
      salesPrice: new Decimal(1299),
      categoryId: accessories.id,
      minStock: 150,
      maxStock: 1000,
      userId: user.id,
    },
    {
      name: 'Screen Protector Tempered Glass',
      sku: 'ELEC-ACC-SPG-021',
      description: 'Premium Tempered Glass Screen Protector',
      type: ProductType.STORABLE,
      unitOfMeasure: 'Units',
      costPrice: new Decimal(150),
      salesPrice: new Decimal(499),
      categoryId: accessories.id,
      minStock: 200,
      maxStock: 1500,
      userId: user.id,
    },
  ];

  let createdCount = 0;
  for (const product of productsData) {
    const existingProduct = await prisma.product.findUnique({
      where: { sku_userId: { sku: product.sku, userId: user.id } },
    });

    if (!existingProduct) {
      await prisma.product.create({ data: product });
      createdCount++;
    }
  }

  console.log(`✅ Created ${createdCount} new products (${productsData.length - createdCount} already existed)`)

  // Create Warehouses
  console.log('🏭 Creating warehouses...');

  let mainWarehouse = await prisma.warehouse.findFirst({
    where: { userId: user.id, shortCode: 'WH-MUM' },
  });

  if (!mainWarehouse) {
    mainWarehouse = await prisma.warehouse.create({
      data: {
        name: 'Mumbai Main Warehouse',
        shortCode: 'WH-MUM',
        address: 'Andheri East, Mumbai, Maharashtra 400069',
        userId: user.id,
      },
    });
  }

  let delhiWarehouse = await prisma.warehouse.findFirst({
    where: { userId: user.id, shortCode: 'WH-DEL' },
  });

  if (!delhiWarehouse) {
    delhiWarehouse = await prisma.warehouse.create({
      data: {
        name: 'Delhi Distribution Center',
        shortCode: 'WH-DEL',
        address: 'Connaught Place, New Delhi 110001',
        userId: user.id,
      },
    });
  }  // Create Locations with hierarchy
  console.log('📍 Creating locations...');

  // Mumbai Warehouse Locations
  const mumStock = await prisma.location.create({
    data: {
      name: 'Mumbai Stock',
      shortCode: 'WH-MUM/STOCK',
      type: LocationType.INTERNAL,
      warehouseId: mainWarehouse.id,
      userId: user.id,
    },
  });

  const mumShelf1 = await prisma.location.create({
    data: {
      name: 'Shelf A1 - Smartphones',
      shortCode: 'WH-MUM/STOCK/A1',
      type: LocationType.INTERNAL,
      parentId: mumStock.id,
      warehouseId: mainWarehouse.id,
      userId: user.id,
    },
  });

  const mumShelf2 = await prisma.location.create({
    data: {
      name: 'Shelf A2 - Laptops',
      shortCode: 'WH-MUM/STOCK/A2',
      type: LocationType.INTERNAL,
      parentId: mumStock.id,
      warehouseId: mainWarehouse.id,
      userId: user.id,
    },
  });

  const mumShelf3 = await prisma.location.create({
    data: {
      name: 'Shelf B1 - Audio/Video',
      shortCode: 'WH-MUM/STOCK/B1',
      type: LocationType.INTERNAL,
      parentId: mumStock.id,
      warehouseId: mainWarehouse.id,
      userId: user.id,
    },
  });

  const mumShelf4 = await prisma.location.create({
    data: {
      name: 'Shelf C1 - Components',
      shortCode: 'WH-MUM/STOCK/C1',
      type: LocationType.INTERNAL,
      parentId: mumStock.id,
      warehouseId: mainWarehouse.id,
      userId: user.id,
    },
  });

  // Delhi Warehouse Locations
  const delStock = await prisma.location.create({
    data: {
      name: 'Delhi Stock',
      shortCode: 'WH-DEL/STOCK',
      type: LocationType.INTERNAL,
      warehouseId: delhiWarehouse.id,
      userId: user.id,
    },
  });

  // Special Locations
  const vendorLocation = await prisma.location.create({
    data: {
      name: 'Vendors',
      shortCode: 'VENDOR',
      type: LocationType.VENDOR,
      userId: user.id,
    },
  });

  const customerLocation = await prisma.location.create({
    data: {
      name: 'Customers',
      shortCode: 'CUSTOMER',
      type: LocationType.CUSTOMER,
      userId: user.id,
    },
  });

  await prisma.location.create({
    data: {
      name: 'Inventory Adjustments',
      shortCode: 'INV-ADJ',
      type: LocationType.INVENTORY_LOSS,
      userId: user.id,
    },
  });

  // Create Contacts
  console.log('👥 Creating contacts...');

  await prisma.contact.createMany({
    data: [
      {
        name: 'Apple India Pvt Ltd',
        email: 'orders@apple.in',
        phone: '+91-22-12345678',
        type: ContactType.VENDOR,
        address: 'Bandra Kurla Complex, Mumbai 400051',
        userId: user.id,
      },
      {
        name: 'Samsung Electronics India',
        email: 'supply@samsung.in',
        phone: '+91-11-23456789',
        type: ContactType.VENDOR,
        address: 'Sector 62, Noida, UP 201301',
        userId: user.id,
      },
      {
        name: 'Tech Components Distributor',
        email: 'sales@techcomp.in',
        phone: '+91-22-34567890',
        type: ContactType.VENDOR,
        address: 'Lamington Road, Mumbai 400007',
        userId: user.id,
      },
      {
        name: 'Global Electronics Wholesale',
        email: 'wholesale@globalelec.in',
        phone: '+91-11-45678901',
        type: ContactType.VENDOR,
        address: 'Nehru Place, New Delhi 110019',
        userId: user.id,
      },
      {
        name: 'Tech Retail Chain',
        email: 'procurement@techretail.com',
        phone: '+91-22-56789012',
        type: ContactType.CUSTOMER,
        address: 'Phoenix Mall, Lower Parel, Mumbai 400013',
        userId: user.id,
      },
      {
        name: 'Gadget World Stores',
        email: 'orders@gadgetworld.in',
        phone: '+91-11-67890123',
        type: ContactType.CUSTOMER,
        address: 'Select Citywalk, Saket, Delhi 110017',
        userId: user.id,
      },
      {
        name: 'E-Commerce Giant',
        email: 'vendor@ecommerce.in',
        phone: '+91-80-78901234',
        type: ContactType.CUSTOMER,
        address: 'Bangalore, Karnataka',
        userId: user.id,
      },
      {
        name: 'Corporate IT Solutions',
        email: 'it@corpsolutions.com',
        phone: '+91-22-89012345',
        type: ContactType.CUSTOMER,
        address: 'BKC, Mumbai 400051',
        userId: user.id,
      },
    ],
  });

  console.log(`✅ Created contacts`);

  // Get all products for stock operations
  const allProducts = await prisma.product.findMany({
    where: { userId: user.id },
  });
  const allContacts = await prisma.contact.findMany({
    where: { userId: user.id },
  });
  // ===============================
// DEMAND HISTORY GENERATION (60 DAYS)
// ===============================

console.log("📊 Generating demand history...")

const today = new Date()

for (const product of allProducts) {
  for (let i = 60; i >= 1; i--) {
    const date = new Date()
    date.setDate(today.getDate() - i)

    let baseDemand = 5

    if (product.sku.includes("ACC")) baseDemand = 15
    else if (product.sku.includes("COMP")) baseDemand = 12
    else if (product.sku.includes("PHONE")) baseDemand = 10
    else if (product.sku.includes("AUD")) baseDemand = 8
    else if (product.sku.includes("LAP")) baseDemand = 4
    else if (product.sku.includes("CAM")) baseDemand = 3

    const variation = baseDemand * (0.7 + Math.random() * 0.6)
    const trendFactor = 1 + (60 - i) * 0.002

    const finalDemand = Math.floor(variation * trendFactor)

    await prisma.demandHistory.create({
      data: {
        productId: product.id,
        userId: user.id,
        quantity: finalDemand,
        date,
      },
    })
  }
}

console.log("✅ Demand history generated.")

  // Create Initial Stock Levels
  console.log('📊 Creating initial stock levels...');

  const stockData = [
    // Smartphones
    { productSku: 'ELEC-PHONE-IP15P-001', location: mumShelf1, quantity: 25 },
    { productSku: 'ELEC-PHONE-SGS24U-002', location: mumShelf1, quantity: 18 },
    { productSku: 'ELEC-PHONE-GP8P-003', location: mumShelf1, quantity: 12 },

    // Laptops
    { productSku: 'ELEC-LAP-MBP14M3-004', location: mumShelf2, quantity: 8 },
    { productSku: 'ELEC-LAP-DXPS15-005', location: mumShelf2, quantity: 6 },
    { productSku: 'ELEC-LAP-LTX1C-006', location: mumShelf2, quantity: 10 },

    // Audio/Video
    { productSku: 'ELEC-AUD-SWXM5-007', location: mumShelf3, quantity: 45 },
    { productSku: 'ELEC-AUD-APP2-008', location: mumShelf3, quantity: 65 },
    { productSku: 'ELEC-AUD-JBLF6-009', location: mumShelf3, quantity: 80 },
    { productSku: 'ELEC-CAM-CR6M2-010', location: mumShelf3, quantity: 4 },

    // Components
    { productSku: 'ELEC-COMP-ARD-011', location: mumShelf4, quantity: 250 },
    { productSku: 'ELEC-COMP-RPI5-012', location: mumShelf4, quantity: 120 },
    { productSku: 'ELEC-COMP-ESP32-013', location: mumShelf4, quantity: 450 },
    { productSku: 'ELEC-COMP-RESK-014', location: mumShelf4, quantity: 60 },

    // Wearables
    { productSku: 'ELEC-WEAR-AWS9-015', location: mumStock, quantity: 30 },
    { productSku: 'ELEC-WEAR-SGW6-016', location: mumStock, quantity: 22 },
    { productSku: 'ELEC-WEAR-FBC6-017', location: mumStock, quantity: 40 },

    // Accessories
    { productSku: 'ELEC-ACC-USBC-018', location: mumStock, quantity: 500 },
    { productSku: 'ELEC-ACC-APB20-019', location: mumStock, quantity: 180 },
    { productSku: 'ELEC-ACC-SPC-020', location: mumStock, quantity: 650 },
    { productSku: 'ELEC-ACC-SPG-021', location: mumStock, quantity: 850 },

    // Delhi warehouse
    { productSku: 'ELEC-PHONE-IP15P-001', location: delStock, quantity: 15 },
    { productSku: 'ELEC-PHONE-SGS24U-002', location: delStock, quantity: 12 },
    { productSku: 'ELEC-AUD-APP2-008', location: delStock, quantity: 35 },
    { productSku: 'ELEC-ACC-USBC-018', location: delStock, quantity: 300 },
  ];

  for (const item of stockData) {
    const product = allProducts.find(p => p.sku === item.productSku);
    if (product) {
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

  console.log(`✅ Created ${stockData.length} stock level entries`);

  // Create Sample Stock Transfers and Moves
  console.log('🚚 Creating stock transfers...');

  const appleVendor = allContacts.find(c => c.name === 'Apple India Pvt Ltd');
  const samsungVendor = allContacts.find(c => c.name === 'Samsung Electronics India');
  const techRetail = allContacts.find(c => c.name === 'Tech Retail Chain');

  // Receipt 1 - Incoming from Apple
  const receipt1 = await prisma.stockTransfer.create({
    data: {
      reference: 'WH-MUM/IN/0001',
      origin: 'PO-2024-001',
      type: TransferType.INCOMING,
      status: TransferStatus.DONE,
      sourceLocationId: vendorLocation.id,
      destinationLocationId: mumShelf1.id,
      contactId: appleVendor?.id,
      scheduledDate: new Date('2024-11-15'),
      effectiveDate: new Date('2024-11-16'),
      userId: user.id,
    },
  });

  const iphone = allProducts.find(p => p.sku === 'ELEC-PHONE-IP15P-001');
  const airpods = allProducts.find(p => p.sku === 'ELEC-AUD-APP2-008');
  const usbcCable = allProducts.find(p => p.sku === 'ELEC-ACC-USBC-018');

  if (iphone && airpods && usbcCable) {
    await prisma.stockMove.createMany({
      data: [
        {
          transferId: receipt1.id,
          productId: iphone.id,
          quantity: 25,
          sourceLocationId: vendorLocation.id,
          destinationLocationId: mumShelf1.id,
          status: TransferStatus.DONE,
          userId: user.id,
        },
        {
          transferId: receipt1.id,
          productId: airpods.id,
          quantity: 50,
          sourceLocationId: vendorLocation.id,
          destinationLocationId: mumShelf3.id,
          status: TransferStatus.DONE,
          userId: user.id,
        },
        {
          transferId: receipt1.id,
          productId: usbcCable.id,
          quantity: 300,
          sourceLocationId: vendorLocation.id,
          destinationLocationId: mumStock.id,
          status: TransferStatus.DONE,
          userId: user.id,
        },
      ],
    });
  }

  // Receipt 2 - Incoming from Samsung
  const receipt2 = await prisma.stockTransfer.create({
    data: {
      reference: 'WH-MUM/IN/0002',
      origin: 'PO-2024-002',
      type: TransferType.INCOMING,
      status: TransferStatus.DONE,
      sourceLocationId: vendorLocation.id,
      destinationLocationId: mumShelf1.id,
      contactId: samsungVendor?.id,
      scheduledDate: new Date('2024-11-18'),
      effectiveDate: new Date('2024-11-18'),
      userId: user.id,
    },
  });

  const galaxy = allProducts.find(p => p.sku === 'ELEC-PHONE-SGS24U-002');
  const watch = allProducts.find(p => p.sku === 'ELEC-WEAR-SGW6-016');

  if (galaxy && watch) {
    await prisma.stockMove.createMany({
      data: [
        {
          transferId: receipt2.id,
          productId: galaxy.id,
          quantity: 18,
          sourceLocationId: vendorLocation.id,
          destinationLocationId: mumShelf1.id,
          status: TransferStatus.DONE,
          userId: user.id,
        },
        {
          transferId: receipt2.id,
          productId: watch.id,
          quantity: 22,
          sourceLocationId: vendorLocation.id,
          destinationLocationId: mumStock.id,
          status: TransferStatus.DONE,
          userId: user.id,
        },
      ],
    });
  }

  // Delivery 1 - Outgoing to Customer
  const delivery1 = await prisma.stockTransfer.create({
    data: {
      reference: 'WH-MUM/OUT/0001',
      origin: 'SO-2024-001',
      type: TransferType.OUTGOING,
      status: TransferStatus.DONE,
      sourceLocationId: mumShelf1.id,
      destinationLocationId: customerLocation.id,
      contactId: techRetail?.id,
      scheduledDate: new Date('2024-11-20'),
      effectiveDate: new Date('2024-11-20'),
      userId: user.id,
    },
  });

  if (iphone && galaxy) {
    await prisma.stockMove.createMany({
      data: [
        {
          transferId: delivery1.id,
          productId: iphone.id,
          quantity: 10,
          sourceLocationId: mumShelf1.id,
          destinationLocationId: customerLocation.id,
          status: TransferStatus.DONE,
          userId: user.id,
        },
        {
          transferId: delivery1.id,
          productId: galaxy.id,
          quantity: 5,
          sourceLocationId: mumShelf1.id,
          destinationLocationId: customerLocation.id,
          status: TransferStatus.DONE,
          userId: user.id,
        },
      ],
    });
  }

  // Pending Receipt
  const pendingReceipt = await prisma.stockTransfer.create({
    data: {
      reference: 'WH-MUM/IN/0003',
      origin: 'PO-2024-003',
      type: TransferType.INCOMING,
      status: TransferStatus.WAITING,
      sourceLocationId: vendorLocation.id,
      destinationLocationId: mumShelf2.id,
      contactId: allContacts.find(c => c.name === 'Global Electronics Wholesale')?.id,
      scheduledDate: new Date('2024-11-25'),
      userId: user.id,
    },
  });

  const macbook = allProducts.find(p => p.sku === 'ELEC-LAP-MBP14M3-004');
  const dell = allProducts.find(p => p.sku === 'ELEC-LAP-DXPS15-005');

  if (macbook && dell) {
    await prisma.stockMove.createMany({
      data: [
        {
          transferId: pendingReceipt.id,
          productId: macbook.id,
          quantity: 10,
          sourceLocationId: vendorLocation.id,
          destinationLocationId: mumShelf2.id,
          status: TransferStatus.WAITING,
          userId: user.id,
        },
        {
          transferId: pendingReceipt.id,
          productId: dell.id,
          quantity: 8,
          sourceLocationId: vendorLocation.id,
          destinationLocationId: mumShelf2.id,
          status: TransferStatus.WAITING,
          userId: user.id,
        },
      ],
    });
  }

  // Internal Transfer
  const internalTransfer = await prisma.stockTransfer.create({
    data: {
      reference: 'WH-INT/0001',
      type: TransferType.INTERNAL,
      status: TransferStatus.READY,
      sourceLocationId: mumStock.id,
      destinationLocationId: delStock.id,
      scheduledDate: new Date('2024-11-23'),
      userId: user.id,
    },
  });

  const powerbank = allProducts.find(p => p.sku === 'ELEC-ACC-APB20-019');
  const phoneCase = allProducts.find(p => p.sku === 'ELEC-ACC-SPC-020');

  if (powerbank && phoneCase) {
    await prisma.stockMove.createMany({
      data: [
        {
          transferId: internalTransfer.id,
          productId: powerbank.id,
          quantity: 50,
          sourceLocationId: mumStock.id,
          destinationLocationId: delStock.id,
          status: TransferStatus.READY,
          userId: user.id,
        },
        {
          transferId: internalTransfer.id,
          productId: phoneCase.id,
          quantity: 100,
          sourceLocationId: mumStock.id,
          destinationLocationId: delStock.id,
          status: TransferStatus.READY,
          userId: user.id,
        },
      ],
    });
  }

  // ===============================
  // ADD MORE DEMO DATA FOR SHOWCASE
  // ===============================

  console.log('📈 Adding more demo data for showcasing...');

  // Update stock levels to create LOW STOCK ALERTS
  const lowStockUpdates = [
    { sku: 'ELEC-LAP-MBP14M3-004', quantity: 2 }, // Below min of 3
    { sku: 'ELEC-PHONE-GP8P-003', quantity: 1 }, // Below min of 3
    { sku: 'ELEC-CAM-CR6M2-010', quantity: 1 }, // Below min of 2
    { sku: 'ELEC-WEAR-SGW6-016', quantity: 3 }, // Below min of 5
    { sku: 'ELEC-LAP-DXPS15-005', quantity: 1 }, // Below min of 2
  ];

  for (const item of lowStockUpdates) {
    const product = allProducts.find(p => p.sku === item.sku);
    const location = item.sku.includes('LAP') ? mumShelf2 : item.sku.includes('CAM') ? mumShelf3 : item.sku.includes('WEAR') ? mumStock : mumShelf1;
    
    if (product) {
      await prisma.stockLevel.updateMany({
        where: {
          productId: product.id,
          locationId: location.id,
        },
        data: {
          quantity: item.quantity,
        },
      });
    }
  }

  console.log('✅ Updated stock levels for low stock alerts');

  // Add DELIVERY orders (WAITING status)
  console.log('📦 Creating delivery orders (WAITING)...');

  const gadgetWorld = allContacts.find(c => c.name === 'Gadget World Stores');
  const ecommerce = allContacts.find(c => c.name === 'E-Commerce Giant');
  const corporateIT = allContacts.find(c => c.name === 'Corporate IT Solutions');

  const delivery2 = await prisma.stockTransfer.create({
    data: {
      reference: 'WH-MUM/OUT/0002',
      origin: 'SO-2024-002',
      type: TransferType.OUTGOING,
      status: TransferStatus.WAITING,
      sourceLocationId: mumShelf3.id,
      destinationLocationId: customerLocation.id,
      contactId: gadgetWorld?.id,
      scheduledDate: new Date('2024-11-27'),
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

  const delivery3 = await prisma.stockTransfer.create({
    data: {
      reference: 'WH-MUM/OUT/0003',
      origin: 'SO-2024-003',
      type: TransferType.OUTGOING,
      status: TransferStatus.WAITING,
      sourceLocationId: mumShelf4.id,
      destinationLocationId: customerLocation.id,
      contactId: techRetail?.id,
      scheduledDate: new Date('2024-11-28'),
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

  // Add READY delivery (prepared but not dispatched)
  const delivery4 = await prisma.stockTransfer.create({
    data: {
      reference: 'WH-MUM/OUT/0004',
      origin: 'SO-2024-004',
      type: TransferType.OUTGOING,
      status: TransferStatus.READY,
      sourceLocationId: mumShelf1.id,
      destinationLocationId: customerLocation.id,
      contactId: ecommerce?.id,
      scheduledDate: new Date('2024-11-26'),
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
          quantity: 8,
          sourceLocationId: mumShelf1.id,
          destinationLocationId: customerLocation.id,
          status: TransferStatus.READY,
          userId: user.id,
        },
        {
          transferId: delivery4.id,
          productId: screenProt.id,
          quantity: 40,
          sourceLocationId: mumStock.id,
          destinationLocationId: customerLocation.id,
          status: TransferStatus.READY,
          userId: user.id,
        },
      ],
    });
  }

  // Add LATE delivery (scheduled date is in past)
  const lateDelivery = await prisma.stockTransfer.create({
    data: {
      reference: 'WH-MUM/OUT/0005',
      origin: 'SO-2024-005',
      type: TransferType.OUTGOING,
      status: TransferStatus.WAITING,
      sourceLocationId: mumShelf2.id,
      destinationLocationId: customerLocation.id,
      contactId: corporateIT?.id,
      scheduledDate: new Date('2024-11-15'), // Past date - LATE!
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
          quantity: 5,
          sourceLocationId: mumShelf2.id,
          destinationLocationId: customerLocation.id,
          status: TransferStatus.WAITING,
          userId: user.id,
        },
        {
          transferId: lateDelivery.id,
          productId: fitbit.id,
          quantity: 12,
          sourceLocationId: mumStock.id,
          destinationLocationId: customerLocation.id,
          status: TransferStatus.WAITING,
          userId: user.id,
        },
      ],
    });
  }

  // Add more INCOMING receipts
  const receipt3 = await prisma.stockTransfer.create({
    data: {
      reference: 'WH-MUM/IN/0004',
      origin: 'PO-2024-004',
      type: TransferType.INCOMING,
      status: TransferStatus.READY,
      sourceLocationId: vendorLocation.id,
      destinationLocationId: mumShelf3.id,
      contactId: allContacts.find(c => c.name === 'Tech Components Distributor')?.id,
      scheduledDate: new Date('2024-11-24'),
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
          quantity: 15,
          sourceLocationId: vendorLocation.id,
          destinationLocationId: mumStock.id,
          status: TransferStatus.READY,
          userId: user.id,
        },
        {
          transferId: receipt3.id,
          productId: camera.id,
          quantity: 3,
          sourceLocationId: vendorLocation.id,
          destinationLocationId: mumShelf3.id,
          status: TransferStatus.READY,
          userId: user.id,
        },
      ],
    });
  }

  // Add LATE incoming receipt (waiting for a long time)
  const lateReceipt = await prisma.stockTransfer.create({
    data: {
      reference: 'WH-MUM/IN/0005',
      origin: 'PO-2024-005',
      type: TransferType.INCOMING,
      status: TransferStatus.WAITING,
      sourceLocationId: vendorLocation.id,
      destinationLocationId: mumShelf2.id,
      contactId: allContacts.find(c => c.name === 'Global Electronics Wholesale')?.id,
      scheduledDate: new Date('2024-10-25'), // OLD - LATE!
      userId: user.id,
    },
  });

  const dell2 = allProducts.find(p => p.sku === 'ELEC-LAP-DXPS15-005');
  const raspi = allProducts.find(p => p.sku === 'ELEC-COMP-RPI5-012');

  if (dell2 && raspi) {
    await prisma.stockMove.createMany({
      data: [
        {
          transferId: lateReceipt.id,
          productId: dell2.id,
          quantity: 6,
          sourceLocationId: vendorLocation.id,
          destinationLocationId: mumShelf2.id,
          status: TransferStatus.WAITING,
          userId: user.id,
        },
        {
          transferId: lateReceipt.id,
          productId: raspi.id,
          quantity: 40,
          sourceLocationId: vendorLocation.id,
          destinationLocationId: mumShelf4.id,
          status: TransferStatus.WAITING,
          userId: user.id,
        },
      ],
    });
  }

  // Add more INTERNAL transfers
  const internalTransfer2 = await prisma.stockTransfer.create({
    data: {
      reference: 'WH-INT/0002',
      type: TransferType.INTERNAL,
      status: TransferStatus.WAITING,
      sourceLocationId: mumShelf3.id,
      destinationLocationId: delStock.id,
      scheduledDate: new Date('2024-11-25'),
      userId: user.id,
    },
  });

  if (sony && appwatch) {
    await prisma.stockMove.createMany({
      data: [
        {
          transferId: internalTransfer2.id,
          productId: sony.id,
          quantity: 20,
          sourceLocationId: mumShelf3.id,
          destinationLocationId: delStock.id,
          status: TransferStatus.WAITING,
          userId: user.id,
        },
        {
          transferId: internalTransfer2.id,
          productId: appwatch.id,
          quantity: 12,
          sourceLocationId: mumStock.id,
          destinationLocationId: delStock.id,
          status: TransferStatus.WAITING,
          userId: user.id,
        },
      ],
    });
  }

  console.log('✅ Created all delivery orders and receipts');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`   User: ${user.email}`);
  console.log(`   Password: Vivek@123`);
  console.log(`   Role: ${user.role}`);
  console.log(`   Categories: 7 (Electronics with subcategories)`);
  console.log(`   Products: ${allProducts.length}`);
  console.log(`   Warehouses: 2`);
  console.log(`   Locations: 9`);
  console.log(`   Contacts: ${allContacts.length}`);
  console.log(`   Stock Levels: ${stockData.length}`);
  console.log(`   Stock Transfers: 12 (6 Incoming, 5 Outgoing, 2 Internal)`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

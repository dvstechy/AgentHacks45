import { PrismaClient, UserRole, ProductType, LocationType, TransferType, TransferStatus, ContactType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  console.log('🗑️  Cleaning existing data...');
  await prisma.stockMove.deleteMany();
  await prisma.stockTransfer.deleteMany();
  await prisma.stockLevel.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.location.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.user.deleteMany();

  // Create User
  console.log('👤 Creating user...');
  const hashedPassword = await bcrypt.hash('Vivek@123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'bhosvivek123@gmail.com',
      password: hashedPassword,
      name: 'Vivek Bhos',
      role: UserRole.ADMIN,
    },
  });

  // Create Categories with hierarchy
  console.log('📂 Creating categories...');

  // Main Electronics Category
  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      description: 'All electronic products and components',
      userId: user.id,
    },
  });

  // Subcategories
  const smartphones = await prisma.category.create({
    data: {
      name: 'Smartphones',
      description: 'Mobile phones and accessories',
      parentId: electronics.id,
      userId: user.id,
    },
  });

  const laptops = await prisma.category.create({
    data: {
      name: 'Laptops & Computers',
      description: 'Laptops, desktops and computer accessories',
      parentId: electronics.id,
      userId: user.id,
    },
  });

  const audioVideo = await prisma.category.create({
    data: {
      name: 'Audio & Video',
      description: 'Headphones, speakers, cameras and accessories',
      parentId: electronics.id,
      userId: user.id,
    },
  });

  const components = await prisma.category.create({
    data: {
      name: 'Electronic Components',
      description: 'PCBs, chips, resistors, capacitors and other components',
      parentId: electronics.id,
      userId: user.id,
    },
  });

  const wearables = await prisma.category.create({
    data: {
      name: 'Wearables',
      description: 'Smartwatches, fitness trackers and wearable tech',
      parentId: electronics.id,
      userId: user.id,
    },
  });

  const accessories = await prisma.category.create({
    data: {
      name: 'Accessories',
      description: 'Cables, chargers, cases and other accessories',
      parentId: electronics.id,
      userId: user.id,
    },
  });

  // Create Products
  console.log('📦 Creating products...');

  // Smartphones
  const products = await prisma.product.createMany({
    data: [
      // Smartphones
      {
        name: 'iPhone 15 Pro',
        sku: 'ELEC-PHONE-IP15P-001',
        description: 'Apple iPhone 15 Pro 256GB - Titanium Black',
        type: ProductType.STORABLE,
        unitOfMeasure: 'Units',
        costPrice: 85000.00,
        salesPrice: 129900.00,
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
        costPrice: 95000.00,
        salesPrice: 134999.00,
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
        costPrice: 65000.00,
        salesPrice: 89999.00,
        categoryId: smartphones.id,
        minStock: 3,
        maxStock: 30,
        userId: user.id,
      },

      // Laptops & Computers
      {
        name: 'MacBook Pro 14" M3',
        sku: 'ELEC-LAP-MBP14M3-004',
        description: 'Apple MacBook Pro 14" M3 Chip 16GB 512GB SSD',
        type: ProductType.STORABLE,
        unitOfMeasure: 'Units',
        costPrice: 145000.00,
        salesPrice: 199900.00,
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
        costPrice: 125000.00,
        salesPrice: 169999.00,
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
        costPrice: 95000.00,
        salesPrice: 134999.00,
        categoryId: laptops.id,
        minStock: 2,
        maxStock: 15,
        userId: user.id,
      },

      // Audio & Video
      {
        name: 'Sony WH-1000XM5',
        sku: 'ELEC-AUD-SWXM5-007',
        description: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
        type: ProductType.STORABLE,
        unitOfMeasure: 'Units',
        costPrice: 18000.00,
        salesPrice: 29990.00,
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
        costPrice: 16000.00,
        salesPrice: 24900.00,
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
        costPrice: 7500.00,
        salesPrice: 12999.00,
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
        costPrice: 185000.00,
        salesPrice: 249999.00,
        categoryId: audioVideo.id,
        minStock: 2,
        maxStock: 10,
        userId: user.id,
      },

      // Electronic Components
      {
        name: 'Arduino Uno R3',
        sku: 'ELEC-COMP-ARD-011',
        description: 'Arduino Uno R3 Microcontroller Board',
        type: ProductType.STORABLE,
        unitOfMeasure: 'Units',
        costPrice: 450.00,
        salesPrice: 899.00,
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
        costPrice: 5500.00,
        salesPrice: 8999.00,
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
        costPrice: 350.00,
        salesPrice: 699.00,
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
        costPrice: 250.00,
        salesPrice: 499.00,
        categoryId: components.id,
        minStock: 20,
        maxStock: 100,
        userId: user.id,
      },

      // Wearables
      {
        name: 'Apple Watch Series 9',
        sku: 'ELEC-WEAR-AWS9-015',
        description: 'Apple Watch Series 9 GPS 45mm Midnight Aluminum',
        type: ProductType.STORABLE,
        unitOfMeasure: 'Units',
        costPrice: 32000.00,
        salesPrice: 45900.00,
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
        costPrice: 22000.00,
        salesPrice: 32999.00,
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
        costPrice: 9000.00,
        salesPrice: 14999.00,
        categoryId: wearables.id,
        minStock: 10,
        maxStock: 80,
        userId: user.id,
      },

      // Accessories
      {
        name: 'USB-C to Lightning Cable',
        sku: 'ELEC-ACC-USBC-018',
        description: 'Apple USB-C to Lightning Cable 1m',
        type: ProductType.STORABLE,
        unitOfMeasure: 'Units',
        costPrice: 800.00,
        salesPrice: 1900.00,
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
        costPrice: 2500.00,
        salesPrice: 4999.00,
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
        costPrice: 450.00,
        salesPrice: 1299.00,
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
        costPrice: 150.00,
        salesPrice: 499.00,
        categoryId: accessories.id,
        minStock: 200,
        maxStock: 1500,
        userId: user.id,
      },
    ],
  });

  console.log(`✅ Created ${products.count} products`);

  // Create Warehouses
  console.log('🏭 Creating warehouses...');

  const mainWarehouse = await prisma.warehouse.create({
    data: {
      name: 'Mumbai Main Warehouse',
      shortCode: 'WH-MUM',
      address: 'Andheri East, Mumbai, Maharashtra 400069',
      userId: user.id,
    },
  });

  const delhiWarehouse = await prisma.warehouse.create({
    data: {
      name: 'Delhi Distribution Center',
      shortCode: 'WH-DEL',
      address: 'Connaught Place, New Delhi 110001',
      userId: user.id,
    },
  });

  // Create Locations with hierarchy
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

  const inventoryLoss = await prisma.location.create({
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
  const allProducts = await prisma.product.findMany();
  const allContacts = await prisma.contact.findMany();

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

  console.log('✅ Created stock transfers and moves');

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
  console.log(`   Stock Transfers: 5`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

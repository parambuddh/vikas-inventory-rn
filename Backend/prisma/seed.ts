import { PrismaClient, Role, UnitType, InventoryMovementType, OrderStatus, PaymentStatus, PaymentMode, VisitStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting DB Seed...');

  // 1. CLEAR DATABASE (in correct dependency order)
  console.log('Clearing old data...');
  await prisma.paymentAllocation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // 2. CREATE USERS
  console.log('Creating users...');
  const passwordHash = await bcrypt.hash('Password123', 10);

  const admin = await prisma.user.create({
    data: {
      first_name: 'Vikas',
      last_name: 'Admin',
      phone: '9876543210',
      email: 'admin@vikasmarketing.com',
      password_hash: passwordHash,
      role: Role.ADMIN,
    }
  });

  const salesman1 = await prisma.user.create({
    data: {
      first_name: 'Rahul',
      last_name: 'Sharma',
      phone: '9876543211',
      password_hash: passwordHash,
      role: Role.SALESMAN,
      created_by: admin.id,
    }
  });

  const salesman2 = await prisma.user.create({
    data: {
      first_name: 'Amit',
      last_name: 'Patel',
      phone: '9876543212',
      password_hash: passwordHash,
      role: Role.SALESMAN,
      created_by: admin.id,
    }
  });

  // 3. CREATE CUSTOMERS (Realistic Indian Shops)
  console.log('Creating customers...');
  const shopNames = [
    'Shreeji Traders', 'Krishna Supermart', 'Ambica Provision Store', 
    'Mahalaxmi Kirana', 'Ganesh General Store', 'Shiv Shakti Enterprises',
    'Bhavani Mini Mart', 'Om Sai Retail', 'Jain Grocery Store', 'Balaji Traders'
  ];

  const customers = [];
  for (let i = 0; i < 10; i++) {
    customers.push(
      await prisma.customer.create({
        data: {
          shop_name: shopNames[i],
          owner_name: `Owner ${i + 1}`,
          phone: `99988877${i.toString().padStart(2, '0')}`,
          address: `Shop No. ${i + 1}, Main Market Road, Ahmedabad`,
          area: ['Bopal', 'Vastrapur', 'Navrangpura', 'Satellite', 'Maninagar'][i % 5],
          latitude: 23.0225 + (Math.random() * 0.05),
          longitude: 72.5714 + (Math.random() * 0.05),
          created_by: i % 2 === 0 ? salesman1.id : salesman2.id,
        }
      })
    );
  }

  // 4. CREATE PRODUCTS
  console.log('Creating products...');
  const products = [
    { name: 'Premium Rice 25kg', sku: 'RICE-25KG-PRM', pp: 1200, sp: 1450, gst: 0, stock: 50, unit: UnitType.BOX },
    { name: 'Toor Dal 1kg', sku: 'DAL-TOOR-1KG', pp: 120, sp: 145, gst: 5, stock: 200, unit: UnitType.KG },
    { name: 'Sunflower Oil 15L Tin', sku: 'OIL-SUN-15L', pp: 1800, sp: 2100, gst: 5, stock: -5, unit: UnitType.BOX }, // negative stock demo
    { name: 'Wheat Flour 10kg', sku: 'FLOUR-WHEAT-10K', pp: 350, sp: 420, gst: 0, stock: 15, unit: UnitType.PCS }, // low stock demo
    { name: 'Sugar 50kg Sack', sku: 'SUGAR-50KG', pp: 1900, sp: 2150, gst: 5, stock: 100, unit: UnitType.BOX },
    { name: 'Besan 500g', sku: 'BESAN-500G', pp: 45, sp: 60, gst: 5, stock: 500, unit: UnitType.GRAM },
    { name: 'Mustard Oil 1L', sku: 'OIL-MUST-1L', pp: 140, sp: 165, gst: 5, stock: 300, unit: UnitType.LITER },
  ];

  const dbProducts = [];
  for (const p of products) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        sku: p.sku,
        purchase_price: p.pp,
        selling_price: p.sp,
        gst_percentage: p.gst,
        stock_quantity: p.stock,
        unit_type: p.unit,
        low_stock_threshold: 20,
        created_by: admin.id,
      }
    });
    dbProducts.push(product);

    // Initial Inventory Log
    await prisma.inventoryLog.create({
      data: {
        product_id: product.id,
        type: InventoryMovementType.STOCK_ADDED,
        quantity_before: 0,
        quantity_changed: p.stock,
        quantity_after: p.stock,
        notes: 'Initial opening stock',
        created_by: admin.id,
      }
    });
  }

  // 5. CREATE VISITS
  console.log('Creating visits...');
  // Completed, Productive
  const visit1 = await prisma.visit.create({
    data: {
      salesman_id: salesman1.id,
      customer_id: customers[0].id,
      status: VisitStatus.COMPLETED,
      checkin_latitude: 23.025,
      checkin_longitude: 72.575,
      checkout_latitude: 23.025,
      checkout_longitude: 72.575,
      checkin_time: new Date(Date.now() - 86400000 * 2), // 2 days ago
      checkout_time: new Date(Date.now() - 86400000 * 2 + 1800000), // 30 mins later
      visit_duration: 1800,
      order_created: true,
      notes: 'Collected pending order',
    }
  });

  // Completed, Non-Productive
  await prisma.visit.create({
    data: {
      salesman_id: salesman2.id,
      customer_id: customers[1].id,
      status: VisitStatus.COMPLETED,
      checkin_time: new Date(Date.now() - 86400000), // 1 day ago
      checkout_time: new Date(Date.now() - 86400000 + 600000), // 10 mins
      visit_duration: 600,
      order_created: false,
      notes: 'Shop was closed today',
    }
  });

  // Active Visit
  await prisma.visit.create({
    data: {
      salesman_id: salesman1.id,
      customer_id: customers[2].id,
      status: VisitStatus.ACTIVE,
      checkin_time: new Date(),
    }
  });

  // 6. CREATE ORDERS & ITEMS
  console.log('Creating orders...');
  
  // Order 1: Delivered & Fully Paid
  const order1 = await prisma.order.create({
    data: {
      order_number: 'ORD-100001',
      customer_id: customers[0].id,
      status: OrderStatus.DELIVERED,
      payment_status: PaymentStatus.PAID,
      total_amount: 5800, // 4 * 1450
      paid_amount: 5800,
      pending_amount: 0,
      created_by: salesman1.id,
      confirmed_at: new Date(Date.now() - 86400000 * 2),
      delivered_at: new Date(Date.now() - 86400000),
      items: {
        create: [
          {
            product_id: dbProducts[0].id,
            product_name: dbProducts[0].name,
            quantity: 4,
            unit_type: dbProducts[0].unit_type,
            price_per_unit: 1450,
            gst_percentage: 0,
            gst_amount: 0,
            subtotal: 5800,
            total: 5800,
          }
        ]
      }
    }
  });

  // Order 2: Confirmed & Partially Paid (Decimal quantity)
  const subtotal2 = 145 * 12.5; // 1812.5
  const gst2 = subtotal2 * 0.05; // 90.625
  const total2 = subtotal2 + gst2; // 1903.125
  
  const order2 = await prisma.order.create({
    data: {
      order_number: 'ORD-100002',
      customer_id: customers[0].id,
      status: OrderStatus.CONFIRMED,
      payment_status: PaymentStatus.PARTIAL,
      total_amount: total2,
      paid_amount: 1000,
      pending_amount: total2 - 1000,
      created_by: salesman1.id,
      confirmed_at: new Date(),
      items: {
        create: [
          {
            product_id: dbProducts[1].id, // Toor Dal
            product_name: dbProducts[1].name,
            quantity: 12.5, // Decimal support
            unit_type: dbProducts[1].unit_type,
            price_per_unit: 145,
            gst_percentage: 5,
            gst_amount: gst2,
            subtotal: subtotal2,
            total: total2,
          }
        ]
      }
    }
  });

  // Order 3: Pending
  const order3 = await prisma.order.create({
    data: {
      order_number: 'ORD-100003',
      customer_id: customers[3].id,
      status: OrderStatus.PENDING,
      payment_status: PaymentStatus.UNPAID,
      total_amount: 4200,
      paid_amount: 0,
      pending_amount: 4200,
      created_by: salesman2.id,
      items: {
        create: [
          {
            product_id: dbProducts[3].id,
            product_name: dbProducts[3].name,
            quantity: 10,
            unit_type: dbProducts[3].unit_type,
            price_per_unit: 420,
            gst_percentage: 0,
            gst_amount: 0,
            subtotal: 4200,
            total: 4200,
          }
        ]
      }
    }
  });

  // 7. CREATE PAYMENTS
  console.log('Creating payments...');
  
  // Payment 1: Full payment for Order 1
  await prisma.payment.create({
    data: {
      payment_number: 'PAY-200001',
      customer_id: customers[0].id,
      amount: 5800,
      payment_mode: PaymentMode.UPI,
      payment_date: new Date(Date.now() - 86400000),
      reference_number: 'UPI987654321',
      notes: 'Full payment received',
      created_by: admin.id,
      allocations: {
        create: [
          { order_id: order1.id, allocated_amount: 5800 }
        ]
      }
    }
  });

  // Payment 2: Partial advance for Order 2
  await prisma.payment.create({
    data: {
      payment_number: 'PAY-200002',
      customer_id: customers[0].id,
      amount: 1000,
      payment_mode: PaymentMode.CASH,
      payment_date: new Date(),
      notes: 'Cash advance against new order',
      created_by: admin.id,
      allocations: {
        create: [
          { order_id: order2.id, allocated_amount: 1000 }
        ]
      }
    }
  });

  // Customer Totals Updates
  console.log('Updating customer totals...');
  await prisma.customer.update({
    where: { id: customers[0].id },
    data: {
      total_orders_amount: 5800 + total2,
      total_received_amount: 6800,
      pending_amount: (5800 + total2) - 6800,
    }
  });

  await prisma.customer.update({
    where: { id: customers[3].id },
    data: {
      total_orders_amount: 4200,
      total_received_amount: 0,
      pending_amount: 4200,
    }
  });

  console.log('Seed completed successfully! 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

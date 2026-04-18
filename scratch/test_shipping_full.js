import { calculateShippingRates } from '../lib/shipping.js';
import prisma from '../lib/prisma.js';

async function test() {
    console.log('--- Testing Shipping Logic ---');

    // Fetch a real product from DB
    const product = await prisma.product.findFirst();
    if (!product) {
        console.error('No products found in DB. Please run seed.js first.');
        return;
    }

    const items = [
        { productId: product.id, quantity: 1, price: product.price, weight: product.weight }
    ];

    // Test Case 1: Deliverable Address (India)
    console.log('\nCase 1: Standard delivery to Mumbai (400001)');
    const res1 = await calculateShippingRates(items, { pincode: '400001', country: 'India' });
    console.log('Success:', res1.success);
    console.log('Options:', res1.shippingOptions);

    // Test Case 2: Free Shipping (Order > 1000)
    console.log('\nCase 2: Free Shipping (Bulk order - 30 items @ 40 = 1200)');
    const bulkItems = [
        { productId: product.id, quantity: 30, price: product.price, weight: product.weight }
    ];
    const res2 = await calculateShippingRates(bulkItems, { pincode: '400001', country: 'India' });
    console.log('Success:', res2.success);
    console.log('Options:', res2.shippingOptions.map(o => `${o.name}: ₹${o.price}`));

    // Test Case 3: Local Delivery (Surat 395006)
    console.log('\nCase 3: Hyperlocal Delivery to Surat (395006 - 10 items @ 40 = 400)');
    const localItems = [
        { productId: product.id, quantity: 10, price: product.price, weight: product.weight }
    ];
    const res3 = await calculateShippingRates(localItems, { pincode: '395006', country: 'India' });
    console.log('Success:', res3.success);
    console.log('Local Delivery included:', res3.shippingOptions.some(o => o.name === 'Local Delivery'));
    console.log('All Options:', res3.shippingOptions.map(o => o.name));

    // Test Case 4: Non-deliverable Address (USA)
    console.log('\nCase 4: International Delivery (USA) - Should be non-deliverable');
    const res4 = await calculateShippingRates(items, { pincode: '90001', country: 'USA' });
    console.log('Success:', res4.success);
    console.log('Options:', res4.shippingOptions); // Should be empty

    await prisma.$disconnect();
}

test();

const { calculateShippingRates } = require('./lib/shipping');
const prisma = require('./lib/prisma');

async function test() {
    console.log("Testing Shipping Engine...");
    const items = [
        { productId: 'clun60wzf0001jz08x876abc1', quantity: 1, price: 500, weight: 1.5 }
    ];
    const address = { pincode: '394107', country: 'India' };
    
    const result = await calculateShippingRates(items, address);
    console.log("Result:", JSON.stringify(result, null, 2));
    process.exit(0);
}

// test(); 
// Not running yet as I need to be sure about product IDs.

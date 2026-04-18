import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateShippingRates } from '@/lib/shipping';

export async function POST(request) {
    try {
        const body = await request.json();
        
        const { 
            customerId, 
            customerName,
            customerPhone,
            items, 
            shippingAddress, 
            pincode,
            state, // Optional but helpful
            country, // Optional
            subtotal, 
            taxAmount, 
            shippingCharge, 
            shippingMethodName,
            total 
        } = body;

        // 1. Validate basic inputs
        if (!items || items.length === 0) {
            return NextResponse.json({ success: false, message: 'Cart is empty' }, { status: 400 });
        }

        if (!pincode) {
            return NextResponse.json({ success: false, message: 'Pincode is required for shipping' }, { status: 400 });
        }

        // 2. Server-side Shipping Validation
        const shippingResult = await calculateShippingRates(items, { pincode, state, country });
        
        if (!shippingResult.success) {
            return NextResponse.json({ success: false, message: 'Could not calculate shipping' }, { status: 400 });
        }

        if (!shippingResult.addressMatched?.areaName) {
            return NextResponse.json({
                success: false,
                message: 'Shipping is not available for this pincode'
            }, { status: 400 });
        }

        // Standardize on static 30 INR charge for now as per requirement
        const isStaticRateValid = Number(shippingCharge) === 30;
        if (!isStaticRateValid) {
            return NextResponse.json({ 
                success: false, 
                message: 'Invalid shipping charge. Standard rate is ₹30.' 
            }, { status: 400 });
        }

        // 3. Create Order in transaction
        const result = await prisma.$transaction(async (tx) => {
            // A. Resolve REAL Customer ID (User ID -> Customer ID)
            let realCustomerId = null;
            if (customerId) {
                const customerRecord = await tx.customer.findUnique({
                    where: { userId: customerId },
                    select: { id: true }
                });

                if (customerRecord) {
                    realCustomerId = customerRecord.id;
                } else {
                    // Auto-provision Customer profile if missing for this User
                    const newCustomer = await tx.customer.create({
                        data: { userId: customerId },
                        select: { id: true }
                    });
                    realCustomerId = newCustomer.id;
                }
            }

            // B. Validate/resolve product IDs (some clients may accidentally send slugs)
            const requestedProductRefs = Array.from(
                new Set(items.map((item) => item?.productId).filter(Boolean))
            );

            if (requestedProductRefs.length === 0) {
                throw new Error("Cart items are missing productId");
            }

            const products = await tx.product.findMany({
                where: {
                    OR: [
                        { id: { in: requestedProductRefs } },
                        { slug: { in: requestedProductRefs } }
                    ]
                },
                select: { id: true, slug: true }
            });

            const productIdLookup = new Map();
            for (const p of products) {
                productIdLookup.set(p.id, p.id);
                productIdLookup.set(p.slug, p.id);
            }

            const normalizedItems = items.map((item) => {
                const resolvedProductId = productIdLookup.get(item.productId);
                if (!resolvedProductId) {
                    throw new Error(`Invalid productId (product not found): ${item.productId}`);
                }
                return { ...item, productId: resolvedProductId };
            });

            // C. Generate Order Number (#1000 series)
            const lastOrder = await tx.order.findFirst({
                orderBy: { createdAt: 'desc' },
                select: { orderNumber: true }
            });

            let nextNumber = 1000;
            if (lastOrder?.orderNumber) {
                const lastNum = parseInt(lastOrder.orderNumber.replace('#', ''));
                if (!isNaN(lastNum)) {
                    nextNumber = lastNum + 1;
                }
            }
            const orderNumber = `#${nextNumber}`;

            const order = await tx.order.create({
                data: {
                    orderNumber,
                    customerId: realCustomerId, 
                    customerName,
                    customerPhone,
                    total: Number(total),
                    subtotal: Number(subtotal),
                    taxAmount: Number(taxAmount),
                    shippingCharge: Number(shippingCharge),
                    shippingMethodName: shippingMethodName || "Standard Shipping",
                    shippingAddress: shippingAddress,
                    pincode: pincode,
                    status: 'PENDING',
                    items: {
                        create: normalizedItems.map((item, idx) => ({
                            productId: item.productId,
                            quantity: Number(item.quantity),
                            price: Number(item.price),
                            taxAmount: (Number(item.price) * Number(item.quantity) * 0.05),
                            taxRate: 5.0
                        }))
                    }
                },
                include: {
                    items: true
                }
            });

            return order;
        }, {
            timeout: 15000 
        });

        return NextResponse.json({
            success: true,
            message: 'Order placed successfully',
            orderId: result.id,
            orderNumber: result.orderNumber
        });

    } catch (error) {
        console.error('Order placement error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to place order: ' + error.message },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';

// ✅ GET Single Order with Metafields
export async function GET(req, { params }) {
    const { id } = await params;

    try {
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                customer: {
                    include: {
                        user: true,
                        addresses: true
                    }
                },
                items: {
                    include: {
                        product: true
                    }
                },
                metafields: true, // Include metafields
            }
        });

        if (!order) {
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            );
        }

        const formatted = {
            id: order.id,
            customerId: order.customerId,
            customerName: order.customer?.user?.name || 'Unknown Customer',
            customerEmail: order.customer?.user?.email || 'N/A',
            customerPhone: order.customer?.user?.phone || 'N/A',
            addresses: order.customer?.addresses || [],
            total: order.total,
            status: order.status,
            createdAt: order.createdAt,
            metafields: order.metafields || [], // Pass metafields
            items: order.items.map(item => ({
                id: item.id,
                productId: item.productId,
                productName: item.product?.name || 'Unknown Product',
                productImage: item.product?.images?.[0]?.url || null,
                quantity: item.quantity,
                price: item.price,
                total: item.quantity * item.price
            }))
        };

        return NextResponse.json({
            success: true,
            data: formatted
        });
    } catch (error) {
        console.error('GET order error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch order', details: error.message },
            { status: 500 }
        );
    }
}

// ✅ PUT Update Order with Metafields Transaction
export async function PUT(req, { params }) {
    const { id } = await params;

    try {
        const body = await req.json();
        const { status, trackingNumber, trackingUrl, carrierName, metafields } = body;

        const result = await prisma.$transaction(async (tx) => {
            // 1. Sync Metafields
            if (metafields !== undefined) {
                await tx.orderMetafield.deleteMany({
                    where: { orderId: id }
                });
            }

            // Auto-update status to SHIPPED if tracking info is provided
            let finalStatus = status;
            const existingOrder = await tx.order.findUnique({ where: { id } });
            if (!existingOrder) throw new Error('Order not found');

            if ((trackingNumber || carrierName) && (!status || status === 'PENDING' || status === 'PROCESSING')) {
                finalStatus = 'SHIPPED';
            }

            // 2. Update Order
            const updated = await tx.order.update({
                where: { id },
                data: { 
                    ...(finalStatus && { status: finalStatus }),
                    ...(trackingNumber !== undefined && { trackingNumber }),
                    ...(trackingUrl !== undefined && { trackingUrl }),
                    ...(carrierName !== undefined && { carrierName }),
                    ...((trackingNumber || carrierName) && { shippedAt: new Date() }),
                    metafields: metafields && metafields.length > 0 ? {
                        create: metafields.map(m => ({
                            namespace: m.namespace || 'custom',
                            key: m.key,
                            value: String(m.value ?? ''),
                            type: m.type || 'text',
                        }))
                    } : undefined
                },
                include: {
                    items: true,
                    metafields: true
                }
            });

            return updated;
        });

        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('PUT order error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update order', details: error.message },
            { status: 500 }
        );
    }
}

// ✅ DELETE Order
export async function DELETE(req, { params }) {
    const { id } = await params;

    try {
        // Manually delete order items first to avoid foreign key constraints 
        await prisma.orderItem.deleteMany({
            where: { orderId: id }
        });

        await prisma.order.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        console.error('DELETE order error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete order', details: error.message },
            { status: 500 }
        );
    }
}

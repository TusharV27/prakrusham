import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const order = await prisma.order.findUnique({
            where: { id },
            select: {
                id: true,
                status: true,
                createdAt: true,
                shippedAt: true,
                trackingNumber: true,
                trackingUrl: true,
                carrierName: true,
                shippingMethodName: true,
                items: {
                    select: {
                        product: {
                            select: {
                                name: true,
                                images: { take: 1 }
                            }
                        },
                        quantity: true
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        // Add a friendly status message
        const statusMessages = {
            'PENDING': 'We have received your order and are preparing it.',
            'PROCESSING': 'Your order is being packed and will be shipped soon.',
            'SHIPPED': `Your order has been handed over to ${order.carrierName || 'the carrier'}.`,
            'DELIVERED': 'Your order has been delivered successfully.',
            'CANCELLED': 'This order has been cancelled.'
        };

        return NextResponse.json({
            success: true,
            data: {
                ...order,
                statusLabel: statusMessages[order.status] || order.status
            }
        });

    } catch (error) {
        console.error('Tracking API error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error while fetching tracking info' },
            { status: 500 }
        );
    }
}

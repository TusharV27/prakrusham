import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';

        const skip = (page - 1) * limit;

        const where = {
            ...((status && status !== 'ALL') ? { status } : {}),
            ...(search
                ? {
                    OR: [
                        { id: { contains: search, mode: 'insensitive' } },
                        { customer: { user: { name: { path: ['en'], string_contains: search, mode: 'insensitive' } } } },
                        { customer: { user: { phone: { contains: search, mode: 'insensitive' } } } },
                    ],
                }
                : {}),
        };

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    customer: {
                        include: {
                            user: true
                        }
                    },
                    items: {
                        include: {
                            product: true
                        }
                    },
                    metafields: true,
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit,
            }),
            prisma.order.count({ where }),
        ]);

        const formatted = orders.map(order => ({
            id: order.id,
            customerId: order.customerId,
            customerName: order.customer?.user?.name?.en || order.customer?.user?.name || 'Unknown',
            customerEmail: order.customer?.user?.email || 'N/A',
            customerPhone: order.customer?.user?.phone || 'N/A',
            total: order.total,
            status: order.status,
            createdAt: order.createdAt,
            shippingAddress: order.shippingAddress,
            metafields: order.metafields || [],
            itemCount: order.items?.length || 0,
            items: (order.items || []).map(item => ({
                id: item.id,
                productId: item.productId,
                productName: item.product?.name?.en || item.product?.name || 'Unknown',
                quantity: item.quantity,
                price: item.price,
                total: item.quantity * item.price
            }))
        }));

        return NextResponse.json({
            success: true,
            data: formatted,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('GET orders error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const data = await req.json();
        const { customerId, items, total, status, subtotal, taxAmount, shippingAddress, pincode } = data;

        // Fetch global tax settings for fallbacks
        const taxSettingsRecord = await prisma.storeSetting.findUnique({
            where: { key: 'tax_settings' }
        });
        const taxSettings = taxSettingsRecord?.value || { defaultTaxRate: 5.0, pricesIncludeTax: false };

        if (!customerId || !items || items.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Customer ID and items are required' },
                { status: 400 }
            );
        }

        const orderSize = total || items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const order = await prisma.order.create({
            data: {
                customerId,
                total: orderSize,
                subtotal: subtotal || orderSize - (taxAmount || 0),
                taxAmount: taxAmount || 0,
                shippingAddress: shippingAddress || null,
                pincode: pincode || null,
                status: status || 'PENDING',
                items: {
                    create: items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        taxRate: item.taxRate || taxSettings.defaultTaxRate || 0,
                        taxAmount: item.taxAmount || 0
                    }))
                }
            },
            include: {
                items: true
            }
        });

        return NextResponse.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('POST order error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create order', details: error.message },
            { status: 500 }
        );
    }
}

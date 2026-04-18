import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const search = searchParams.get('search') || '';
        const statusFilter = searchParams.get('statusFilter') || 'all';

        const skip = (page - 1) * limit;

        const where = {
            AND: [
                search ? {
                    OR: [
                        { product: { name: { path: ['en'], string_contains: search, mode: 'insensitive' } } },
                        { product: { name: { path: ['hi'], string_contains: search, mode: 'insensitive' } } },
                        { product: { name: { path: ['gu'], string_contains: search, mode: 'insensitive' } } },
                        { product: { sku: { contains: search, mode: 'insensitive' } } },
                        { variant: { title: { contains: search, mode: 'insensitive' } } },
                        { variant: { sku: { contains: search, mode: 'insensitive' } } },
                        { warehouse: { name: { path: ['en'], string_contains: search, mode: 'insensitive' } } },
                    ]
                } : {},
                statusFilter === 'out' ? { quantity: { lte: 0 } } :
                statusFilter === 'low' ? { quantity: { gt: 0, lte: 10 } } :
                statusFilter === 'instock' ? { quantity: { gt: 10 } } : {}
            ]
        };

        const [inventory, total, productsRaw, warehousesRaw, lowStockRaw, outOfStockRaw] = await Promise.all([
            prisma.inventoryItem.findMany({
                where,
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            sku: true,
                        },
                    },
                    variant: {
                        select: {
                            id: true,
                            title: true,
                            sku: true,
                        },
                    },
                    warehouse: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: {
                    updatedAt: 'desc',
                },
                skip,
                take: limit,
            }),
            prisma.inventoryItem.count({ where }),
            prisma.product.count({ where: { status: 'ACTIVE' } }),
            prisma.warehouse.count(),
            prisma.inventoryItem.count({ where: { quantity: { gt: 0, lte: 10 } } }),
            prisma.inventoryItem.count({ where: { quantity: { lte: 0 } } })
        ]);

        const inventoryForStats = await prisma.inventoryItem.aggregate({
             _sum: { quantity: true }
        });

        const formatted = inventory.map(item => ({
            ...item,
            product: item.product ? {
                ...item.product,
                name: (typeof item.product.name === 'object' && item.product.name !== null) ? item.product.name : { en: item.product.name || '', hi: '', gu: '' },
            } : null,
            variant: item.variant || null,
            warehouse: item.warehouse ? {
                ...item.warehouse,
                name: (typeof item.warehouse.name === 'object' && item.warehouse.name !== null) ? item.warehouse.name : { en: item.warehouse.name || '', hi: '', gu: '' },
            } : null
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
            stats: {
                totalQuantity: inventoryForStats._sum.quantity || 0,
                activeProducts: productsRaw,
                totalWarehouses: warehousesRaw,
                alerts: lowStockRaw + outOfStockRaw
            }
        });
    } catch (error) {
        console.error('Error fetching inventory:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { productId, variantId, warehouseId, quantity } = body;

        if (!productId || !warehouseId || quantity === undefined) {
            return NextResponse.json(
                { success: false, error: 'Product, Warehouse and Quantity are required' },
                { status: 400 }
            );
        }

        // Use upsert to handle both creation and update if the trio exists
        const inventoryItem = await prisma.inventoryItem.upsert({
            where: {
                productId_warehouseId_variantId: {
                    productId,
                    warehouseId,
                    variantId: variantId || null,
                },
            },
            update: {
                quantity: parseInt(quantity),
            },
            create: {
                productId,
                warehouseId,
                variantId: variantId || null,
                quantity: parseInt(quantity),
            },
        });

        return NextResponse.json({
            success: true,
            data: inventoryItem,
        });
    } catch (error) {
        console.error('Error creating/updating inventory:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Internal Server Error', 
                message: error.message,
                details: error.code === 'P2003' ? 'Foreign key constraint failed. Make sure Product ID and Warehouse ID exist.' : error.meta
            },
            { status: 500 }
        );
    }
}

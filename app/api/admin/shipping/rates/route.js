import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
    try {
        const body = await request.json();
        const { zoneId, name, type, price, minWeight, maxWeight } = body;

        if (!zoneId || !name || price === undefined) {
            return NextResponse.json(
                { success: false, message: 'zoneId, name, and price are required' },
                { status: 400 }
            );
        }

        const rate = await prisma.shippingRate.create({
            data: {
                zoneId,
                name,
                type: type || 'FLAT',
                price: Number(price),
                minWeight: minWeight !== undefined ? Number(minWeight) : null,
                maxWeight: maxWeight !== undefined ? Number(maxWeight) : null,
                minPrice: body.minPrice !== undefined ? Number(body.minPrice) : null,
                maxPrice: body.maxPrice !== undefined ? Number(body.maxPrice) : null
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Shipping rate created successfully',
            data: rate
        });
    } catch (error) {
        console.error('Create rate error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create shipping rate' },
            { status: 500 }
        );
    }
}

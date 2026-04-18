import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';

export async function PATCH(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();
        const { name, type, price, minWeight, maxWeight } = body;

        const rate = await prisma.shippingRate.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(type && { type }),
                ...(price !== undefined && { price: Number(price) }),
                ...(minWeight !== undefined && { minWeight: Number(minWeight) }),
                ...(maxWeight !== undefined && { maxWeight: Number(maxWeight) }),
                ...(body.minPrice !== undefined && { minPrice: Number(body.minPrice) }),
                ...(body.maxPrice !== undefined && { maxPrice: Number(body.maxPrice) })
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Rate updated successfully',
            data: rate
        });
    } catch (error) {
        console.error('Update rate error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update rate' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        await prisma.shippingRate.delete({ where: { id } });
        return NextResponse.json({ success: true, message: 'Rate deleted successfully' });
    } catch (error) {
        console.error('Delete rate error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete rate' },
            { status: 500 }
        );
    }
}

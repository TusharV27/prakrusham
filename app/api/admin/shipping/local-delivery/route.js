import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        let setting = await prisma.localDeliverySetting.findFirst();
        
        if (!setting) {
            setting = await prisma.localDeliverySetting.create({
                data: {
                    isActive: false,
                    deliveryRadius: 10,
                    minOrderAmount: 0,
                    deliveryCharge: 0,
                    pincodes: []
                }
            });
        }
        
        return NextResponse.json({ success: true, data: setting });
    } catch (error) {
        console.error('Fetch local delivery setting error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch local delivery setting' },
            { status: 500 }
        );
    }
}

export async function PATCH(request) {
    try {
        const body = await request.json();
        const { id, isActive, deliveryRadius, minOrderAmount, deliveryCharge, pincodes } = body;

        const updated = await prisma.localDeliverySetting.update({
            where: { id },
            data: {
                isActive,
                deliveryRadius: Number(deliveryRadius),
                minOrderAmount: Number(minOrderAmount),
                deliveryCharge: Number(deliveryCharge),
                pincodes: pincodes || []
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Local delivery settings updated successfully',
            data: updated
        });
    } catch (error) {
        console.error('Update local delivery error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update local delivery settings' },
            { status: 500 }
        );
    }
}

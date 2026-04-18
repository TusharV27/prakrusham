import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
    try {
        const body = await request.json();
        const { profileId, name, countries, states, isActive } = body;

        if (!profileId || !name || !countries) {
            return NextResponse.json(
                { success: false, message: 'profileId, name, and countries are required' },
                { status: 400 }
            );
        }

        const zone = await prisma.shippingZone.create({
            data: {
                profileId,
                name,
                countries,
                states: states || null,
                isActive: isActive !== undefined ? isActive : true
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Shipping zone created successfully',
            data: zone
        });
    } catch (error) {
        console.error('Create zone error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create shipping zone' },
            { status: 500 }
        );
    }
}

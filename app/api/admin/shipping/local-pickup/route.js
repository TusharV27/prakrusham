import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        let setting = await prisma.localPickupSetting.findFirst();
        
        if (!setting) {
            setting = await prisma.localPickupSetting.create({
                data: {
                    isActive: false,
                    locationName: 'Primary Store',
                    instructions: 'Pick up your order from our main store location.'
                }
            });
        }
        
        return NextResponse.json({ success: true, data: setting });
    } catch (error) {
        console.error('Fetch local pickup setting error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch local pickup setting' },
            { status: 500 }
        );
    }
}

export async function PATCH(request) {
    try {
        const body = await request.json();
        const { id, isActive, locationName, instructions } = body;

        const updated = await prisma.localPickupSetting.update({
            where: { id },
            data: {
                isActive,
                locationName,
                instructions
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Local pickup settings updated successfully',
            data: updated
        });
    } catch (error) {
        console.error('Update local pickup error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update local pickup settings' },
            { status: 500 }
        );
    }
}

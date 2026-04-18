import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';

export async function PATCH(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();
        const { name, countries, states, isActive } = body;

        const zone = await prisma.shippingZone.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(countries && { countries }),
                ...(states !== undefined && { states }),
                ...(isActive !== undefined && { isActive })
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Zone updated successfully',
            data: zone
        });
    } catch (error) {
        console.error('Update zone error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update zone' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        await prisma.shippingZone.delete({ where: { id } });
        return NextResponse.json({ success: true, message: 'Zone deleted successfully' });
    } catch (error) {
        console.error('Delete zone error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete zone' },
            { status: 500 }
        );
    }
}

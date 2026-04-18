import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(req, { params }) {
    try {
        const { id } = params;
        const body = await req.json();
        const { name, width, height, length, weight, unit, weightUnit, isDefault } = body;

        // If setting as default, unset others first
        if (isDefault) {
            await prisma.shippingPackage.updateMany({
                where: { isDefault: true },
                data: { isDefault: false }
            });
        }

        const updatedPackage = await prisma.shippingPackage.update({
            where: { id },
            data: {
                name,
                width: width !== undefined ? parseFloat(width) : undefined,
                height: height !== undefined ? parseFloat(height) : undefined,
                length: length !== undefined ? parseFloat(length) : undefined,
                weight: weight !== undefined ? parseFloat(weight) : undefined,
                unit: unit || undefined,
                weightUnit: weightUnit || undefined,
                isDefault: isDefault !== undefined ? !!isDefault : undefined
            }
        });

        return NextResponse.json({ success: true, data: updatedPackage });
    } catch (error) {
        console.error('Error updating package:', error);
        return NextResponse.json({ success: false, error: 'Failed to update package' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = params;
        await prisma.shippingPackage.delete({
            where: { id }
        });
        return NextResponse.json({ success: true, message: 'Package deleted' });
    } catch (error) {
        console.error('Error deleting package:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete package' }, { status: 500 });
    }
}

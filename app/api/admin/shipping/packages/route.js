import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const packages = await prisma.shippingPackage.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ success: true, data: packages });
    } catch (error) {
        console.error('Error fetching packages:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch packages' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, width, height, length, weight, unit, weightUnit, isDefault } = body;

        // If this is set as default, unset others
        if (isDefault) {
            await prisma.shippingPackage.updateMany({
                where: { isDefault: true },
                data: { isDefault: false }
            });
        }

        const newPackage = await prisma.shippingPackage.create({
            data: {
                name,
                width: parseFloat(width),
                height: parseFloat(height),
                length: parseFloat(length),
                weight: parseFloat(weight || 0),
                unit: unit || 'in',
                weightUnit: weightUnit || 'lb',
                isDefault: !!isDefault
            }
        });

        return NextResponse.json({ success: true, data: newPackage });
    } catch (error) {
        console.error('Error creating package:', error);
        return NextResponse.json({ success: false, error: 'Failed to create package' }, { status: 500 });
    }
}

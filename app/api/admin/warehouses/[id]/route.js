import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// ✅ GET Single Warehouse
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const warehouse = await prisma.warehouse.findUnique({
            where: { id },
            include: {
                metafields: true,
            },
        });

        if (!warehouse) {
            return NextResponse.json(
                { success: false, error: 'Warehouse not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: warehouse,
        });
    } catch (error) {
        console.error('GET warehouse error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch warehouse', details: error.message },
            { status: 500 }
        );
    }
}

// ✅ PUT Update Warehouse
export async function PUT(request, { params }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { 
            name, locationName, pincode, address, 
            nameHi, nameGu, locationNameHi, locationNameGu, addressHi, addressGu,
            metafields 
        } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID is required' },
                { status: 400 }
            );
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Sync Metafields
            await tx.warehouseMetafield.deleteMany({
                where: { warehouseId: id }
            });

            // 2. Update Warehouse
            const updated = await tx.warehouse.update({
                where: { id },
                data: {
                    name: {
                        en: name || '',
                        hi: nameHi || '',
                        gu: nameGu || ''
                    },
                    locationName: {
                        en: locationName || '',
                        hi: locationNameHi || '',
                        gu: locationNameGu || ''
                    },
                    pincode: String(pincode || ''),
                    address: {
                        en: address || '',
                        hi: addressHi || '',
                        gu: addressGu || ''
                    },
                    metafields: metafields && metafields.length > 0 ? {
                        create: metafields.map(m => ({
                            namespace: m.namespace || 'custom',
                            key: m.key,
                            value: String(m.value ?? ''),
                            type: m.type || 'text',
                        }))
                    } : undefined
                },
                include: {
                    metafields: true,
                }
            });

            return updated;
        });

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('Error updating warehouse:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}

// ✅ DELETE Warehouse
export async function DELETE(request, { params }) {
    const { id } = await params;
    try {
        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID is required' },
                { status: 400 }
            );
        }

        await prisma.warehouse.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Warehouse deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting warehouse:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

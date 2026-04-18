import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { quantity } = body;

        if (quantity === undefined) {
            return NextResponse.json(
                { success: false, error: 'Quantity is required' },
                { status: 400 }
            );
        }

        const updatedItem = await prisma.inventoryItem.update({
            where: { id },
            data: {
                quantity: parseInt(quantity),
            },
        });

        return NextResponse.json({
            success: true,
            data: updatedItem,
        });
    } catch (error) {
        console.error('Error updating inventory item:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;
    try {

        await prisma.inventoryItem.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Inventory item deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting inventory item:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

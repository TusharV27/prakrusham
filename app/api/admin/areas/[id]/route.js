import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();

        const {
            areaName,
            city,
            district,
            state,
            pincode,
            deliveryCharge,
            minOrderAmount,
            status,
            pincodeDataId,
        } = body;

        const updatedArea = await prisma.area.update({
            where: { id },
            data: {
                ...(areaName !== undefined && { areaName }),
                ...(city !== undefined && { city }),
                ...(district !== undefined && { district }),
                ...(state !== undefined && { state }),
                ...(pincode !== undefined && { pincode }),
                ...(deliveryCharge !== undefined && {
                    deliveryCharge: Number(deliveryCharge),
                }),
                ...(minOrderAmount !== undefined && {
                    minOrderAmount: Number(minOrderAmount),
                }),
                ...(status !== undefined && { status }),
                ...(pincodeDataId !== undefined && { pincodeDataId }),
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Area updated successfully',
            data: updatedArea,
        });
    } catch (error) {
        console.error('Update area error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update area', error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        await prisma.area.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Area deleted successfully',
        });
    } catch (error) {
        console.error('Delete area error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete area' },
            { status: 500 }
        );
    }
}

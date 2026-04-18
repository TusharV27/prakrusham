import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const pincode = searchParams.get('pincode');

        if (!pincode) {
            return NextResponse.json(
                { success: false, message: 'Pincode is required' },
                { status: 400 }
            );
        }

        const pincodeData = await prisma.pincodeData.findMany({
            where: {
                pincode: pincode,
            },
        });

        return NextResponse.json({
            success: true,
            data: pincodeData,
        });
    } catch (error) {
        console.error('Pincode search error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to search pincode' },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request, context) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json(
                { success: false, error: 'Status is required' },
                { status: 400 }
            );
        }

        const review = await prisma.review.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json({
            success: true,
            data: review
        });
    } catch (error) {
        console.error('Error updating review:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error', message: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request, context) {
    try {
        const { id } = await context.params;

        await prisma.review.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting review:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error', message: error.message },
            { status: 500 }
        );
    }
}

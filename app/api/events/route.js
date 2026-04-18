import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const events = await prisma.event.findMany({
            include: {
                images: true,
            },
            orderBy: {
                date: 'desc',
            },
        });

        return NextResponse.json({
            success: true,
            data: events,
        });
    } catch (error) {
        console.error('GET public events error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch events' },
            { status: 500 }
        );
    }
}

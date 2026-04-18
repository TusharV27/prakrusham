import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
    try {
        const { slug } = await params;

        if (!slug) {
            return NextResponse.json(
                { success: false, error: 'Slug is required' },
                { status: 400 }
            );
        }

        const event = await prisma.event.findUnique({
            where: {
                slug: slug,
            },
            include: {
                images: true,
            },
        });

        if (!event) {
            return NextResponse.json(
                { success: false, error: 'Event not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: event,
        });
    } catch (error) {
        console.error('GET single event error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch event', details: error.message },
            { status: 500 }
        );
    }
}

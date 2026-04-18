import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    try {
        const { slug } = await params;
        
        const offer = await prisma.offer.findFirst({
            where: {
                OR: [
                    { id: slug },
                    { slug: slug }
                ],
                isActive: true
            },
            include: {
                images: true,
                products: {
                    include: {
                        images: { take: 1, select: { url: true } },
                        variants: true
                    }
                }
            }
        });

        if (!offer) {
            return NextResponse.json(
                { success: false, error: 'Offer not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: offer
        });
    } catch (error) {
        console.error('Error fetching offer details:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}

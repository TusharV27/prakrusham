import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const now = new Date();
        
        const activeOffers = await prisma.offer.findMany({
            where: {
                isActive: true,
                startTime: { lte: now },
                endTime: { gte: now }
            },
            include: {
                images: true,
                products: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        images: { take: 1, select: { url: true } }
                    }
                }
            },
            orderBy: { startTime: 'desc' }
        });

        // Categorize offers for different frontend sections
        const banners = activeOffers.filter(o => o.showInHero && o.images.length > 0);
        const combos = activeOffers.filter(o => o.discountType === 'COMBO' || o.products.length >= 2);
        
        return NextResponse.json({
            success: true,
            data: {
                all: activeOffers,
                banners,
                combos
            }
        });
    } catch (error) {
        console.error('Error fetching public offers:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';

export async function GET() {
    try {
        const articles = await prisma.article.findMany({
            where: { status: 'PUBLISHED' }, // Refined status filter
            include: {
                blog: true,
                author: true,
            },
            orderBy: { publishedAt: 'desc' },
        });

        return NextResponse.json({ success: true, data: articles });
    } catch (error) {
        console.error('GET public articles error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';

export async function GET(req, { params }) {
    try {
        const { handle } = await params;

        const article = await prisma.article.findFirst({
            where: {
                OR: [
                    { handle: handle },
                    { id: handle }
                ],
                status: 'PUBLISHED', // Refined status filter
            },
            include: {
                blog: true,
                author: true,
            },
        });

        if (!article) {
            return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
        }

        // Increment views
        await prisma.article.update({
            where: { id: article.id },
            data: { views: { increment: 1 } },
        });

        return NextResponse.json({ success: true, data: article });
    } catch (error) {
        console.error('GET public article error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
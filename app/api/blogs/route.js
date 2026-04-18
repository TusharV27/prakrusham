import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';

// ✅ GET All Blogs with articles
export async function GET() {
    try {
        const blogs = await prisma.blog.findMany({
            include: {
                articles: {
                    where: { isPublished: true },
                    orderBy: { publishedAt: 'desc' }
                }
            }
        });

        return NextResponse.json({ success: true, data: blogs });

    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
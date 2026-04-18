import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';

// ✅ GET Blog Categories
export async function GET() {
    try {
        const blogs = await prisma.blog.findMany({
            include: {
                _count: {
                    select: { articles: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Add the articleCount property for the UI
        const formatted = blogs.map(b => ({
            ...b,
            articleCount: b._count.articles,
        }));

        return NextResponse.json({ success: true, data: formatted });
    } catch (error) {
        console.error('GET blogs error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

// ✅ CREATE Blog Category
export async function POST(req) {
    try {
        const data = await req.json();
        const { title, titleHi, titleGu, handle, description, descriptionHi, descriptionGu, metaTitle, metaDescription } = data;

        if (!title || !handle) {
            return NextResponse.json({ success: false, error: 'Title and Handle are required' }, { status: 400 });
        }

        const blog = await prisma.blog.create({
            data: {
                handle,
                title: { en: title, hi: titleHi || '', gu: titleGu || '' },
                description: { en: description || '', hi: descriptionHi || '', gu: descriptionGu || '' },
                metaTitle: { en: metaTitle || '', hi: '', gu: '' }, // Support for extended SEO
                metaDescription: { en: metaDescription || '', hi: '', gu: '' },
            },
        });

        return NextResponse.json({ success: true, data: blog });
    } catch (error) {
        console.error('POST blog error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';

// ✅ GET Blog category
export async function GET(req, { params }) {
    try {
        const { id } = await params;
        const blog = await prisma.blog.findUnique({
            where: { id },
            include: { metafields: true }
        });
        if (!blog) return NextResponse.json({ success: false, error: 'Blog not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: blog });
    } catch (error) {
        console.error('GET blog error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// ✅ PUT Update Blog category
export async function PUT(req, { params }) {
    try {
        const { id } = await params;
        const data = await req.json();
        const { title, titleHi, titleGu, handle, description, descriptionHi, descriptionGu, metaTitle, metaDescription, metafields = [] } = data;

        const updatedBlog = await prisma.$transaction(async (tx) => {
            const blog = await tx.blog.update({
                where: { id },
                data: {
                    handle,
                    title: { en: title, hi: titleHi || '', gu: titleGu || '' },
                    description: { en: description || '', hi: descriptionHi || '', gu: descriptionGu || '' },
                    metaTitle: { en: metaTitle || '', hi: '', gu: '' },
                    metaDescription: { en: metaDescription || '', hi: '', gu: '' },
                },
            });

            // Update Metafields
            await tx.blogMetafield.deleteMany({ where: { blogId: id } });
            if (metafields && Array.isArray(metafields) && metafields.length > 0) {
                await tx.blogMetafield.createMany({
                    data: metafields.map(m => ({
                        blogId: id,
                        namespace: m.namespace || 'custom',
                        key: m.key,
                        value: String(m.value ?? ''),
                        type: m.type || 'text',
                    }))
                });
            }

            return await tx.blog.findUnique({
                where: { id },
                include: { metafields: true }
            });
        });

        return NextResponse.json({ success: true, data: updatedBlog });
    } catch (error) {
        console.error('PUT blog error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// ✅ DELETE Blog Category
export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        await prisma.blog.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE blog error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

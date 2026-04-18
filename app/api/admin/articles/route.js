import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';
import fs from 'fs';
import path from 'path';

const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w-]+/g, '')  // Remove all non-word chars
        .replace(/--+/g, '-');    // Replace multiple - with single -
};

const generateUniqueHandle = async (baseHandle, currentId = null) => {
    let handle = slugify(baseHandle);
    let uniqueHandle = handle;
    let counter = 1;

    while (true) {
        const existing = await prisma.article.findFirst({
            where: {
                handle: uniqueHandle,
                NOT: currentId ? { id: currentId } : undefined
            }
        });

        if (!existing) break;

        uniqueHandle = `${handle}-${counter}`;
        counter++;
    }

    return uniqueHandle;
};

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const search = searchParams.get('search') || '';

        const skip = (page - 1) * limit;

        const where = search ? {
            OR: [
                { title: { path: ['en'], string_contains: search, mode: 'insensitive' } },
                { title: { path: ['hi'], string_contains: search, mode: 'insensitive' } },
                { title: { path: ['gu'], string_contains: search, mode: 'insensitive' } },
                { handle: { contains: search, mode: 'insensitive' } }
            ]
        } : {};

        const [articles, total, allArticles, categoryCount] = await Promise.all([
            prisma.article.findMany({
                where,
                select: {
                    id: true,
                    blogId: true,
                    authorId: true,
                    title: true,
                    handle: true,
                    summaryHtml: true,
                    image: true,
                    status: true,
                    featured: true,
                    createdAt: true,
                    tags: true,
                    blog: { select: { id: true, title: true } },
                    author: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.article.count({ where }),
            prisma.article.findMany({
                select: {
                    status: true,
                    featured: true
                }
            }),
            prisma.blog.count()
        ]);

        const stats = {
            total: allArticles.length,
            published: allArticles.filter(a => a.status === 'PUBLISHED').length,
            featured: allArticles.filter(a => a.featured).length,
            categories: categoryCount
        };

        return NextResponse.json({
            success: true,
            data: articles,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
            stats
        });
    } catch (error) {
        console.error('GET articles error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}


// ✅ CREATE Article
export async function POST(req) {
    try {
        const contentType = req.headers.get('content-type') || '';
        let body = {};
        let file = null;

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            formData.forEach((value, key) => {
                if (key !== 'image') {
                    body[key] = value;
                }
            });
            file = formData.get('image');
        } else {
            body = await req.json();
            file = body.image; // Could be a URL string
        }

        const {
            blogId,
            title, titleHi, titleGu,
            handle,
            summaryHtml, summaryHtmlHi, summaryHtmlGu,
            bodyHtml, bodyHtmlHi, bodyHtmlGu,
            authorId,
            tags,
            imageAlt, imageAltHi, imageAltGu,
            metaTitle, metaTitleHi, metaTitleGu,
            metaDescription, metaDescriptionHi, metaDescriptionGu,
            status,
            featured,
            publishedAt
        } = body;

        // ✅ Validation & Fallbacks
        if (!blogId) {
            return NextResponse.json({ success: false, error: 'blogId is required' }, { status: 400 });
        }

        let finalAuthorId = authorId;
        
        // Verify author exists if ID provided
        if (finalAuthorId) {
            const exists = await prisma.user.findUnique({ where: { id: finalAuthorId } });
            if (!exists) finalAuthorId = null;
        }

        // Fallback: Find any admin or first available user
        if (!finalAuthorId) {
            const defaultAuthor = await prisma.user.findFirst({ 
                where: { OR: [{ role: 'ADMIN' }, { role: 'FARMER' }] } 
            });
            finalAuthorId = defaultAuthor?.id || (await prisma.user.findFirst())?.id;
        }

        if (!finalAuthorId) {
            return NextResponse.json({ success: false, error: 'A valid User must exist in the database to author an article.' }, { status: 400 });
        }

        let imageUrl = typeof file === 'string' ? file : '';

        // Handle File Upload
        if (file && typeof file === 'object' && file.name) {
            const uploadDir = path.join(process.cwd(), 'public/uploads/articles');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, buffer);
            imageUrl = `/uploads/articles/${fileName}`;
        }

        const article = await prisma.article.create({
            data: {
                blogId,
                authorId: finalAuthorId,
                status: status || 'DRAFT',
                featured: String(featured) === 'true',
                handle: await generateUniqueHandle(handle || title || 'article'),
                publishedAt: publishedAt ? new Date(publishedAt) : (status === 'PUBLISHED' ? new Date() : null),

                title: { en: title, hi: titleHi || '', gu: titleGu || '' },
                summaryHtml: { en: summaryHtml || '', hi: summaryHtmlHi || '', gu: summaryHtmlGu || '' },
                bodyHtml: { en: bodyHtml || '', hi: bodyHtmlHi || '', gu: bodyHtmlGu || '' },
                imageAlt: { en: imageAlt || '', hi: imageAltHi || '', gu: imageAltGu || '' },
                metaTitle: { en: metaTitle || '', hi: metaTitleHi || '', gu: metaTitleGu || '' },
                metaDescription: { en: metaDescription || '', hi: metaDescriptionHi || '', gu: metaDescriptionGu || '' },
            },
            include: {
                blog: true,
                author: true,
            }
        });

        return NextResponse.json({ success: true, data: article });

    } catch (error) {
        console.error('POST article error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
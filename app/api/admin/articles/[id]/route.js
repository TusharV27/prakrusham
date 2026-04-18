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

// ✅ GET Single Article
export async function GET(req, { params }) {
    try {
        const { id } = await params;
        const article = await prisma.article.findUnique({
            where: { id },
            include: { blog: true, author: true, metafields: true }
        });
        if (!article) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: article });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// ✅ PUT Update Article
export async function PUT(req, { params }) {
    try {
        const { id } = await params;
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
            file = body.image;
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
            publishedAt,
            metafields // Might be string if from FormData
        } = body;

        // Parse metafields if it's a string (from FormData)
        let parsedMetafields = [];
        try {
            parsedMetafields = typeof metafields === 'string' ? JSON.parse(metafields) : (metafields || []);
        } catch (e) {
            console.error('Error parsing article metafields:', e);
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

        // If no file was uploaded but we had an old image, keep the old one unlessimageUrl was explicitly changed
        if (!imageUrl && body.image && typeof body.image === 'string') {
            imageUrl = body.image;
        }

        const updatedArticle = await prisma.$transaction(async (tx) => {
            const article = await tx.article.update({
                where: { id },
                data: {
                    blogId,
                    authorId: finalAuthorId,
                    handle: await generateUniqueHandle(handle || title || 'article', id),
                    tags,
                    image: imageUrl || undefined,
                    status: status || 'DRAFT',
                    featured: String(featured) === 'true',
                    publishedAt: publishedAt ? new Date(publishedAt) : (status === 'PUBLISHED' ? new Date() : null),

                    title: { en: title, hi: titleHi || '', gu: titleGu || '' },
                    summaryHtml: { en: summaryHtml || '', hi: summaryHtmlHi || '', gu: summaryHtmlGu || '' },
                    bodyHtml: { en: bodyHtml || '', hi: bodyHtmlHi || '', gu: bodyHtmlGu || '' },
                    imageAlt: { en: imageAlt || '', hi: imageAltHi || '', gu: imageAltGu || '' },
                    metaTitle: { en: metaTitle || '', hi: metaTitleHi || '', gu: metaTitleGu || '' },
                    metaDescription: { en: metaDescription || '', hi: metaDescriptionHi || '', gu: metaDescriptionGu || '' },
                }
            });

            // Update Metafields
            await tx.articleMetafield.deleteMany({ where: { articleId: id } });
            if (parsedMetafields.length > 0) {
                await tx.articleMetafield.createMany({
                    data: parsedMetafields.map(m => ({
                        articleId: id,
                        namespace: m.namespace || 'custom',
                        key: m.key,
                        value: String(m.value ?? ''),
                        type: m.type || 'text',
                    }))
                });
            }

            return await tx.article.findUnique({
                where: { id },
                include: { blog: true, author: true, metafields: true }
            });
        });

        return NextResponse.json({ success: true, data: updatedArticle });
    } catch (error) {
        console.error('PUT article error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// ✅ DELETE Article
export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        await prisma.article.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE article error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
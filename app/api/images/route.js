import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const search = searchParams.get('search') || '';

        const skip = (page - 1) * limit;

        const where = search ? {
            OR: [
                { altText: { path: ['en'], string_contains: search, mode: 'insensitive' } },
                { altText: { path: ['hi'], string_contains: search, mode: 'insensitive' } },
                { altText: { path: ['gu'], string_contains: search, mode: 'insensitive' } }
            ]
        } : {};

        const [images, total, allRaw] = await Promise.all([
            prisma.image.findMany({
                where,
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit
            }),
            prisma.image.count({ where }),
            prisma.image.findMany({
                select: {
                    productId: true,
                    eventId: true,
                    farmerId: true,
                    vendorId: true,
                    warehouseId: true,
                    offerId: true
                }
            })
        ]);

        const formatted = images.map(img => ({
            ...img,
            altText: typeof img.altText === 'object' && img.altText !== null ? (img.altText.en || '') : (img.altText || ''),
            altTextHi: typeof img.altText === 'object' && img.altText !== null ? (img.altText.hi || '') : '',
            altTextGu: typeof img.altText === 'object' && img.altText !== null ? (img.altText.gu || '') : '',
        }));

        const isUsedFn = (img) => img.productId || img.eventId || img.farmerId || img.vendorId || img.warehouseId || img.offerId;
        
        const stats = {
            total: allRaw.length,
            used: allRaw.filter(isUsedFn).length,
            unused: allRaw.filter(img => !isUsedFn(img)).length
        };

        return NextResponse.json({
            success: true,
            images: formatted,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
            stats
        });
    } catch (error) {
        console.error('GET images error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch images' },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const contentType = req.headers.get('content-type') || '';
        let altText = '';
        let altTextHi = '';
        let altTextGu = '';
        let files = [];

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            altText = formData.get('altText') || '';
            altTextHi = formData.get('altTextHi') || '';
            altTextGu = formData.get('altTextGu') || '';
            files = formData.getAll('images');
        } else if (contentType.includes('application/json')) {
            const body = await req.json();
            altText = body.altText || '';
            altTextHi = body.altTextHi || '';
            altTextGu = body.altTextGu || '';
            files = body.images || [];
        } else {
            return NextResponse.json(
                { success: false, error: 'Unsupported Content-Type' },
                { status: 415 }
            );
        }

        if (files.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No images provided' },
                { status: 400 }
            );
        }

        const uploadDir = path.join(process.cwd(), 'public/uploads/gallery');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const createdImages = [];

        for (const file of files) {
            // Handle File objects from FormData
            if (file && typeof file === 'object' && file.name) {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
                const filePath = path.join(uploadDir, fileName);
                
                fs.writeFileSync(filePath, buffer);

                const newImage = await prisma.image.create({
                    data: {
                        url: `/uploads/gallery/${fileName}`,
                        altText: {
                            en: altText || (file.name || ''),
                            hi: altTextHi || '',
                            gu: altTextGu || ''
                        },
                    },
                });
                createdImages.push(newImage);
            } 
            // Handle URL strings from JSON (optional, but good for completeness)
            else if (typeof file === 'string') {
                 const newImage = await prisma.image.create({
                    data: {
                        url: file,
                        altText: {
                            en: altText || '',
                            hi: altTextHi || '',
                            gu: altTextGu || ''
                        },
                    },
                });
                createdImages.push(newImage);
            }
        }

        return NextResponse.json({
            success: true,
            images: createdImages,
        }, { status: 201 });

    } catch (error) {
        console.error('POST images error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to upload images', details: error.message },
            { status: 500 }
        );
    }
}

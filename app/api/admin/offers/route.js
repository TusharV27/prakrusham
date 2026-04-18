import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// ===============================
// GET ALL OFFERS
// ===============================
export async function GET() {
    try {
        const offers = await prisma.offer.findMany({
            include: {
                images: true,
                products: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                    },
                },
            },
            orderBy: {
                startTime: 'desc',
            },
        });

        const formatted = offers.map(o => ({
            ...o,
            name: typeof o.name === 'object' ? (o.name?.en || '') : (o.name || ''),
            nameHi: typeof o.name === 'object' ? (o.name?.hi || '') : '',
            nameGu: typeof o.name === 'object' ? (o.name?.gu || '') : '',
            description: typeof o.description === 'object' ? (o.description?.en || '') : (o.description || ''),
            descriptionHi: typeof o.description === 'object' ? (o.description?.hi || '') : '',
            descriptionGu: typeof o.description === 'object' ? (o.description?.gu || '') : '',
            image: o.images?.[0]?.url || null, // Simplified for backward compatibility if needed
            products: o.products.map(p => ({
                ...p,
                name: typeof p.name === 'object' ? (p.name?.en || '') : (p.name || ''),
                nameHi: typeof p.name === 'object' ? (p.name?.hi || '') : '',
                nameGu: typeof p.name === 'object' ? (p.name?.gu || '') : '',
            }))
        }));

        return NextResponse.json({
            success: true,
            data: formatted,
        });
    } catch (error) {
        console.error('Error fetching offers:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error', message: error.message },
            { status: 500 }
        );
    }
}

// ===============================
// CREATE OFFER
// ===============================
export async function POST(request) {
    try {
        const contentType = request.headers.get('content-type') || '';
        let body = {};
        let files = [];

        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            formData.forEach((value, key) => {
                if (key !== 'images') {
                    body[key] = value;
                }
            });
            files = formData.getAll('images');
        } else {
            body = await request.json();
        }

        const {
            name,
            description,
            discountType,
            value,
            startTime,
            endTime,
            isActive,
            showInHero,
            slug,
            productIds: productIdsRaw
        } = body;

        let productIds = productIdsRaw;
        if (typeof productIds === 'string') {
            try { productIds = JSON.parse(productIds); } catch (e) { productIds = []; }
        }

        // Basic validation
        if (!name || !discountType || value === undefined || !startTime || !endTime) {
            return NextResponse.json(
                { success: false, error: 'Name, discountType, value, startTime, and endTime are required' },
                { status: 400 }
            );
        }

        // Image Handling
        const uploadDir = path.join(process.cwd(), 'public/uploads/offers');
        if (!fs.existsSync(uploadDir)) { fs.mkdirSync(uploadDir, { recursive: true }); }

        const uploadedImages = [];
        for (const file of files) {
            if (file && typeof file === 'object' && file.name) {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
                const filePath = path.join(uploadDir, fileName);
                fs.writeFileSync(filePath, buffer);
                uploadedImages.push({ url: `/uploads/offers/${fileName}` });
            }
        }

        const offer = await prisma.offer.create({
            data: {
                name: typeof name === 'string' ? JSON.parse(name) : name,
                description: typeof description === 'string' ? JSON.parse(description) : description,
                discountType,
                value: parseFloat(value),
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                isActive: String(isActive) === 'true',
                showInHero: String(showInHero) === 'true',
                slug: slug || `${Date.now()}-${Math.random().toString(36).substring(7)}`,
                images: {
                    create: uploadedImages.map(img => ({
                        url: img.url,
                        altText: typeof name === 'string' ? JSON.parse(name) : name
                    }))
                },
                products: {
                    connect: Array.isArray(productIds) ? productIds.map(id => ({ id })) : []
                }
            },
            include: {
                products: true,
                images: true
            }
        });

        return NextResponse.json({
            success: true,
            data: offer,
        });
    } catch (error) {
        console.error('Error creating offer:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error', message: error.message },
            { status: 500 }
        );
    }
}

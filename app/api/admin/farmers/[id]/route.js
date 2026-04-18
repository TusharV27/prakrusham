import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';
import fs from 'fs';
import path from 'path';

// ✅ GET Single Farmer
export async function GET(req, { params }) {
    try {
        const { id } = await params;
        const farmer = await prisma.farmer.findUnique({
            where: { id },
            include: {
                user: true,
                images: true,
                products: true,
                reviews: true,
                metafields: true,
            },
        });

        if (!farmer) {
            return NextResponse.json(
                { success: false, error: 'Farmer not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: farmer,
        });
    } catch (error) {
        console.error('GET farmer error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch farmer', details: error.message },
            { status: 500 }
        );
    }
}

// ✅ PUT Update Farmer
export async function PUT(req, { params }) {
    const { id } = await params;
    try {
        const contentType = req.headers.get('content-type') || '';
        let data = {};
        let files = [];
        let existingImagesRaw = null;

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            formData.forEach((value, key) => {
                if (key !== 'images') {
                    data[key] = value;
                }
            });
            files = formData.getAll('images');
            existingImagesRaw = data.existingImages;
        } else if (contentType.includes('application/json')) {
            data = await req.json();
            files = data.images || [];
            existingImagesRaw = data.existingImages;
        } else {
            return NextResponse.json(
                { success: false, error: 'Unsupported Content-Type. Please use multipart/form-data or application/json' },
                { status: 415 }
            );
        }

        const {
            name,
            nameHi,
            nameGu,
            email,
            phone,
            landSize,
            farmDetails,
            farmDetailsHi,
            farmDetailsGu,
            status,
            metafields // Might be string if from FormData
        } = data;

        const existingImages = existingImagesRaw ? (Array.isArray(existingImagesRaw) ? existingImagesRaw : JSON.parse(existingImagesRaw)) : [];
        let parsedMetafields = [];
        try {
            parsedMetafields = typeof metafields === 'string' ? JSON.parse(metafields) : (metafields || []);
        } catch (e) {
            console.error('Error parsing farmer metafields:', e);
        }

        const farmer = await prisma.farmer.findUnique({
            where: { id },
            include: { user: true, images: true },
        });

        if (!farmer) {
            return NextResponse.json(
                { success: false, error: 'Farmer not found' },
                { status: 404 }
            );
        }

        const uploadDir = path.join(process.cwd(), 'public/uploads/farmers');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const newUploadedImages = [];

        for (const file of files) {
            if (file && typeof file === 'object' && file.name) {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
                const filePath = path.join(uploadDir, fileName);

                fs.writeFileSync(filePath, buffer);

                newUploadedImages.push({
                    url: `/uploads/farmers/${fileName}`,
                });
            }
        }

        const finalImages = [
            ...existingImages.map((img) => ({
                url: img.url || img,
            })),
            ...newUploadedImages,
        ];

        const result = await prisma.$transaction(async (tx) => {
            // 1. Update User
            await tx.user.update({
                where: { id: farmer.userId },
                data: {
                    name: {
                        en: String(name || ''),
                        hi: String(nameHi || ''),
                        gu: String(nameGu || '')
                    },
                    email: String(email || ''),
                    phone: String(phone || ''),
                    status: String(status || 'active'),
                },
            });

            // 2. Clear Images
            await tx.image.deleteMany({
                where: { farmerId: id },
            });

            // 3. Clear Metafields
            await tx.farmerMetafield.deleteMany({
                where: { farmerId: id },
            });

            // 4. Update Farmer
            const updated = await tx.farmer.update({
                where: { id },
                data: {
                    landSize: landSize ? parseFloat(landSize) : null,
                    farmDetails: {
                        en: String(farmDetails || ''),
                        hi: String(farmDetailsHi || ''),
                        gu: String(farmDetailsGu || '')
                    },
                    images: {
                        create: finalImages,
                    },
                    metafields: parsedMetafields.length > 0 ? {
                        create: parsedMetafields.map(m => ({
                            namespace: m.namespace || 'custom',
                            key: m.key,
                            value: String(m.value ?? ''),
                            type: m.type || 'text',
                        }))
                    } : undefined
                },
                include: {
                    user: true,
                    images: true,
                    products: true,
                    reviews: true,
                    metafields: true,
                },
            });

            return updated;
        });

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('PUT farmer error details:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update farmer', details: error.message },
            { status: 500 }
        );
    }
}

// ✅ DELETE Farmer
export async function DELETE(req, { params }) {
    const { id } = await params;
    try {
        const farmer = await prisma.farmer.findUnique({
            where: { id },
            include: { user: true, images: true },
        });

        if (!farmer) {
            return NextResponse.json(
                { success: false, error: 'Farmer not found' },
                { status: 404 }
            );
        }

        for (const img of farmer.images) {
            if (img.url?.startsWith('/uploads/farmers/')) {
                const filePath = path.join(process.cwd(), 'public', img.url);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        }

        await prisma.image.deleteMany({
            where: { farmerId: id },
        });

        await prisma.farmer.delete({
            where: { id },
        });

        await prisma.user.delete({
            where: { id: farmer.userId },
        });

        return NextResponse.json({
            success: true,
            message: 'Farmer deleted successfully',
        });
    } catch (error) {
        console.error('DELETE farmer error details:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete farmer', details: error.message },
            { status: 500 }
        );
    }
}
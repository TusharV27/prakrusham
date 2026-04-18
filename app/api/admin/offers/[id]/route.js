import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// ===============================
// GET SINGLE OFFER
// ===============================
export async function GET(request, { params }) {
    const { id } = await params;
    try {
        const offer = await prisma.offer.findUnique({
            where: { id },
            include: {
                products: true,
                images: true
            }
        });

        if (!offer) {
            return NextResponse.json(
                { success: false, error: 'Offer not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: offer,
        });
    } catch (error) {
        console.error('Error fetching offer:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error', message: error.message },
            { status: 500 }
        );
    }
}

// ===============================
// UPDATE OFFER
// ===============================
export async function PUT(request, { params }) {
    const { id } = await params;
    try {
        const contentType = request.headers.get('content-type') || '';
        let body = {};
        let files = [];
        let existingImages = [];

        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            formData.forEach((value, key) => {
                if (key !== 'images' && key !== 'existingImages') {
                    body[key] = value;
                }
            });
            files = formData.getAll('images');
            const existingImagesStr = formData.get('existingImages');
            if (existingImagesStr) {
                try { existingImages = JSON.parse(existingImagesStr); } catch (e) { existingImages = []; }
            }
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

        const updateData = {};
        if (name) updateData.name = typeof name === 'string' ? JSON.parse(name) : name;
        if (description !== undefined) updateData.description = typeof description === 'string' ? JSON.parse(description) : description;
        if (discountType) updateData.discountType = discountType;
        if (value !== undefined) updateData.value = parseFloat(value);
        if (startTime) updateData.startTime = new Date(startTime);
        if (endTime) updateData.endTime = new Date(endTime);
        if (isActive !== undefined) updateData.isActive = String(isActive) === 'true';
        if (showInHero !== undefined) updateData.showInHero = String(showInHero) === 'true';
        if (slug) updateData.slug = slug;

        if (productIds) {
            updateData.products = {
                set: productIds.map(pid => ({ id: pid }))
            };
        }

        // Image Handling
        const uploadDir = path.join(process.cwd(), 'public/uploads/offers');
        if (!fs.existsSync(uploadDir)) { fs.mkdirSync(uploadDir, { recursive: true }); }

        const uploadedImages = [];
        // Preserve existing images if they are still in the list
        if (Array.isArray(existingImages)) {
            existingImages.forEach(url => { uploadedImages.push({ url }); });
        }

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

        // Pre-calculate metadata for images
        const campaignName = updateData.name || (body.name ? (typeof body.name === 'string' ? JSON.parse(body.name) : body.name) : null);

        const updatedOffer = await prisma.offer.update({
            where: { id },
            data: {
                ...updateData,
                images: {
                    deleteMany: {},
                    create: uploadedImages.map(img => ({
                        url: img.url,
                        altText: campaignName
                    }))
                }
            },
            include: {
                products: true,
                images: true
            }
        });

        return NextResponse.json({
            success: true,
            data: updatedOffer,
        });
    } catch (error) {
        console.error('Error updating offer:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error', message: error.message },
            { status: 500 }
        );
    }
}

// ===============================
// DELETE OFFER
// ===============================
export async function DELETE(request, { params }) {
    const { id } = await params;
    try {
        await prisma.offer.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: 'Offer deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting offer:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error', message: error.message },
            { status: 500 }
        );
    }
}

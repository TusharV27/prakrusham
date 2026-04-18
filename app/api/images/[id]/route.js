import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';
import fs from 'fs';
import path from 'path';

export async function PATCH(req, { params }) {
    const { id } = await params;
    try {
        const body = await req.json();
        const { altText, altTextHi, altTextGu } = body;

        const updatedImage = await prisma.image.update({
            where: { id },
            data: {
                altText: {
                    en: altText || '',
                    hi: altTextHi || '',
                    gu: altTextGu || ''
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: updatedImage
        });
    } catch (error) {
        console.error('PATCH image error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update image', details: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(req, { params }) {
    const { id } = await params;
    try {
        const image = await prisma.image.findUnique({
            where: { id },
        });

        if (!image) {
            return NextResponse.json(
                { success: false, error: 'Image not found' },
                { status: 404 }
            );
        }

        // Delete physical file if it's a local upload
        if (image.url.startsWith('/uploads/')) {
            const filePath = path.join(process.cwd(), 'public', image.url);
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (err) {
                    console.error('Error deleting physical file:', err);
                }
            }
        }

        await prisma.image.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Image deleted successfully',
        });

    } catch (error) {
        console.error('DELETE image error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete image' },
            { status: 500 }
        );
    }
}

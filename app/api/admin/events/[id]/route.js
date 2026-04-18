import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';
import fs from 'fs';
import path from 'path';

export async function GET(req, context) {
    const params = await context.params;
    const id = params?.id || req.nextUrl.pathname.split('/').pop();

    try {
        if (!id) {
            return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
        }

        const event = await prisma.event.findUnique({
            where: { id },
            include: { images: true },
        });

        if (!event) {
            return NextResponse.json(
                { success: false, error: 'Event not found' },
                { status: 404 }
            );
        }

        const formatted = {
            ...event,
            title: typeof event.title === 'object' ? (event.title?.en || '') : (event.title || ''),
            titleHi: typeof event.title === 'object' ? (event.title?.hi || '') : '',
            titleGu: typeof event.title === 'object' ? (event.title?.gu || '') : '',
            shortDesc: typeof event.shortDesc === 'object' ? (event.shortDesc?.en || '') : (event.shortDesc || ''),
            shortDescHi: typeof event.shortDesc === 'object' ? (event.shortDesc?.hi || '') : '',
            shortDescGu: typeof event.shortDesc === 'object' ? (event.shortDesc?.gu || '') : '',
            description: typeof event.description === 'object' ? (event.description?.en || '') : (event.description || ''),
            descriptionHi: typeof event.description === 'object' ? (event.description?.hi || '') : '',
            descriptionGu: typeof event.description === 'object' ? (event.description?.gu || '') : '',
            location: typeof event.location === 'object' ? (event.location?.en || '') : (event.location || ''),
            locationHi: typeof event.location === 'object' ? (event.location?.hi || '') : '',
            locationGu: typeof event.location === 'object' ? (event.location?.gu || '') : '',
        };

        return NextResponse.json({
            success: true,
            data: formatted,
        });
    } catch (error) {
        console.error('GET single event error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch event' },
            { status: 500 }
        );
    }
}

export async function PUT(req, context) {
    const params = await context.params;
    const id = params?.id || req.nextUrl.pathname.split('/').pop();

    try {
        if (!id) {
            return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
        }
        const contentType = req.headers.get('content-type') || '';
        let data = {};
        let files = [];
        let existingImages = null;

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            for (const [key, value] of formData.entries()) {
                if (key === 'images') continue;
                data[key] = value;
            }
            files = formData.getAll('images');
            existingImages = data.existingImages ?? null;
        } else if (contentType.includes('application/json')) {
            data = await req.json();
            files = data.images || [];
            existingImages = data.existingImages ?? null;
        } else {
            return NextResponse.json(
                { success: false, error: 'Unsupported Content-Type. Please use multipart/form-data or application/json' },
                { status: 415 }
            );
        }

        const {
            title,
            titleHi,
            titleGu,
            slug,
            shortDesc,
            shortDescHi,
            shortDescGu,
            description,
            descriptionHi,
            descriptionGu,
            date,
            location,
            locationHi,
            locationGu
        } = data;

        const eventExists = await prisma.event.findUnique({ where: { id } });
        if (!eventExists) {
            return NextResponse.json(
                { success: false, error: 'Event not found' },
                { status: 404 }
            );
        }

        if (slug && slug !== eventExists.slug) {
            try {
                const slugTaken = await prisma.event.findFirst({ where: { slug: String(slug) } });
                if (slugTaken) {
                    return NextResponse.json(
                        { success: false, error: 'Slug already in use. Please choose a unique slug.' },
                        { status: 400 }
                    );
                }
            } catch (slugError) {
                console.warn('Slug check skipped due to Prisma sync issue:', slugError.message);
                // Continue with update if check fails to prevent 500 error
            }
        }

        const uploadDir = path.join(process.cwd(), 'public/uploads/events');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const newImages = [];
        for (const file of files) {
            if (file && typeof file === 'object' && file.name) {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
                const filePath = path.join(uploadDir, fileName);
                fs.writeFileSync(filePath, buffer);
                newImages.push({ url: `/uploads/events/${fileName}` });
            }
        }

        let imageIdsToKeep = null;
        if (existingImages !== null) {
            try {
                if (Array.isArray(existingImages)) {
                    imageIdsToKeep = existingImages;
                } else {
                    imageIdsToKeep = JSON.parse(String(existingImages));
                }
            } catch (e) {
                console.error('Error parsing existingImages:', e);
                imageIdsToKeep = [];
            }
        }

        if (imageIdsToKeep !== null) {
            await prisma.image.deleteMany({
                where: {
                    eventId: id,
                    id: { notIn: imageIdsToKeep }
                }
            });
        }

        const updatedEvent = await prisma.event.update({
            where: { id },
            data: {
                title: title || titleHi || titleGu ? {
                    en: String(title || ''),
                    hi: String(titleHi || ''),
                    gu: String(titleGu || ''),
                } : undefined,
                slug: slug ? String(slug) : undefined,
                shortDesc: shortDesc || shortDescHi || shortDescGu ? {
                    en: String(shortDesc || ''),
                    hi: String(shortDescHi || ''),
                    gu: String(shortDescGu || ''),
                } : undefined,
                description: description || descriptionHi || descriptionGu ? {
                    en: String(description || ''),
                    hi: String(descriptionHi || ''),
                    gu: String(descriptionGu || ''),
                } : undefined,
                date: date ? new Date(String(date)) : undefined,
                location: location || locationHi || locationGu ? {
                    en: String(location || ''),
                    hi: String(locationHi || ''),
                    gu: String(locationGu || ''),
                } : undefined,
                images: newImages.length > 0 ? {
                    create: newImages,
                } : undefined,
            },
            include: {
                images: true,
            },
        });

        const formatted = {
            ...updatedEvent,
            title: typeof updatedEvent.title === 'object' ? (updatedEvent.title?.en || '') : (updatedEvent.title || ''),
            titleHi: typeof updatedEvent.title === 'object' ? (updatedEvent.title?.hi || '') : '',
            titleGu: typeof updatedEvent.title === 'object' ? (updatedEvent.title?.gu || '') : '',
            shortDesc: typeof updatedEvent.shortDesc === 'object' ? (updatedEvent.shortDesc?.en || '') : (updatedEvent.shortDesc || ''),
            shortDescHi: typeof updatedEvent.shortDesc === 'object' ? (updatedEvent.shortDesc?.hi || '') : '',
            shortDescGu: typeof updatedEvent.shortDesc === 'object' ? (updatedEvent.shortDesc?.gu || '') : '',
            description: typeof updatedEvent.description === 'object' ? (updatedEvent.description?.en || '') : (updatedEvent.description || ''),
            descriptionHi: typeof updatedEvent.description === 'object' ? (updatedEvent.description?.hi || '') : '',
            descriptionGu: typeof updatedEvent.description === 'object' ? (updatedEvent.description?.gu || '') : '',
            location: typeof updatedEvent.location === 'object' ? (updatedEvent.location?.en || '') : (updatedEvent.location || ''),
            locationHi: typeof updatedEvent.location === 'object' ? (updatedEvent.location?.hi || '') : '',
            locationGu: typeof updatedEvent.location === 'object' ? (updatedEvent.location?.gu || '') : '',
        };

        return NextResponse.json({
            success: true,
            data: formatted,
        });
    } catch (error) {
        console.error('PUT event error:', error);
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { success: false, error: 'Failed to update event', details: message },
            { status: 500 }
        );
    }
}

export async function DELETE(req, context) {
    const params = await context.params;
    const id = params?.id || req.nextUrl.pathname.split('/').pop();

    try {
        if (!id) {
            return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
        }

        // Find event to get images
        const event = await prisma.event.findUnique({
            where: { id },
            include: { images: true }
        });

        if (!event) {
            return NextResponse.json(
                { success: false, error: 'Event not found' },
                { status: 404 }
            );
        }

        // Delete physical files (optional but recommended)
        for (const img of event.images) {
            const filePath = path.join(process.cwd(), 'public', img.url);
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (e) {
                    console.error('Error deleting file:', filePath, e);
                }
            }
        }

        await prisma.event.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Event deleted successfully',
        });
    } catch (error) {
        console.error('DELETE event error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete event' },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';
import fs from 'fs';
import path from 'path';

const generateSlug = (text) => {
    const base = String(text || '').trim().toLowerCase();
    const slug = base
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
    return slug || `event-${Date.now()}`;
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
                { location: { path: ['en'], string_contains: search, mode: 'insensitive' } },
                { location: { path: ['hi'], string_contains: search, mode: 'insensitive' } },
                { location: { path: ['gu'], string_contains: search, mode: 'insensitive' } },
                { description: { path: ['en'], string_contains: search, mode: 'insensitive' } }
            ]
        } : {};

        const [events, total, allEvents] = await Promise.all([
            prisma.event.findMany({
                where,
                include: {
                    images: true,
                },
                orderBy: {
                    date: 'desc',
                },
                skip,
                take: limit
            }),
            prisma.event.count({ where }),
            prisma.event.findMany({
                select: {
                    date: true
                }
            })
        ]);

        const formatted = events.map(e => ({
            ...e,
            title: typeof e.title === 'object' && e.title !== null ? (e.title.en || '') : (e.title || ''),
            titleHi: typeof e.title === 'object' && e.title !== null ? (e.title.hi || '') : '',
            titleGu: typeof e.title === 'object' && e.title !== null ? (e.title.gu || '') : '',
            shortDesc: typeof e.shortDesc === 'object' && e.shortDesc !== null ? (e.shortDesc.en || '') : (e.shortDesc || ''),
            shortDescHi: typeof e.shortDesc === 'object' && e.shortDesc !== null ? (e.shortDesc.hi || '') : '',
            shortDescGu: typeof e.shortDesc === 'object' && e.shortDesc !== null ? (e.shortDesc.gu || '') : '',
            description: typeof e.description === 'object' && e.description !== null ? (e.description.en || '') : (e.description || ''),
            descriptionHi: typeof e.description === 'object' && e.description !== null ? (e.description.hi || '') : '',
            descriptionGu: typeof e.description === 'object' && e.description !== null ? (e.description.gu || '') : '',
            location: typeof e.location === 'object' && e.location !== null ? (e.location.en || '') : (e.location || ''),
            locationHi: typeof e.location === 'object' && e.location !== null ? (e.location.hi || '') : '',
            locationGu: typeof e.location === 'object' && e.location !== null ? (e.location.gu || '') : '',
        }));

        const now = new Date();
        const stats = {
            total: allEvents.length,
            upcoming: allEvents.filter(e => new Date(e.date) >= now).length
        };

        return NextResponse.json({
            success: true,
            data: formatted,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
            stats
        });
    } catch (error) {
        console.error('GET events error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch events', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const contentType = req.headers.get('content-type') || '';
        let data = {};
        let files = [];

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            formData.forEach((value, key) => {
                if (key !== 'images') {
                    data[key] = value;
                }
            });
            files = formData.getAll('images');
        } else if (contentType.includes('application/json')) {
            data = await req.json();
            files = data.images || []; // In JSON, images might be passed as URLs or base64 (if supported)
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

        if (!title || !shortDesc || !description || !date) {
            return NextResponse.json(
                { success: false, error: 'Title, short description, description, and date are required' },
                { status: 400 }
            );
        }

        const uploadDir = path.join(process.cwd(), 'public/uploads/events');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const uploadedImages = [];
        for (const file of files) {
            if (file && typeof file === 'object' && file.name) {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
                const filePath = path.join(uploadDir, fileName);
                fs.writeFileSync(filePath, buffer);
                uploadedImages.push({ url: `/uploads/events/${fileName}` });
            }
        }

        const event = await prisma.event.create({
            data: {
                slug: generateSlug(slug || title),
                title: {
                    en: String(title || ''),
                    hi: String(titleHi || ''),
                    gu: String(titleGu || '')
                },
                shortDesc: {
                    en: String(shortDesc || ''),
                    hi: String(shortDescHi || ''),
                    gu: String(shortDescGu || '')
                },
                description: {
                    en: String(description || ''),
                    hi: String(descriptionHi || ''),
                    gu: String(descriptionGu || '')
                },
                date: new Date(String(date)),
                location: {
                    en: String(location || ''),
                    hi: String(locationHi || ''),
                    gu: String(locationGu || '')
                },
                images: {
                    create: uploadedImages,
                },
            },
            include: {
                images: true,
            },
        });

        return NextResponse.json({
            success: true,
            data: event,
        });
    } catch (error) {
        console.error('POST event error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create event', details: error.message },
            { status: 500 }
        );
    }
}

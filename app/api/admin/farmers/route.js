import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';

        const skip = (page - 1) * limit;

        const where = {
            ...(status ? { user: { status: status } } : {}),
            ...(search
                ? {
                    OR: [
                        { user: { name: { path: ['en'], string_contains: search, mode: 'insensitive' } } },
                        { user: { name: { path: ['hi'], string_contains: search, mode: 'insensitive' } } },
                        { user: { name: { path: ['gu'], string_contains: search, mode: 'insensitive' } } },
                        { user: { email: { contains: search, mode: 'insensitive' } } },
                        { user: { phone: { contains: search, mode: 'insensitive' } } },
                    ],
                }
                : {}),
        };

        const [farmers, total, activeCount, totalLandRaw] = await Promise.all([
            prisma.farmer.findMany({
                where,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            phone: true,
                            status: true,
                        }
                    },
                    images: { take: 1 },
                    _count: {
                        select: {
                            products: true,
                            reviews: true,
                        }
                    }
                },
                orderBy: {
                    user: { createdAt: 'desc' },
                },
                skip,
                take: limit,
            }),
            prisma.farmer.count({ where }),
            prisma.user.count({ where: { role: 'FARMER', status: 'active' } }),
            prisma.farmer.aggregate({
                _sum: { landSize: true }
            })
        ]);

        const formatted = farmers.map((farmer) => ({
            id: farmer.id,
            userId: farmer.userId,
            name: (typeof farmer.user?.name === 'object' && farmer.user?.name !== null) ? farmer.user.name : { en: farmer.user?.name || '', hi: '', gu: '' },
            email: farmer.user?.email || '',
            phone: farmer.user?.phone || '',
            landSize: farmer.landSize || 0,
            farmDetails: (typeof farmer.farmDetails === 'object' && farmer.farmDetails !== null) ? farmer.farmDetails : { en: farmer.farmDetails || '', hi: '', gu: '' },
            status: farmer.user?.status || 'active',
            images: farmer.images || [],
            productsCount: farmer._count?.products || 0,
            reviewsCount: farmer._count?.reviews || 0,
        }));

        return NextResponse.json({
            success: true,
            data: formatted,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            stats: {
                totalFarmers: total, // For current filter if searching
                globalTotal: await prisma.farmer.count(),
                activePartners: activeCount,
                totalLand: totalLandRaw._sum.landSize || 0
            }
        });
    } catch (error) {
        console.error('GET farmers error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch farmers' },
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
            files = data.images || [];
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

        let parsedMetafields = [];
        try {
            parsedMetafields = typeof metafields === 'string' ? JSON.parse(metafields) : (metafields || []);
        } catch (e) {
            console.error('Error parsing farmer metafields:', e);
        }

        if (!name || !email) {
            return NextResponse.json(
                { success: false, error: 'Name and email are required' },
                { status: 400 }
            );
        }

        // Check for existing email or phone
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: String(email) },
                    { phone: String(phone || '') }
                ]
            },
        });

        if (existingUser) {
            const conflict = existingUser.email === String(email) ? 'email' : 'phone number';
            return NextResponse.json(
                { success: false, error: `A user with this ${conflict} already exists` },
                { status: 400 }
            );
        }

        const uploadDir = path.join(process.cwd(), 'public/uploads/farmers');
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
                uploadedImages.push({ url: `/uploads/farmers/${fileName}` });
            }
        }

        const user = await prisma.user.create({
            data: {
                name: {
                    en: String(name || ''),
                    hi: String(nameHi || ''),
                    gu: String(nameGu || '')
                },
                email: String(email),
                phone: String(phone || ''),
                role: 'FARMER',
                status: String(status || 'active'),
                password: '123456',
            },
        });

        const farmer = await prisma.farmer.create({
            data: {
                userId: user.id,
                landSize: landSize ? parseFloat(landSize) : null,
                farmDetails: {
                    en: String(farmDetails || ''),
                    hi: String(farmDetailsHi || ''),
                    gu: String(farmDetailsGu || '')
                },
                images: {
                    create: uploadedImages,
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

        return NextResponse.json({
            success: true,
            data: farmer,
        });
    } catch (error) {
        console.error('POST farmer error details:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create farmer', details: error.message },
            { status: 500 }
        );
    }
}
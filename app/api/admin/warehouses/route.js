import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const search = searchParams.get('search') || '';

        const skip = (page - 1) * limit;

        const where = {
            AND: [
                search ? {
                    OR: [
                        { name: { path: ['en'], string_contains: search, mode: 'insensitive' } },
                        { name: { path: ['hi'], string_contains: search, mode: 'insensitive' } },
                        { name: { path: ['gu'], string_contains: search, mode: 'insensitive' } },
                        { locationName: { path: ['en'], string_contains: search, mode: 'insensitive' } },
                        { locationName: { path: ['hi'], string_contains: search, mode: 'insensitive' } },
                        { locationName: { path: ['gu'], string_contains: search, mode: 'insensitive' } },
                        { pincode: { contains: search, mode: 'insensitive' } },
                    ]
                } : {}
            ]
        };

        const [warehouses, total, globalTotalRaw, distinctRegionsRaw, distinctPinsRaw] = await Promise.all([
            prisma.warehouse.findMany({
                where,
                include: {
                    metafields: true,
                },
                orderBy: { id: 'desc' },
                skip,
                take: limit,
            }),
            prisma.warehouse.count({ where }),
            prisma.warehouse.count(),
            prisma.warehouse.findMany({ distinct: ['locationName'], select: { locationName: true } }),
            prisma.warehouse.findMany({ distinct: ['pincode'], select: { pincode: true } })
        ]);

        const formatted = warehouses.map(w => ({
            ...w,
            name: typeof w.name === 'object' && w.name !== null ? (w.name?.en || '') : (w.name || ''),
            nameHi: typeof w.name === 'object' && w.name !== null ? (w.name?.hi || '') : '',
            nameGu: typeof w.name === 'object' && w.name !== null ? (w.name?.gu || '') : '',
            locationName: typeof w.locationName === 'object' && w.locationName !== null ? (w.locationName?.en || '') : (w.locationName || ''),
            locationNameHi: typeof w.locationName === 'object' && w.locationName !== null ? (w.locationName?.hi || '') : '',
            locationNameGu: typeof w.locationName === 'object' && w.locationName !== null ? (w.locationName?.gu || '') : '',
            address: typeof w.address === 'object' && w.address !== null ? (w.address?.en || '') : (w.address || ''),
            addressHi: typeof w.address === 'object' && w.address !== null ? (w.address?.hi || '') : '',
            addressGu: typeof w.address === 'object' && w.address !== null ? (w.address?.gu || '') : '',
        }));

        const uniqueRegionsCount = new Set(distinctRegionsRaw.map(r => typeof r.locationName === 'object' ? r.locationName?.en : r.locationName).filter(Boolean)).size;

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
                total: globalTotalRaw,
                regions: uniqueRegionsCount,
                pins: distinctPinsRaw.filter(p => p.pincode).length
            }
        });
    } catch (error) {
        console.error('Error fetching warehouses:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, locationName, pincode, address, nameHi, nameGu, locationNameHi, locationNameGu, addressHi, addressGu } = body;

        if (!name || !pincode) {
            return NextResponse.json(
                { success: false, error: 'Name and Pincode are required' },
                { status: 400 }
            );
        }

        const warehouse = await prisma.warehouse.create({
            data: {
                name: {
                    en: String(name || ''),
                    hi: String(nameHi || ''),
                    gu: String(nameGu || '')
                },
                locationName: {
                    en: String(locationName || ''),
                    hi: String(locationNameHi || ''),
                    gu: String(locationNameGu || '')
                },
                pincode: String(pincode || ''),
                address: {
                    en: String(address || ''),
                    hi: String(addressHi || ''),
                    gu: String(addressGu || '')
                },
                metafields: body.metafields && body.metafields.length > 0 ? {
                    create: body.metafields.map(m => ({
                        namespace: m.namespace || 'custom',
                        key: m.key,
                        value: String(m.value ?? ''),
                        type: m.type || 'text',
                    }))
                } : undefined
            },
            include: {
                metafields: true,
            }
        });

        return NextResponse.json({
            success: true,
            data: warehouse,
        });
    } catch (error) {
        console.error('Error creating warehouse:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const search = searchParams.get('search') || '';
        const statusFilter = searchParams.get('statusFilter') || 'all';

        const skip = (page - 1) * limit;

        const where = {
            AND: [
                search ? {
                    OR: [
                        { areaName: { contains: search, mode: 'insensitive' } },
                        { city: { contains: search, mode: 'insensitive' } },
                        { pincode: { contains: search, mode: 'insensitive' } },
                    ]
                } : {},
                statusFilter !== 'all' ? { status: statusFilter } : {}
            ]
        };

        const [areas, total, globalTotalRaw, activeZonesRaw, avgLogisticsRaw, distinctStatesRaw] = await Promise.all([
            prisma.area.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.area.count({ where }),
            prisma.area.count(),
            prisma.area.count({ where: { status: 'active' } }),
            prisma.area.aggregate({ _avg: { deliveryCharge: true } }),
            prisma.area.findMany({ distinct: ['state'], select: { state: true } })
        ]);

        return NextResponse.json({
            success: true,
            data: areas,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            stats: {
                totalReach: globalTotalRaw,
                activeZones: activeZonesRaw,
                avgLogistics: avgLogisticsRaw._avg.deliveryCharge || 0,
                statesCount: distinctStatesRaw.filter(s => s.state).length
            }
        });
    } catch (error) {
        console.error('Fetch areas error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch areas' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();

        const {
            areaName,
            city,
            district,
            state,
            pincode,
            deliveryCharge,
            minOrderAmount,
            status,
            pincodeDataId,
        } = body;

        if (!areaName || !city || !pincode) {
            return NextResponse.json(
                { success: false, message: 'areaName, city and pincode are required' },
                { status: 400 }
            );
        }

        const area = await prisma.area.create({
            data: {
                areaName,
                city,
                district: district || null,
                state: state || null,
                pincode,
                deliveryCharge: Number(deliveryCharge || 0),
                minOrderAmount: Number(minOrderAmount || 0),
                status: status || 'active',
                pincodeDataId: pincodeDataId || null,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Area created successfully',
            data: area,
        });
    } catch (error) {
        console.error('Create area error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create area' },
            { status: 500 }
        );
    }
}
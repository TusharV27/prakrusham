import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const profiles = await prisma.shippingProfile.findMany({
            include: {
                _count: {
                    select: { products: true }
                },
                zones: {
                    include: {
                        rates: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // If no profiles exist, create a default one
        if (profiles.length === 0) {
            const defaultProfile = await prisma.shippingProfile.create({
                data: {
                    name: 'General',
                    isDefault: true
                },
                include: {
                    _count: {
                        select: { products: true }
                    },
                    zones: {
                        include: {
                            rates: true
                        }
                    }
                }
            });
            return NextResponse.json({ success: true, data: [defaultProfile] });
        }

        return NextResponse.json({ success: true, data: profiles });
    } catch (error) {
        console.error('Fetch profiles error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch shipping profiles' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json(
                { success: false, message: 'Profile name is required' },
                { status: 400 }
            );
        }

        const profileData = {
            name,
            isDefault: false
        };

        if (body.productIds && Array.isArray(body.productIds) && body.productIds.length > 0) {
            profileData.products = {
                connect: body.productIds.map(id => ({ id }))
            };
        }

        const profile = await prisma.shippingProfile.create({
            data: profileData,
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Shipping profile created successfully',
            data: profile
        });
    } catch (error) {
        console.error('Create profile error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create shipping profile' },
            { status: 500 }
        );
    }
}

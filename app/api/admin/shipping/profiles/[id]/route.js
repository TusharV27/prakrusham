import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const profile = await prisma.shippingProfile.findUnique({
            where: { id },
            include: {
                products: {
                    select: {
                        id: true,
                        name: true,
                        images: { take: 1 }
                    }
                },
                zones: {
                    include: {
                        rates: true
                    }
                }
            }
        });

        if (!profile) {
            return NextResponse.json(
                { success: false, message: 'Profile not found' },
                { status: 404 }
            );
        }

        // Calculate accurate product count
        let productCount = profile.products.length;
        if (profile.isDefault) {
            // For default profile, count all products that don't belong to any other profile
            const otherProfiles = await prisma.shippingProfile.findMany({
                where: { id: { not: id } },
                select: { id: true }
            });
            const otherProfileIds = otherProfiles.map(p => p.id);
            
            productCount = await prisma.product.count({
                where: {
                    OR: [
                        { shippingProfileId: null },
                        { shippingProfileId: id },
                        { shippingProfileId: { notIn: otherProfileIds } }
                    ]
                }
            });
        }

        return NextResponse.json({ 
            success: true, 
            data: { 
                ...profile,
                productCount // Return calculated count
            } 
        });
    } catch (error) {
        console.error('Fetch profile error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch shipping profile' },
            { status: 500 }
        );
    }
}

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, productIds } = body;

        const profile = await prisma.shippingProfile.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(productIds && {
                    products: {
                        set: productIds.map(pid => ({ id: pid }))
                    }
                })
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            data: profile
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update shipping profile' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        const profile = await prisma.shippingProfile.findUnique({ where: { id } });

        if (profile?.isDefault) {
            return NextResponse.json(
                { success: false, message: 'Cannot delete default profile' },
                { status: 400 }
            );
        }

        await prisma.shippingProfile.delete({ where: { id } });

        return NextResponse.json({
            success: true,
            message: 'Profile deleted successfully'
        });
    } catch (error) {
        console.error('Delete profile error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete shipping profile' },
            { status: 500 }
        );
    }
}

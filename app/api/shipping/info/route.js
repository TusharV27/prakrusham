import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // 1. Fetch Active Shipping Profiles & Zones
        // We only include profiles that have at least one zone
        const profiles = await prisma.shippingProfile.findMany({
            include: {
                zones: {
                    where: { isActive: true },
                    include: {
                        rates: true
                    }
                }
            }
        });

        // 2. Fetch Hyperlocal Settings
        const [localDelivery, localPickup] = await Promise.all([
            prisma.localDeliverySetting.findFirst({
                where: { isActive: true }
            }),
            prisma.localPickupSetting.findFirst({
                where: { isActive: true }
            })
        ]);

        // 3. Format public-friendly response
        const publicShippingInfo = {
            profiles: profiles.map(p => ({
                id: p.id,
                name: p.name,
                isDefault: p.isDefault,
                zones: p.zones.map(z => ({
                    id: z.id,
                    name: z.name,
                    regions: z.countries || [],
                    states: z.states || [],
                    rates: z.rates.map(r => ({
                        id: r.id,
                        name: r.name,
                        type: r.type,
                        price: r.price,
                        conditions: {
                            minWeight: r.minWeight,
                            maxWeight: r.maxWeight,
                            minPrice: r.minPrice,
                            maxPrice: r.maxPrice
                        }
                    }))
                }))
            })),
            localDelivery: localDelivery ? {
                enabled: true,
                charge: localDelivery.deliveryCharge,
                minOrder: localDelivery.minOrderAmount,
                supportedPincodes: localDelivery.pincodes || []
            } : { enabled: false },
            localPickup: localPickup ? {
                enabled: true,
                location: localPickup.locationName,
                instructions: localPickup.instructions
            } : { enabled: false }
        };

        return NextResponse.json({
            success: true,
            data: publicShippingInfo,
            lastUpdated: new Date().toISOString()
        });

    } catch (error) {
        console.error('Public shipping info error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch shipping information' },
            { status: 500 }
        );
    }
}

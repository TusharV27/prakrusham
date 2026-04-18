import { NextResponse } from 'next/server';
import { calculateShippingRates } from '@/lib/shipping';
import prisma from '@/lib/prisma';

const normalizeJsonValue = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        if (typeof value.en === 'string' && value.en.trim()) return value.en.trim();
        const firstText = Object.values(value).find(v => typeof v === 'string' && v.trim());
        return firstText || '';
    }
    return String(value);
};

export async function POST(request) {
    try {
        const body = await request.json();
        const { pincode, productId } = body;
        const normalizedPincode = (pincode || '').toString().trim();

        if (!normalizedPincode) {
            return NextResponse.json(
                { success: false, message: 'Pincode is required' },
                { status: 400 }
            );
        }

        const matchedArea = await prisma.area.findFirst({
            where: { pincode: normalizedPincode, status: 'active' }
        });

        if (!matchedArea) {
            return NextResponse.json({
                success: true,
                data: {
                    deliverable: false,
                    shippingOptions: [],
                    addressMatched: {
                        areaName: null,
                        state: null,
                        country: 'India',
                        pincode: normalizedPincode,
                    },
                    message: 'Currently not deliverable to this location.'
                }
            });
        }

        const areaLabel = normalizeJsonValue(matchedArea.areaName) || normalizedPincode;
        const defaultResponse = {
            deliverable: true,
            shippingOptions: [
                {
                    name: areaLabel,
                    price: matchedArea.deliveryCharge || 0,
                    isAreaDelivery: true,
                    carrierName: 'Area Delivery',
                    estimatedDays: 'Same day / 24 hours'
                }
            ],
            addressMatched: {
                areaName: areaLabel,
                state: normalizeJsonValue(matchedArea.state) || null,
                country: 'India',
                pincode: normalizedPincode,
            },
            message: `Great! Delivery is available to ${areaLabel}.`
        };

        if (!productId) {
            return NextResponse.json({ success: true, data: defaultResponse });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: {
                id: true,
                shippingProfileId: true,
                name: true,
                price: true,
                weight: true
            }
        });

        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }

        const result = await calculateShippingRates(
            [{ ...product, quantity: 1, productId: product.id }],
            { pincode: normalizedPincode }
        );

        if (!result.success) {
            return NextResponse.json({ success: false, message: result.message }, { status: 500 });
        }

        const isDeliverable = !!result.addressMatched?.areaName;
        const locationLabel2 = result.addressMatched.areaName || result.addressMatched.state || 'your location';

        return NextResponse.json({
            success: true,
            data: {
                deliverable: isDeliverable,
                shippingOptions: result.shippingOptions,
                addressMatched: result.addressMatched,
                message: isDeliverable
                    ? result.shippingOptions.length > 0
                        ? `Great! Shipping is available to ${locationLabel2}.`
                        : `Pincode is serviceable for ${locationLabel2}, but shipping options are not currently available for this order.`
                    : 'Currently not deliverable to this location.'
            }
        });

    } catch (error) {
        console.error('Availability check error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error while checking availability' },
            { status: 500 }
        );
    }
}

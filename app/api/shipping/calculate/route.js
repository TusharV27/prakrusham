import { NextResponse } from 'next/server';
import { calculateShippingRates } from '@/lib/shipping';

export async function POST(request) {
    try {
        const body = await request.json();
        const { items, address } = body;
        // address: { pincode, city, state, country }

        if (!items || items.length === 0) {
            return NextResponse.json({
                success: true,
                shippingOptions: [],
                message: 'No items in cart'
            });
        }

        const result = await calculateShippingRates(items, address);

        if (!result.success) {
            return NextResponse.json(
                { success: false, message: result.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            shippingOptions: result.shippingOptions.length > 0 || result.addressMatched?.areaName ? [{
                name: 'Standard Shipping',
                price: 30,
                carrierName: 'Standard Shipping',
                estimatedDays: '1 day'
            }] : [],
            addressMatched: result.addressMatched
        });

    } catch (error) {
        console.error('Shipping calculation API error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to calculate shipping correctly' },
            { status: 500 }
        );
    }
}

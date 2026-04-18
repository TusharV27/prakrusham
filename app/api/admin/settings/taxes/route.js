import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';

const SETTING_KEY = 'tax_settings';

// Default values for tax settings
const DEFAULT_SETTINGS = {
    defaultTaxRate: 5.0,
    pricesIncludeTax: false,
    chargeTaxOnShipping: false,
    taxCalculationMethod: 'standard'
};

export async function GET() {
    try {
        const setting = await prisma.storeSetting.findUnique({
            where: { key: SETTING_KEY }
        });

        return NextResponse.json({
            success: true,
            data: setting ? setting.value : DEFAULT_SETTINGS
        });
    } catch (error) {
        console.error('GET tax settings error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch tax settings', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const data = await req.json();
        
        const setting = await prisma.storeSetting.upsert({
            where: { key: SETTING_KEY },
            update: { value: data },
            create: {
                key: SETTING_KEY,
                value: data
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Tax settings updated successfully',
            data: setting.value
        });
    } catch (error) {
        console.error('POST tax settings error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update tax settings', details: error.message },
            { status: 500 }
        );
    }
}

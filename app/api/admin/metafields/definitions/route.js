import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET ALL METAFIELD DEFINITIONS
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const ownerType = searchParams.get('ownerType');

        const where = ownerType ? { ownerType: ownerType.toUpperCase() } : {};
        
        const definitions = await prisma.metafieldDefinition.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            success: true,
            data: definitions,
        });
    } catch (error) {
        console.error('Error fetching metafield definitions:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error', message: error.message },
            { status: 500 }
        );
    }
}

// CREATE METAFIELD DEFINITION
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, type, ownerType, quantity, description, pinned, key, namespace } = body;

        if (!name || !type || !ownerType) {
            return NextResponse.json(
                { success: false, error: 'Name, type, and ownerType are required' },
                { status: 400 }
            );
        }

        const definition = await prisma.metafieldDefinition.create({
            data: {
                name,
                type,
                ownerType: ownerType.toUpperCase(),
                quantity: quantity || 'ONE',
                description,
                pinned: pinned !== undefined ? pinned : true,
                key: key || name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                namespace: namespace || 'custom',
                options: body.options || {}
            }
        });

        return NextResponse.json({
            success: true,
            data: definition,
        });
    } catch (error) {
        console.error('Error creating metafield definition:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error', message: error.message },
            { status: 500 }
        );
    }
}

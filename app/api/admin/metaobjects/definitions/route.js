import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET ALL METAOBJECT DEFINITIONS
export async function GET() {
    try {
        const definitions = await prisma.metaobjectDefinition.findMany({
            include: {
                fields: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            success: true,
            data: definitions,
        });
    } catch (error) {
        console.error('Error fetching metaobject definitions:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error', message: error.message },
            { status: 500 }
        );
    }
}

// CREATE METAOBJECT DEFINITION
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, type, description, fields, options } = body;

        if (!name || !type || !fields || !Array.isArray(fields)) {
            return NextResponse.json(
                { success: false, error: 'Name, type, and fields are required' },
                { status: 400 }
            );
        }

        const definition = await prisma.metaobjectDefinition.create({
            data: {
                name,
                type,
                description,
                options: options || {},
                fields: {
                    create: fields.map(f => ({
                        name: f.label || f.name,
                        key: (f.label || f.name).toLowerCase().replace(/[^a-z0-9]/g, '_'),
                        type: f.type?.id || f.type,
                        description: f.description || '',
                        quantity: f.quantity || 'ONE'
                    }))
                }
            },
            include: {
                fields: true
            }
        });

        return NextResponse.json({
            success: true,
            data: definition,
        });
    } catch (error) {
        console.error('Error creating metaobject definition:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error', message: error.message },
            { status: 500 }
        );
    }
}

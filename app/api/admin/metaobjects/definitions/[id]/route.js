import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// UPDATE METAOBJECT DEFINITION
export async function PATCH(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();
        const { name, description, fields, options } = body;

        // Transaction to handle fields update
        const definition = await prisma.$transaction(async (tx) => {
            // Update main record
            const updated = await tx.metaobjectDefinition.update({
                where: { id },
                data: {
                    name,
                    description,
                    options: options || undefined
                }
            });

            // If fields are provided, we usually replace them or update selectively
            // For simplicity and Shopify-like behavior (fields often added/locked),
            // We'll update names/descriptions of existing fields
            if (fields && Array.isArray(fields)) {
                for (const field of fields) {
                    if (field.id && typeof field.id === 'string' && !isNaN(Date.parse(field.id)) === false) { 
                        // Real DB ID (not a timestamp from frontend)
                        await tx.metaobjectFieldDefinition.update({
                            where: { id: field.id },
                            data: {
                                name: field.label || field.name,
                                description: field.description || '',
                                quantity: field.quantity || undefined
                            }
                        });
                    }
                }
            }
            
            return updated;
        });

        return NextResponse.json({
            success: true,
            data: definition,
        });
    } catch (error) {
        console.error('Error updating metaobject definition:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error', message: error.message },
            { status: 500 }
        );
    }
}

// DELETE METAOBJECT DEFINITION
export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        
        await prisma.metaobjectDefinition.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: 'Definition deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting metaobject definition:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error', message: error.message },
            { status: 500 }
        );
    }
}

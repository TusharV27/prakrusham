import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// UPDATE METAFIELD DEFINITION
export async function PATCH(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();
        const { name, description, pinned, options } = body;

        const definition = await prisma.metafieldDefinition.update({
            where: { id },
            data: {
                name,
                description,
                pinned: pinned !== undefined ? pinned : undefined,
                options: options || undefined
            }
        });

        return NextResponse.json({
            success: true,
            data: definition,
        });
    } catch (error) {
        console.error('Error updating metafield definition:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error', message: error.message },
            { status: 500 }
        );
    }
}

// DELETE METAFIELD DEFINITION
export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        
        await prisma.metafieldDefinition.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: 'Definition deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting metafield definition:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error', message: error.message },
            { status: 500 }
        );
    }
}

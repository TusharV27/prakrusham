import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET CUSTOMER BY ID
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const customer = await prisma.customer.findUnique({
            where: { id },
            include: {
                user: true,
                addresses: true,
                orders: {
                    orderBy: { createdAt: 'desc' }
                },
                metafields: true,
            }
        });

        if (!customer) {
            return NextResponse.json(
                { success: false, error: 'Customer not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            customer: {
                id: customer.id,
                userId: customer.userId,
                fullName: customer.user.name,
                email: customer.user.email,
                phone: customer.user.phone,
                addresses: customer.addresses,
                orders: customer.orders,
                metafields: customer.metafields || []
            }
        });
    } catch (error) {
        console.error('GET CUSTOMER BY ID ERROR:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch customer', details: error.message },
            { status: 500 }
        );
    }
}

// UPDATE CUSTOMER
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { fullName, email, phone, status, addresses, metafields = [] } = body;

        // 1. Check if customer exists
        const existingCustomer = await prisma.customer.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!existingCustomer) {
            return NextResponse.json(
                { success: false, error: 'Customer not found' },
                { status: 404 }
            );
        }

        // 2. Update user info
        const updatedCustomerData = await prisma.$transaction(async (tx) => {
            // 2. Update user info
            const formattedFullName = typeof fullName === 'string' ? { en: fullName, hi: '', gu: '' } : fullName;
            
            await tx.user.update({
                where: { id: existingCustomer.userId },
                data: {
                    ...(formattedFullName && { name: formattedFullName }),
                    ...(email && { email }),
                    ...(phone && { phone }),
                    ...(status && { status }),
                }
            });

            // 3. Update addresses
            if (addresses && Array.isArray(addresses)) {
                await tx.address.deleteMany({ where: { customerId: id } });
                await tx.address.createMany({
                    data: addresses.map(addr => ({
                        customerId: id,
                        type: addr.type || 'Home',
                        fullName: typeof addr.fullName === 'string' ? { en: addr.fullName, hi: '', gu: '' } : addr.fullName,
                        phoneNumber: addr.phoneNumber || phone || existingCustomer.user.phone,
                        addressLine1: typeof addr.addressLine1 === 'string' ? { en: addr.addressLine1, hi: '', gu: '' } : addr.addressLine1,
                        addressLine2: typeof addr.addressLine2 === 'string' ? { en: addr.addressLine2, hi: '', gu: '' } : addr.addressLine2,
                        landmark: typeof addr.landmark === 'string' ? { en: addr.landmark, hi: '', gu: '' } : addr.landmark,
                        pincode: addr.pincode,
                        city: typeof addr.city === 'string' ? { en: addr.city, hi: '', gu: '' } : addr.city,
                        state: typeof addr.state === 'string' ? { en: addr.state, hi: '', gu: '' } : addr.state,
                        isDefault: !!addr.isDefault
                    }))
                });
            }

            // 4. Update Metafields
            await tx.customerMetafield.deleteMany({ where: { customerId: id } });
            if (metafields && Array.isArray(metafields) && metafields.length > 0) {
                await tx.customerMetafield.createMany({
                    data: metafields.map(m => ({
                        customerId: id,
                        namespace: m.namespace || 'custom',
                        key: m.key,
                        value: String(m.value ?? ''),
                        type: m.type || 'text',
                    }))
                });
            }

            return await tx.customer.findUnique({
                where: { id },
                include: { user: true, addresses: true, metafields: true }
            });
        });

        return NextResponse.json({
            success: true,
            message: 'Customer updated successfully',
            customer: updatedCustomerData
        });
    } catch (error) {
        console.error('UPDATE CUSTOMER ERROR:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update customer', details: error.message },
            { status: 500 }
        );
    }
}

// DELETE CUSTOMER
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        const customer = await prisma.customer.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!customer) {
            return NextResponse.json(
                { success: false, error: 'Customer not found' },
                { status: 404 }
            );
        }

        // Delete user (will cascade to customer and addresses due to onDelete: Cascade in schema)
        await prisma.user.delete({
            where: { id: customer.userId }
        });

        return NextResponse.json({
            success: true,
            message: 'Customer and associated user deleted successfully'
        });
    } catch (error) {
        console.error('DELETE CUSTOMER ERROR:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete customer', details: error.message },
            { status: 500 }
        );
    }
}

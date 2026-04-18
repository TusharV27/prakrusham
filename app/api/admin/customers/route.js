import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET ALL CUSTOMERS
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const search = searchParams.get('search') || '';

        const skip = (page - 1) * limit;

        const where = search ? {
            OR: [
                { user: { name: { path: ['en'], string_contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { user: { phone: { contains: search, mode: 'insensitive' } } },
                { addresses: { some: { city: { path: ['en'], string_contains: search, mode: 'insensitive' } } } },
                { addresses: { some: { state: { path: ['en'], string_contains: search, mode: 'insensitive' } } } }
            ]
        } : {};

        const [customers, total, globalCustomers] = await Promise.all([
            prisma.customer.findMany({
                where,
                include: {
                    user: true,
                    addresses: {
                        orderBy: { isDefault: 'desc' },
                    },
                    _count: {
                        select: { orders: true }
                    }
                },
                orderBy: {
                    user: { createdAt: 'desc' },
                },
                skip,
                take: limit
            }),
            prisma.customer.count({ where }),
            prisma.customer.findMany({
                select: {
                    user: { select: { status: true } },
                    _count: { select: { addresses: true } }
                }
            })
        ]);

        const formattedCustomers = customers.map(cust => ({
            id: cust.id,
            userId: cust.userId,
            fullName: cust.user?.name || { en: '', hi: '', gu: '' },
            email: cust.user?.email,
            phone: cust.user?.phone,
            status: cust.user?.status || 'active',
            createdAt: cust.user?.createdAt,
            addresses: (cust.addresses || []).map(addr => ({
                ...addr,
                fullName: addr.fullName || { en: '', hi: '', gu: '' },
                addressLine1: addr.addressLine1 || { en: '', hi: '', gu: '' },
                addressLine2: addr.addressLine2 || { en: '', hi: '', gu: '' },
                landmark: addr.landmark || { en: '', hi: '', gu: '' },
                city: addr.city || { en: '', hi: '', gu: '' },
                state: addr.state || { en: '', hi: '', gu: '' },
            })),
            orderCount: cust._count.orders
        }));

        const stats = {
            total: globalCustomers.length,
            active: globalCustomers.filter(c => c.user?.status === 'active').length,
            inactive: globalCustomers.filter(c => c.user?.status !== 'active').length,
            addresses: globalCustomers.reduce((sum, c) => sum + (c._count?.addresses || 0), 0)
        };

        return NextResponse.json({
            success: true,
            customers: formattedCustomers,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
            stats
        });
    } catch (error) {
        console.error('GET CUSTOMERS ERROR:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch customers', details: error.message },
            { status: 500 }
        );
    }
}

// CREATE CUSTOMER (Admin)
export async function POST(request) {
    try {
        const body = await request.json();
        const { fullName, email, phone, status, addresses } = body;

        // fullName can be string or object {en, hi, gu}
        const formattedFullName = typeof fullName === 'string' ? { en: fullName, hi: '', gu: '' } : fullName;

        if (!formattedFullName || !phone) {
            return NextResponse.json(
                { success: false, error: 'Name and Phone are required' },
                { status: 400 }
            );
        }

        // 1. Find or create user
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { phone: phone },
                    ...(email ? [{ email: email }] : [])
                ]
            }
        });

        if (user) {
            const existingCustomer = await prisma.customer.findUnique({
                where: { userId: user.id }
            });

            if (existingCustomer) {
                return NextResponse.json(
                    { success: false, error: 'A customer profile already exists for this phone/email' },
                    { status: 409 }
                );
            }
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(phone, salt);

            user = await prisma.user.create({
                data: {
                    name: formattedFullName,
                    email: email || `${phone}@prakrushi.com`,
                    phone,
                    password: hashedPassword,
                    role: 'CUSTOMER',
                    status: status || 'active'
                }
            });
        }

        // 2. Create customer profile
        const customer = await prisma.customer.create({
            data: {
                userId: user.id,
                addresses: {
                    create: (addresses || []).map(addr => ({
                        type: addr.type || 'Home',
                        fullName: typeof addr.fullName === 'string' ? { en: addr.fullName, hi: '', gu: '' } : addr.fullName,
                        phoneNumber: addr.phoneNumber || phone,
                        addressLine1: typeof addr.addressLine1 === 'string' ? { en: addr.addressLine1, hi: '', gu: '' } : addr.addressLine1,
                        addressLine2: typeof addr.addressLine2 === 'string' ? { en: addr.addressLine2, hi: '', gu: '' } : addr.addressLine2,
                        landmark: typeof addr.landmark === 'string' ? { en: addr.landmark, hi: '', gu: '' } : addr.landmark,
                        pincode: addr.pincode,
                        city: typeof addr.city === 'string' ? { en: addr.city, hi: '', gu: '' } : addr.city,
                        state: typeof addr.state === 'string' ? { en: addr.state, hi: '', gu: '' } : addr.state,
                        isDefault: !!addr.isDefault
                    }))
                }
            },
            include: {
                user: true,
                addresses: true
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Customer created successfully',
            customer
        }, { status: 201 });

    } catch (error) {
        console.error('CREATE CUSTOMER ERROR:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create customer', details: error.message },
            { status: 500 }
        );
    }
}

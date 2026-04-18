import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const search = searchParams.get('search') || '';
        const statusFilter = searchParams.get('statusFilter') || 'all';
        const ratingFilter = searchParams.get('ratingFilter') || 'all';
        const typeFilter = searchParams.get('typeFilter') || 'all';

        const skip = (page - 1) * limit;

        const where = {
            AND: [
                search ? {
                    OR: [
                        { author: { email: { contains: search, mode: 'insensitive' } } },
                        { author: { name: { path: ['en'], string_contains: search, mode: 'insensitive' } } },
                        { product: { name: { path: ['en'], string_contains: search, mode: 'insensitive' } } },
                        { farmer: { user: { name: { path: ['en'], string_contains: search, mode: 'insensitive' } } } },
                        { vendor: { businessName: { path: ['en'], string_contains: search, mode: 'insensitive' } } }
                    ]
                } : {},
                statusFilter !== 'all' ? { status: statusFilter.toUpperCase() } : {},
                ratingFilter !== 'all' ? { rating: parseInt(ratingFilter) } : {},
                typeFilter === 'product' ? { productId: { not: null } } : {},
                typeFilter === 'farmer' ? { farmerId: { not: null } } : {},
                typeFilter === 'vendor' ? { vendorId: { not: null } } : {}
            ]
        };

        const [reviews, total, rawStats] = await Promise.all([
            prisma.review.findMany({
                where,
                include: {
                    author: true,
                    product: { select: { id: true, name: true, sku: true } },
                    farmer: { include: { user: true } },
                    vendor: true
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.review.count({ where }),
            prisma.review.findMany({ select: { rating: true, status: true } })
        ]);

        const formatted = reviews.map(r => {
            let subjectName = '';
            let subjectNameHi = '';
            let subjectNameGu = '';
            
            const reviewType = r.productId ? 'product' : r.farmerId ? 'farmer' : r.vendorId ? 'vendor' : 'other';

            if (r.productId) {
                subjectName = typeof r.product?.name === 'object' && r.product?.name !== null ? (r.product.name.en || '') : (r.product?.name || '');
                subjectNameHi = typeof r.product?.name === 'object' && r.product?.name !== null ? (r.product.name.hi || '') : '';
                subjectNameGu = typeof r.product?.name === 'object' && r.product?.name !== null ? (r.product.name.gu || '') : '';
            } else if (r.farmerId) {
                subjectName = typeof r.farmer?.user?.name === 'object' && r.farmer?.user?.name !== null ? (r.farmer.user.name.en || '') : (r.farmer?.user?.name || '');
                subjectNameHi = typeof r.farmer?.user?.name === 'object' && r.farmer?.user?.name !== null ? (r.farmer.user.name.hi || '') : '';
                subjectNameGu = typeof r.farmer?.user?.name === 'object' && r.farmer?.user?.name !== null ? (r.farmer.user.name.gu || '') : '';
            } else if (r.vendorId) {
                subjectName = typeof r.vendor?.businessName === 'object' && r.vendor?.businessName !== null ? (r.vendor.businessName.en || '') : (r.vendor?.businessName || '');
                subjectNameHi = typeof r.vendor?.businessName === 'object' && r.vendor?.businessName !== null ? (r.vendor.businessName.hi || '') : '';
                subjectNameGu = typeof r.vendor?.businessName === 'object' && r.vendor?.businessName !== null ? (r.vendor.businessName.gu || '') : '';
            }

            return {
                ...r,
                type: reviewType,
                customerName: typeof r.author?.name === 'object' && r.author?.name !== null ? (r.author.name.en || r.author.email || 'Anonymous') : (r.author?.name || r.author?.email || 'Anonymous'),
                subjectName,
                subjectNameHi,
                subjectNameGu,
                productName: r.productId ? subjectName : '',
                farmerName: (r.farmerId || r.vendorId) ? subjectName : '',
                date: r.createdAt.toISOString().split('T')[0],
                orderId: 'N/A'
            };
        });

        const pendingCount = rawStats.filter(r => r.status === 'PENDING').length;
        const approvedCount = rawStats.filter(r => r.status === 'APPROVED').length;
        const sumRatings = rawStats.reduce((s, r) => s + r.rating, 0);
        const avgRating = rawStats.length ? (sumRatings / rawStats.length).toFixed(1) : 0;

        return NextResponse.json({
            success: true,
            data: formatted,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            stats: {
                total: rawStats.length,
                avgRating,
                pendingCount,
                approvedCount
            }
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error', message: error.message },
            { status: 500 }
        );
    }
}

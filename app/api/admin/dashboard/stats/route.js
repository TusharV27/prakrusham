import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            where: {
                status: {
                    not: 'CANCELLED'
                }
            },
            select: {
                total: true,
                createdAt: true,
                status: true
            }
        });

        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

        const customerCount = await prisma.user.count({
            where: { role: 'CUSTOMER' }
        });

        const farmerCount = await prisma.user.count({
            where: { role: 'FARMER' }
        });

        const dispatchCount = orders.filter(o =>
            ['SHIPPED', 'DELIVERED'].includes(o.status)
        ).length;

        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toLocaleDateString('en-CA');

            const dayRevenue = orders
                .filter(o => {
                    const orderDate = new Date(o.createdAt).toLocaleDateString('en-CA');
                    return orderDate === dateString;
                })
                .reduce((sum, o) => sum + o.total, 0);

            chartData.push({
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                value: dayRevenue,
                date: dateString
            });
        }

        return NextResponse.json({
            success: true,
            stats: {
                totalRevenue,
                customerCount,
                farmerCount,
                dispatchCount
            },
            chartData
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
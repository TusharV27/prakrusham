import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';
import { SignJWT } from 'jose';

const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'prakrushi-admin-secret-key-2026-change-in-production'
);

export async function POST(request) {
    try {
        const { phone, otp } = await request.json();

        if (!phone || !otp) {
            return NextResponse.json({ success: false, message: 'Phone and OTP are required' }, { status: 400 });
        }

        // Verify OTP from database
        let storedOtp;
        if (prisma.userOtp) {
            storedOtp = await prisma.userOtp.findUnique({
                where: { phone },
            });
        } else {
            console.log('Prisma Client UserOtp missing in verify, using Raw SQL');
            const rows = await prisma.$queryRaw`
                SELECT * FROM "UserOtp" WHERE "phone" = ${phone} LIMIT 1
            `;
            storedOtp = rows[0];
        }

        if (!storedOtp || storedOtp.otp !== otp || new Date(storedOtp.expiresAt) < new Date()) {
            return NextResponse.json({ success: false, message: 'Invalid or expired OTP' }, { status: 401 });
        }

        // OTP is correct, delete it
        if (prisma.userOtp) {
            await prisma.userOtp.delete({
                where: { phone },
            });
        } else {
            await prisma.$executeRaw`
                DELETE FROM "UserOtp" WHERE "phone" = ${phone}
            `;
        }

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { phone },
        });

        if (!user) {
            // Create user with placeholder email (required by schema)
            user = await prisma.user.create({
                data: {
                    phone,
                    email: `user_${phone}@prakrushi.com`, // Placeholder
                    password: '', // OTP based login doesn't need password
                    role: 'CUSTOMER',
                    name: { en: 'New Customer', hi: 'नया ग्राहक', gu: 'નવો ગ્રાહક' },
                },
            });
        }

        // Generate JWT
        const token = await new SignJWT({
            userId: user.id,
            phone: user.phone,
            role: user.role,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('30d')
            .sign(secret);

        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                phone: user.phone,
                name: user.name,
                role: user.role,
            },
        });

        // Set cookie
        response.cookies.set('user_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Verify Route Error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

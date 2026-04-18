// app/api/admin/login/route.js

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';
import { verifyPassword } from '@/lib/auth.js';
import { SignJWT } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'prakrushi-admin-secret-key-2026-change-in-production'
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Invalid admin credentials.' },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid admin credentials.' },
        { status: 401 }
      );
    }

    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    console.log('✅ Admin login successful for:', email);
    return response;

  } catch (error) {
    console.error('ADMIN LOGIN ERROR:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// import { NextResponse } from 'next/server';
// import prisma from '@/lib/prisma.js';
// import { verifyPassword } from '@/lib/auth.js';

// export async function POST(request) {
//   try {
//     console.log('========== ADMIN LOGIN START ==========');

//     const body = await request.json();
//     console.log('Request body received:', body);

//     const { email, password } = body ?? {};

//     if (!email || !password) {
//       console.warn('Validation failed: Missing email or password');
//       return NextResponse.json(
//         { error: 'Email and password are required.' },
//         { status: 400 }
//       );
//     }

//     console.log('Finding user with email:', email);

//     const user = await prisma.user.findUnique({
//       where: { email },
//     });

//     console.log('User found:', user ? {
//       id: user.id,
//       email: user.email,
//       role: user.role,
//       hasPassword: !!user.password,
//     } : null);

//     if (!user || user.role !== 'ADMIN') {
//       console.warn('Invalid admin credentials: user not found or not ADMIN');
//       return NextResponse.json(
//         { error: 'Invalid admin credentials.' },
//         { status: 401 }
//       );
//     }

//     console.log('Verifying password...');
//     const isValidPassword = await verifyPassword(password, user.password);

//     console.log('Password valid:', isValidPassword);

//     if (!isValidPassword) {
//       console.warn('Invalid admin credentials: password mismatch');
//       return NextResponse.json(
//         { error: 'Invalid admin credentials.' },
//         { status: 401 }
//       );
//     }

//     console.log('Admin login successful for:', email);
//     console.log('========== ADMIN LOGIN END ==========');

//     return NextResponse.json({
//       success: true,
//       user: {
//         id: user.id,
//         email: user.email,
//         name: user.name,
//         role: user.role,
//       },
//     });
//   } catch (error) {
//     console.error('========== ADMIN LOGIN ERROR ==========');
//     console.error('Full error object:', error);
//     console.error('Error message:', error?.message);
//     console.error('Error stack:', error?.stack);
//     console.error('======================================');

//     return NextResponse.json(
//       {
//         error: 'Internal server error',
//         details: error?.message || 'Unknown error',
//       },
//       { status: 500 }
//     );
//   }
// }
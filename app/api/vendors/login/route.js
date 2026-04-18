import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

// ===============================
// VENDOR LOGIN
// ===============================
export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Find vendor by email
    const vendor = await prisma.vendor.findUnique({
      where: { email },
    });

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    // Check if vendor is active
    if (vendor.status !== 'active' && vendor.status !== 'Active') {
      return NextResponse.json(
        { success: false, error: 'Your account is inactive. Please contact administration.' },
        { status: 403 }
      );
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, vendor.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: vendor.id,
        email: vendor.email,
        type: 'vendor',
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return vendor data without password
    const { password: _, ...vendorData } = vendor;

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      vendor: vendorData,
      token,
    });
  } catch (error) {
    console.error('VENDOR LOGIN ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Login failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
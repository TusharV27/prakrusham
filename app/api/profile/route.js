import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET PROFILE
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const phone = searchParams.get('phone');

    if (!userId && !phone) {
      return NextResponse.json(
        { success: false, message: 'User ID or phone is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: userId ? { id: userId } : { phone },
      include: {
        customer: {
          include: {
            addresses: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('GET PROFILE ERROR:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// UPDATE PROFILE
export async function PUT(request) {
  try {
    const { userId, name, phone, email } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('UPDATE PROFILE ERROR:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    const addresses = await prisma.address.findMany({
      where: {
        customer: { userId: userId }
      },
      orderBy: { isDefault: 'desc' }
    });

    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error('GET ADDRESSES ERROR:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      userId, type, houseNumber, detectedHeadline, landmark, 
      city, pincode, phoneNumber, state, fullName 
    } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    // 0. Verify User exists to prevent Foreign Key crashes
    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userExists) {
      return NextResponse.json({ success: false, message: 'Session expired. Please log out and log in again.', code: 'USER_NOT_FOUND' }, { status: 401 });
    }

    // 1. Ensure Customer profile exists
    let customer = await prisma.customer.findUnique({
      where: { userId },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: { userId },
      });
    }

    // 2. Map fields to JSON objects as required by schema
    const newAddress = await prisma.address.create({
      data: {
        customerId: customer.id,
        type: type || 'Home',
        phoneNumber: phoneNumber || '',
        pincode: pincode || '',
        isDefault: true,
        fullName: fullName || { en: 'Customer' }, 
        addressLine1: { en: houseNumber || '' },
        addressLine2: { en: detectedHeadline || '' }, 
        landmark: { en: landmark || '' },
        city: { en: typeof city === 'string' ? city : 'Surat' },
        state: { en: typeof state === 'string' ? state : 'Gujarat' },
      },
    });

    // 3. Mark other addresses as not default
    await prisma.address.updateMany({
      where: {
        customerId: customer.id,
        NOT: { id: newAddress.id },
      },
      data: { isDefault: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Address added successfully',
      address: newAddress,
    });
  } catch (error) {
    console.error('ADD ADDRESS ERROR:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

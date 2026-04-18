import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// DELETE ADDRESS
export async function DELETE(request, { params }) {
  try {
    const { addressId } = await params;

    await prisma.address.delete({
      where: { id: addressId }
    });

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('DELETE ADDRESS ERROR:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// UPDATE ADDRESS (e.g. set default)
export async function PUT(request, { params }) {
  try {
    const { addressId } = await params;
    const body = await request.json();
    const { 
      isDefault, type, phoneNumber, pincode, fullName, 
      houseNumber, landmark, city, state // Map houseNumber from frontend
    } = body;

    const currentAddress = await prisma.address.findUnique({
      where: { id: addressId }
    });

    if (!currentAddress) {
      return NextResponse.json({ success: false, message: 'Address not found' }, { status: 404 });
    }

    // If marking as default, unmark others
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          customerId: currentAddress.customerId,
          NOT: { id: addressId }
        },
        data: { isDefault: false }
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: {
        ...(isDefault !== undefined && { isDefault }),
        ...(type && { type }),
        ...(phoneNumber && { phoneNumber }),
        ...(pincode && { pincode }),
        ...(fullName && { fullName }),
        addressLine1: houseNumber ? { en: houseNumber } : undefined,
        landmark: landmark ? { en: landmark } : undefined,
        city: city ? { en: city } : undefined,
        state: state ? { en: state } : undefined
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Address updated successfully',
      address: updatedAddress
    });
  } catch (error) {
    console.error('UPDATE ADDRESS ERROR:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

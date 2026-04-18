import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// ===============================
// GET VENDOR BY ID
// ===============================
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        productRequests: true,
        products: true,
        images: true,
        reviews: true,
        metafields: true,
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      vendor,
    });
  } catch (error) {
    console.error('GET VENDOR ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch vendor',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ===============================
// UPDATE VENDOR
// ===============================
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const contentType = request.headers.get('content-type') || '';
    let body = {};
    let logoFile = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        if (key === 'logo') {
          logoFile = value;
        } else {
          body[key] = value;
        }
      });
    } else {
      body = await request.json();
    }

    const {
      email,
      password,
      name, nameHi, nameGu,
      phone,
      profileImage,
      businessName, businessNameHi, businessNameGu,
      businessSlug,
      description, descriptionHi, descriptionGu,
      commissionRate,
      serviceArea, serviceAreaHi, serviceAreaGu,
      status,
      metafields // Might be string if from FormData
    } = body;

    let parsedMetafields = [];
    try {
        parsedMetafields = typeof metafields === 'string' ? JSON.parse(metafields) : (metafields || []);
    } catch (e) {
        console.error('Error parsing vendor metafields:', e);
    }

    const existingVendor = await prisma.vendor.findUnique({
      where: { id },
    });

    if (!existingVendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found.' },
        { status: 404 }
      );
    }

    // Validate commission
    const finalCommission = commissionRate !== undefined ? parseFloat(commissionRate) : existingVendor.commissionRate;
    if (isNaN(finalCommission) || finalCommission < 0 || finalCommission > 100) {
      return NextResponse.json(
        { success: false, error: 'commissionRate must be between 0 and 100.' },
        { status: 400 }
      );
    }

    // Check unique email
    if (email && email !== existingVendor.email) {
      const duplicateEmail = await prisma.vendor.findFirst({
        where: { email, NOT: { id } },
      });
      if (duplicateEmail) {
        return NextResponse.json({ success: false, error: 'Email already in use.' }, { status: 400 });
      }
    }

    // Logo Upload Logic
    let logoUrl = body.logo || existingVendor.logo;
    if (logoFile && logoFile instanceof File && logoFile.size > 0) {
      const bytes = await logoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${logoFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      const uploadDir = path.join(process.cwd(), 'public/uploads/vendors');
      await mkdir(uploadDir, { recursive: true });
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      logoUrl = `/uploads/vendors/${filename}`;
    }

    // Hash password if provided
    let hashedPassword = existingVendor.password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Transactional Update
    const result = await prisma.$transaction(async (tx) => {
        // 1. Sync Metafields
        await tx.vendorMetafield.deleteMany({
            where: { vendorId: id }
        });

        // 2. Update Vendor
        const updated = await tx.vendor.update({
            where: { id },
            data: {
              email: email ?? existingVendor.email,
              password: hashedPassword,
              phone: phone ?? existingVendor.phone,
              profileImage: profileImage ?? existingVendor.profileImage,
              logo: logoUrl,
              commissionRate: finalCommission,
              businessSlug: businessSlug ?? existingVendor.businessSlug,
              status: status ?? existingVendor.status,
              // Localized JSON fields
              name: (name || nameHi || nameGu) ? {
                en: name ?? (existingVendor.name?.en || ''),
                hi: nameHi ?? (existingVendor.name?.hi || ''),
                gu: nameGu ?? (existingVendor.name?.gu || '')
              } : existingVendor.name,
              businessName: (businessName || businessNameHi || businessNameGu) ? {
                en: businessName ?? (existingVendor.businessName?.en || ''),
                hi: businessNameHi ?? (existingVendor.businessName?.hi || ''),
                gu: businessNameGu ?? (existingVendor.businessName?.gu || '')
              } : existingVendor.businessName,
              description: (description || descriptionHi || descriptionGu) ? {
                en: description ?? (existingVendor.description?.en || ''),
                hi: descriptionHi ?? (existingVendor.description?.hi || ''),
                gu: descriptionGu ?? (existingVendor.description?.gu || '')
              } : existingVendor.description,
              serviceArea: (serviceArea || serviceAreaHi || serviceAreaGu) ? {
                en: serviceArea ?? (existingVendor.serviceArea?.en || ''),
                hi: serviceAreaHi ?? (existingVendor.serviceArea?.hi || ''),
                gu: serviceAreaGu ?? (existingVendor.serviceArea?.gu || '')
              } : existingVendor.serviceArea,
              metafields: parsedMetafields.length > 0 ? {
                  create: parsedMetafields.map(m => ({
                    namespace: m.namespace || 'custom',
                    key: m.key,
                    value: String(m.value ?? ''),
                    type: m.type || 'text',
                  }))
              } : undefined
            },
            include: {
              productRequests: true,
              products: true,
              images: true,
              reviews: true,
              metafields: true,
            },
        });

        return updated;
    });

    return NextResponse.json({
      success: true,
      message: 'Vendor updated successfully',
      vendor: result,
    });
  } catch (error) {
    console.error('UPDATE VENDOR ERROR:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update vendor',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ===============================
// DELETE VENDOR
// ===============================
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const existingVendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        products: true,
        productRequests: true,
      },
    });

    if (!existingVendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found.' },
        { status: 404 }
      );
    }

    // Optional safety
    if (existingVendor.products.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete vendor with existing products.',
        },
        { status: 400 }
      );
    }

    await prisma.vendor.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Vendor deleted successfully',
    });
  } catch (error) {
    console.error('DELETE VENDOR ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete vendor',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
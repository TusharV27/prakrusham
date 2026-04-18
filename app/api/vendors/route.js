import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// ===============================
// GET ALL VENDORS
// ===============================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    const where = {
      ...(status ? { status: status } : {}),
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { businessSlug: { contains: search, mode: 'insensitive' } },
              { businessName: { path: ['en'], string_contains: search, mode: 'insensitive' } },
              { businessName: { path: ['hi'], string_contains: search, mode: 'insensitive' } },
              { businessName: { path: ['gu'], string_contains: search, mode: 'insensitive' } },
              { name: { path: ['en'], string_contains: search, mode: 'insensitive' } },
              { name: { path: ['hi'], string_contains: search, mode: 'insensitive' } },
              { name: { path: ['gu'], string_contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [vendors, total, activeCount, commissionRaw] = await Promise.all([
      prisma.vendor.findMany({
        where,
        include: {
          images: { take: 1 },
          _count: {
            select: {
              productRequests: true,
              products: true,
              reviews: true,
            }
          }
        },
        orderBy: { businessName: 'asc' },
        skip,
        take: limit,
      }),
      prisma.vendor.count({ where }),
      prisma.vendor.count({ where: { OR: [{ status: 'active' }, { status: 'Active' }] } }),
      prisma.vendor.aggregate({
        _avg: { commissionRate: true }
      })
    ]);

    const formatted = vendors.map(v => ({
      ...v,
      name: (typeof v.name === 'object' && v.name !== null) ? v.name : { en: v.name || '', hi: '', gu: '' },
      businessName: (typeof v.businessName === 'object' && v.businessName !== null) ? v.businessName : { en: v.businessName || '', hi: '', gu: '' },
      description: (typeof v.description === 'object' && v.description !== null) ? v.description : { en: v.description || '', hi: '', gu: '' },
      serviceArea: (typeof v.serviceArea === 'object' && v.serviceArea !== null) ? v.serviceArea : { en: v.serviceArea || '', hi: '', gu: '' },
      productsCount: v._count?.products || 0,
      reviewsCount: v._count?.reviews || 0,
      requestsCount: v._count?.productRequests || 0
    }));

    return NextResponse.json({
      success: true,
      data: formatted, // Using data instead of vendors for consistency with other APIs, but we'll include both so old code doesn't break
      vendors: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalVendors: total, // Current filtered total
        globalTotal: await prisma.vendor.count(),
        activePartners: activeCount,
        avgCommission: commissionRaw._avg.commissionRate || 0,
      }
    });
  } catch (error) {
    console.error('GET VENDORS ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch vendors',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ===============================
// CREATE VENDOR
// ===============================
export async function POST(request) {
  try {
    const formData = await request.formData();

    const email = formData.get('email');
    const password = formData.get('password');
    const name = formData.get('name');
    const nameHi = formData.get('nameHi');
    const nameGu = formData.get('nameGu');
    const phone = formData.get('phone');
    const businessName = formData.get('businessName');
    const businessNameHi = formData.get('businessNameHi');
    const businessNameGu = formData.get('businessNameGu');
    const businessSlug = formData.get('businessSlug');
    const description = formData.get('description');
    const descriptionHi = formData.get('descriptionHi');
    const descriptionGu = formData.get('descriptionGu');
    const commissionRate = parseFloat(formData.get('commissionRate') || '0');
    const serviceArea = formData.get('serviceArea');
    const serviceAreaHi = formData.get('serviceAreaHi');
    const serviceAreaGu = formData.get('serviceAreaGu');
    const status = formData.get('status') || 'active';
    const logoFile = formData.get('logo');
    const metafields = formData.get('metafields');

    let parsedMetafields = [];
    try {
        parsedMetafields = typeof metafields === 'string' ? JSON.parse(metafields) : (metafields || []);
    } catch (e) {
        console.error('Error parsing vendor metafields:', e);
    }

    // VALIDATION
    if (!email || !password || !businessName) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and business name are required.' },
        { status: 400 }
      );
    }

    // Check unique email
    const existing = await prisma.vendor.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 400 });
    }

    // Slug generation
    const finalSlug = businessSlug || businessName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Logo Upload
    let logoUrl = null;
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const vendor = await prisma.vendor.create({
      data: {
        email,
        password: hashedPassword,
        name: { en: name || '', hi: nameHi || '', gu: nameGu || '' },
        phone,
        businessName: { en: businessName || '', hi: businessNameHi || '', gu: businessNameGu || '' },
        businessSlug: finalSlug,
        description: { en: description || '', hi: descriptionHi || '', gu: descriptionGu || '' },
        serviceArea: { en: serviceArea || '', hi: serviceAreaHi || '', gu: serviceAreaGu || '' },
        logo: logoUrl,
        commissionRate,
        status,
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
        metafields: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Vendor created successfully',
      vendor,
    });
  } catch (error) {
    console.error('CREATE VENDOR ERROR:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create vendor' },
      { status: 500 }
    );
  }
}


import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// ==============================
// GET ALL PRODUCTS
// ==============================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const searchBy = searchParams.get('searchBy') || 'all'; // New param
    const status = searchParams.get('status') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const vendorId = searchParams.get('vendorId') || '';
    const farmerId = searchParams.get('farmerId') || '';

    const skip = (page - 1) * limit;

    // Define search condition based on searchBy
    let searchCondition = {};
    if (search) {
      if (searchBy === 'id') {
        searchCondition = { id: search };
      } else if (searchBy === 'name') {
        searchCondition = {
          OR: [
            { name: { path: ['en'], string_contains: search, mode: 'insensitive' } },
            { name: { path: ['hi'], string_contains: search, mode: 'insensitive' } },
            { name: { path: ['gu'], string_contains: search, mode: 'insensitive' } },
          ]
        };
      } else if (searchBy === 'sku') {
        searchCondition = { sku: { contains: search, mode: 'insensitive' } };
      } else if (searchBy === 'barcode') {
        searchCondition = { barcode: { contains: search, mode: 'insensitive' } };
      } else if (searchBy === 'variant_id') {
        searchCondition = { variants: { some: { id: search } } };
      } else if (searchBy === 'variant_title') {
        searchCondition = { variants: { some: { title: { contains: search, mode: 'insensitive' } } } };
      } else {
        // Default "all" search
        searchCondition = {
          OR: [
            { name: { path: ['en'], string_contains: search, mode: 'insensitive' } },
            { name: { path: ['hi'], string_contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
            { tags: { contains: search, mode: 'insensitive' } },
          ],
        };
      }
    }

    const where = {
      ...((status && status !== 'ALL') ? { status } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(vendorId ? { vendorId } : {}),
      ...(farmerId ? { farmerId } : {}),
      ...searchCondition
    };

    const [products, total, allStatusCounts] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          status: true,
          sku: true,
          isRecommendation: true,
          isTaxable: true,
          taxRate: true,
          createdAt: true,
          category: { select: { id: true, name: true } },
          vendor: { select: { id: true, name: true, businessName: true, businessSlug: true } },
          farmer: {
            select: {
              id: true,
              user: { select: { id: true, name: true } }
            }
          },
          images: { take: 1, select: { url: true } },
          variants: {
            select: {
              id: true,
              title: true,
              sku: true,
              price: true,
              compareAtPrice: true,
              quantity: true,
              isDefault: true,
              isActive: true,
              options: true,
            }
          },
          inventoryItems: {
            select: { variantId: true, quantity: true }
          },
          reviews: {
            where: { status: 'APPROVED' },
            select: { rating: true }
          },
          shippingProfileId: true,
          shippingProfile: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
      prisma.product.groupBy({
        by: ['status'],
        _count: { _all: true }
      })
    ]);

    const stats = {
        total: allStatusCounts.reduce((acc, curr) => acc + curr._count._all, 0),
        active: allStatusCounts.find(s => s.status === 'ACTIVE')?._count._all || 0,
        draft: allStatusCounts.find(s => s.status === 'DRAFT')?._count._all || 0,
        archived: allStatusCounts.find(s => s.status === 'ARCHIVED')?._count._all || 0
    };

    const formatted = products.map(p => {
      const variantInventoryMap = (p.inventoryItems || []).reduce((acc, item) => {
        if (item.variantId) {
          acc[item.variantId] = (acc[item.variantId] || 0) + (item.quantity || 0);
        }
        return acc;
      }, {});

      const totalInventory = (p.variants || []).reduce((sum, v) => {
        const variantQuantity = variantInventoryMap[v.id] !== undefined
          ? variantInventoryMap[v.id]
          : (v.quantity || 0);
        return sum + variantQuantity;
      }, 0);

      return {
        id: p.id,
        name: p.name || { en: '', hi: '', gu: '' },
        slug: p.slug,
        price: p.price,
        status: p.status,
        sku: p.sku,
        createdAt: p.createdAt,
        categoryName: p.category?.name?.en || (typeof p.category?.name === 'string' ? p.category.name : ''),
        vendorName: p.vendor?.businessName?.en || (typeof p.vendor?.businessName === 'string' ? p.vendor.businessName : p.vendor?.name?.en || (typeof p.vendor?.name === 'string' ? p.vendor.name : '')),
        farmerName: p.farmer?.user?.name?.en || (typeof p.farmer?.user?.name === 'string' ? p.farmer.user.name : ''),
        image: p.images?.[0]?.url || null,
        images: p.images,
        isRecommendation: p.isRecommendation,
        isTaxable: p.isTaxable,
        taxRate: p.taxRate,
        inventory: totalInventory,
        stock: totalInventory,
        variants: (p.variants || []).map(v => ({
          id: v.id,
          title: v.title,
          sku: v.sku,
          price: v.price,
          compareAtPrice: v.compareAtPrice,
          quantity: variantInventoryMap[v.id] !== undefined
            ? variantInventoryMap[v.id]
            : (v.quantity || 0),
          isDefault: v.isDefault,
          isActive: v.isActive,
          options: v.options,
        })),
        rating: p.reviews?.length > 0 
          ? Number((p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length).toFixed(1)) 
          : 0,
        reviewCount: p.reviews?.length || 0,
        shippingProfileId: p.shippingProfileId,
        shippingProfileName: p.shippingProfile?.name || null,
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats
    });
  } catch (error) {
    console.error('GET PRODUCTS ERROR:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ==============================
// CREATE PRODUCT
// ==============================
export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body = {};
    let files = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        if (key !== 'images') {
          body[key] = value;
        }
      });
      files = formData.getAll('images');
    } else {
      body = await request.json();
      files = body.images || [];
    }

    const {
      name, nameHi, nameGu,
      slug,
      summaryHtml, summaryHtmlHi, summaryHtmlGu,
      bodyHtml, bodyHtmlHi, bodyHtmlGu,
      price,
      compareAtPrice,
      costPerItem,
      sku,
      barcode,
      weight,
      isTaxable,
      taxRate,
      status,
      categoryId,
      vendorId,
      farmerId,
      tags,
      metaTitle, metaTitleHi, metaTitleGu,
      metaDescription, metaDescriptionHi, metaDescriptionGu,
    } = body;

    let variants = body.variants || [];
    let metafields = body.metafields || [];
    let options = body.options || [];

    // Parse JSON safely
    if (typeof variants === 'string') {
      try { variants = JSON.parse(variants); } catch { variants = []; }
    }
    if (typeof metafields === 'string') {
      try { metafields = JSON.parse(metafields); } catch { metafields = []; }
    }
    if (typeof options === 'string') {
      try { options = JSON.parse(options); } catch { options = []; }
    }

    // Remove empty options (important fix)
    options = options.filter(opt => opt.name && opt.values?.length);

    // Number parser
    const parseNumber = (val, def = null) => {
      if (val === null || val === undefined || val === '' || val === 'null') return def;
      const n = parseFloat(val);
      return isNaN(n) ? def : n;
    };

    const finalPrice = parseNumber(price, 0);
    const finalCompareAtPrice = parseNumber(compareAtPrice);
    const finalCostPerItem = parseNumber(costPerItem);
    const finalWeight = parseNumber(weight);

    // Upload images
    const uploadDir = path.join(process.cwd(), 'public/uploads/products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadedImages = [];
    for (const file of files) {
      if (file && typeof file === 'object' && file.name) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, buffer);
        uploadedImages.push({ url: `/uploads/products/${fileName}` });
      } else if (typeof file === 'string') {
        uploadedImages.push({ url: file });
      } else if (file?.url) {
        uploadedImages.push({ url: file.url, altText: file.altText });
      }
    }

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'name and slug are required' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: {
          en: String(name || ''),
          hi: String(nameHi || ''),
          gu: String(nameGu || '')
        },
        slug,
        shortDesc: {
          en: String(summaryHtml || ''),
          hi: String(summaryHtmlHi || ''),
          gu: String(summaryHtmlGu || '')
        },
        description: {
          en: String(bodyHtml || ''),
          hi: String(bodyHtmlHi || ''),
          gu: String(bodyHtmlGu || '')
        },

        price: finalPrice,
        compareAtPrice: finalCompareAtPrice,
        costPerItem: finalCostPerItem,
        sku: sku || null,
        barcode: barcode || null,
        weight: finalWeight,

        isTaxable: String(isTaxable) === 'true' || isTaxable === true,
        taxRate: parseNumber(taxRate, 5.0),
        status: status || 'DRAFT',

        // ✅ FIXED RELATIONS (MAIN ERROR FIX)
        category: categoryId
          ? { connect: { id: categoryId } }
          : undefined,

        vendor: vendorId
          ? { connect: { id: vendorId } }
          : undefined,

        farmer: farmerId
          ? { connect: { id: farmerId } }
          : undefined,

        tags: tags || null,
        options,

        metaTitle: {
          en: metaTitle || '',
          hi: metaTitleHi || '',
          gu: metaTitleGu || ''
        },
        metaDescription: {
          en: metaDescription || '',
          hi: metaDescriptionHi || '',
          gu: metaDescriptionGu || ''
        },
        shippingProfileId: body.shippingProfileId || null,

        variants: variants.length
          ? {
            create: variants.map(v => ({
              title: v.name || v.title || 'Default Variant',
              sku: v.sku || null,
              barcode: v.barcode || null,
              price: parseNumber(v.price, 0),
              compareAtPrice: parseNumber(v.compareAtPrice, finalCompareAtPrice),
              costPerItem: parseNumber(v.costPerItem),
              weight: parseNumber(v.weight),
              quantity: parseInt(v.stock || v.quantity) || 0,
              isDefault: v.isDefault === true || v.isDefault === 'true',
              isActive: v.isActive !== false && v.isActive !== 'false',
              options: v.options || null,
            })),
          }
          : undefined,

        metafields: metafields.length
          ? {
            create: metafields.map(m => ({
              namespace: m.namespace || 'custom',
              key: m.key,
              value: String(m.value ?? ''),
              type: m.type || 'text',
            })),
          }
          : undefined,

        images: uploadedImages.length
          ? {
            create: uploadedImages.map(img => ({
              url: img.url,
              altText: img.altText || null,
            })),
          }
          : undefined,
      },

      include: {
        category: true,
        vendor: true,
        farmer: true,
        images: true,
        variants: true,
        metafields: true,
      },
    });

    return NextResponse.json(
      { success: true, data: product },
      { status: 201 }
    );

  } catch (error) {
    console.error('CREATE PRODUCT ERROR:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create product',
        details: error.message
      },
      { status: 500 }
    );
  }
}
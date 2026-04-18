import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { products } = await request.json();

    if (!Array.isArray(products)) {
        return NextResponse.json(
            { success: false, error: 'Invalid data format. Expected an array of products.' },
            { status: 400 }
        );
    }

    const results = {
      success: [],
      failed: [],
    };

    // Pre-fetch categories, vendors, and farmers to avoid redundant queries
    const [categories, vendors, farmers] = await Promise.all([
      prisma.category.findMany({ select: { id: true, name: true } }),
      prisma.vendor.findMany({ select: { id: true, name: true, businessName: true } }),
      prisma.farmer.findMany({ 
        select: { 
          id: true, 
          user: { select: { name: true } } 
        } 
      }),
    ]);

    const findCategoryId = (name) => {
      if (!name) return null;
      const lowerName = String(name).toLowerCase();
      const cat = categories.find(c => 
        (typeof c.name === 'string' && c.name.toLowerCase() === lowerName) ||
        (c.name?.en && c.name.en.toLowerCase() === lowerName) ||
        (c.name?.hi && c.name.hi.toLowerCase() === lowerName) ||
        (c.name?.gu && c.name.gu.toLowerCase() === lowerName)
      );
      return cat ? cat.id : null;
    };

    const findVendorId = (name) => {
      if (!name) return null;
      const lowerName = String(name).toLowerCase();
      const ven = vendors.find(v => 
        (v.businessName?.en && v.businessName.en.toLowerCase() === lowerName) ||
        (v.businessName?.hi && v.businessName.hi.toLowerCase() === lowerName) ||
        (v.businessName?.gu && v.businessName.gu.toLowerCase() === lowerName) ||
        (v.name?.en && v.name.en.toLowerCase() === lowerName) ||
        (typeof v.businessName === 'string' && v.businessName.toLowerCase() === lowerName)
      );
      return ven ? ven.id : null;
    };

    const findFarmerId = (name) => {
      if (!name) return null;
      const lowerName = String(name).toLowerCase();
      const far = farmers.find(f => 
        (f.user?.name?.en && f.user.name.en.toLowerCase() === lowerName) ||
        (f.user?.name?.hi && f.user.name.hi.toLowerCase() === lowerName) ||
        (f.user?.name?.gu && f.user.name.gu.toLowerCase() === lowerName) ||
        (typeof f.user?.name === 'string' && f.user.name.toLowerCase() === lowerName)
      );
      return far ? far.id : null;
    };

    for (const item of products) {
      try {
        const name = item.name || '';
        const enName = item.nameEn || item.name || '';
        const hiName = item.nameHi || '';
        const guName = item.nameGu || '';

        let slug = item.slug || enName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        // Ensure slug uniqueness
        let existingProduct = await prisma.product.findUnique({ where: { slug } });
        if (existingProduct) {
            slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }

        const categoryId = findCategoryId(item.category);
        const vendorId = findVendorId(item.vendor);
        const farmerId = findFarmerId(item.farmer);

        const price = parseFloat(item.price) || 0;
        const compareAtPrice = parseFloat(item.compareAtPrice) || null;
        const sku = item.sku || null;

        const product = await prisma.product.create({
          data: {
            name: {
              en: String(enName),
              hi: String(hiName),
              gu: String(guName)
            },
            slug,
            shortDesc: {
              en: String(item.summaryEn || item.summary || ''),
              hi: String(item.summaryHi || ''),
              gu: String(item.summaryGu || '')
            },
            description: {
              en: String(item.descriptionEn || item.description || ''),
              hi: String(item.descriptionHi || ''),
              gu: String(item.descriptionGu || '')
            },
            metaTitle: {
              en: String(item.metaTitleEn || ''),
              hi: String(item.metaTitleHi || ''),
              gu: String(item.metaTitleGu || '')
            },
            metaDescription: {
              en: String(item.metaDescEn || ''),
              hi: String(item.metaDescHi || ''),
              gu: String(item.metaDescGu || '')
            },
            price,
            compareAtPrice,
            sku,
            status: item.status || 'DRAFT',
            category: categoryId ? { connect: { id: categoryId } } : undefined,
            vendor: vendorId ? { connect: { id: vendorId } } : undefined,
            farmer: farmerId ? { connect: { id: farmerId } } : undefined,
            weight: parseFloat(item.weight) || null,
            barcode: item.barcode || null,
            tags: item.tags || null,
            // Create a default variant
            variants: {
                create: {
                    title: 'Default',
                    price,
                    compareAtPrice,
                    sku: sku ? `${sku}-DEF` : null,
                    quantity: parseInt(item.stock || item.quantity) || 0,
                    isDefault: true
                }
            }
          }
        });

        results.success.push({ name: enName, id: product.id });
      } catch (err) {
        results.failed.push({ 
            name: item.nameEn || item.name || 'Unknown', 
            error: err.message 
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('BULK UPLOAD ERROR:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

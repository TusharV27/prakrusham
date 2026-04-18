// app/api/categories/route.js

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const where = {
      ...(search
        ? {
            OR: [
              { name: { path: ['en'], string_contains: search, mode: 'insensitive' } },
              { name: { path: ['hi'], string_contains: search, mode: 'insensitive' } },
              { name: { path: ['gu'], string_contains: search, mode: 'insensitive' } },
              { slug: { contains: search, mode: 'insensitive' } },
              { description: { path: ['en'], string_contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { products: true }
          }
        },
        skip,
        take: limit,
      }),
      prisma.category.count({ where }),
    ]);

    const formatted = categories.map(c => ({
      ...c,
      name: (typeof c.name === 'object' && c.name !== null) ? c.name : { en: c.name || '', hi: '', gu: '' },
      description: (typeof c.description === 'object' && c.description !== null) ? c.description : { en: c.description || '', hi: '', gu: '' },
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET CATEGORIES ERROR:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch categories',
      data: []
    }, { status: 500 });
  }
}

// ===============================
export async function POST(request) {
  try {
    const formData = await request.formData();

    const name = formData.get('name')?.trim();
    const nameHi = formData.get('nameHi')?.trim();
    const nameGu = formData.get('nameGu')?.trim();
    const slug = formData.get('slug')?.trim();
    const description = formData.get('description')?.trim();
    const descriptionHi = formData.get('descriptionHi')?.trim();
    const descriptionGu = formData.get('descriptionGu')?.trim();
    const imageFile = formData.get('image');
    const iconFile = formData.get('icon');
    const displayImageFile = formData.get('displayImage');

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    const finalSlug = slug || name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check duplicate
    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { path: ['en'], equals: name } },
          { slug: finalSlug }
        ]
      }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Category with this name or slug already exists" },
        { status: 400 }
      );
    }

    let imageUrl = null;

    // Handle Image Upload
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      const uploadDir = path.join(process.cwd(), 'public/uploads/categories');

      await mkdir(uploadDir, { recursive: true });

      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);

      imageUrl = `/uploads/categories/${filename}`;
    }

    let iconUrl = null;
    // Handle Icon Upload
    if (iconFile && iconFile.size > 0) {
      const bytes = await iconFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `icon-${Date.now()}-${iconFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      const uploadDir = path.join(process.cwd(), 'public/uploads/categories');

      await mkdir(uploadDir, { recursive: true });

      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);

      iconUrl = `/uploads/categories/${filename}`;
    }

    let displayImageUrl = null;
    // Handle Display Image Upload
    if (displayImageFile && displayImageFile.size > 0) {
      const bytes = await displayImageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `display-${Date.now()}-${displayImageFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      const uploadDir = path.join(process.cwd(), 'public/uploads/categories');

      await mkdir(uploadDir, { recursive: true });

      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);

      displayImageUrl = `/uploads/categories/${filename}`;
    }

    // Create Category with JSON fields (Multilingual)
    const category = await prisma.category.create({
      data: {
        name: {
          en: name,
          hi: nameHi || name,
          gu: nameGu || name
        },
        slug: finalSlug,
        description: {
          en: description || '',
          hi: descriptionHi || '',
          gu: descriptionGu || ''
        },
        image: imageUrl,
        icon: iconUrl,
        displayImage: displayImageUrl,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      category,
    });

  } catch (error) {
    console.error('CREATE CATEGORY ERROR:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create category' },
      { status: 500 }
    );
  }
}

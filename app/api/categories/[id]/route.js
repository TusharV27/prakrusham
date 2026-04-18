import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// ===============================
// GET CATEGORY BY ID
// ===============================
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
        metafields: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error('GET CATEGORY ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch category',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
// ===============================
// UPDATE CATEGORY
// ===============================
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const contentType = request.headers.get('content-type') || '';
    let body = {};
    let imageFile = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        if (key === 'image') {
          imageFile = value;
        } else if (key === 'icon') {
          body[key] = value; 
        } else if (key === 'displayImage') {
          body[key] = value;
        } else {
          body[key] = value;
        }
      });
      // Correctly identify iconFile and displayImageFile
      const iconFileFromForm = formData.get('icon');
      if (iconFileFromForm && iconFileFromForm instanceof File) {
          body.iconFile = iconFileFromForm;
      }
      const displayImageFileFromForm = formData.get('displayImage');
      if (displayImageFileFromForm && displayImageFileFromForm instanceof File) {
          body.displayImageFile = displayImageFileFromForm;
      }
    } else {
      body = await request.json();
    }

    let metafields = body.metafields || [];
    if (typeof metafields === 'string') {
      try { metafields = JSON.parse(metafields); } catch (e) { metafields = []; }
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found.' },
        { status: 404 }
      );
    }

    const name = body.name?.trim();
    const nameHi = body.nameHi?.trim();
    const nameGu = body.nameGu?.trim();
    const slug = body.slug?.trim();
    const description = body.description?.trim();
    const descriptionHi = body.descriptionHi?.trim();
    const descriptionGu = body.descriptionGu?.trim();

    // Generate slug if name/slug updated
    let finalSlug = existingCategory.slug;

    if (slug || name) {
      finalSlug =
        slug ||
        name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

      const duplicateSlug = await prisma.category.findFirst({
        where: {
          slug: finalSlug,
          NOT: { id },
        },
      });

      if (duplicateSlug) {
        return NextResponse.json(
          { success: false, error: 'Slug already in use.' },
          { status: 400 }
        );
      }
    }

    let imageUrl = existingCategory.image;

    // Handle Image Upload
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      const uploadDir = path.join(process.cwd(), 'public/uploads/categories');

      await mkdir(uploadDir, { recursive: true });

      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);

      imageUrl = `/uploads/categories/${filename}`;
    }

    let iconUrl = existingCategory.icon;
    const iconFile = body.iconFile;

    // Handle Icon Upload
    if (iconFile && iconFile instanceof File && iconFile.size > 0) {
      const bytes = await iconFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `icon-${Date.now()}-${iconFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      const uploadDir = path.join(process.cwd(), 'public/uploads/categories');

      await mkdir(uploadDir, { recursive: true });

      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);

      iconUrl = `/uploads/categories/${filename}`;
    }

    let displayImageUrl = existingCategory.displayImage;
    const displayImageFile = body.displayImageFile;

    // Handle Display Image Upload
    if (displayImageFile && displayImageFile instanceof File && displayImageFile.size > 0) {
      const bytes = await displayImageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `display-${Date.now()}-${displayImageFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      const uploadDir = path.join(process.cwd(), 'public/uploads/categories');

      await mkdir(uploadDir, { recursive: true });

      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);

      displayImageUrl = `/uploads/categories/${filename}`;
    }

    const updatedCategory = await prisma.$transaction(async (tx) => {
      // 1. Update Category Base Data
      const category = await tx.category.update({
        where: { id },
        data: {
          name: {
            en: name || (existingCategory.name?.en || ''),
            hi: nameHi || (existingCategory.name?.hi || ''),
            gu: nameGu || (existingCategory.name?.gu || '')
          },
          slug: finalSlug,
          description: {
            en: description || (existingCategory.description?.en || ''),
            hi: descriptionHi || (existingCategory.description?.hi || ''),
            gu: descriptionGu || (existingCategory.description?.gu || '')
          },
          image: imageUrl,
          icon: iconUrl,
          displayImage: displayImageUrl,
        },
      });

      // 2. Sync Metafields
      await tx.categoryMetafield.deleteMany({ where: { categoryId: id } });
      if (metafields.length > 0) {
        await tx.categoryMetafield.createMany({
          data: metafields.map(m => ({
            categoryId: id,
            namespace: m.namespace || 'custom',
            key: m.key,
            value: String(m.value ?? ''),
            type: m.type || 'text',
          }))
        });
      }

      return await tx.category.findUnique({
        where: { id },
        include: { metafields: true }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      category: updatedCategory,
    });
  } catch (error) {
    console.error('UPDATE CATEGORY ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update category',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ===============================
// DELETE CATEGORY
// ===============================
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found.' },
        { status: 404 }
      );
    }

    // Optional safety: prevent delete if products exist
    if (existingCategory.products.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete category with existing products.',
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('DELETE CATEGORY ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete category',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
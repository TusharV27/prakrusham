// middleware.js   ← Project ke ROOT folder mein (package.json ke saath)

import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'prakrushi-admin-secret-key-2026-change-in-production'
);

const ADMIN_PATHS = [
  '/admin',
  '/admin/orders',
  '/admin/products',
  '/admin/categories',
  '/admin/farmers',
  '/admin/vendors',
  '/admin/inventory',
  '/admin/areas',
  '/admin/warehouses',
  '/admin/offers',
  '/admin/reviews',
  '/admin/customers',
  '/admin/gallery',
  '/admin/events',
  '/admin/settings',
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isAdminPath = ADMIN_PATHS.some(path =>
    pathname === path || pathname.startsWith(path + '/')
  );

  if (!isAdminPath) {
    return NextResponse.next();
  }

  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
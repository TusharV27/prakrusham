// app/api/admin/logout/route.js

import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  // Important: Same cookie name use karo jo login mein set kiya tha
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,           // best way to delete cookie
  });

  return response;
}

// import { NextResponse } from 'next/server';

// export async function POST() {
//     try {
//         const response = NextResponse.json({
//             success: true,
//             message: 'Logged out successfully',
//         });

//         // Remove token cookie
//         response.cookies.set('token', '', {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: 'strict',
//             path: '/',
//             expires: new Date(0), // expire immediately
//         });

//         return response;
//     } catch (error) {
//         return NextResponse.json(
//             {
//                 success: false,
//                 message: 'Logout failed',
//                 error: error.message,
//             },
//             { status: 500 }
//         );
//     }
// }
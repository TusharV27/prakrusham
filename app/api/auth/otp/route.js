import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';

export async function POST(request) {
    try {
        console.log('--- OTP REQUEST START ---');
        const { phone } = await request.json();
        console.log('Phone number:', phone);

        if (!phone) {
            return NextResponse.json({ success: false, message: 'Phone number is required' }, { status: 400 });
        }

        const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const token = process.env.WHATSAPP_TOKEN;
        const template = process.env.WHATSAPP_TEMPLATE_NAME;

        if (!phoneId || !token || !template) {
            const configStatus = { phoneId: !!phoneId, token: !!token, template: !!template };
            console.error('Missing WhatsApp config:', configStatus);
            return NextResponse.json({ 
                success: false, 
                message: 'WhatsApp configuration is missing on server', 
                debug: configStatus 
            }, { status: 500 });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        console.log('Generated OTP:', otp);

        // Save OTP to database
        try {
            if (prisma.userOtp) {
                await prisma.userOtp.upsert({
                    where: { phone },
                    update: { otp, expiresAt, createdAt: new Date() },
                    create: { phone, otp, expiresAt },
                });
                console.log('OTP saved to database via Prisma Client');
            } else {
                console.log('Prisma Client UserOtp missing, using Raw SQL fallback');
                // Raw SQL Fallback for when Prisma Client isn't generated yet
                const id = `otp_${Date.now()}`;
                const now = new Date();
                const exp = expiresAt;
                
                await prisma.$executeRaw`
                    INSERT INTO "UserOtp" ("id", "phone", "otp", "expiresAt", "createdAt")
                    VALUES (${id}, ${phone}, ${otp}, ${exp}, ${now})
                    ON CONFLICT ("phone") 
                    DO UPDATE SET "otp" = ${otp}, "expiresAt" = ${exp}, "createdAt" = ${now}
                `;
                console.log('OTP saved to database via Raw SQL');
            }
        } catch (dbError) {
            console.error('Database Error (UserOtp):', dbError);
            return NextResponse.json({ 
                success: false, 
                message: 'Database operation failed', 
                error: dbError?.message,
                details: 'Please ensure UserOtp table exists and prisma client is updated.'
            }, { status: 500 });
        }

        // Send OTP via WhatsApp
        const waUrl = `https://graph.facebook.com/v22.0/${phoneId}/messages`;
        console.log('Sending to WhatsApp:', waUrl);

        const response = await fetch(
            waUrl,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: phone.startsWith('+') ? phone : `+91${phone}`,
                    type: 'template',
                    template: {
                        name: template,
                        language: { code: 'en_US' },
                        components: [
                            {
                                type: 'body',
                                parameters: [
                                    { type: 'text', text: otp },
                                ],
                            },
                            {
                                type: 'button',
                                sub_type: 'url',
                                index: '0',
                                parameters: [
                                    { type: 'text', text: otp },
                                ],
                            },
                        ],
                    },
                }),
            }
        );

        let data;
        try {
            data = await response.json();
        } catch (jsonErr) {
            console.error('JSON Parse Error from WhatsApp API:', jsonErr);
            return NextResponse.json({ success: false, message: 'WhatsApp API returned invalid JSON' }, { status: 500 });
        }

        if (response.ok) {
            console.log('WhatsApp Success:', data);
            return NextResponse.json({ success: true, message: 'OTP sent successfully' });
        } else {
            console.error('WhatsApp API Failure:', data);
            return NextResponse.json({ success: false, message: 'WhatsApp API returned error', error: data }, { status: 500 });
        }
    } catch (error) {
        console.error('OTP GLOBAL ROUTE ERROR:', error);
        return NextResponse.json({ success: false, message: 'Internal server error', details: error?.message }, { status: 500 });
    } finally {
        console.log('--- OTP REQUEST END ---');
    }
}

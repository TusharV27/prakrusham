import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'scratch', 'api_logs.txt');

function writeLog(msg) {
  try {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `[DEBUG-ROUTE] [${timestamp}] ${msg}\n`);
  } catch (e) {}
}

export async function POST(request) {
  writeLog('--- DEBUG POST START ---');
  try {
    const body = await request.json();
    writeLog(`Payload: ${JSON.stringify(body)}`);

    const { userId, type, houseNumber, city, state, pincode, phoneNumber, fullName } = body;

    if (!userId) {
      writeLog('ERROR: userId missing');
      return NextResponse.json({ success: false, message: 'User ID missing' }, { status: 400 });
    }

    // Direct creation without customer check first to see if it even reaches here
    writeLog(`Processing userId: ${userId}`);
    
    let customer = await prisma.customer.findUnique({ where: { userId } });
    if (!customer) {
        writeLog('Customer not found, creating...');
        customer = await prisma.customer.create({ data: { userId } });
    }

    const newAddress = await prisma.address.create({
      data: {
        customerId: customer.id,
        type: type || 'Home',
        phoneNumber: phoneNumber || '',
        pincode: pincode || '',
        isDefault: true,
        fullName: fullName || { en: 'Customer' }, 
        addressLine1: { en: houseNumber || '' },
        addressLine2: { en: '' }, 
        landmark: { en: '' },
        city: { en: city || 'Surat' },
        state: { en: state || 'Gujarat' },
      },
    });

    writeLog('SUCCESS: Address created');
    return NextResponse.json({ success: true, address: newAddress });
  } catch (err) {
    writeLog(`FATAL ERROR: ${err.message}`);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

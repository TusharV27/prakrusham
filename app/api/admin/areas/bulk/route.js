import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const normalizeString = (value) => {
  if (value === undefined || value === null) return '';
  return String(value).trim();
};

const findPincode = (item) => {
  return normalizeString(item.pincode || item.pin || item.PIN || item.postal || item.postalCode || item.postalcode || item.postal_code);
};

const findStatus = (item) => {
  const raw = normalizeString(item.status || item.Status || item.statusCode || item.active);
  if (!raw) return 'active';
  return ['active', 'inactive', 'suspended'].includes(raw.toLowerCase()) ? raw.toLowerCase() : 'active';
};

export async function POST(request) {
  try {
    const { areas } = await request.json();

    if (!Array.isArray(areas)) {
      return NextResponse.json(
        { success: false, error: 'Invalid data format. Expected an array of areas.' },
        { status: 400 }
      );
    }

    const results = {
      success: [],
      failed: [],
    };

    for (const item of areas) {
      try {
        const pincode = findPincode(item);
        if (!/^[0-9]{6}$/.test(pincode)) {
          throw new Error('Invalid or missing pincode.');
        }

        const areaName = normalizeString(item.areaName || item.area || item.name || item['Area Name'] || '');
        const city = normalizeString(item.city || item.City || item.cityName || item['City Name'] || '');
        const district = normalizeString(item.district || item.District || item.districtName || item['District'] || '');
        const state = normalizeString(item.state || item.State || item.stateName || item['State'] || '');
        const deliveryCharge = parseFloat(normalizeString(item.deliveryCharge || item.delivery_charge || item['Delivery Charge'] || 0)) || 0;
        const minOrderAmount = parseFloat(normalizeString(item.minOrderAmount || item.min_order_amount || item['Min Order Amount'] || 0)) || 0;
        const status = findStatus(item);

        if (!areaName || !city || !state) {
          throw new Error('areaName, city, and state are required.');
        }

        const existing = await prisma.area.findFirst({ where: { pincode } });
        if (existing) {
          results.failed.push({ row: item, error: 'Area with this pincode already exists.' });
          continue;
        }

        const created = await prisma.area.create({
          data: {
            areaName,
            city,
            district: district || null,
            state: state || null,
            pincode,
            deliveryCharge,
            minOrderAmount,
            status,
          },
        });

        results.success.push({ pincode, id: created.id, areaName });
      } catch (error) {
        results.failed.push({ row: item, error: error.message });
      }
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Bulk areas upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while importing areas.' },
      { status: 500 }
    );
  }
}

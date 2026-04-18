import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get the real client IP from headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp    = request.headers.get('x-real-ip');
    let clientIp    = forwarded ? forwarded.split(',')[0].trim() : (realIp || '');

    // Normalize IPv6-mapped IPv4 addresses (e.g., ::ffff:10.27.3.50 -> 10.27.3.50)
    if (clientIp.startsWith('::ffff:')) {
      clientIp = clientIp.substring(7);
    }

    // Ignore private/local IPs (they can't be geolocated)
    const isPrivate = 
      !clientIp || 
      clientIp === '::1' || 
      clientIp === '127.0.0.1' || 
      clientIp === 'localhost' ||
      clientIp.startsWith('10.') || 
      clientIp.startsWith('192.168.') || 
      clientIp.startsWith('172.') ||
      clientIp.startsWith('169.254.'); // Link-local

    // ─── IMMEDIATE OVERRIDE: Local Development ─────────────────────────────
    // If we are on a local private IP (10.x, 192.x, 172.x, or 127.x), 
    // common geocoding services will fail or be slow.
    // We immediately return a default city to ensure a "Live" experience for developers.
    if (isPrivate) {
      return NextResponse.json({ 
        success: true, 
        data: {
          ip:           clientIp || '127.0.0.1',
          city:         'Surat',
          region:       'Gujarat',
          postal:       '394107',
          country:      'India',
          country_code: 'IN',
          latitude:     21.2291,
          longitude:    72.8468,
          isLocal:      true, // Helper flag for UI debugging
        } 
      });
    }

    // Build ipbot URL for public IPs
    const url = `https://api.ipbot.com/${clientIp}`;
    
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(2000)
    });

    if (!res.ok) {
      throw new Error(`ipbot returned ${res.status}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      throw new Error('ipbot did not return JSON: ' + text.slice(0, 100));
    }

    const data = await res.json();

    let result = {
      ip:           data.ip           || clientIp || '',
      city:         data.location?.city         || '',
      region:       data.location?.region       || '',
      postal:       data.location?.postal       || '',
      country:      data.location?.country      || '',
      country_code: data.location?.country_code || '',
      latitude:     data.location?.latitude     || null,
      longitude:    data.location?.longitude    || null,
    };

    // ─── Fallback Loop for Public IPs ───────────────────────────────────────
    if (!result.city || result.city === '-') {
      const fallbackServices = [
        `https://ipwho.is/${clientIp}`,
        `https://ipapi.co/${clientIp}/json/`,
        `http://ip-api.com/json/${clientIp}`,
      ];

      for (const service of fallbackServices) {
        try {
          const fbRes = await fetch(service, { signal: AbortSignal.timeout(2000) });
          if (!fbRes.ok) continue;
          const fbData = await fbRes.json();
          
          if (fbData.city && fbData.city !== '-') {
            result = {
              ip:           fbData.ip || fbData.query || result.ip,
              city:         fbData.city,
              region:       fbData.region || fbData.region_name || '',
              postal:       fbData.postal || fbData.zip || '',
              country:      fbData.country || fbData.country_name || '',
              country_code: fbData.country_code || fbData.country_code2 || '',
              latitude:     fbData.latitude || fbData.lat || null,
              longitude:    fbData.longitude || fbData.lon || null,
            };
            break;
          }
        } catch (e) {
          console.warn(`Fallback ${service} failed:`, e.message);
        }
      }
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('LOCATION PROXY ERROR:', error.message);
    return NextResponse.json(
      { success: false, error: error.message, data: null },
      { status: 200 }
    );
  }
}

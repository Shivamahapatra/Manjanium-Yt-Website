import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionKey = searchParams.get('session_key') || 'latest';
    const driver1 = searchParams.get('d1');
    const driver2 = searchParams.get('d2');

    const urls = [];
    if (driver1) urls.push(fetch(`https://api.openf1.org/v1/car_data?driver_number=${driver1}&session_key=${sessionKey}`, { cache: 'no-store' }));
    if (driver2) urls.push(fetch(`https://api.openf1.org/v1/car_data?driver_number=${driver2}&session_key=${sessionKey}`, { cache: 'no-store' }));

    const responses = await Promise.all(urls);
    const data = await Promise.all(responses.map(res => res.json()));

    return NextResponse.json({
      telemetry: data
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

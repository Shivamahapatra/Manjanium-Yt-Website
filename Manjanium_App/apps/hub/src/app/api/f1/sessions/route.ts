import { NextResponse } from 'next/server';

export const revalidate = 60;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionKey = searchParams.get('session_key');
    const year = searchParams.get('year');
    const countryName = searchParams.get('country_name');
    const sessionType = searchParams.get('session_type');
    
    let url = 'https://api.openf1.org/v1/sessions?';
    
    if (sessionKey) {
      url += `session_key=${sessionKey}`;
    } else if (year) {
      url += `year=${year}`;
      if (countryName) url += `&country_name=${countryName}`;
      if (sessionType) url += `&session_type=${sessionType}`;
    } else {
      url += 'session_key=latest';
    }
    
    const res = await fetch(url, { next: { revalidate: 60 } });
    const data = await res.json();
    
    return NextResponse.json({
      sessions: Array.isArray(data) ? data : [data]
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

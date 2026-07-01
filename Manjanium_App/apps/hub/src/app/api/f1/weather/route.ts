import { NextResponse } from 'next/server';

export const revalidate = 30;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionKey = searchParams.get('session_key') || 'latest';
    
    const weatherRes = await fetch(`https://api.openf1.org/v1/weather?session_key=${sessionKey}`);
    const weatherData = await weatherRes.json();

    return NextResponse.json({
      weather: weatherData
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

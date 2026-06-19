import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://v3.football.api-sports.io/fixtures?live=all", {
      headers: {
        "x-apisports-key": process.env.API_SPORTS_KEY || "",
      },
      next: {
        revalidate: 30, // cache for 30 seconds
      }
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch live football fixtures:", error);
    return NextResponse.json({ response: [] }, { status: 500 });
  }
}

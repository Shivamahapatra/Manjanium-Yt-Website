import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

export const revalidate = 900; // 15 minutes

export async function GET() {
  try {
    const parser = new Parser();
    
    // motorsport.com F1 feed (sometimes blocked by CORS on client, but works server-side)
    const feed = await parser.parseURL('https://www.motorsport.com/rss/f1/news/');
    
    return NextResponse.json({
      updates: feed.items.map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        contentSnippet: item.contentSnippet,
        source: 'Motorsport.com'
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

export const revalidate = 900; // 15 minutes

function classifyTags(title: string, snippet: string): string[] {
  const text = `${title} ${snippet}`.toLowerCase();
  const tags: string[] = [];
  if (/upgrade|floor|wing|sidepod|diffuser|rear wing|front wing/i.test(text)) tags.push('Upgrade');
  if (/regulat|fia|rule|ban|clarif/i.test(text)) tags.push('Regulation');
  if (/engine|power unit|pu|hybrid|mgu|turbo/i.test(text)) tags.push('Engine');
  if (/aero|downforce|drag|beam wing/i.test(text)) tags.push('Aero');
  if (/strateg|tyre|tire|undercut|overcut|pit stop|safety car/i.test(text)) tags.push('Strategy');
  if (/protest|appeal|penalty|steward|investigation/i.test(text)) tags.push('Protest');
  return tags.length > 0 ? tags : ['General'];
}

export async function GET() {
  try {
    const parser = new Parser();
    
    const feeds = [
      { url: 'https://www.motorsport.com/rss/f1/news/', source: 'Motorsport.com' },
      { url: 'https://www.the-race.com/feed/', source: 'The Race' },
      { url: 'https://www.autosport.com/rss/feed/f1', source: 'Autosport' },
    ];
    
    const allItems: any[] = [];
    
    // Fetch all feeds in parallel, gracefully handle failures
    const results = await Promise.allSettled(
      feeds.map(async (feed) => {
        try {
          const parsed = await parser.parseURL(feed.url);
          return parsed.items.map(item => ({
            title: item.title || '',
            link: item.link || '',
            pubDate: item.pubDate || '',
            contentSnippet: (item.contentSnippet || '').slice(0, 200),
            source: feed.source,
            tags: classifyTags(item.title || '', item.contentSnippet || ''),
          }));
        } catch {
          return [];
        }
      })
    );
    
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allItems.push(...result.value);
      }
    });
    
    // Sort by date (newest first) and deduplicate by title
    const seen = new Set<string>();
    const unique = allItems
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .filter(item => {
        const key = item.title.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    return NextResponse.json({
      updates: unique.slice(0, 50) // Cap at 50 articles
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

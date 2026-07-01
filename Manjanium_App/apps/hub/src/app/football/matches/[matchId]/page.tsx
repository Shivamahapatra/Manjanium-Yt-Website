import { Metadata } from 'next';
import { MatchDetailsClient } from './MatchDetailsClient';

type Props = {
  params: Promise<{ matchId: string }>;
};

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { matchId } = await params;
  try {
    const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${matchId}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('Match not found');
    const data = await res.json();
    
    if (data.header && data.header.competitions && data.header.competitions[0]) {
      const comp = data.header.competitions[0];
      const home = comp.competitors.find((c: any) => c.homeAway === 'home')?.team?.displayName || 'Home Team';
      const away = comp.competitors.find((c: any) => c.homeAway === 'away')?.team?.displayName || 'Away Team';
      
      return {
        title: `${home} vs ${away} - World Cup 2026 | Football Hub`,
        description: `Live match details, timeline, statistics, and lineups for ${home} vs ${away}.`,
      };
    }
  } catch (error) {
    console.error('Metadata fetch error:', error);
  }

  return {
    title: 'Match Details | Football Hub',
    description: 'Live match details, timeline, statistics, and lineups.',
  };
}

export default async function MatchDetailsDedicatedPage({ params }: Props) {
  const { matchId } = await params;

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <MatchDetailsClient matchId={matchId} />
    </div>
  );
}

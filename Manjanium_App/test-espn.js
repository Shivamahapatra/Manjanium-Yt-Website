// Node 18+ has built-in fetch
async function test() {
  try {
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260628-20260719');
    const data = await res.json();
    console.log(`Found ${data.events?.length || 0} events.`);
    if (data.events && data.events.length > 0) {
      console.log(JSON.stringify(data.events.map(e => ({
        name: e.name,
        date: e.date,
        shortDetail: e.status.type.shortDetail
      })), null, 2));
    }
  } catch(e) {
    console.log(e);
  }
}
test();

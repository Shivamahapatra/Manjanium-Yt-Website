/**
 * Utility for fetching and caching the Globe GeoJSON data to prevent redundant network calls.
 * Caches in localStorage for 7 days.
 */
export async function getGlobeData(signal?: AbortSignal): Promise<any> {
  const cacheKey = "globe_geojson";
  const timeKey = "globe_geojson_time";
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(cacheKey);
      const timestamp = localStorage.getItem(timeKey);

      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp, 10);
        if (age < oneWeek) {
          return JSON.parse(cached);
        }
      }
    } catch (e) {
      console.warn("Error reading globe data from localStorage cache:", e);
    }
  }

  // Fetch fresh data if cache is missing, invalid, or expired
  const res = await fetch("https://raw.githubusercontent.com/igorssc/react-globe/main/public/globe.json", {
    signal,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch globe geojson: ${res.statusText}`);
  }

  const data = await res.json();

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(timeKey, Date.now().toString());
    } catch (e) {
      console.warn("Error storing globe data to localStorage cache:", e);
    }
  }

  return data;
}

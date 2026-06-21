import { GeoJsonData } from "@/types/globe";

/**
 * Utility for fetching and caching the Globe GeoJSON data to prevent redundant network calls.
 * Caches in localStorage for 7 days.
 * Includes automatic retry mechanism with exponential backoff.
 */
export async function getGlobeData(
  signal?: AbortSignal,
  maxRetries = 3,
  retryDelay = 1000,
  onRetry?: (attempt: number, max: number, err: any) => void
): Promise<GeoJsonData> {
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
          return JSON.parse(cached) as GeoJsonData;
        }
      }
    } catch (e) {
      console.warn("Error reading globe data from localStorage cache:", e);
    }
  }

  // Fetch with retry logic
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch("https://raw.githubusercontent.com/igorssc/react-globe/main/public/globe.json", {
        signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = (await res.json()) as GeoJsonData;

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data));
          localStorage.setItem(timeKey, Date.now().toString());
        } catch (e) {
          console.warn("Error storing globe data to localStorage cache:", e);
        }
      }

      return data;
    } catch (err: any) {
      // If request was aborted by unmounting, do not retry
      if (signal?.aborted) {
        throw err;
      }

      // If we reached max retries, throw the final error
      if (i === maxRetries - 1) {
        throw err;
      }

      // Notify caller of progress
      if (onRetry) {
        onRetry(i + 1, maxRetries, err);
      }

      // Wait with backoff before next attempt
      await new Promise((resolve) => setTimeout(resolve, retryDelay * (i + 1)));
    }
  }

  throw new Error("Failed to load globe data after all retries");
}

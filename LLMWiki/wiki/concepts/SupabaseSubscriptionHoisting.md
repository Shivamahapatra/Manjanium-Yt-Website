# Supabase Subscription Hoisting

Tags: #supabase #realtime #architecture #react

## Overview
In [[ManjaniumSportsHub]], a critical architecture rule is implemented for managing Supabase Realtime subscriptions to avoid duplicate listeners and memory leaks.

## The Problem
If multiple child components (like individual telemetry widgets or preset layouts) each subscribe to the same Supabase Realtime channel, the application will open redundant WebSocket connections or fire duplicate state updates, leading to heavy performance degradation and rate limiting.

## The Hoisting Pattern
1. **Singleton Manager:** A `realtimeManager.ts` utility should manage the actual WebSocket connection to ensure there is only ever one connection open.
2. **State Hoisting:** The actual subscription should be hoisted to the top-level parent component (e.g. `F1Hub.tsx` or `FootballHub.tsx`), never inside the individual widget components.
3. **Prop Drilling/Context:** The parent component receives the real-time payloads and distributes the data down to the children (the dashboard widgets) via props or a React Context provider.

## Related
- [[ManjaniumSportsHub]]

"use client";

import React, { useEffect, useState } from "react";
import { LiveChatMarquee } from "@/components/chat/LiveChatMarquee";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Card, Spin } from "antd";

export default function F1HubPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/f1/live");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching F1 data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Determine if any session is in progress. ESPN uses 'in' for in-progress.
  const isLive = data?.events?.some(
    (event: any) => event.status?.type?.state === "in" || event.status?.type?.state === "post"
  ) ?? true; // Default to true to show off the simulation if API has no active events

  return (
    <div className="min-h-screen p-8 bg-neutral-50 dark:bg-black text-neutral-900 dark:text-neutral-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-red-600 dark:text-red-500">Live F1 Telemetry Hub</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-8">
              <h2 className="text-2xl font-semibold">Latest Events</h2>
              {data?.events?.map((event: any) => (
                <BackgroundGradient key={event.id} containerClassName="w-full">
                  <div className="p-6 bg-white dark:bg-neutral-900 rounded-[22px]">
                    <h3 className="text-xl font-bold mb-2 dark:text-white">{event.name}</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-4">{event.shortName}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded">
                        {event.status?.type?.detail || "Scheduled"}
                      </span>
                      <span className="dark:text-neutral-300">
                        {new Date(event.date).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </BackgroundGradient>
              ))}
              {!data?.events?.length && (
                <div className="p-6 bg-white dark:bg-neutral-900 rounded-[22px] border border-neutral-200 dark:border-neutral-800">
                  <p>No upcoming events found.</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-8">
              <h2 className="text-2xl font-semibold">Season Details</h2>
              <Card className="dark:bg-neutral-900 dark:border-neutral-800 dark:text-white shadow-md rounded-[22px]">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-700 pb-2">
                    <span className="font-bold">League</span>
                    <span>{data?.leagues?.[0]?.name || "Formula 1"}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-700 pb-2">
                    <span className="font-bold">Season</span>
                    <span>{data?.leagues?.[0]?.season?.year || "Current"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Abbreviation</span>
                    <span>{data?.leagues?.[0]?.abbreviation || "F1"}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
      
      {/* Simulation of Live Chat when active */}
      <LiveChatMarquee isActive={isLive} />
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { Rss, ExternalLink, Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/f1/updates');
        const data = await res.json();
        if (data.updates) {
          setUpdates(data.updates);
        }
      } catch (error) {
        console.error("Failed to fetch updates:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUpdates();
  }, []);

  return (
    <div className="p-4 md:p-8 min-h-full">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 via-neutral-500 to-neutral-400 dark:from-white dark:via-zinc-200 dark:to-zinc-500 mb-2 flex items-center gap-3">
            <Rss className="w-8 h-8 text-neutral-800 dark:text-white" />
            TECHNICAL UPDATES
          </h1>
          <p className="text-neutral-500">Latest F1 news and technical developments from motorsport.com.</p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse bg-[#111111] border border-[#1f1f1f] rounded-xl h-48" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {updates.map((item, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={idx} 
                className="bg-[#111111] border border-[#1f1f1f] rounded-xl overflow-hidden hover:border-blue-500/50 transition-colors group flex flex-col"
              >
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-500 mb-3 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <h2 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
                    {item.title}
                  </h2>
                  <p className="text-neutral-400 text-sm mb-6 line-clamp-3 flex-1">
                    {item.contentSnippet || "Read the full article for more details..."}
                  </p>
                  
                  <Link 
                    href={item.link} 
                    target="_blank"
                    className="flex items-center justify-between text-sm font-bold text-white bg-[#1a1a1a] p-3 rounded-lg group-hover:bg-blue-600 transition-colors mt-auto"
                  >
                    <span>Read Article</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

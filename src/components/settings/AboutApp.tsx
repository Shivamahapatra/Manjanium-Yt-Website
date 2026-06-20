"use client";

import React from "react";
import { Info, Code, ShieldCheck, FileText, Bug, MessageSquare, ExternalLink } from "lucide-react";

export function AboutApp() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto flex flex-col gap-10">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">About App</h2>
        <p className="text-[#94a3b8]">Information, features, and credits for Manjanium Sports Hub.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* App Info Card */}
        <div className="bg-[#0f172a] p-6 md:p-8 rounded-2xl border border-white/5 shadow-lg flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-[#fbbf24] rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-[#fbbf24]/10">
            <span className="text-3xl font-black text-black">M</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Manjanium Sports Hub</h3>
          <p className="text-[#94a3b8] mb-6">The ultimate live telemetry and match center.</p>
          
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-background/50 rounded-lg p-3 border border-white/5">
              <div className="text-xs text-[#94a3b8] mb-1">Version</div>
              <div className="font-mono font-bold text-white">v1.2.0-beta</div>
            </div>
            <div className="bg-background/50 rounded-lg p-3 border border-white/5">
              <div className="text-xs text-[#94a3b8] mb-1">Build</div>
              <div className="font-mono font-bold text-white">2026.06.20</div>
            </div>
          </div>
        </div>

        {/* Links and Credits */}
        <div className="flex flex-col gap-4">
          <a href="#" className="flex items-center justify-between p-4 bg-[#0f172a] rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#94a3b8] group-hover:text-white transition-colors" />
              <span className="font-medium text-white">Documentation</span>
            </div>
            <ExternalLink className="w-4 h-4 text-[#94a3b8] group-hover:text-[#fbbf24] transition-colors" />
          </a>
          
          <a href="#" className="flex items-center justify-between p-4 bg-[#0f172a] rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-[#94a3b8] group-hover:text-white transition-colors" />
              <span className="font-medium text-white">Community Discord</span>
            </div>
            <ExternalLink className="w-4 h-4 text-[#94a3b8] group-hover:text-[#fbbf24] transition-colors" />
          </a>
          
          <a href="#" className="flex items-center justify-between p-4 bg-[#0f172a] rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#94a3b8] group-hover:text-white transition-colors" />
              <span className="font-medium text-white">Privacy Policy</span>
            </div>
            <ExternalLink className="w-4 h-4 text-[#94a3b8] group-hover:text-[#fbbf24] transition-colors" />
          </a>

          <a href="#" className="flex items-center justify-between p-4 bg-[#0f172a] rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
            <div className="flex items-center gap-3">
              <Bug className="w-5 h-5 text-[#94a3b8] group-hover:text-white transition-colors" />
              <span className="font-medium text-white">Report a Bug</span>
            </div>
            <ExternalLink className="w-4 h-4 text-[#94a3b8] group-hover:text-[#fbbf24] transition-colors" />
          </a>
        </div>
      </div>

      {/* Credits Section */}
      <div className="bg-[#0f172a] p-6 md:p-8 rounded-2xl border border-white/5 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <Code className="w-5 h-5 text-[#fbbf24]" />
          <h3 className="font-bold text-white text-lg">Credits & Technology</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Core Stack</h4>
            <ul className="space-y-2 text-sm text-[#94a3b8]">
              <li>Next.js 14</li>
              <li>React 19</li>
              <li>TypeScript</li>
              <li>Tailwind CSS v4</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">UI & Design</h4>
            <ul className="space-y-2 text-sm text-[#94a3b8]">
              <li>Aceternity UI</li>
              <li>Framer Motion</li>
              <li>Lucide Icons</li>
              <li>Tabler Icons</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Data Providers</h4>
            <ul className="space-y-2 text-sm text-[#94a3b8]">
              <li>ESPN API</li>
              <li>FIA Data API</li>
              <li>OpenF1</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Development</h4>
            <ul className="space-y-2 text-sm text-[#94a3b8]">
              <li>Manjanium Team</li>
              <li>Open Source Contributors</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="text-center text-sm text-[#94a3b8]/60 pb-8">
        &copy; {currentYear} Manjanium Sports. All rights reserved.
      </div>
    </div>
  );
}

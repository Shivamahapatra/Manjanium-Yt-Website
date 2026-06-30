"use client";

import React from "react";
import { Info, Code, ShieldCheck, FileText, Bug, MessageSquare, ExternalLink } from "lucide-react";

export function AboutApp() {
  const currentYear = new Date().getFullYear();
  
  const linkItems = [
    { icon: <FileText className="w-5 h-5" />, label: "Documentation", href: "#" },
    { icon: <MessageSquare className="w-5 h-5" />, label: "Community Discord", href: "#" },
    { icon: <ShieldCheck className="w-5 h-5" />, label: "Privacy Policy", href: "#" },
    { icon: <Bug className="w-5 h-5" />, label: "Report a Bug", href: "#" },
  ];

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto flex flex-col gap-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>About App</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Information, features, and credits for Manjanium Sports Hub.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* App Info Card */}
        <div
          className="p-6 md:p-8 rounded-2xl border shadow-lg flex flex-col items-center justify-center text-center"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-xl"
            style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 8px 24px rgba(251,191,36,0.15)' }}
          >
            <span className="text-3xl font-black" style={{ color: 'var(--color-background)' }}>M</span>
          </div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Manjanium Sports Hub</h3>
          <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>The ultimate live telemetry and match center.</p>
          
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="rounded-lg p-3 border" style={{ backgroundColor: 'var(--color-surface-container)', borderColor: 'var(--color-border)' }}>
              <div className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>Version</div>
              <div className="font-mono font-bold" style={{ color: 'var(--color-text-primary)' }}>v1.2.0-beta</div>
            </div>
            <div className="rounded-lg p-3 border" style={{ backgroundColor: 'var(--color-surface-container)', borderColor: 'var(--color-border)' }}>
              <div className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>Build</div>
              <div className="font-mono font-bold" style={{ color: 'var(--color-text-primary)' }}>2026.06.22</div>
            </div>
          </div>
        </div>

        {/* Links and Credits */}
        <div className="flex flex-col gap-3">
          {linkItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group hover:scale-[1.01]"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center gap-3">
                <span style={{ color: 'var(--color-text-secondary)' }} className="group-hover:text-[var(--color-text-primary)] transition-colors">{item.icon}</span>
                <span className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{item.label}</span>
              </div>
              <ExternalLink className="w-4 h-4 transition-colors" style={{ color: 'var(--color-text-secondary)' }} />
            </a>
          ))}
        </div>
      </div>

      {/* Credits Section */}
      <div
        className="p-6 md:p-8 rounded-2xl border shadow-lg"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Code className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>Credits & Technology</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { title: "Core Stack", items: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4"] },
            { title: "UI & Design", items: ["Aceternity UI", "Framer Motion", "Lucide Icons", "Tabler Icons"] },
            { title: "Data Providers", items: ["ESPN API", "FIA Data API", "OpenF1"] },
            { title: "Development", items: ["Manjanium Team", "Open Source Contributors"] },
          ].map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>{section.title}</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-center text-sm pb-8" style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }}>
        &copy; {currentYear} Manjanium Sports. All rights reserved.
      </div>
    </div>
  );
}

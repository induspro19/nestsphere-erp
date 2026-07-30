import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border/40 py-4 px-6 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2 bg-background/50">
      <div>
        © {new Date().getFullYear()} Society ERP SaaS Platform. All rights reserved.
      </div>
      <div className="flex items-center gap-4">
        <span>v1.0.0 (Phase 1 Foundation)</span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          System Operational
        </span>
      </div>
    </footer>
  );
};

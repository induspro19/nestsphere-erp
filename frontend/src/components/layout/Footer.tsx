import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border/40 py-4 px-6 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2 bg-background/50">
      <div>
        © {new Date().getFullYear()} NestSphere ERP Enterprise SaaS. All rights reserved.
      </div>
      <div className="flex items-center gap-4">
        <span className="font-mono text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-semibold border border-primary/20">
          v1.0.1 Production Ready
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          System Operational
        </span>
      </div>
    </footer>
  );
};

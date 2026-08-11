import React, { useState, useEffect } from 'react';
import { Search, Command } from 'lucide-react';
import { Input } from '../ui/input';

export const QuickSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between w-full max-w-[150px] sm:w-64 h-10 sm:h-9 min-h-[44px] sm:min-h-[36px] px-2.5 sm:px-3 text-xs sm:text-sm text-muted-foreground bg-accent/40 hover:bg-accent/70 border border-border/40 rounded-xl transition-all min-w-0"
      >
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 truncate">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="truncate">Search ERP...</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-medium bg-background px-1.5 py-0.5 rounded border border-border shrink-0">
          <Command className="h-3 w-3" /> K
        </kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-border/60 bg-card p-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 border-b border-border/40 pb-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search residents, flats, complaints, visitors..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="border-none focus-visible:ring-0 text-base"
              />
            </div>
            <div className="py-6 text-center text-sm text-muted-foreground">
              {query ? `Searching for "${query}" across modules...` : 'Type to search across all society modules...'}
            </div>
            <div className="flex justify-end pt-2 border-t border-border/40 text-xs text-muted-foreground">
              Press ESC to close
            </div>
          </div>
        </div>
      )}
    </>
  );
};

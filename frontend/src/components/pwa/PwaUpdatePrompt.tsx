import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { RefreshCw, X } from 'lucide-react';

export const PwaUpdatePrompt: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        setSwRegistration(registration);
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdate(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-primary text-primary-foreground p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-md">
      <div className="space-y-0.5">
        <h4 className="font-bold text-xs font-display">New Version Available</h4>
        <p className="text-[11px] opacity-90">A new version of NestSphere ERP is available.</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" variant="secondary" onClick={handleUpdate} className="gap-1 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Update Now
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowUpdate(false)} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

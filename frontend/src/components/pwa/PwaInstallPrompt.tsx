import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Download, X, Share } from 'lucide-react';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user is on iOS Safari and app is not installed
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;

    if (isIOS && !isStandalone) {
      const hasPrompted = localStorage.getItem('pwa_ios_prompt_dismissed');
      if (!hasPrompted) {
        setShowIOSPrompt(true);
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const dismissIOSPrompt = () => {
    setShowIOSPrompt(false);
    localStorage.setItem('pwa_ios_prompt_dismissed', 'true');
  };

  if (dismissed) return null;

  if (deferredPrompt) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-card border border-primary/40 p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm">
        <div className="space-y-1">
          <h4 className="font-bold text-xs font-display text-foreground">Install NestSphere App</h4>
          <p className="text-[11px] text-muted-foreground">Add to homescreen for fast offline access</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button size="sm" onClick={handleInstallClick} className="gap-1 text-xs">
            <Download className="h-3.5 w-3.5" /> Install
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDismissed(true)} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (showIOSPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 bg-card border border-primary/40 p-4 rounded-2xl shadow-2xl space-y-2 max-w-sm">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs font-display">Install NestSphere on iPhone</h4>
          <Button size="sm" variant="ghost" onClick={dismissIOSPrompt} className="h-6 w-6 p-0">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Tap <Share className="h-3.5 w-3.5 inline mx-1 text-primary" /> Share icon and select <strong>'Add to Home Screen'</strong> to install.
        </p>
      </div>
    );
  }

  return null;
};

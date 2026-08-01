import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from './../ui/button';

export const LoadingSpinner: React.FC<{ message?: string, timeoutMs?: number }> = ({ 
  message = 'Loading...', 
  timeoutMs = 8000 
}) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasTimedOut(true);
      console.error(`LoadingSpinner timed out after ${timeoutMs}ms while displaying: "${message}"`);
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [message, timeoutMs]);

  if (hasTimedOut) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4 min-h-[200px]">
        <AlertCircle className="h-10 w-10 text-destructive animate-pulse" />
        <div className="text-center space-y-1">
          <p className="text-lg font-bold text-foreground">Unable to load component</p>
          <p className="text-sm font-medium text-muted-foreground">{message} took too long.</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3 min-h-[200px]">
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
};

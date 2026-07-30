import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3 min-h-[200px]">
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
};

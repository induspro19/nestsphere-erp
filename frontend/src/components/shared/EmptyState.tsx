import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from '../ui/button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There are currently no items to display in this list.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border/60 space-y-4">
      <div className="h-12 w-12 rounded-full bg-accent/60 text-muted-foreground flex items-center justify-center">
        <FolderOpen className="h-6 w-6" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h4 className="font-semibold text-base">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="rounded-xl">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

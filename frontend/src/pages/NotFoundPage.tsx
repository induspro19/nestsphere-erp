import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="h-16 w-16 rounded-full bg-accent text-muted-foreground flex items-center justify-center">
        <FileQuestion className="h-8 w-8" />
      </div>
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-display">404 - Page Not Found</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          The view or route you requested does not exist in the platform.
        </p>
      </div>
      <Button onClick={() => navigate('/dashboard')} className="rounded-xl mt-2">
        <ArrowLeft className="mr-2 h-4 w-4" /> Return to Dashboard
      </Button>
    </div>
  );
};

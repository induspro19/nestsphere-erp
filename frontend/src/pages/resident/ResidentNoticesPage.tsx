import React from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Bell, CheckCircle2, FileText } from 'lucide-react';
import { toast } from 'sonner';

export const ResidentNoticesPage: React.FC = () => {
  const notices = [
    {
      id: 'n1',
      noticeNumber: 'NTC-00001',
      title: 'Scheduled Water Supply Interruption',
      category: 'WATER',
      priority: 'HIGH',
      date: '2026-07-24',
      content: 'Water supply will be temporarily shut off for tank cleaning on Sunday from 10:00 AM to 2:00 PM.',
    },
  ];

  const handleAcknowledge = (num: string) => {
    toast.success(`Notice ${num} acknowledged as read.`);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" /> Society Notices & Circulars
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Official society updates, water/electricity maintenance alerts, and circulars</p>
      </div>

      <div className="space-y-4">
        {notices.map((n) => (
          <div key={n.id} className="p-5 rounded-2xl bg-card border border-border/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs text-primary">{n.noticeNumber}</span>
              <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">{n.priority}</Badge>
            </div>
            <h3 className="font-bold text-sm">{n.title}</h3>
            <p className="text-xs text-muted-foreground bg-accent/30 p-3 rounded-xl">{n.content}</p>
            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => handleAcknowledge(n.noticeNumber)} className="gap-1.5 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" /> Acknowledge Read
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

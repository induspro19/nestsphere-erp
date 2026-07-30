import React from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { CalendarCheck, Video, ExternalLink, Download } from 'lucide-react';
import { toast } from 'sonner';

export const ResidentMeetingsPage: React.FC = () => {
  const meetings = [
    {
      id: 'm1',
      meetingNumber: 'MTG-00001',
      title: 'Annual General Meeting (AGM 2026)',
      type: 'AGM',
      date: '2026-07-30',
      time: '10:00 AM - 12:30 PM',
      mode: 'HYBRID',
      link: 'https://meet.google.com/abc-defg-hij',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
          <CalendarCheck className="h-6 w-6 text-primary" /> Society Meetings & AGM
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Upcoming general body meetings, online conferencing, agendas, and minutes</p>
      </div>

      <div className="space-y-4">
        {meetings.map((m) => (
          <div key={m.id} className="p-5 rounded-2xl bg-card border border-border/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs text-primary">{m.meetingNumber}</span>
              <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">{m.type}</Badge>
            </div>
            <h3 className="font-bold text-sm">{m.title}</h3>
            <p className="text-xs text-muted-foreground">Date: {m.date} | Time: {m.time}</p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/20">
              <Button size="sm" variant="outline" onClick={() => toast.success('Downloading Meeting Notice PDF...')} className="gap-1 text-xs">
                <Download className="h-3.5 w-3.5" /> Notice PDF
              </Button>
              <a href={m.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-md">
                <Video className="h-3.5 w-3.5" /> Join Meeting <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

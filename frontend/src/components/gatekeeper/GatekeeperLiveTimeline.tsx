import React from 'react';
import { Badge } from '../ui/badge';
import { Clock } from 'lucide-react';

export const GatekeeperLiveTimeline: React.FC = () => {
  const events = [
    { time: '12:05 PM', title: 'Visitor Entry Approved', desc: 'Sunil Verma -> Flat A-402 (Approved by Resident)', type: 'VISITOR', badge: 'APPROVED' },
    { time: '11:42 AM', title: 'Delivery Entry Logged', desc: 'Amazon Delivery -> Flat B-104 (Gate Pass Issued)', type: 'DELIVERY', badge: 'DELIVERY' },
    { time: '11:15 AM', title: 'Vehicle QR Verified', desc: 'MH-02-CB-8842 -> Slot A-402 (FASTag Active)', type: 'VEHICLE', badge: 'VERIFIED' },
    { time: '09:30 AM', title: 'Staff Checked In', desc: 'Sunita Devi (Maid) -> Flats A-402, B-101', type: 'STAFF', badge: 'STAFF' },
  ];

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm font-display text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
          <Clock className="h-4 w-4" /> Real-Time Stream
        </h3>
        <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 text-[10px] animate-pulse">Live</Badge>
      </div>

      <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border/50">
        {events.map((event, idx) => (
          <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Timeline node */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary/20 text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            </div>
            
            {/* Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-card border border-border/40 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-foreground text-sm">{event.title}</span>
                <span className="font-mono text-[10px] text-muted-foreground font-semibold">{event.time}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{event.desc}</p>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] px-2 font-bold tracking-wider hover:bg-primary/20">{event.badge}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CalendarCheck, Plus } from 'lucide-react';
import { toast } from 'sonner';

export const ResidentAmenitiesPage: React.FC = () => {
  const amenities = [
    { id: 'a1', name: 'Clubhouse Banquet Hall', fee: '₹1,500 / hr', status: 'AVAILABLE' },
    { id: 'a2', name: 'Tennis Court', fee: 'Free for Residents', status: 'BOOKED' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
          <CalendarCheck className="h-6 w-6 text-primary" /> Book Society Amenities
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Clubhouse hall, tennis court, swimming pool, and gym slot bookings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {amenities.map((item) => (
          <div key={item.id} className="p-5 rounded-2xl bg-card border border-border/40 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm font-display">{item.name}</h3>
              <Badge variant="outline">{item.fee}</Badge>
            </div>
            <Button size="sm" onClick={() => toast.success(`Slot booked for ${item.name}!`)} className="w-full text-xs">
              Book Slot
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { Badge } from '../../components/ui/badge';
import { ParkingCircle, Car, AlertTriangle } from 'lucide-react';

export const ResidentParkingPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
          <ParkingCircle className="h-6 w-6 text-primary" /> My Parking & Vehicles
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Assigned parking slots, registered vehicles, FASTag stickers, and PUC/insurance alerts</p>
      </div>

      <div className="p-5 rounded-2xl bg-card border border-border/40 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono font-bold text-xs text-primary">SLOT A-402</span>
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Allocated</Badge>
        </div>
        <div className="flex items-center gap-3">
          <Car className="h-5 w-5 text-primary" />
          <div>
            <h4 className="font-semibold text-sm">MH-02-CB-8842 (Honda City)</h4>
            <p className="text-xs text-muted-foreground">RFID Sticker: RFID-994012 • FASTag Active</p>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>PUC Compliance Notice: Vehicle PUC expires on 2026-08-15. Please renew.</span>
        </div>
      </div>
    </div>
  );
};

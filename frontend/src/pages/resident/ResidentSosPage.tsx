import React from 'react';
import { Button } from '../../components/ui/button';
import { ShieldAlert, Shield, Wrench, Flame, Ambulance, PhoneCall, Building } from 'lucide-react';
import { residentApi } from '../../api/resident.api';
import { toast } from 'sonner';

export const ResidentSosPage: React.FC = () => {
  const handleSos = async (type: string) => {
    try {
      await residentApi.triggerSos(type);
      toast.success(`🚨 EMERGENCY SOS DISPATCHED FOR ${type.toUpperCase()}! Security alerted immediately.`);
    } catch (err: any) {
      toast.error('Failed to dispatch SOS alert');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight text-rose-500 flex items-center gap-2">
          <ShieldAlert className="h-6 w-6" /> Emergency SOS Dispatch Center
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Instant 1-tap emergency dispatch to gate security, maintenance, and emergency response</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Button size="lg" variant="destructive" className="h-32 flex flex-col items-center justify-center gap-2 text-base font-bold shadow-xl" onClick={() => handleSos('SECURITY')}>
          <Shield className="h-8 w-8" /> Security Gate SOS
        </Button>
        <Button size="lg" variant="destructive" className="h-32 flex flex-col items-center justify-center gap-2 text-base font-bold shadow-xl" onClick={() => handleSos('MAINTENANCE')}>
          <Wrench className="h-8 w-8" /> Maintenance Breakdown
        </Button>
        <Button size="lg" variant="destructive" className="h-32 flex flex-col items-center justify-center gap-2 text-base font-bold shadow-xl" onClick={() => handleSos('FIRE')}>
          <Flame className="h-8 w-8" /> Fire Emergency
        </Button>
        <Button size="lg" variant="destructive" className="h-32 flex flex-col items-center justify-center gap-2 text-base font-bold shadow-xl" onClick={() => handleSos('AMBULANCE')}>
          <Ambulance className="h-8 w-8" /> Medical Ambulance
        </Button>
        <Button size="lg" variant="destructive" className="h-32 flex flex-col items-center justify-center gap-2 text-base font-bold shadow-xl" onClick={() => handleSos('POLICE')}>
          <PhoneCall className="h-8 w-8" /> Police Dispatch
        </Button>
        <Button size="lg" variant="destructive" className="h-32 flex flex-col items-center justify-center gap-2 text-base font-bold shadow-xl" onClick={() => handleSos('OFFICE')}>
          <Building className="h-8 w-8" /> Society Office
        </Button>
      </div>
    </div>
  );
};

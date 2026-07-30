import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Car, Camera } from 'lucide-react';
import { gatekeeperApi } from '../../api/gatekeeper.api';
import { toast } from 'sonner';

export const GatekeeperVehicleVerifyPage: React.FC = () => {
  const [vehicleNo, setVehicleNo] = useState('');
  const [vehicleData, setVehicleData] = useState<any>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNo) return;
    const res = await gatekeeperApi.verifyVehicle(vehicleNo);
    setVehicleData(res);
    toast.success(`Vehicle ${vehicleNo} verified! Owner: ${res.ownerName}`);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
          <Car className="h-6 w-6 text-primary" /> Vehicle QR & FASTag Verification
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-card border border-border/40 p-6 rounded-2xl shadow-sm space-y-4">
             <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Manual Verification</h3>
             <form onSubmit={handleVerify} className="flex flex-col gap-3">
              <Input
                placeholder="Enter Vehicle No (e.g. MH-02-CB-8842)..."
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                className="bg-background border-input text-foreground font-mono text-sm h-12 uppercase"
              />
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 px-6 shadow-sm">
                Verify Vehicle Data
              </Button>
            </form>
          </div>

          <div className="bg-card border border-border/40 p-6 rounded-2xl shadow-sm space-y-4">
             <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2"><Camera className="h-4 w-4"/> ANPR Scanner</h3>
             <div className="w-full aspect-video bg-muted border-2 border-dashed border-border/60 rounded-xl flex items-center justify-center relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors">
                <div className="text-center">
                   <Car className="h-8 w-8 text-muted-foreground mx-auto mb-2 group-hover:text-primary transition-colors" />
                   <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">Click to Activate ANPR Camera</span>
                </div>
             </div>
          </div>
        </div>

        <div>
          {vehicleData ? (
            <div className="p-6 rounded-2xl bg-card border border-border/40 space-y-6 shadow-sm h-full animate-in slide-in-from-right-2">
              <div className="flex items-center justify-between pb-4 border-b border-border/40">
                <span className="font-mono font-bold text-xl text-primary">{vehicleData.vehicleNo}</span>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 font-bold px-3 py-1 text-sm">{vehicleData.status}</Badge>
              </div>

              <div className="grid grid-cols-1 gap-5 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs font-semibold uppercase block mb-1">Registered Owner</span>
                  <p className="font-bold text-foreground text-base">{vehicleData.ownerName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs font-semibold uppercase block mb-1">Allocated Flat & Slot</span>
                  <p className="font-bold text-foreground text-base">{vehicleData.flat} <span className="text-muted-foreground font-normal">({vehicleData.parkingSlot})</span></p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/40">
                  <div>
                    <span className="text-muted-foreground text-xs font-semibold uppercase block mb-1">Insurance Valid Until</span>
                    <p className="font-semibold text-foreground">{vehicleData.insuranceValid}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs font-semibold uppercase block mb-1">PUC Compliance</span>
                    <p className="font-semibold text-primary">{vehicleData.pucValid}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-muted/30 border border-border/40 space-y-4 shadow-inner h-full flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 bg-card rounded-full flex items-center justify-center shadow-sm mb-2 text-muted-foreground">
                <Car className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-foreground">Waiting for Scan</h3>
              <p className="text-sm text-muted-foreground max-w-[200px]">Enter a vehicle number or use the ANPR scanner to view vehicle details and access status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

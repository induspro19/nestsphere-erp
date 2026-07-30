import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Truck, Check } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '../../components/shared/DataTable';

export const GatekeeperDeliveryPage: React.FC = () => {
  const [vendor, setVendor] = useState('AMAZON');
  const [flatNumber, setFlatNumber] = useState('');

  const vendors = ['AMAZON', 'FLIPKART', 'SWIGGY', 'ZOMATO', 'BLINKIT', 'ZEPTO', 'COURIER'];

  const [activeDeliveries, setActiveDeliveries] = useState([
    { id: '1', vendor: 'AMAZON', flat: 'A-402', entryTime: '10:15 AM' },
    { id: '2', vendor: 'SWIGGY', flat: 'B-104', entryTime: '10:30 AM' },
  ]);

  const handleLog = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`${vendor} delivery logged for Flat ${flatNumber}! Gate pass issued.`);
    setActiveDeliveries([{ id: Date.now().toString(), vendor, flat: flatNumber, entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...activeDeliveries]);
    setFlatNumber('');
  };

  const columns: { header: string; accessorKey: "vendor" | "flat" | "entryTime" }[] = [
    { header: 'Delivery Partner', accessorKey: 'vendor' },
    { header: 'Destination Flat', accessorKey: 'flat' },
    { header: 'Entry Time', accessorKey: 'entryTime' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="p-6 md:p-8 rounded-2xl bg-card border border-border/40 space-y-6 shadow-sm">
        <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" /> Log Delivery / Courier Entry
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {vendors.map((v) => (
            <Button
              key={v}
              type="button"
              variant={vendor === v ? 'default' : 'outline'}
              onClick={() => setVendor(v)}
              className={`h-12 font-bold text-xs ${
                vendor === v 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'border-border/40 bg-secondary/50 text-secondary-foreground hover:bg-secondary'
              }`}
            >
              {v}
            </Button>
          ))}
        </div>

        <form onSubmit={handleLog} className="space-y-4 pt-4">
          <div>
            <label className="text-foreground font-bold block mb-1.5">Destination Flat / Unit *</label>
            <Input
              value={flatNumber}
              onChange={(e) => setFlatNumber(e.target.value)}
              className="bg-background border-input text-foreground h-12 text-sm"
              placeholder="e.g. A-402"
              required
            />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm h-12 shadow-sm">
            <Check className="h-5 w-5 mr-2" /> Log Delivery Entry & Notify Resident
          </Button>
        </form>
      </div>

      <div className="bg-card border border-border/40 p-1 rounded-2xl shadow-sm">
         <div className="p-4 border-b border-border/40">
           <h3 className="font-bold text-foreground">Active Deliveries Inside</h3>
         </div>
         <DataTable 
           columns={columns}
           data={activeDeliveries}
           emptyMessage="No active deliveries logged."
         />
      </div>
    </div>
  );
};

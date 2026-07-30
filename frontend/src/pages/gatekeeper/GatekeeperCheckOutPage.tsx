import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { LogOut, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '../../components/shared/DataTable';

export const GatekeeperCheckOutPage: React.FC = () => {
  const [activeVisitors, setActiveVisitors] = useState([
    { id: 'v1', name: 'Sunil Verma', flat: 'A-402', entryTime: '10:15 AM', duration: '2 hrs 15 mins', overstay: false },
    { id: 'v2', name: 'Ramesh Contractor', flat: 'B-104', entryTime: '08:00 AM', duration: '4 hrs 45 mins', overstay: true },
  ]);

  const handleCheckout = (id: string, name: string) => {
    setActiveVisitors(activeVisitors.filter((v) => v.id !== id));
    toast.success(`Visitor ${name} successfully checked out.`);
  };

  const columns = [
    {
      header: 'Visitor Details',
      accessorKey: (row: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground">{row.name}</span>
          <span className="text-xs text-muted-foreground">Flat {row.flat}</span>
        </div>
      ),
    },
    {
      header: 'Entry & Duration',
      accessorKey: (row: any) => (
        <div className="flex flex-col">
          <span className="text-foreground">{row.entryTime}</span>
          <span className="text-xs font-semibold text-primary">{row.duration}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: (row: any) => (
        row.overstay ? (
          <Badge className="bg-red-600 text-white font-bold animate-pulse hover:bg-red-700">OVERSTAY ALERT</Badge>
        ) : (
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Active</Badge>
        )
      ),
    },
    {
      header: 'Action',
      accessorKey: (row: any) => (
        <Button
          onClick={() => handleCheckout(row.id, row.name)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs h-9 px-4"
        >
          <CheckCircle className="h-4 w-4 mr-2" /> Process Exit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
          <LogOut className="h-6 w-6 text-primary" /> Visitor Check-Out & Overstay Monitor
        </h2>
      </div>

      <div className="bg-card border border-border/40 p-1 rounded-2xl shadow-sm">
        <DataTable 
          columns={columns} 
          data={activeVisitors} 
          emptyMessage="No active visitors found inside the premises."
        />
      </div>
    </div>
  );
};

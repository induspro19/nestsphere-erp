import React from 'react';
import { Badge } from '../../components/ui/badge';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { DataTable } from '../../components/shared/DataTable';

export const GatekeeperBlacklistPage: React.FC = () => {
  const blacklists = [
    { id: 'b1', name: 'Vikram Malhotra', phone: '+91 99000 11111', reason: 'Unauthorised Entry & Disruption', addedOn: '2026-05-10' },
  ];

  const columns = [
    {
      header: 'Banned Person Details',
      accessorKey: (row: any) => (
        <div className="flex flex-col gap-1">
          <span className="font-bold text-foreground">{row.name}</span>
          <span className="text-xs text-muted-foreground">{row.phone}</span>
        </div>
      )
    },
    {
      header: 'Reason for Ban',
      accessorKey: (row: any) => (
        <div className="flex flex-col gap-1">
          <span className="text-foreground text-sm flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-red-600"/> {row.reason}</span>
          <span className="text-xs text-muted-foreground">Logged on: {row.addedOn}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessorKey: () => (
        <Badge className="bg-red-600 hover:bg-red-700 text-white font-bold">ENTRY DENIED</Badge>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-display text-red-600 flex items-center gap-2">
          <ShieldAlert className="h-6 w-6" /> Blacklist & Banned Persons Watchdog
        </h2>
      </div>

      <div className="bg-card border border-border/40 p-1 rounded-2xl shadow-sm">
        <DataTable 
          columns={columns}
          data={blacklists}
          emptyMessage="No blacklisted persons found."
        />
      </div>
    </div>
  );
};

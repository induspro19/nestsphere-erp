import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Users } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '../../components/shared/DataTable';

export const GatekeeperStaffAttendancePage: React.FC = () => {
  const [staffList, setStaffList] = useState([
    { id: 's1', name: 'Sunita Devi', role: 'Maid', flats: 'A-402, B-101', passId: 'STAFF-104', status: 'OUT' },
    { id: 's2', name: 'Ramesh Singh', role: 'Driver', flats: 'A-402', passId: 'STAFF-208', status: 'INSIDE' },
  ]);

  const toggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'INSIDE' ? 'OUT' : 'INSIDE';
    setStaffList(staffList.map((s) => (s.id === id ? { ...s, status: nextStatus } : s)));
    toast.success(`Staff member status updated to ${nextStatus}!`);
  };

  const columns = [
    {
      header: 'Pass ID & Role',
      accessorKey: (row: any) => (
        <div className="flex flex-col gap-1 items-start">
          <span className="font-mono font-bold text-xs text-primary">{row.passId}</span>
          <Badge variant="outline" className="text-[10px] uppercase">{row.role}</Badge>
        </div>
      )
    },
    {
      header: 'Staff Name & Flats',
      accessorKey: (row: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground">{row.name}</span>
          <span className="text-xs text-muted-foreground">Flats: <strong className="text-foreground">{row.flats}</strong></span>
        </div>
      )
    },
    {
      header: 'Current Status',
      accessorKey: (row: any) => (
        <Badge className={`font-bold ${row.status === 'INSIDE' ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'}`}>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Action',
      accessorKey: (row: any) => (
        <Button
          onClick={() => toggleStatus(row.id, row.status)}
          className={`h-9 font-bold text-xs px-4 w-[140px] shadow-sm ${
            row.status === 'INSIDE'
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {row.status === 'INSIDE' ? 'Mark Check-Out' : 'Mark Check-In'}
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" /> Domestic Staff & Daily Help Attendance
        </h2>
      </div>

      <div className="bg-card border border-border/40 p-1 rounded-2xl shadow-sm">
         <DataTable 
           columns={columns}
           data={staffList}
           emptyMessage="No staff registered."
         />
      </div>
    </div>
  );
};

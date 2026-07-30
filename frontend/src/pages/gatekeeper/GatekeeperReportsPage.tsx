import React from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { FileText, Download, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '../../components/shared/DataTable';

export const GatekeeperReportsPage: React.FC = () => {
  const reports = [
    { id: '1', title: "Today's Visitor Log Report", type: 'VISITOR_LOG', format: 'PDF & Excel', lastGenerated: 'Today, 08:00 AM' },
    { id: '2', title: 'Domestic Staff Attendance Register', type: 'STAFF_ATTENDANCE', format: 'PDF & Excel', lastGenerated: 'Yesterday, 06:00 PM' },
    { id: '3', title: 'Delivery & Courier Entry Audit', type: 'DELIVERY_LOG', format: 'PDF', lastGenerated: 'Today, 12:30 PM' },
    { id: '4', title: 'Blacklist Security Incident Log', type: 'BLACKLIST_LOG', format: 'PDF', lastGenerated: '2 Days Ago' },
  ];

  const columns = [
    {
      header: 'Report Title & Type',
      accessorKey: (row: any) => (
        <div className="flex flex-col gap-1 items-start">
          <span className="font-bold text-foreground">{row.title}</span>
          <Badge variant="outline" className="text-[10px] text-muted-foreground">{row.type}</Badge>
        </div>
      )
    },
    {
      header: 'Export Format',
      accessorKey: (row: any) => (
        <span className="text-sm text-foreground">{row.format}</span>
      )
    },
    {
      header: 'Last Generated',
      accessorKey: (row: any) => (
        <span className="text-sm text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3" /> {row.lastGenerated}
        </span>
      )
    },
    {
      header: 'Action',
      accessorKey: (row: any) => (
        <Button 
          size="sm" 
          onClick={() => toast.success(`Exporting ${row.title}...`)} 
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-sm"
        >
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" /> Security Gate Audit Reports & Exports
        </h2>
      </div>

      <div className="bg-card border border-border/40 p-1 rounded-2xl shadow-sm">
        <DataTable 
          columns={columns}
          data={reports}
          emptyMessage="No reports available."
        />
      </div>
    </div>
  );
};

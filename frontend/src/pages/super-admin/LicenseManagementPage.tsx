import React from 'react';
import { FileKey } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { StatCard } from '../../components/shared/StatCard';
import { DataTable } from '../../components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

import { Input } from '../../components/ui/input';
import { useState } from 'react';

export default function LicenseManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const licenses = [
    { id: '1', key: 'ABCD-EFGH-IJKL-1234', society: 'Sunrise Apartments', plan: 'Enterprise', status: 'Active', activatedAt: '2023-01-15', expiresAt: '2024-01-15', machines: '2/5' },
    { id: '2', key: 'MNOP-QRST-UVWX-5678', society: 'Green Valley', plan: 'Professional', status: 'Active', activatedAt: '2023-03-22', expiresAt: '2024-03-22', machines: '1/3' },
    { id: '3', key: 'YZAB-CDEF-GHIJ-9012', society: 'Ocean View', plan: 'Starter', status: 'Expired', activatedAt: '2022-05-10', expiresAt: '2023-05-10', machines: '1/1' },
    { id: '4', key: 'KLMN-OPQR-STUV-3456', society: 'Pine Crest', plan: 'Professional', status: 'Revoked', activatedAt: '2022-11-05', expiresAt: '2023-11-05', machines: '0/3' },
    { id: '5', key: 'WXYZ-ABCD-EFGH-7890', society: 'Oakwood Residency', plan: 'Enterprise', status: 'Active', activatedAt: '2021-08-19', expiresAt: '2025-08-19', machines: '4/5' },
    { id: '6', key: 'IJKL-MNOP-QRST-1234', society: 'Maple Heights', plan: 'Starter', status: 'Pending', activatedAt: '-', expiresAt: '-', machines: '0/1' },
    { id: '7', key: 'UVWX-YZAB-CDEF-5678', society: 'Cedar Park', plan: 'Professional', status: 'Active', activatedAt: '2024-06-01', expiresAt: '2025-06-01', machines: '2/3' },
    { id: '8', key: 'GHIJ-KLMN-OPQR-9012', society: 'Birch Meadows', plan: 'Enterprise', status: 'Active', activatedAt: '2022-04-30', expiresAt: '2024-04-30', machines: '3/5' }
  ];

  const maskKey = (key: string) => {
    const parts = key.split('-');
    if (parts.length === 4) {
      return `XXXX-XXXX-XXXX-${parts[3]}`;
    }
    return key;
  };

  const columns: { header: string; accessorKey: any }[] = [
    {
      header: 'License Key',
      accessorKey: (row: any) => <span className="font-mono">{maskKey(row.key)}</span>
    },
    { header: 'Society Name', accessorKey: 'society' },
    { header: 'Plan', accessorKey: 'plan' },
    {
      header: 'Status',
      accessorKey: (row: any) => {
        const variant = row.status === 'Active' ? 'success' : (row.status === 'Expired' || row.status === 'Revoked') ? 'destructive' : 'outline';
        return <Badge variant={variant as "default" | "secondary" | "destructive" | "outline" | "success"}>{row.status}</Badge>;
      }
    },
    { header: 'Activated', accessorKey: 'activatedAt' },
    { header: 'Expires', accessorKey: 'expiresAt' },
    { header: 'Machines', accessorKey: 'machines' },
    {
      header: 'Actions',
      accessorKey: (row: any) => (
        <div className="flex space-x-2">
          {row.status === 'Active' && <Button variant="destructive" size="sm" onClick={() => toast.success('License revoked')}>Revoke</Button>}
          {row.status === 'Pending' && <Button variant="default" size="sm" onClick={() => toast.success('License activated')}>Activate</Button>}
          {(row.status === 'Expired' || row.status === 'Revoked') && <Button variant="outline" size="sm" onClick={() => toast.success('License renewed')}>Renew</Button>}
        </div>
      )
    }
  ];

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <FileKey className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold font-display tracking-tight">License Management</h1>
        </div>
        <Button onClick={() => toast.success('License generated successfully')}>+ Generate License</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Licenses" value="42" icon={FileKey} />
        <StatCard title="Active" value="38" icon={FileKey} />
        <StatCard title="Expired" value="3" icon={FileKey} />
        <StatCard title="Revoked" value="1" icon={FileKey} />
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <Input 
            placeholder="Search licenses by key or society..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="max-w-md"
          />
          <DataTable 
            columns={columns} 
            data={licenses.filter(l => l.key.toLowerCase().includes(searchTerm.toLowerCase()) || l.society.toLowerCase().includes(searchTerm.toLowerCase()))} 
            emptyMessage="No licenses found." 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>License History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { date: '2023-10-25 14:30', action: 'Generated new license', key: 'XXXX-XXXX-XXXX-9012', user: 'Admin' },
              { date: '2023-10-24 09:15', action: 'Revoked license', key: 'XXXX-XXXX-XXXX-3456', user: 'System' },
              { date: '2023-10-20 11:45', action: 'Renewed license', key: 'XXXX-XXXX-XXXX-1234', user: 'Admin' },
              { date: '2023-10-15 16:20', action: 'Activated license', key: 'XXXX-XXXX-XXXX-5678', user: 'Admin' },
              { date: '2023-10-10 10:00', action: 'Machine count exceeded', key: 'XXXX-XXXX-XXXX-7890', user: 'System' }
            ].map((entry, i) => (
              <div key={i} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                <div>
                  <p className="font-semibold text-sm">{entry.action}</p>
                  <p className="text-xs text-muted-foreground">{entry.key} • by {entry.user}</p>
                </div>
                <div className="text-sm text-muted-foreground">{entry.date}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

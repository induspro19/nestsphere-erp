import React, { useState } from 'react';
import { ShieldCheck, Download, Search, AlertOctagon, Activity, ShieldAlert, UserX, Key } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { DataTable } from '../../components/shared/DataTable';
import { StatCard } from '../../components/shared/StatCard';
import { toast } from 'sonner';

interface AuditLog {
  id: string;
  timestamp: string;
  category: 'Security' | 'Auth' | 'Data' | 'Admin' | 'System';
  action: string;
  user: string;
  ipAddress: string;
  resource: string;
  status: 'Success' | 'Failure' | 'Warning';
}

const AUDIT_LOGS: AuditLog[] = [
  { id: '1', timestamp: '2023-10-27 10:24:12', category: 'Auth', action: 'User Login Success', user: 'admin@nestsphere.com', ipAddress: '192.168.1.1', resource: 'Web App', status: 'Success' },
  { id: '2', timestamp: '2023-10-27 10:15:00', category: 'Security', action: 'Failed Login Attempt', user: 'unknown', ipAddress: '45.22.11.9', resource: 'Admin Portal', status: 'Failure' },
  { id: '3', timestamp: '2023-10-27 09:45:33', category: 'Admin', action: 'Society Created', user: 'super.admin', ipAddress: '10.0.0.5', resource: 'Society: Green Valley', status: 'Success' },
  { id: '4', timestamp: '2023-10-27 09:30:11', category: 'Security', action: 'Role Permission Updated', user: 'super.admin', ipAddress: '10.0.0.5', resource: 'Role: Manager', status: 'Success' },
  { id: '5', timestamp: '2023-10-27 08:22:45', category: 'Admin', action: 'Subscription Changed', user: 'system', ipAddress: '127.0.0.1', resource: 'Society: Blue Skies', status: 'Success' },
  { id: '6', timestamp: '2023-10-27 07:15:20', category: 'Auth', action: 'Password Reset Requested', user: 'user123', ipAddress: '192.168.1.55', resource: 'Web App', status: 'Warning' },
  { id: '7', timestamp: '2023-10-26 23:55:01', category: 'Security', action: 'API Key Generated', user: 'dev.team', ipAddress: '10.0.0.12', resource: 'API Settings', status: 'Success' },
  { id: '8', timestamp: '2023-10-26 22:10:00', category: 'Data', action: 'Bulk Export Initiated', user: 'data.analyst', ipAddress: '192.168.1.100', resource: 'Members List', status: 'Success' },
  { id: '9', timestamp: '2023-10-26 15:30:22', category: 'System', action: 'Maintenance Mode Toggled', user: 'super.admin', ipAddress: '10.0.0.5', resource: 'Global Settings', status: 'Warning' },
  { id: '10', timestamp: '2023-10-26 14:20:15', category: 'Admin', action: 'Feature Flag Updated', user: 'super.admin', ipAddress: '10.0.0.5', resource: 'Feature: Beta UI', status: 'Success' },
  { id: '11', timestamp: '2023-10-26 11:05:44', category: 'Admin', action: 'License Activated', user: 'system', ipAddress: '127.0.0.1', resource: 'Society: Red Rocks', status: 'Success' },
  { id: '12', timestamp: '2023-10-26 03:00:00', category: 'System', action: 'Backup Completed', user: 'system', ipAddress: '127.0.0.1', resource: 'Database', status: 'Success' },
];

const CATEGORIES = ['All', 'Security', 'Auth', 'Data', 'Admin', 'System'];

export default function AuditCenterPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = AUDIT_LOGS.filter(log => {
    const matchesCategory = activeCategory === 'All' || log.category === activeCategory;
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const columns = [
    { header: 'Timestamp', accessorKey: 'timestamp' as const },
    { 
      header: 'Category', 
      accessorKey: ((row: AuditLog) => {
        const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
          Security: 'destructive',
          Auth: 'outline',
          Data: 'secondary',
          Admin: 'default',
          System: 'outline'
        };
        return <Badge variant={variants[row.category]}>{row.category}</Badge>;
      }) as any
    },
    { header: 'Action', accessorKey: 'action' as const },
    { header: 'User', accessorKey: 'user' as const },
    { 
      header: 'IP Address', 
      accessorKey: ((row: AuditLog) => (
        <span className="font-mono text-xs">{row.ipAddress}</span>
      )) as any 
    },
    { header: 'Resource', accessorKey: 'resource' as const },
    { 
      header: 'Status', 
      accessorKey: ((row: AuditLog) => {
        if (row.status === 'Success') return <Badge variant="success">Success</Badge>;
        if (row.status === 'Failure') return <Badge variant="destructive">Failure</Badge>;
        return <Badge variant="outline">Warning</Badge>;
      }) as any
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold font-display tracking-tight">Audit Center</h1>
        </div>
        <Button onClick={() => toast.success('Export initiated. You will receive an email shortly.')}>
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Events (Today)" value="1,247" icon={Activity} />
        <StatCard title="Security Events" value="23" icon={ShieldAlert} />
        <StatCard title="Failed Logins" value="8" icon={UserX} />
        <StatCard title="Permission Changes" value="5" icon={Key} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search audit logs..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <Button
                      key={cat}
                      variant={activeCategory === cat ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={filteredLogs} emptyMessage="No audit logs found." />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-t-4 border-t-amber-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertOctagon className="h-5 w-5 text-amber-500" />
                Recent Security Events
              </CardTitle>
              <CardDescription>Requires attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {AUDIT_LOGS.filter(log => log.category === 'Security' || log.status === 'Failure').slice(0, 5).map(log => (
                <div key={log.id} className="text-sm space-y-1 pb-3 border-b last:border-0 last:pb-0">
                  <div className="font-medium text-destructive">{log.action}</div>
                  <div className="text-muted-foreground flex justify-between text-xs">
                    <span>{log.user}</span>
                    <span className="font-mono">{log.ipAddress}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{log.timestamp}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

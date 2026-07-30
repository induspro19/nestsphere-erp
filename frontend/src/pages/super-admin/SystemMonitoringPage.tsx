import React from 'react';
import { Activity, Server, Database, HardDrive, Mail, Clock, ActivityIcon, AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { DataTable } from '../../components/shared/DataTable';

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  status: 'Success' | 'Running' | 'Failed';
  duration: string;
}

const CRON_JOBS: CronJob[] = [
  { id: '1', name: 'Daily Backup', schedule: '0 0 * * *', lastRun: '2023-10-27 00:00', nextRun: '2023-10-28 00:00', status: 'Success', duration: '45s' },
  { id: '2', name: 'Calculate Overdues', schedule: '0 1 * * *', lastRun: '2023-10-27 01:00', nextRun: '2023-10-28 01:00', status: 'Success', duration: '12s' },
  { id: '3', name: 'Send Reminder Emails', schedule: '0 9 * * *', lastRun: '2023-10-27 09:00', nextRun: '2023-10-28 09:00', status: 'Failed', duration: '5s' },
  { id: '4', name: 'Sync Payment Gateway', schedule: '*/15 * * * *', lastRun: '2023-10-27 10:15', nextRun: '2023-10-27 10:30', status: 'Running', duration: '-' },
  { id: '5', name: 'Generate Monthly Invoices', schedule: '0 0 1 * *', lastRun: '2023-10-01 00:00', nextRun: '2023-11-01 00:00', status: 'Success', duration: '2m 14s' },
  { id: '6', name: 'Clean Audit Logs', schedule: '0 3 * * 0', lastRun: '2023-10-22 03:00', nextRun: '2023-10-29 03:00', status: 'Success', duration: '8s' },
];

const ALERTS = [
  { id: 1, timestamp: '10:24 AM', severity: 'Warning', message: 'High memory usage on API Node 2', source: 'API Gateway' },
  { id: 2, timestamp: '09:15 AM', severity: 'Info', message: 'Database backup completed successfully', source: 'PostgreSQL Database' },
  { id: 3, timestamp: '08:00 AM', severity: 'Critical', message: 'Redis connection timeout', source: 'Redis Cache' },
  { id: 4, timestamp: 'Yesterday', severity: 'Info', message: 'New deployment v2.1.4 active', source: 'System' },
  { id: 5, timestamp: 'Yesterday', severity: 'Warning', message: 'Elevated error rate on payment endpoint', source: 'API Gateway' },
];

export default function SystemMonitoringPage() {
  const cronColumns = [
    { header: 'Job Name', accessorKey: 'name' as const },
    { header: 'Schedule', accessorKey: 'schedule' as const },
    { header: 'Last Run', accessorKey: 'lastRun' as const },
    { header: 'Next Run', accessorKey: 'nextRun' as const },
    { 
      header: 'Status', 
      accessorKey: ((row: CronJob) => {
        if (row.status === 'Success') return <Badge variant="success">Success</Badge>;
        if (row.status === 'Failed') return <Badge variant="destructive">Failed</Badge>;
        return <Badge variant="default">Running</Badge>;
      }) as any
    },
    { header: 'Duration', accessorKey: 'duration' as const },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold font-display tracking-tight">System Monitoring</h1>
        </div>
        <Badge variant="success" className="flex items-center gap-1.5 py-1.5 px-3">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          All Systems Operational
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Database className="h-5 w-5 text-muted-foreground" />
                PostgreSQL Database
              </CardTitle>
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <CardDescription>Online</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Connections:</span> <span>24/100</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Latency:</span> <span>2.3ms</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Server className="h-5 w-5 text-muted-foreground" />
                Redis Cache
              </CardTitle>
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <CardDescription>Online</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Memory:</span> <span>128MB/512MB</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Hit Rate:</span> <span>98.7%</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-muted-foreground" />
                File Storage (S3)
              </CardTitle>
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <CardDescription>Online</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Used:</span> <span>2.4TB/5TB</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status:</span> <span>48% utilized</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                Email Service (SMTP)
              </CardTitle>
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <CardDescription>Online</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Queue:</span> <span>12 pending</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Sent today:</span> <span>847</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Background Jobs (Bull)
              </CardTitle>
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <CardDescription>Online</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Active:</span> <span>3</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Waiting:</span> <span>7</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Failed:</span> <span>0</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <ActivityIcon className="h-5 w-5 text-muted-foreground" />
                API Gateway
              </CardTitle>
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <CardDescription>Online</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Requests/min:</span> <span>245</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Avg latency:</span> <span>45ms</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">34%</div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full" style={{ width: '34%' }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">67%</div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full" style={{ width: '67%' }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Disk I/O</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">12%</div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full" style={{ width: '12%' }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Network</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">23 Mbps</div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full" style={{ width: '23%' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cron Jobs</CardTitle>
            <CardDescription>Scheduled background tasks and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={cronColumns} data={CRON_JOBS} emptyMessage="No cron jobs found." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>System notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ALERTS.map(alert => (
              <div key={alert.id} className="flex gap-3 border-b pb-3 last:border-0 last:pb-0">
                <div className="mt-0.5">
                  {alert.severity === 'Info' && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                  {alert.severity === 'Warning' && <div className="h-2 w-2 rounded-full bg-amber-500" />}
                  {alert.severity === 'Critical' && <div className="h-2 w-2 rounded-full bg-red-500" />}
                </div>
                <div>
                  <p className="text-sm font-medium leading-none mb-1">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">{alert.source} • {alert.timestamp}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

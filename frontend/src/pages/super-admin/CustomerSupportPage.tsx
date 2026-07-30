import React from 'react';
import { StatCard } from '../../components/shared/StatCard';
import { DataTable } from '../../components/shared/DataTable';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card';
import { toast } from 'sonner';
import { Headset, Plus, Eye, UserPlus, MonitorPlay, BookOpen, ExternalLink, Ticket, Clock, CheckCircle2, Timer } from 'lucide-react';

const mockTickets = [
  { id: '1', ticketNo: 'TCK-9001', society: 'Grand Omaxe', subject: 'Payment Gateway Failure', priority: 'Critical', status: 'Open', assignee: 'Unassigned', createdAt: '10 mins ago' },
  { id: '2', ticketNo: 'TCK-9002', society: 'DLF Camellias', subject: 'Visitor Logs Not Syncing', priority: 'High', status: 'In Progress', assignee: 'Priya Sharma', createdAt: '1 hour ago' },
  { id: '3', ticketNo: 'TCK-9003', society: 'Supertech Emerald', subject: 'Admin Login Issue', priority: 'Medium', status: 'Resolved', assignee: 'Rahul Desai', createdAt: '3 hours ago' },
  { id: '4', ticketNo: 'TCK-9004', society: 'Jaypee Greens', subject: 'Feature Request: Custom Roles', priority: 'Low', status: 'Closed', assignee: 'Kavita Iyer', createdAt: '1 day ago' },
  { id: '5', ticketNo: 'TCK-9005', society: 'Gaur City 2', subject: 'App Crashing on iOS', priority: 'High', status: 'In Progress', assignee: 'Priya Sharma', createdAt: '2 hours ago' },
  { id: '6', ticketNo: 'TCK-9006', society: 'Mahagun Moderne', subject: 'Incorrect Billing Amount', priority: 'Critical', status: 'Open', assignee: 'Unassigned', createdAt: '30 mins ago' },
  { id: '7', ticketNo: 'TCK-9007', society: 'ATS Village', subject: 'Unable to Add Amenities', priority: 'Medium', status: 'Open', assignee: 'Rahul Desai', createdAt: '4 hours ago' },
  { id: '8', ticketNo: 'TCK-9008', society: 'Prateek Wisteria', subject: 'SMS Notifications Delayed', priority: 'High', status: 'Resolved', assignee: 'Kavita Iyer', createdAt: '5 hours ago' },
];

const remoteSessions = [
  { id: '1', society: 'Grand Omaxe', date: 'Today, 10:30 AM', duration: '45 mins', agent: 'Priya Sharma' },
  { id: '2', society: 'Supertech Emerald', date: 'Yesterday', duration: '12 mins', agent: 'Rahul Desai' },
  { id: '3', society: 'Jaypee Greens', date: '25 Jul 2026', duration: '1 hr 15 mins', agent: 'Kavita Iyer' },
];

const kbArticles = [
  'How to reset Society Admin password manually',
  'Troubleshooting Payment Gateway Webhooks',
  'Setting up custom SMS templates for societies',
  'Resolving "Database Lock" errors during migration',
];

export default function CustomerSupportPage() {
  const columns: { header: string; accessorKey: any }[] = [
    { 
      header: 'Ticket #', 
      accessorKey: (row: any) => <span className="font-mono text-sm">{row.ticketNo}</span> 
    },
    { header: 'Society', accessorKey: 'society' },
    { header: 'Subject', accessorKey: 'subject' },
    {
      header: 'Priority',
      accessorKey: (row: any) => {
        let variant: "destructive" | "outline" | "secondary" | "default" = "default";
        let className = "";
        if (row.priority === 'Critical') variant = 'destructive';
        else if (row.priority === 'High') { variant = 'outline'; className = "border-amber-500 text-amber-600"; }
        else if (row.priority === 'Medium') variant = 'secondary';
        else variant = 'outline';
        return <Badge variant={variant} className={className}>{row.priority}</Badge>;
      }
    },
    {
      header: 'Status',
      accessorKey: (row: any) => {
        let variant: "outline" | "default" | "success" | "secondary" = "default";
        if (row.status === 'Open') variant = 'outline';
        else if (row.status === 'Resolved') variant = 'success';
        else if (row.status === 'Closed') variant = 'secondary';
        return <Badge variant={variant}>{row.status}</Badge>;
      }
    },
    { header: 'Assigned To', accessorKey: 'assignee' },
    { header: 'Created', accessorKey: 'createdAt' },
    {
      header: 'Actions',
      accessorKey: (row: any) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" aria-label="View Ticket" onClick={() => toast.info(`Viewing ticket ${row.ticketNo}`)}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Assign Ticket" onClick={() => toast.success(`Assigning ticket ${row.ticketNo}`)}>
            <UserPlus className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Headset className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Customer Support Center</h1>
        </div>
        <Button onClick={() => toast.success('Open Create Ticket Modal')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Open Tickets" value="14" icon={Ticket} />
        <StatCard title="In Progress" value="8" icon={Clock} />
        <StatCard title="Resolved Today" value="5" icon={CheckCircle2} />
        <StatCard title="Avg Resolution" value="4.2 hrs" icon={Timer} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={mockTickets} emptyMessage="No tickets found." />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Remote Login & Support Sessions</CardTitle>
            <CardDescription>Securely access society admin panels for troubleshooting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => toast.info('Starting secure remote session...')}>
              <MonitorPlay className="w-4 h-4 mr-2" />
              Start Remote Session
            </Button>
            <div className="space-y-3 mt-4">
              <h4 className="text-sm font-semibold text-muted-foreground">Recent Sessions</h4>
              {remoteSessions.map(session => (
                <div key={session.id} className="flex justify-between items-center text-sm p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">{session.society}</span>
                    <span className="text-muted-foreground ml-2">by {session.agent}</span>
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {session.date} ({session.duration})
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Knowledge Base</CardTitle>
            <CardDescription>Internal documentation and FAQs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {kbArticles.map((article, i) => (
                <button key={i} type="button" onClick={(e) => { e.preventDefault(); toast.info('Opening KB Article'); }} className="w-full text-left flex items-center gap-2 p-2 hover:bg-accent rounded-md transition-colors text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  {article}
                </button>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => toast.success('Redirecting to KB Manager...')}>
              <BookOpen className="w-4 h-4 mr-2" />
              Manage Knowledge Base
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

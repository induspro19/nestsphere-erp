import React from 'react';
import { StatCard } from '../../components/shared/StatCard';
import { DataTable } from '../../components/shared/DataTable';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { Users, Search, Plus, Edit2, Ban, ShieldCheck, Wrench, BadgeDollarSign, UserCheck } from 'lucide-react';

const mockStaff = [
  { id: '1', name: 'Ravi Kumar', email: 'ravi@nestsphere.com', role: 'Platform Admin', department: 'Management', status: 'Active', mfaEnabled: true, lastLogin: '10 mins ago', failedAttempts: 0 },
  { id: '2', name: 'Priya Sharma', email: 'priya@nestsphere.com', role: 'Support Engineer', department: 'Support', status: 'Active', mfaEnabled: true, lastLogin: '2 hours ago', failedAttempts: 1 },
  { id: '3', name: 'Amit Patel', email: 'amit@nestsphere.com', role: 'Sales', department: 'Sales', status: 'Inactive', mfaEnabled: false, lastLogin: '5 days ago', failedAttempts: 0 },
  { id: '4', name: 'Sneha Gupta', email: 'sneha@nestsphere.com', role: 'Finance', department: 'Finance', status: 'Active', mfaEnabled: true, lastLogin: '1 hour ago', failedAttempts: 0 },
  { id: '5', name: 'Vikram Singh', email: 'vikram@nestsphere.com', role: 'Developer', department: 'Engineering', status: 'Active', mfaEnabled: true, lastLogin: 'Just now', failedAttempts: 0 },
  { id: '6', name: 'Neha Reddy', email: 'neha@nestsphere.com', role: 'Operations', department: 'Operations', status: 'Locked', mfaEnabled: true, lastLogin: '1 week ago', failedAttempts: 5 },
  { id: '7', name: 'Rahul Desai', email: 'rahul@nestsphere.com', role: 'Support Engineer', department: 'Support', status: 'Active', mfaEnabled: false, lastLogin: '3 hours ago', failedAttempts: 0 },
  { id: '8', name: 'Anjali Verma', email: 'anjali@nestsphere.com', role: 'Sales', department: 'Sales', status: 'Active', mfaEnabled: true, lastLogin: 'Yesterday', failedAttempts: 0 },
  { id: '9', name: 'Sanjay Joshi', email: 'sanjay@nestsphere.com', role: 'Developer', department: 'Engineering', status: 'Active', mfaEnabled: true, lastLogin: '4 hours ago', failedAttempts: 0 },
  { id: '10', name: 'Kavita Iyer', email: 'kavita@nestsphere.com', role: 'Support Engineer', department: 'Support', status: 'Active', mfaEnabled: true, lastLogin: '30 mins ago', failedAttempts: 0 },
];

export default function PlatformUsersPage() {
  const columns: { header: string; accessorKey: any }[] = [
    {
      header: 'Name & Email',
      accessorKey: (row: any) => (
        <div>
          <div className="font-bold">{row.name}</div>
          <div className="text-xs text-muted-foreground">{row.email}</div>
        </div>
      )
    },
    {
      header: 'Role',
      accessorKey: (row: any) => (
        <Badge variant="secondary">{row.role}</Badge>
      )
    },
    { header: 'Department', accessorKey: 'department' },
    {
      header: 'Status',
      accessorKey: (row: any) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'destructive'}>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'MFA',
      accessorKey: (row: any) => (
        <Badge variant={row.mfaEnabled ? 'success' : 'outline'}>
          {row.mfaEnabled ? 'Enabled' : 'Disabled'}
        </Badge>
      )
    },
    { header: 'Last Login', accessorKey: 'lastLogin' },
    {
      header: 'Failed Attempts',
      accessorKey: (row: any) => (
        <span className={row.failedAttempts > 3 ? 'text-destructive font-bold' : ''}>
          {row.failedAttempts}
        </span>
      )
    },
    {
      header: 'Actions',
      accessorKey: (row: any) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" aria-label="Edit User" onClick={() => toast.info(`Edit ${row.name}`)}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Deactivate User" onClick={() => toast.warning(`Deactivate ${row.name}`)}>
            <Ban className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Platform Users</h1>
        </div>
        <Button onClick={() => toast.success('Open Add Staff Modal')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Staff" value="24" icon={Users} />
        <StatCard title="Support Engineers" value="8" icon={Wrench} />
        <StatCard title="Sales" value="6" icon={BadgeDollarSign} />
        <StatCard title="Active Now" value="12" icon={UserCheck} />
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or email..." className="pl-9" />
        </div>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <DataTable columns={columns} data={mockStaff} emptyMessage="No staff members found." />
      </div>
    </div>
  );
}

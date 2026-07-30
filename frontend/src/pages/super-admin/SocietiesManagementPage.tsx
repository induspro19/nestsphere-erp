import React, { useState } from 'react';
import { Building2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { StatCard } from '../../components/shared/StatCard';
import { DataTable } from '../../components/shared/DataTable';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

interface Society {
  id: string;
  name: string;
  code: string;
  plan: string;
  status: 'Active' | 'Trial' | 'Suspended' | 'Archived';
  users: number;
  residents: number;
  buildings: number;
  storage: string;
  createdAt: string;
}

const mockSocieties: Society[] = [
  { id: '1', name: 'Sunrise Apartments', code: 'SUN-01', plan: 'Enterprise', status: 'Active', users: 150, residents: 450, buildings: 4, storage: '4.2 GB', createdAt: '2023-01-15' },
  { id: '2', name: 'Green Valley', code: 'GRV-02', plan: 'Professional', status: 'Active', users: 85, residents: 250, buildings: 2, storage: '1.8 GB', createdAt: '2023-03-22' },
  { id: '3', name: 'Ocean View', code: 'OCV-03', plan: 'Starter', status: 'Trial', users: 12, residents: 45, buildings: 1, storage: '245 MB', createdAt: '2024-05-10' },
  { id: '4', name: 'Pine Crest', code: 'PIN-04', plan: 'Professional', status: 'Suspended', users: 90, residents: 280, buildings: 3, storage: '2.1 GB', createdAt: '2022-11-05' },
  { id: '5', name: 'Oakwood Residency', code: 'OAK-05', plan: 'Enterprise', status: 'Active', users: 210, residents: 600, buildings: 6, storage: '8.5 GB', createdAt: '2021-08-19' },
  { id: '6', name: 'Maple Heights', code: 'MAP-06', plan: 'Starter', status: 'Active', users: 45, residents: 120, buildings: 1, storage: '800 MB', createdAt: '2023-09-12' },
  { id: '7', name: 'Cedar Park', code: 'CED-07', plan: 'Professional', status: 'Trial', users: 18, residents: 55, buildings: 1, storage: '310 MB', createdAt: '2024-06-01' },
  { id: '8', name: 'Birch Meadows', code: 'BIR-08', plan: 'Enterprise', status: 'Active', users: 125, residents: 380, buildings: 3, storage: '3.6 GB', createdAt: '2022-04-30' }
];

export default function SocietiesManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);

  const filteredSocieties = mockSocieties.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All' || s.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const columns: { header: string; accessorKey: any }[] = [
    {
      header: 'Society',
      accessorKey: (row: Society) => (
        <div className="flex flex-col">
          <span className="font-bold">{row.name}</span>
          <span className="text-xs font-mono text-muted-foreground">{row.code}</span>
        </div>
      )
    },
    {
      header: 'Plan',
      accessorKey: (row: Society) => {
        const variant = row.plan === 'Enterprise' ? 'default' : row.plan === 'Professional' ? 'secondary' : row.plan === 'Starter' ? 'outline' : 'destructive';
        return <Badge variant={variant as "default" | "secondary" | "destructive" | "outline" | "success"}>{row.plan}</Badge>;
      }
    },
    {
      header: 'Status',
      accessorKey: (row: Society) => {
        const variant = row.status === 'Active' ? 'success' : row.status === 'Trial' ? 'outline' : 'destructive';
        return <Badge variant={variant as "default" | "secondary" | "destructive" | "outline" | "success"}>{row.status}</Badge>;
      }
    },
    { header: 'Users', accessorKey: 'users' },
    { header: 'Residents', accessorKey: 'residents' },
    { header: 'Buildings', accessorKey: 'buildings' },
    { header: 'Storage', accessorKey: 'storage' },
    { header: 'Created', accessorKey: 'createdAt' },
    {
      header: 'Actions',
      accessorKey: (row: Society) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => toast.success(`Editing ${row.name}`)}>Edit</Button>
          <Button variant="default" size="sm" onClick={() => { setSelectedSociety(row); toast.info(`Viewing ${row.name}`); }}>Manage</Button>
        </div>
      )
    }
  ];

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Building2 className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold font-display tracking-tight">Society Management</h1>
        </div>
        <Button onClick={() => toast.info('Provisioning wizard coming soon')}>+ Provision New Society</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Societies" value="42" icon={Building2} />
        <StatCard title="Active" value="38" icon={Building2} />
        <StatCard title="Trial" value="4" icon={Building2} />
        <StatCard title="Suspended" value="0" icon={Building2} />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0 mb-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search societies..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
              {['All', 'Active', 'Trial', 'Suspended', 'Archived'].map(filter => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>

          <DataTable columns={columns} data={filteredSocieties} emptyMessage="No societies found." />
        </CardContent>
      </Card>

      {selectedSociety && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedSociety.name} - Details</CardTitle>
            <CardDescription>Code: {selectedSociety.code}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Overview</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Registration:</span> 24B-IN-992</p>
                  <p><span className="text-muted-foreground">Contact:</span> admin@{selectedSociety.code.toLowerCase()}.com</p>
                  <p><span className="text-muted-foreground">Status:</span> {selectedSociety.status}</p>
                  <p><span className="text-muted-foreground">Plan:</span> {selectedSociety.plan}</p>
                  <p><span className="text-muted-foreground">License:</span> Valid till Dec 2026</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Usage Stats</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">API Requests:</span> 1.2M / mo</p>
                  <p><span className="text-muted-foreground">Storage:</span> {selectedSociety.storage}</p>
                  <p><span className="text-muted-foreground">Active Users:</span> {selectedSociety.users}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Modules Enabled</h3>
              <div className="flex flex-wrap gap-2">
                {['Visitor', 'Parking', 'Amenity', 'Maintenance', 'Billing', 'Complaints'].map(mod => (
                  <Badge key={mod} variant="secondary">{mod}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Timeline</h3>
              <div className="space-y-2 text-sm">
                <p>• <strong>Today:</strong> Backup completed successfully.</p>
                <p>• <strong>2 days ago:</strong> Upgraded to Enterprise plan.</p>
                <p>• <strong>1 week ago:</strong> Added 50 new resident accounts.</p>
                <p>• <strong>1 month ago:</strong> Support ticket resolved.</p>
                <p>• <strong>{selectedSociety.createdAt}:</strong> Society provisioned.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

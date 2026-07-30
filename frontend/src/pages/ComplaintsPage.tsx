import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { DataTable } from '../components/shared/DataTable';
import { StatCard } from '../components/shared/StatCard';
import { complaintApi, Complaint, ComplaintMetrics } from '../api/complaint.api';
import {
  LifeBuoy,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  Flame,
  Wrench,
  X,
  Star,
  User,
  Building,
  DollarSign,
  FileCheck,
} from 'lucide-react';

export const ComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [metrics, setMetrics] = useState<ComplaintMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [cost, setCost] = useState(0);

  // Form
  const [category, setCategory] = useState('ELECTRICAL');
  const [priority, setPriority] = useState('MEDIUM');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchData();
  }, [search, selectedCategory, selectedStatus]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [listRes, metRes] = await Promise.all([
        complaintApi.getComplaints({
          search,
          category: selectedCategory || undefined,
          status: selectedStatus || undefined,
        }),
        complaintApi.getMetrics(),
      ]);
      setComplaints(listRes.data || []);
      setMetrics(metRes);
    } catch {
      // API fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await complaintApi.createComplaint({
        category,
        priority,
        subject,
        description,
      });
      setIsLogModalOpen(false);
      setSubject('');
      setDescription('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to log complaint ticket');
    }
  };

  const handleResolveComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      await complaintApi.updateComplaint(selectedComplaint.id, {
        status: 'RESOLVED',
        resolutionNotes,
        rootCause,
        cost: Number(cost),
      });
      setSelectedComplaint(null);
      setResolutionNotes('');
      setRootCause('');
      fetchData();
    } catch {
      alert('Failed to resolve complaint');
    }
  };

  const columns = [
    {
      header: 'Ticket ID & Subject',
      accessorKey: (row: Complaint) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold font-mono text-sm">{row.ticketNumber}</span>
            <Badge variant="outline" className="text-[10px]">
              {row.category}
            </Badge>
          </div>
          <p className="font-semibold text-xs mt-0.5 text-foreground">{row.subject}</p>
          <p className="text-[11px] text-muted-foreground line-clamp-1">{row.description}</p>
        </div>
      ),
    },
    {
      header: 'Reported By & Unit',
      accessorKey: (row: Complaint) => (
        <div className="text-xs">
          <p className="font-semibold">{row.reportedBy ? `${row.reportedBy.firstName} ${row.reportedBy.lastName}` : 'Resident'}</p>
          <p className="text-muted-foreground text-[10px]">Unit: {row.unit?.flatNumber || 'Common Area'}</p>
        </div>
      ),
    },
    {
      header: 'Priority',
      accessorKey: (row: Complaint) => {
        const colors: Record<string, string> = {
          LOW: 'text-slate-500 border-slate-500/30',
          MEDIUM: 'text-blue-500 border-blue-500/30',
          HIGH: 'text-amber-500 border-amber-500/30',
          CRITICAL: 'text-orange-500 border-orange-500/30',
          EMERGENCY: 'text-red-500 border-red-500/30 bg-red-500/10',
        };
        return (
          <Badge variant="outline" className={`text-[10px] font-bold ${colors[row.priority] || ''}`}>
            {row.priority}
          </Badge>
        );
      },
    },
    {
      header: 'Status & SLA Due',
      accessorKey: (row: Complaint) => (
        <div>
          <Badge
            variant={row.status === 'RESOLVED' || row.status === 'CLOSED' ? 'success' : 'outline'}
            className="text-[10px] gap-1"
          >
            {row.status === 'RESOLVED' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3 text-amber-500" />}
            {row.status}
          </Badge>
          {row.slaDueDate && (
            <p className="text-[10px] text-muted-foreground mt-1">
              Due: {new Date(row.slaDueDate).toLocaleDateString()}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Action',
      accessorKey: (row: Complaint) => (
        <div>
          {row.status !== 'RESOLVED' && row.status !== 'CLOSED' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedComplaint(row)}
              className="rounded-lg h-8 px-2 text-xs"
            >
              Resolve Ticket
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl border border-border/40 bg-gradient-to-r from-card via-accent/30 to-background flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <LifeBuoy className="h-6 w-6 text-primary" /> Enterprise Complaint & Helpdesk Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Automated ticket routing, 24-hr SLA timers, asset/property linking, technician cost tracking & resident feedback
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsLogModalOpen(true)} className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" /> Log Complaint Ticket
          </Button>
        </div>
      </div>

      {/* Helpdesk Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Open Tickets" value={metrics?.totalOpen || 0} description="Awaiting Assignment" icon={Clock} />
        <StatCard title="In Progress" value={metrics?.totalInProgress || 0} description="Under Repair" icon={Wrench} />
        <StatCard title="Resolved Tickets" value={metrics?.totalResolved || 0} description="Successfully Closed" icon={CheckCircle} />
        <StatCard title="SLA Overdue Alerts" value={metrics?.totalOverdue || 0} description="Escalated to Management" icon={AlertTriangle} />
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl border border-border/40 bg-card flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets by CMP-00001, subject, or resident..."
            className="pl-9 h-10 rounded-xl text-xs"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-10 px-3 rounded-xl border border-input bg-background/50 text-xs w-full sm:w-48"
        >
          <option value="">All Categories</option>
          <option value="ELECTRICAL">Electrical</option>
          <option value="PLUMBING">Plumbing</option>
          <option value="CIVIL">Civil</option>
          <option value="CLEANING">Cleaning</option>
          <option value="LIFT">Lift Repair</option>
          <option value="FIRE_SYSTEM">Fire System</option>
          <option value="SECURITY">Security</option>
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="h-10 px-3 rounded-xl border border-input bg-background/50 text-xs w-full sm:w-40"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <LoadingSpinner message="Fetching complaint tickets and SLA timers..." />
      ) : (
        <DataTable columns={columns} data={complaints} emptyMessage="Zero complaint tickets logged." />
      )}

      {/* Modal: Log Complaint Ticket */}
      {isLogModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold font-display">Log Complaint Ticket</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsLogModalOpen(false)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateComplaint} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs"
                  >
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="PLUMBING">Plumbing</option>
                    <option value="CIVIL">Civil Work</option>
                    <option value="HOUSEKEEPING">Housekeeping</option>
                    <option value="LIFT">Elevator / Lift</option>
                    <option value="SECURITY">Security</option>
                    <option value="FIRE_SYSTEM">Fire Alarm</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Subject *</label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Water Seepage in Bathroom Ceiling" required />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Detailed Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide location details, photos, or urgency context..."
                  className="w-full h-24 p-3 rounded-xl border border-input bg-background/50 text-xs resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsLogModalOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl">
                  Log Ticket (Generate CMP-00001)
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Resolve Complaint */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold font-display">Resolve Complaint Ticket</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedComplaint(null)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleResolveComplaint} className="space-y-4">
              <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 text-xs space-y-1 font-mono">
                <p className="font-bold">{selectedComplaint.ticketNumber}</p>
                <p className="text-muted-foreground">{selectedComplaint.subject}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Resolution & Technician Notes *</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Details of repair work completed..."
                  className="w-full h-20 p-3 rounded-xl border border-input bg-background/50 text-xs resize-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Root Cause Analysis</label>
                <Input value={rootCause} onChange={(e) => setRootCause(e.target.value)} placeholder="e.g. Pipe Joint Gasket Wear & Tear" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Repair Cost ($)</label>
                <Input type="number" value={cost} onChange={(e) => setCost(Number(e.target.value))} placeholder="0" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setSelectedComplaint(null)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl">
                  Mark as Resolved
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

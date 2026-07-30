import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { DataTable } from '../components/shared/DataTable';
import { StatCard } from '../components/shared/StatCard';
import { maintenanceApi, WorkOrder, MaintenanceMetrics } from '../api/maintenance.api';
import { assetApi, Asset } from '../api/asset.api';
import {
  Wrench,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  Boxes,
  X,
  Calendar,
  DollarSign,
  TrendingDown,
  FileText,
} from 'lucide-react';

export const MaintenancePage: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [metrics, setMetrics] = useState<MaintenanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [downtimeHours, setDowntimeHours] = useState(0);
  const [labourCost, setLabourCost] = useState(0);
  const [materialCost, setMaterialCost] = useState(0);
  const [correctiveAction, setCorrectiveAction] = useState('');

  // Form
  const [type, setType] = useState('PREVENTIVE');
  const [priority, setPriority] = useState('MEDIUM');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assetId, setAssetId] = useState('');

  useEffect(() => {
    fetchData();
  }, [search, selectedType, selectedStatus]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [woRes, metRes, astRes] = await Promise.all([
        maintenanceApi.getWorkOrders({
          search,
          type: selectedType || undefined,
          status: selectedStatus || undefined,
        }),
        maintenanceApi.getMetrics(),
        assetApi.getAssets(),
      ]);
      setWorkOrders(woRes.data || []);
      setMetrics(metRes);
      setAssets(astRes.data || []);
    } catch {
      // API fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId) return alert('Select an asset for maintenance');
    try {
      await maintenanceApi.createWorkOrder({
        type,
        priority,
        title,
        description,
        assetId,
      });
      setIsScheduleModalOpen(false);
      setTitle('');
      setDescription('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to schedule work order');
    }
  };

  const handleCompleteWO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWO) return;
    try {
      await maintenanceApi.updateWorkOrder(selectedWO.id, {
        status: 'COMPLETED',
        downtimeHours: Number(downtimeHours),
        labourCost: Number(labourCost),
        materialCost: Number(materialCost),
        correctiveAction,
      });
      setSelectedWO(null);
      setDowntimeHours(0);
      setLabourCost(0);
      setMaterialCost(0);
      fetchData();
    } catch {
      alert('Failed to complete work order');
    }
  };

  const columns = [
    {
      header: 'Work Order ID & Title',
      accessorKey: (row: WorkOrder) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold font-mono text-sm">{row.workOrderNumber}</span>
            <Badge variant="outline" className="text-[10px]">
              {row.type}
            </Badge>
          </div>
          <p className="font-semibold text-xs mt-0.5 text-foreground">{row.title}</p>
          <p className="text-[11px] text-muted-foreground line-clamp-1">{row.description}</p>
        </div>
      ),
    },
    {
      header: 'Target Asset & Code',
      accessorKey: (row: WorkOrder) => (
        <div className="text-xs">
          <p className="font-semibold">{row.asset?.name || 'Equipment'}</p>
          <p className="text-muted-foreground text-[10px] font-mono">{row.asset?.assetCode || '-'}</p>
        </div>
      ),
    },
    {
      header: 'Scheduled & Downtime',
      accessorKey: (row: WorkOrder) => (
        <div className="text-xs font-mono">
          <p className="text-foreground">{new Date(row.scheduledDate).toLocaleDateString()}</p>
          <p className="text-muted-foreground text-[10px]">{row.downtimeHours} hrs downtime</p>
        </div>
      ),
    },
    {
      header: 'Costs Breakdown',
      accessorKey: (row: WorkOrder) => (
        <div className="text-xs font-mono font-semibold">
          ${Number(row.totalCost).toLocaleString()}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: (row: WorkOrder) => (
        <Badge
          variant={row.status === 'COMPLETED' || row.status === 'VERIFIED' ? 'success' : 'outline'}
          className="text-[10px] gap-1"
        >
          {row.status === 'COMPLETED' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3 text-amber-500" />}
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Action',
      accessorKey: (row: WorkOrder) => (
        <div>
          {row.status !== 'COMPLETED' && row.status !== 'VERIFIED' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedWO(row)}
              className="rounded-lg h-8 px-2 text-xs"
            >
              Complete Order
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
            <Wrench className="h-6 w-6 text-primary" /> Preventive & Corrective Maintenance Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Work order scheduling (`WO-00001`), Mean Time To Repair (MTTR) analytics, asset downtime & material/labour cost tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsScheduleModalOpen(true)} className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" /> Schedule Work Order
          </Button>
        </div>
      </div>

      {/* Maintenance Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Preventive Work Orders" value={metrics?.totalPreventive || 0} description="Scheduled Servicing" icon={Calendar} />
        <StatCard title="Corrective & Breakdown" value={metrics?.totalCorrective || 0} description="Unplanned Repairs" icon={AlertTriangle} />
        <StatCard title="Average MTTR (Hours)" value={`${metrics?.averageMTTR || 0} hrs`} description="Mean Time To Repair" icon={TrendingDown} />
        <StatCard title="Total Maintenance Cost" value={`$${(metrics?.totalMaintenanceCost || 0).toLocaleString()}`} description="Material & Labour" icon={DollarSign} />
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl border border-border/40 bg-card flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search work orders by WO-00001, title, or asset..."
            className="pl-9 h-10 rounded-xl text-xs"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="h-10 px-3 rounded-xl border border-input bg-background/50 text-xs w-full sm:w-48"
        >
          <option value="">All Maintenance Types</option>
          <option value="PREVENTIVE">Preventive Maintenance</option>
          <option value="CORRECTIVE">Corrective Maintenance</option>
          <option value="BREAKDOWN">Breakdown Repair</option>
          <option value="INSPECTION">Inspection Audit</option>
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="h-10 px-3 rounded-xl border border-input bg-background/50 text-xs w-full sm:w-40"
        >
          <option value="">All Statuses</option>
          <option value="PLANNED">Planned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <LoadingSpinner message="Calculating asset health and maintenance work orders..." />
      ) : (
        <DataTable columns={columns} data={workOrders} emptyMessage="Zero maintenance work orders scheduled." />
      )}

      {/* Modal: Schedule Work Order */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold font-display">Schedule Maintenance Work Order</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsScheduleModalOpen(false)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateWO} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Target Asset *</label>
                <select
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs"
                  required
                >
                  <option value="">Select Asset for Servicing</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>{a.assetCode} - {a.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Maintenance Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs"
                  >
                    <option value="PREVENTIVE">Preventive Maintenance</option>
                    <option value="CORRECTIVE">Corrective Repair</option>
                    <option value="BREAKDOWN">Breakdown Repair</option>
                    <option value="INSPECTION">Inspection</option>
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
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Work Order Title *</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. DG Set Monthly Filter & Oil Replacement" required />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Work Order Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Preventive checklist tasks, vendor instructions..."
                  className="w-full h-20 p-3 rounded-xl border border-input bg-background/50 text-xs resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsScheduleModalOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl">
                  Schedule (Generate WO-00001)
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Complete Work Order */}
      {selectedWO && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold font-display">Complete Work Order</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedWO(null)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleCompleteWO} className="space-y-4">
              <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 text-xs space-y-1 font-mono">
                <p className="font-bold">{selectedWO.workOrderNumber}</p>
                <p className="text-muted-foreground">{selectedWO.title}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Asset Downtime (Hours)</label>
                <Input type="number" value={downtimeHours} onChange={(e) => setDowntimeHours(Number(e.target.value))} placeholder="2" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Labour Cost ($)</label>
                  <Input type="number" value={labourCost} onChange={(e) => setLabourCost(Number(e.target.value))} placeholder="150" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Material Cost ($)</label>
                  <Input type="number" value={materialCost} onChange={(e) => setMaterialCost(Number(e.target.value))} placeholder="300" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Corrective Maintenance Actions Taken</label>
                <textarea
                  value={correctiveAction}
                  onChange={(e) => setCorrectiveAction(e.target.value)}
                  placeholder="Replaced worn out gaskets, refilled lubricant oil..."
                  className="w-full h-20 p-3 rounded-xl border border-input bg-background/50 text-xs resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setSelectedWO(null)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl">
                  Complete & Set Asset Operational
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

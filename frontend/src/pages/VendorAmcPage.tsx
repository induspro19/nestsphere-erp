import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { DataTable } from '../components/shared/DataTable';
import { StatCard } from '../components/shared/StatCard';
import {
  vendorAmcApi,
  Vendor,
  AmcContract,
  ServiceVisit,
  VendorAmcMetrics,
} from '../api/vendor-amc.api';
import {
  Briefcase,
  Plus,
  Search,
  FileText,
  Star,
  AlertTriangle,
  DollarSign,
  X,
  CheckCircle,
  Clock,
  Wrench,
  PhoneCall,
  ShieldAlert,
  TrendingUp,
  CalendarClock,
  Users,
  Ban,
  RefreshCw,
} from 'lucide-react';

const VENDOR_TYPES = [
  { code: 'ELECTRICAL', label: 'Electrical', emoji: '⚡' },
  { code: 'PLUMBING', label: 'Plumbing', emoji: '🚿' },
  { code: 'CIVIL', label: 'Civil', emoji: '🏗️' },
  { code: 'FIRE_SAFETY', label: 'Fire Safety', emoji: '🔥' },
  { code: 'LIFT', label: 'Lift', emoji: '🛗' },
  { code: 'GENERATOR', label: 'Generator', emoji: '⚙️' },
  { code: 'WATER_SUPPLY', label: 'Water Supply', emoji: '💧' },
  { code: 'SECURITY', label: 'Security', emoji: '🔒' },
  { code: 'HOUSEKEEPING', label: 'Housekeeping', emoji: '🧹' },
  { code: 'GARDENING', label: 'Gardening', emoji: '🌿' },
  { code: 'INTERNET', label: 'Internet', emoji: '📡' },
  { code: 'CCTV', label: 'CCTV', emoji: '📹' },
  { code: 'BOOM_BARRIER', label: 'Boom Barrier', emoji: '🚧' },
  { code: 'SOLAR', label: 'Solar', emoji: '☀️' },
  { code: 'STP', label: 'STP', emoji: '♻️' },
  { code: 'WTP', label: 'WTP', emoji: '🏭' },
  { code: 'PAINTING', label: 'Painting', emoji: '🎨' },
  { code: 'PEST_CONTROL', label: 'Pest Control', emoji: '🦟' },
  { code: 'HVAC', label: 'HVAC', emoji: '❄️' },
  { code: 'FABRICATION', label: 'Fabrication', emoji: '🔧' },
  { code: 'MECHANICAL', label: 'Mechanical', emoji: '⚙️' },
  { code: 'IT_SERVICES', label: 'IT Services', emoji: '💻' },
  { code: 'GENERAL_CONTRACTOR', label: 'General Contractor', emoji: '🏢' },
  { code: 'SUPPLIER', label: 'Supplier', emoji: '📦' },
  { code: 'CONSULTANT', label: 'Consultant', emoji: '🧑‍💼' },
  { code: 'EMERGENCY', label: 'Emergency Services', emoji: '🚨' },
];

const CONTRACT_TYPES = ['ANNUAL', 'QUARTERLY', 'MONTHLY', 'COMPREHENSIVE', 'NON_COMPREHENSIVE', 'WARRANTY'];
const VISIT_TYPES = ['PLANNED', 'EMERGENCY', 'BREAKDOWN', 'INSPECTION', 'CALIBRATION', 'PREVENTIVE'];

const vendorStatusBadge = (s: string, isBlacklisted: boolean, isPreferred: boolean): any => {
  if (isBlacklisted) return 'destructive';
  if (isPreferred) return 'success';
  switch (s) {
    case 'ACTIVE': return 'outline';
    case 'INACTIVE': return 'secondary';
    default: return 'outline';
  }
};

const amcStatusColor = (s: string, daysToExpiry?: number): any => {
  if (s === 'EXPIRED' || s === 'TERMINATED') return 'destructive';
  if (s === 'PENDING_RENEWAL') return 'warning';
  if (s === 'ACTIVE' && daysToExpiry !== undefined && daysToExpiry <= 30) return 'warning';
  if (s === 'ACTIVE') return 'success';
  return 'outline';
};

const visitStatusColor = (s: string): any => {
  switch (s) {
    case 'COMPLETED': return 'success';
    case 'IN_PROGRESS': return 'warning';
    case 'SCHEDULED': return 'outline';
    case 'CANCELLED': return 'destructive';
    default: return 'outline';
  }
};

const StarRating = ({ value }: { value: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} className={`h-3 w-3 ${s <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-muted/40'}`} />
    ))}
    <span className="text-[10px] text-muted-foreground ml-1">{Number(value).toFixed(1)}</span>
  </div>
);

export const VendorAmcPage: React.FC = () => {
  const [tab, setTab] = useState<'vendors' | 'amc' | 'visits' | 'renewals'>('vendors');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [amcs, setAmcs] = useState<AmcContract[]>([]);
  const [visits, setVisits] = useState<ServiceVisit[]>([]);
  const [renewals, setRenewals] = useState<AmcContract[]>([]);
  const [metrics, setMetrics] = useState<VendorAmcMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorTypeFilter, setVendorTypeFilter] = useState('');
  const [vendorStatusFilter, setVendorStatusFilter] = useState('');
  const [amcSearch, setAmcSearch] = useState('');
  const [amcContractStatus, setAmcContractStatus] = useState('');
  const [visitSearch, setVisitSearch] = useState('');
  const [visitStatusFilter, setVisitStatusFilter] = useState('');

  // Modals
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isAmcModalOpen, setIsAmcModalOpen] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [selectedVisit, setSelectedVisit] = useState<ServiceVisit | null>(null);

  // Vendor form
  const [vName, setVName] = useState('');
  const [vType, setVType] = useState('ELECTRICAL');
  const [vPhone, setVPhone] = useState('');
  const [vEmail, setVEmail] = useState('');
  const [vGst, setVGst] = useState('');
  const [vPan, setVPan] = useState('');
  const [vCity, setVCity] = useState('');
  const [vIsPreferred, setVIsPreferred] = useState(false);
  const [vIsEmergency, setVIsEmergency] = useState(false);

  // AMC form
  const [amcVendorId, setAmcVendorId] = useState('');
  const [amcType, setAmcType] = useState('ANNUAL');
  const [amcStart, setAmcStart] = useState('');
  const [amcEnd, setAmcEnd] = useState('');
  const [amcValue, setAmcValue] = useState(0);
  const [amcMonthly, setAmcMonthly] = useState(0);
  const [amcSlaResp, setAmcSlaResp] = useState(4);
  const [amcSlaRes, setAmcSlaRes] = useState(24);
  const [amcFreq, setAmcFreq] = useState('MONTHLY');
  const [amcAutoRenew, setAmcAutoRenew] = useState(false);

  // Visit form
  const [svVendorId, setSvVendorId] = useState('');
  const [svAmcId, setSvAmcId] = useState('');
  const [svType, setSvType] = useState('PLANNED');
  const [svDate, setSvDate] = useState('');
  const [svTech, setSvTech] = useState('');
  const [svPhone, setSvPhone] = useState('');
  const [svDesc, setSvDesc] = useState('');

  // Contact form
  const [ctName, setCtName] = useState('');
  const [ctPhone, setCtPhone] = useState('');
  const [ctDesig, setCtDesig] = useState('');
  const [ctPrimary, setCtPrimary] = useState(false);
  const [ctEmergency, setCtEmergency] = useState(false);

  // Visit update
  const [visitUpdateStatus, setVisitUpdateStatus] = useState('');
  const [visitLabour, setVisitLabour] = useState(0);
  const [visitMaterial, setVisitMaterial] = useState(0);
  const [visitPenalty, setVisitPenalty] = useState(0);
  const [visitRating, setVisitRating] = useState(0);
  const [visitFeedback, setVisitFeedback] = useState('');

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [mRes, vRes, aRes, svRes, rRes] = await Promise.all([
        vendorAmcApi.getMetrics(),
        vendorAmcApi.getVendors({ search: vendorSearch || undefined, typeCode: vendorTypeFilter || undefined, status: vendorStatusFilter || undefined }),
        vendorAmcApi.getAmcContracts({ search: amcSearch || undefined, contractStatus: amcContractStatus || undefined }),
        vendorAmcApi.getServiceVisits({ search: visitSearch || undefined, visitStatus: visitStatusFilter || undefined }),
        vendorAmcApi.getAmcContracts({ renewalDays: 30 }),
      ]);
      setMetrics(mRes);
      setVendors((vRes as any)?.data || []);
      setAmcs((aRes as any)?.data || []);
      setVisits((svRes as any)?.data || []);
      setRenewals((rRes as any)?.data || []);
    } catch {
      // API fallback
    } finally {
      setIsLoading(false);
    }
  }, [vendorSearch, vendorTypeFilter, vendorStatusFilter, amcSearch, amcContractStatus, visitSearch, visitStatusFilter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vendorAmcApi.createVendor({ name: vName, typeCode: vType, primaryPhone: vPhone, primaryEmail: vEmail, gstNumber: vGst, panNumber: vPan, city: vCity, isPreferred: vIsPreferred, isEmergencyContact: vIsEmergency });
      setIsVendorModalOpen(false);
      setVName(''); setVPhone(''); setVEmail(''); setVGst(''); setVPan(''); setVCity('');
      fetchAll();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleCreateAmc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amcVendorId || !amcStart || !amcEnd) return alert('Vendor, start and end date required');
    try {
      const result = await vendorAmcApi.createAmc({ vendorId: amcVendorId, contractType: amcType, startDate: amcStart, endDate: amcEnd, contractValue: amcValue, amcCostPerMonth: amcMonthly, slaResponseHours: amcSlaResp, slaResolutionHours: amcSlaRes, visitFrequency: amcFreq, autoRenew: amcAutoRenew });
      alert(`✅ AMC ${(result as any).amcNumber} created!`);
      setIsAmcModalOpen(false);
      fetchAll();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await vendorAmcApi.createServiceVisit({ vendorId: svVendorId, amcId: svAmcId || undefined, visitType: svType, scheduledDate: svDate, technicianName: svTech, technicianPhone: svPhone, workDescription: svDesc });
      alert(`✅ Service Visit ${(result as any).visitNumber} scheduled!`);
      setIsVisitModalOpen(false);
      setSvVendorId(''); setSvAmcId(''); setSvDate(''); setSvTech(''); setSvPhone(''); setSvDesc('');
      fetchAll();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vendorAmcApi.addContact(selectedVendorId, { name: ctName, phone: ctPhone, designation: ctDesig, isPrimary: ctPrimary, isEmergency: ctEmergency });
      setIsContactModalOpen(false);
      setCtName(''); setCtPhone(''); setCtDesig('');
      fetchAll();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleUpdateVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisit) return;
    try {
      await vendorAmcApi.updateServiceVisit(selectedVisit.id, { status: visitUpdateStatus || undefined, labourCost: visitLabour, materialCost: visitMaterial, penaltyAmount: visitPenalty, residentRating: visitRating || undefined, residentFeedback: visitFeedback });
      setSelectedVisit(null);
      fetchAll();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
  };

  const vendorColumns = [
    {
      header: 'Vendor',
      accessorKey: (row: Vendor) => {
        const vt = VENDOR_TYPES.find((t) => t.code === row.typeCode);
        return (
          <div className="flex items-center gap-2">
            <span className="text-xl shrink-0">{vt?.emoji || '🔧'}</span>
            <div>
              <p className="font-bold text-xs font-mono">{row.vendorCode}</p>
              <p className="text-xs font-semibold">{row.name}</p>
              <p className="text-[10px] text-muted-foreground">{vt?.label || row.typeCode}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Contact',
      accessorKey: (row: Vendor) => (
        <div className="text-xs space-y-0.5">
          {row.primaryPhone && <p className="flex items-center gap-1"><PhoneCall className="h-2.5 w-2.5 text-primary" />{row.primaryPhone}</p>}
          {row.primaryEmail && <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">{row.primaryEmail}</p>}
          {row.city && <p className="text-[10px] text-muted-foreground">📍 {row.city}</p>}
        </div>
      ),
    },
    {
      header: 'GST / PAN',
      accessorKey: (row: Vendor) => (
        <div className="text-[10px] font-mono space-y-0.5">
          {row.gstNumber ? <p className="text-primary">{row.gstNumber}</p> : <p className="text-muted-foreground">No GST</p>}
          {row.panNumber ? <p className="text-muted-foreground">{row.panNumber}</p> : null}
        </div>
      ),
    },
    {
      header: 'Rating & Performance',
      accessorKey: (row: Vendor) => (
        <div className="space-y-1">
          <StarRating value={Number(row.rating)} />
          <div className="flex gap-1 text-[9px] text-muted-foreground">
            <span>📋 {row._count?.amcContracts || 0} AMC</span>
            <span>🔧 {row._count?.serviceVisits || 0} visits</span>
          </div>
          {Number(row.penaltyAmount) > 0 && (
            <p className="text-[9px] text-red-500">Penalty: ₹{Number(row.penaltyAmount).toLocaleString()}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: (row: Vendor) => (
        <div className="space-y-1">
          <Badge variant={vendorStatusBadge(row.status, row.isBlacklisted, row.isPreferred) as any} className="text-[10px]">
            {row.isBlacklisted ? '🚫 Blacklisted' : row.isPreferred ? '⭐ Preferred' : row.status}
          </Badge>
          {row.isEmergencyContact && <p className="text-[9px] text-red-500 font-semibold">🚨 Emergency Contact</p>}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessorKey: (row: Vendor) => (
        <div className="flex gap-1 flex-wrap">
          <Button size="sm" variant="outline" className="h-7 px-2 text-[10px] rounded-lg" onClick={() => { setSelectedVendorId(row.id); setIsContactModalOpen(true); }}>
            <Users className="h-3 w-3 mr-1" /> Add Contact
          </Button>
          <Button size="sm" variant="outline" className="h-7 px-2 text-[10px] rounded-lg" onClick={() => { setAmcVendorId(row.id); setIsAmcModalOpen(true); }}>
            <FileText className="h-3 w-3 mr-1" /> New AMC
          </Button>
        </div>
      ),
    },
  ];

  const amcColumns = [
    {
      header: 'AMC Contract',
      accessorKey: (row: AmcContract) => (
        <div>
          <p className="font-bold font-mono text-xs">{row.amcNumber}</p>
          {row.contractNumber && <p className="text-[10px] text-muted-foreground">#{row.contractNumber}</p>}
          <Badge variant="outline" className="text-[9px] mt-0.5">{row.contractType}</Badge>
        </div>
      ),
    },
    {
      header: 'Vendor',
      accessorKey: (row: AmcContract) => (
        <div className="text-xs">
          <p className="font-semibold">{row.vendor?.name}</p>
          <p className="text-[10px] text-muted-foreground font-mono">{row.vendor?.vendorCode}</p>
        </div>
      ),
    },
    {
      header: 'Period',
      accessorKey: (row: AmcContract) => (
        <div className="text-xs font-mono space-y-0.5">
          <p>{new Date(row.startDate).toLocaleDateString()} →</p>
          <p className={Number(row.daysToExpiry) <= 30 ? 'text-amber-500 font-bold' : ''}>{new Date(row.endDate).toLocaleDateString()}</p>
          {row.daysToExpiry !== undefined && (
            <p className={`text-[9px] ${row.daysToExpiry <= 0 ? 'text-red-500' : row.daysToExpiry <= 30 ? 'text-amber-500' : 'text-muted-foreground'}`}>
              {row.daysToExpiry <= 0 ? 'EXPIRED' : `${row.daysToExpiry}d remaining`}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'SLA',
      accessorKey: (row: AmcContract) => (
        <div className="text-[10px] space-y-0.5">
          <p>⚡ Response: {row.slaResponseHours}h</p>
          <p>✅ Resolution: {row.slaResolutionHours}h</p>
          {row.visitFrequency && <p className="text-muted-foreground">📅 {row.visitFrequency}</p>}
        </div>
      ),
    },
    {
      header: 'Value',
      accessorKey: (row: AmcContract) => (
        <div className="text-xs font-mono">
          <p className="font-bold">₹{Number(row.contractValue).toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">₹{Number(row.amcCostPerMonth).toLocaleString()}/mo</p>
          {row.autoRenew && <p className="text-[9px] text-green-500">Auto-Renew</p>}
        </div>
      ),
    },
    {
      header: 'Assets',
      accessorKey: (row: AmcContract) => (
        <div className="text-[10px] space-y-0.5">
          {row.assetLinks?.slice(0, 2).map((l) => (
            <p key={l.asset.assetCode} className="text-muted-foreground truncate max-w-[100px]">{l.asset.assetCode}: {l.asset.name}</p>
          ))}
          {(row.assetLinks?.length || 0) > 2 && <p className="text-muted-foreground">+{(row.assetLinks?.length || 0) - 2} more</p>}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: (row: AmcContract) => (
        <Badge variant={amcStatusColor(row.status, row.daysToExpiry) as any} className="text-[10px]">
          {row.status.replace('_', ' ')}
        </Badge>
      ),
    },
  ];

  const visitColumns = [
    {
      header: 'Visit',
      accessorKey: (row: ServiceVisit) => (
        <div>
          <p className="font-bold font-mono text-xs">{row.visitNumber}</p>
          <Badge variant="outline" className="text-[9px] mt-0.5">{row.visitType}</Badge>
        </div>
      ),
    },
    {
      header: 'Vendor',
      accessorKey: (row: ServiceVisit) => (
        <div className="text-xs">
          <p className="font-semibold">{row.society?.name}</p>
          {row.amc && <p className="text-[10px] text-muted-foreground">{row.amc.amcNumber}</p>}
        </div>
      ),
    },
    {
      header: 'Technician',
      accessorKey: (row: ServiceVisit) => (
        <div className="text-xs">
          <p>{row.technicianName || '—'}</p>
          {row.technicianPhone && <p className="text-[10px] text-muted-foreground">{row.technicianPhone}</p>}
        </div>
      ),
    },
    {
      header: 'Scheduled',
      accessorKey: (row: ServiceVisit) => (
        <div className="text-xs font-mono">
          <p>{new Date(row.scheduledDate).toLocaleDateString()}</p>
          {row.completedAt && <p className="text-[10px] text-green-500">Done: {new Date(row.completedAt).toLocaleDateString()}</p>}
        </div>
      ),
    },
    {
      header: 'Cost',
      accessorKey: (row: ServiceVisit) => (
        <div className="text-xs font-mono">
          <p className="font-bold">₹{Number(row.totalCost).toLocaleString()}</p>
          {Number(row.penaltyAmount) > 0 && <p className="text-[10px] text-red-500">Penalty: ₹{Number(row.penaltyAmount).toLocaleString()}</p>}
          {row.residentRating && <p className="text-[10px] text-amber-400">⭐ {row.residentRating}/5</p>}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: (row: ServiceVisit) => (
        <Badge variant={visitStatusColor(row.status) as any} className="text-[10px]">{row.status.replace('_', ' ')}</Badge>
      ),
    },
    {
      header: 'Actions',
      accessorKey: (row: ServiceVisit) => (
        row.status !== 'COMPLETED' && row.status !== 'CANCELLED' ? (
          <Button size="sm" variant="outline" className="h-7 px-2 text-[10px] rounded-lg" onClick={() => { setSelectedVisit(row); setVisitUpdateStatus(''); setVisitLabour(0); setVisitMaterial(0); }}>
            <RefreshCw className="h-3 w-3 mr-1" /> Update
          </Button>
        ) : null
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-border/40 bg-gradient-to-r from-card via-accent/30 to-background flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" /> Vendor & AMC Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            VEN-00001 · AMC-00001 · SV-00001 · SLA Tracking · Performance Rating · Renewal Alerts · Financial Integration
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="rounded-xl text-xs" onClick={() => setIsAmcModalOpen(true)}>
            <FileText className="h-3.5 w-3.5 mr-1.5" /> New AMC
          </Button>
          <Button variant="outline" className="rounded-xl text-xs" onClick={() => setIsVisitModalOpen(true)}>
            <Wrench className="h-3.5 w-3.5 mr-1.5" /> Schedule Visit
          </Button>
          <Button className="rounded-xl text-xs" onClick={() => setIsVendorModalOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Vendor
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        <StatCard title="Total Vendors" value={metrics?.vendors.total || 0} icon={Briefcase} description="" />
        <StatCard title="Preferred" value={metrics?.vendors.preferred || 0} icon={Star} description="" />
        <StatCard title="Blacklisted" value={metrics?.vendors.blacklisted || 0} icon={Ban} description="" />
        <StatCard title="Active AMCs" value={metrics?.amcs.active || 0} icon={FileText} description="" />
        <StatCard title="Expiring 30d" value={metrics?.amcs.expiringIn30Days || 0} icon={AlertTriangle} description="" />
        <StatCard title="Monthly AMC" value={`₹${(metrics?.amcs.monthlyRecurring || 0).toLocaleString()}`} icon={DollarSign} description="" />
        <StatCard title="Pending Visits" value={metrics?.visits.pending || 0} icon={Clock} description="" />
        <StatCard title="Avg Rating" value={`${metrics?.vendors.avgRating || 0}/5`} icon={Star} description="" />
      </div>

      {/* Renewal Alert Strip */}
      {(metrics?.amcs.expiringIn30Days || 0) > 0 && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-center gap-4">
          <CalendarClock className="h-5 w-5 text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-600">{metrics?.amcs.expiringIn30Days} AMC contract(s) expiring within 30 days!</p>
            <p className="text-xs text-muted-foreground">Review and renew contracts before they lapse.</p>
          </div>
          <Button variant="outline" className="text-xs h-7 rounded-lg" onClick={() => setTab('renewals')}>View Renewals</Button>
        </div>
      )}

      {/* Tab Nav */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border/40 w-fit flex-wrap">
        {[
          { id: 'vendors', label: '🏢 Vendors' },
          { id: 'amc', label: '📋 AMC Contracts' },
          { id: 'visits', label: '🔧 Service Visits' },
          { id: 'renewals', label: '⚠️ Upcoming Renewals' },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === t.id ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB: VENDORS */}
      {tab === 'vendors' && (
        <>
          <div className="p-4 rounded-xl border border-border/40 bg-card flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={vendorSearch} onChange={(e) => setVendorSearch(e.target.value)} placeholder="Search vendor name, code, GST, city..." className="pl-9 h-10 rounded-xl text-xs" />
            </div>
            <select value={vendorTypeFilter} onChange={(e) => setVendorTypeFilter(e.target.value)} className="h-10 px-3 rounded-xl border border-input bg-background/50 text-xs w-full sm:w-44">
              <option value="">All Types</option>
              {VENDOR_TYPES.map((t) => <option key={t.code} value={t.code}>{t.emoji} {t.label}</option>)}
            </select>
            <select value={vendorStatusFilter} onChange={(e) => setVendorStatusFilter(e.target.value)} className="h-10 px-3 rounded-xl border border-input bg-background/50 text-xs w-full sm:w-36">
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PREFERRED">Preferred</option>
              <option value="BLACKLISTED">Blacklisted</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          {isLoading ? <LoadingSpinner message="Loading vendor register..." /> : (
            <DataTable columns={vendorColumns} data={vendors} emptyMessage="No vendors registered yet." />
          )}
        </>
      )}

      {/* TAB: AMC CONTRACTS */}
      {tab === 'amc' && (
        <>
          <div className="p-4 rounded-xl border border-border/40 bg-card flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={amcSearch} onChange={(e) => setAmcSearch(e.target.value)} placeholder="Search AMC number, contract no., vendor name..." className="pl-9 h-10 rounded-xl text-xs" />
            </div>
            <select value={amcContractStatus} onChange={(e) => setAmcContractStatus(e.target.value)} className="h-10 px-3 rounded-xl border border-input bg-background/50 text-xs w-full sm:w-44">
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="PENDING_RENEWAL">Pending Renewal</option>
              <option value="TERMINATED">Terminated</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
          {isLoading ? <LoadingSpinner message="Loading AMC contracts..." /> : (
            <DataTable columns={amcColumns} data={amcs} emptyMessage="No AMC contracts found. Create your first AMC contract." />
          )}
        </>
      )}

      {/* TAB: SERVICE VISITS */}
      {tab === 'visits' && (
        <>
          <div className="p-4 rounded-xl border border-border/40 bg-card flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={visitSearch} onChange={(e) => setVisitSearch(e.target.value)} placeholder="Search visit number, technician..." className="pl-9 h-10 rounded-xl text-xs" />
            </div>
            <select value={visitStatusFilter} onChange={(e) => setVisitStatusFilter(e.target.value)} className="h-10 px-3 rounded-xl border border-input bg-background/50 text-xs w-full sm:w-40">
              <option value="">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          {isLoading ? <LoadingSpinner message="Loading service visits..." /> : (
            <DataTable columns={visitColumns} data={visits} emptyMessage="No service visits found." />
          )}
        </>
      )}

      {/* TAB: UPCOMING RENEWALS */}
      {tab === 'renewals' && (
        <div className="space-y-3">
          {renewals.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-border/40 bg-card">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p className="font-semibold">No renewals due in the next 30 days!</p>
              <p className="text-sm text-muted-foreground mt-1">All your AMC contracts are up to date.</p>
            </div>
          ) : (
            renewals.map((a) => (
              <div key={a.id} className={`p-4 rounded-xl border flex items-center justify-between gap-3 flex-wrap ${Number(a.daysToExpiry) <= 0 ? 'border-red-500/30 bg-red-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`h-5 w-5 shrink-0 ${Number(a.daysToExpiry) <= 0 ? 'text-red-500' : 'text-amber-500'}`} />
                  <div>
                    <p className="font-bold text-sm font-mono">{a.amcNumber} <span className="font-normal text-xs text-muted-foreground">— {a.vendor?.name}</span></p>
                    <p className="text-xs text-muted-foreground">{a.contractType} · Expires {new Date(a.endDate).toLocaleDateString()} · ₹{Number(a.contractValue).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={Number(a.daysToExpiry) <= 0 ? 'destructive' : 'outline'} className={`text-[10px] ${Number(a.daysToExpiry) > 0 && Number(a.daysToExpiry) <= 30 ? 'border-amber-500 text-amber-500' : ''}`}>
                    {Number(a.daysToExpiry) <= 0 ? 'EXPIRED' : `${a.daysToExpiry} days left`}
                  </Badge>
                  {a.autoRenew && <Badge variant="outline" className="text-[10px]">Auto-Renew ON</Badge>}
                  <Button size="sm" variant="outline" className="h-7 px-2 text-[10px] rounded-lg" onClick={() => vendorAmcApi.updateAmcStatus(a.id, 'RENEWED' as any).then(fetchAll)}>
                    <RefreshCw className="h-3 w-3 mr-1" /> Mark Renewed
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── MODAL: Add Vendor ── */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-bold font-display">Register Vendor</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsVendorModalOpen(false)} className="rounded-xl h-8 w-8"><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleCreateVendor} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Vendor Type *</label>
                <select value={vType} onChange={(e) => setVType(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs">
                  {VENDOR_TYPES.map((t) => <option key={t.code} value={t.code}>{t.emoji} {t.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Vendor Name *</label>
                <Input value={vName} onChange={(e) => setVName(e.target.value)} placeholder="ABC Electricals Pvt Ltd" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Phone</label>
                  <Input value={vPhone} onChange={(e) => setVPhone(e.target.value)} placeholder="+91 98765 43210" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">City</label>
                  <Input value={vCity} onChange={(e) => setVCity(e.target.value)} placeholder="Mumbai" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">GST Number</label>
                  <Input value={vGst} onChange={(e) => setVGst(e.target.value)} placeholder="27AABCU9603R1ZX" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">PAN</label>
                  <Input value={vPan} onChange={(e) => setVPan(e.target.value)} placeholder="AABCU9603R" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Email</label>
                <Input type="email" value={vEmail} onChange={(e) => setVEmail(e.target.value)} placeholder="vendor@example.com" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={vIsPreferred} onChange={(e) => setVIsPreferred(e.target.checked)} />
                  <Star className="h-3.5 w-3.5 text-amber-400" />
                  <span className="font-semibold">Mark as Preferred Vendor</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={vIsEmergency} onChange={(e) => setVIsEmergency(e.target.checked)} />
                  <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
                  <span className="font-semibold">Emergency Contact</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsVendorModalOpen(false)} className="rounded-xl text-xs">Cancel</Button>
                <Button type="submit" className="rounded-xl text-xs"><Briefcase className="h-3.5 w-3.5 mr-1.5" /> Register Vendor</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Create AMC ── */}
      {isAmcModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-bold font-display">Create AMC Contract</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsAmcModalOpen(false)} className="rounded-xl h-8 w-8"><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleCreateAmc} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Vendor *</label>
                <select value={amcVendorId} onChange={(e) => setAmcVendorId(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs" required>
                  <option value="">Select vendor...</option>
                  {vendors.map((v) => <option key={v.id} value={v.id}>{v.vendorCode} — {v.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Contract Type</label>
                  <select value={amcType} onChange={(e) => setAmcType(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs">
                    {CONTRACT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Visit Frequency</label>
                  <select value={amcFreq} onChange={(e) => setAmcFreq(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs">
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="HALF_YEARLY">Half Yearly</option>
                    <option value="ANNUAL">Annual</option>
                    <option value="AS_NEEDED">As Needed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Start Date *</label>
                  <Input type="date" value={amcStart} onChange={(e) => setAmcStart(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">End Date *</label>
                  <Input type="date" value={amcEnd} onChange={(e) => setAmcEnd(e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Contract Value (₹)</label>
                  <Input type="number" value={amcValue} onChange={(e) => setAmcValue(Number(e.target.value))} min={0} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Monthly Cost (₹)</label>
                  <Input type="number" value={amcMonthly} onChange={(e) => setAmcMonthly(Number(e.target.value))} min={0} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">SLA Response (hrs)</label>
                  <Input type="number" value={amcSlaResp} onChange={(e) => setAmcSlaResp(Number(e.target.value))} min={1} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">SLA Resolution (hrs)</label>
                  <Input type="number" value={amcSlaRes} onChange={(e) => setAmcSlaRes(Number(e.target.value))} min={1} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={amcAutoRenew} onChange={(e) => setAmcAutoRenew(e.target.checked)} />
                <RefreshCw className="h-3.5 w-3.5 text-green-500" />
                <span className="font-semibold">Enable Auto-Renewal</span>
              </label>
              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsAmcModalOpen(false)} className="rounded-xl text-xs">Cancel</Button>
                <Button type="submit" className="rounded-xl text-xs"><FileText className="h-3.5 w-3.5 mr-1.5" /> Create AMC</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Schedule Service Visit ── */}
      {isVisitModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-bold font-display">Schedule Service Visit</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsVisitModalOpen(false)} className="rounded-xl h-8 w-8"><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleCreateVisit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Vendor *</label>
                <select value={svVendorId} onChange={(e) => setSvVendorId(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs" required>
                  <option value="">Select vendor...</option>
                  {vendors.map((v) => <option key={v.id} value={v.id}>{v.vendorCode} — {v.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Visit Type</label>
                  <select value={svType} onChange={(e) => setSvType(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs">
                    {VISIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Scheduled Date *</label>
                  <Input type="date" value={svDate} onChange={(e) => setSvDate(e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Technician Name</label>
                  <Input value={svTech} onChange={(e) => setSvTech(e.target.value)} placeholder="Technician name" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Technician Phone</label>
                  <Input value={svPhone} onChange={(e) => setSvPhone(e.target.value)} placeholder="+91 98765 43210" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Work Description</label>
                <textarea value={svDesc} onChange={(e) => setSvDesc(e.target.value)} className="w-full h-16 p-3 rounded-xl border border-input bg-background/50 text-xs resize-none" placeholder="Describe the work to be performed..." />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsVisitModalOpen(false)} className="rounded-xl text-xs">Cancel</Button>
                <Button type="submit" className="rounded-xl text-xs"><Wrench className="h-3.5 w-3.5 mr-1.5" /> Schedule Visit</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Add Vendor Contact ── */}
      {isContactModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-bold font-display">Add Contact Person</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsContactModalOpen(false)} className="rounded-xl h-8 w-8"><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Name *</label>
                <Input value={ctName} onChange={(e) => setCtName(e.target.value)} placeholder="Contact name" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Phone *</label>
                  <Input value={ctPhone} onChange={(e) => setCtPhone(e.target.value)} placeholder="+91 98765 43210" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Designation</label>
                  <Input value={ctDesig} onChange={(e) => setCtDesig(e.target.value)} placeholder="Account Manager" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={ctPrimary} onChange={(e) => setCtPrimary(e.target.checked)} />
                  <span className="font-semibold">Primary Contact</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={ctEmergency} onChange={(e) => setCtEmergency(e.target.checked)} />
                  <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
                  <span className="font-semibold">Emergency Contact</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsContactModalOpen(false)} className="rounded-xl text-xs">Cancel</Button>
                <Button type="submit" className="rounded-xl text-xs"><Users className="h-3.5 w-3.5 mr-1.5" /> Add Contact</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Update Service Visit ── */}
      {selectedVisit && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-bold font-display">Update Visit: {selectedVisit.visitNumber}</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedVisit(null)} className="rounded-xl h-8 w-8"><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleUpdateVisit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Status</label>
                <select value={visitUpdateStatus} onChange={(e) => setVisitUpdateStatus(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs">
                  <option value="">No change</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="RESCHEDULED">Rescheduled</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Labour Cost (₹)</label>
                  <Input type="number" value={visitLabour} onChange={(e) => setVisitLabour(Number(e.target.value))} min={0} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Material Cost (₹)</label>
                  <Input type="number" value={visitMaterial} onChange={(e) => setVisitMaterial(Number(e.target.value))} min={0} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Penalty Amount (₹)</label>
                <Input type="number" value={visitPenalty} onChange={(e) => setVisitPenalty(Number(e.target.value))} min={0} />
              </div>
              {visitUpdateStatus === 'COMPLETED' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Resident Rating (1-5)</label>
                    <Input type="number" value={visitRating} onChange={(e) => setVisitRating(Number(e.target.value))} min={1} max={5} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Resident Feedback</label>
                    <textarea value={visitFeedback} onChange={(e) => setVisitFeedback(e.target.value)} className="w-full h-14 p-3 rounded-xl border border-input bg-background/50 text-xs resize-none" />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setSelectedVisit(null)} className="rounded-xl text-xs">Cancel</Button>
                <Button type="submit" className="rounded-xl text-xs"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Update Visit</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

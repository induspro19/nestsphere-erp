import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { DataTable } from '../components/shared/DataTable';
import { StatCard } from '../components/shared/StatCard';
import {
  parkingApi,
  ParkingZone,
  ParkingSlot,
  Vehicle,
  ParkingAllocation,
  ParkingMetrics,
} from '../api/parking-management.api';
import {
  Car,
  Plus,
  Search,
  MapPin,
  Zap,
  AlertTriangle,
  DollarSign,
  X,
  Layers,
  Shield,
  Trash2,
  ArrowRightLeft,
  CheckCircle,
  ParkingCircle,
  Gauge,
  Info,
} from 'lucide-react';

const PARKING_TYPES = [
  { code: 'COVERED', label: 'Covered', emoji: '🏗️' },
  { code: 'OPEN', label: 'Open', emoji: '🟩' },
  { code: 'BASEMENT', label: 'Basement', emoji: '🏢' },
  { code: 'MECHANICAL', label: 'Mechanical', emoji: '⚙️' },
  { code: 'VISITOR', label: 'Visitor', emoji: '👋' },
  { code: 'DISABLED', label: 'Disabled', emoji: '♿' },
  { code: 'EV', label: 'EV Charging', emoji: '⚡' },
  { code: 'RESERVED', label: 'Reserved', emoji: '🔒' },
  { code: 'COMMERCIAL', label: 'Commercial', emoji: '🏬' },
  { code: 'TEMPORARY', label: 'Temporary', emoji: '⏱️' },
  { code: 'TWO_WHEELER', label: 'Two Wheeler', emoji: '🛵' },
  { code: 'FOUR_WHEELER', label: 'Four Wheeler', emoji: '🚗' },
  { code: 'TRUCK', label: 'Truck', emoji: '🚛' },
  { code: 'BUS', label: 'Bus', emoji: '🚌' },
  { code: 'LOADING_BAY', label: 'Loading Bay', emoji: '📦' },
];

const VEHICLE_TYPES = [
  { code: 'CAR', label: 'Car', emoji: '🚗' },
  { code: 'BIKE', label: 'Bike', emoji: '🏍️' },
  { code: 'SCOOTER', label: 'Scooter', emoji: '🛵' },
  { code: 'EV_CAR', label: 'EV Car', emoji: '⚡🚗' },
  { code: 'EV_BIKE', label: 'EV Bike', emoji: '⚡🏍️' },
  { code: 'TRUCK', label: 'Truck', emoji: '🚛' },
  { code: 'BUS', label: 'Bus', emoji: '🚌' },
  { code: 'COMMERCIAL', label: 'Commercial', emoji: '🏭' },
  { code: 'EMERGENCY', label: 'Emergency', emoji: '🚑' },
  { code: 'GOVERNMENT', label: 'Government', emoji: '🏛️' },
];

const slotStatusColor = (s: string) => {
  switch (s) {
    case 'AVAILABLE': return 'bg-green-500/20 border-green-500/40 text-green-500';
    case 'OCCUPIED': return 'bg-red-500/20 border-red-500/40 text-red-500';
    case 'RESERVED': return 'bg-amber-500/20 border-amber-500/40 text-amber-500';
    case 'BLOCKED': return 'bg-gray-500/20 border-gray-500/40 text-gray-500';
    case 'MAINTENANCE': return 'bg-orange-500/20 border-orange-500/40 text-orange-500';
    default: return 'bg-muted border-border text-muted-foreground';
  }
};

const allocStatusBadge = (s: string): any => {
  switch (s) {
    case 'ACTIVE': return 'success';
    case 'CANCELLED': return 'destructive';
    case 'EXPIRED': return 'warning';
    default: return 'outline';
  }
};

export const ParkingManagementPage: React.FC = () => {
  const [tab, setTab] = useState<'dashboard' | 'map' | 'vehicles' | 'allocations' | 'alerts'>('dashboard');
  const [zones, setZones] = useState<ParkingZone[]>([]);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [allocations, setAllocations] = useState<ParkingAllocation[]>([]);
  const [metrics, setMetrics] = useState<ParkingMetrics | null>(null);
  const [expiryAlerts, setExpiryAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [allocSearch, setAllocSearch] = useState('');
  const [slotStatusFilter, setSlotStatusFilter] = useState('');
  const [allocTypeFilter, setAllocTypeFilter] = useState('');

  // Modals
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isAllocModalOpen, setIsAllocModalOpen] = useState(false);

  // Zone form
  const [zoneName, setZoneName] = useState('');
  const [zoneCode, setZoneCode] = useState('');
  const [zoneType, setZoneType] = useState('COVERED');
  const [zoneFloor, setZoneFloor] = useState('');

  // Slot form
  const [slotZoneId, setSlotZoneId] = useState('');
  const [slotNumber, setSlotNumber] = useState('');
  const [slotSize, setSlotSize] = useState('CAR');
  const [slotFloor, setSlotFloor] = useState('');
  const [slotBlock, setSlotBlock] = useState('');
  const [slotEv, setSlotEv] = useState(false);
  const [slotRate, setSlotRate] = useState(0);

  // Vehicle form
  const [vehFlatId, setVehFlatId] = useState('');
  const [vehNumber, setVehNumber] = useState('');
  const [vehType, setVehType] = useState('CAR');
  const [vehBrand, setVehBrand] = useState('');
  const [vehModel, setVehModel] = useState('');
  const [vehColor, setVehColor] = useState('');
  const [vehRfid, setVehRfid] = useState('');
  const [vehInsurance, setVehInsurance] = useState('');
  const [vehPuc, setVehPuc] = useState('');

  // Allocation form
  const [allocSlotId, setAllocSlotId] = useState('');
  const [allocVehicleId, setAllocVehicleId] = useState('');
  const [allocPersonId, setAllocPersonId] = useState('');
  const [allocType, setAllocType] = useState('PERMANENT');
  const [allocStart, setAllocStart] = useState(new Date().toISOString().split('T')[0]);
  const [allocCharge, setAllocCharge] = useState(0);
  const [allocDeposit, setAllocDeposit] = useState(0);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [mRes, zRes, sRes, vRes, aRes, eRes] = await Promise.all([
        parkingApi.getMetrics(),
        parkingApi.getZones(),
        parkingApi.getSlots({ slotStatus: slotStatusFilter || undefined }),
        parkingApi.getVehicles({ search: vehicleSearch || undefined }),
        parkingApi.getAllocations({ allocationType: allocTypeFilter || undefined, search: allocSearch || undefined }),
        parkingApi.getExpiryAlerts(),
      ]);
      setMetrics(mRes);
      setZones(Array.isArray(zRes) ? zRes : []);
      setSlots((sRes as any)?.data || []);
      setVehicles((vRes as any)?.data || []);
      setAllocations((aRes as any)?.data || []);
      setExpiryAlerts(Array.isArray(eRes) ? eRes : []);
    } catch {
      // API fallback
    } finally {
      setIsLoading(false);
    }
  }, [slotStatusFilter, vehicleSearch, allocSearch, allocTypeFilter]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await parkingApi.createZone({ name: zoneName, code: zoneCode, parkingType: zoneType, floor: zoneFloor });
      setIsZoneModalOpen(false);
      setZoneName(''); setZoneCode(''); setZoneFloor('');
      fetchAll();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await parkingApi.createSlot({ zoneId: slotZoneId, slotNumber, slotSize: slotSize as any, floor: slotFloor, block: slotBlock, isEvEnabled: slotEv, monthlyRate: slotRate });
      setIsSlotModalOpen(false);
      setSlotNumber(''); setSlotFloor(''); setSlotBlock(''); setSlotEv(false);
      fetchAll();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleRegisterVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehFlatId) return alert('Select flat to link vehicle');
    try {
      await parkingApi.registerVehicle({
        flatId: vehFlatId,
        vehicleNumber: vehNumber,
        typeCode: vehType,
        brand: vehBrand, modelName: vehModel, color: vehColor,
        rfidTag: vehRfid || undefined,
        insuranceExpiry: vehInsurance || undefined,
        pucExpiry: vehPuc || undefined,
      });
      setIsVehicleModalOpen(false);
      setVehNumber(''); setVehBrand(''); setVehModel(''); setVehColor(''); setVehRfid(''); setVehInsurance(''); setVehPuc('');
      fetchAll();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleCreateAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocPersonId || !allocSlotId || !allocVehicleId) return alert('Select slot, vehicle, and person');
    try {
      await parkingApi.createAllocation({
        slotId: allocSlotId,
        vehicleId: allocVehicleId,
        personId: allocPersonId,
        allocationType: allocType,
        startDate: allocStart,
        monthlyCharge: allocCharge,
        depositPaid: allocDeposit,
      });
      setIsAllocModalOpen(false);
      fetchAll();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Release this parking allocation and free the slot?')) return;
    try {
      await parkingApi.deactivateAllocation(id);
      fetchAll();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
  };

  const availableSlots = slots.filter((s) => s.status === 'AVAILABLE');
  const occupiedSlots = slots.filter((s) => s.status === 'OCCUPIED');

  const vehicleColumns = [
    {
      header: 'Vehicle',
      accessorKey: (row: Vehicle) => {
        const vt = VEHICLE_TYPES.find((v) => v.code === row.typeCode);
        return (
          <div className="flex items-center gap-2">
            <span className="text-lg">{vt?.emoji || '🚗'}</span>
            <div>
              <p className="font-bold text-xs font-mono">{row.vehicleNumber}</p>
              <p className="text-[10px] text-muted-foreground">{row.brand} {row.modelName}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Owner & Unit',
      accessorKey: (row: Vehicle) => (
        <div className="text-xs">
          <p className="font-semibold">{row.person ? `${row.person.firstName} ${row.person.lastName}` : '—'}</p>
          <p className="text-muted-foreground text-[10px]">{row.flat?.flatNumber || '—'}</p>
        </div>
      ),
    },
    {
      header: 'RFID / FASTag',
      accessorKey: (row: Vehicle) => (
        <div className="text-[10px] font-mono space-y-0.5">
          {row.rfidTag ? <p className="text-blue-400">RFID: {row.rfidTag}</p> : <p className="text-muted-foreground">No RFID</p>}
          {row.fasTag ? <p className="text-purple-400">FASTag: {row.fasTag}</p> : null}
        </div>
      ),
    },
    {
      header: 'Compliance',
      accessorKey: (row: Vehicle) => {
        const now = new Date();
        const insExpired = row.insuranceExpiry && new Date(row.insuranceExpiry) < now;
        const pucExpired = row.pucExpiry && new Date(row.pucExpiry) < now;
        return (
          <div className="text-[10px] space-y-0.5">
            <div className={`flex items-center gap-1 ${insExpired ? 'text-red-500' : 'text-muted-foreground'}`}>
              {insExpired && <AlertTriangle className="h-3 w-3" />}
              Ins: {row.insuranceExpiry ? new Date(row.insuranceExpiry).toLocaleDateString() : '—'}
            </div>
            <div className={`flex items-center gap-1 ${pucExpired ? 'text-red-500' : 'text-muted-foreground'}`}>
              {pucExpired && <AlertTriangle className="h-3 w-3" />}
              PUC: {row.pucExpiry ? new Date(row.pucExpiry).toLocaleDateString() : '—'}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Slot',
      accessorKey: (row: Vehicle) => {
        const alloc = row.allocations?.[0];
        return alloc ? (
          <div className="text-[10px]">
            <p className="font-semibold text-green-500">{alloc.slot?.slotNumber}</p>
            <p className="text-muted-foreground">{alloc.slot?.zone?.name}</p>
          </div>
        ) : (
          <span className="text-[10px] text-muted-foreground">No allocation</span>
        );
      },
    },
    { header: 'Color', accessorKey: (row: Vehicle) => <span className="text-xs">{row.color || '—'}</span> },
  ];

  const allocationColumns = [
    {
      header: 'Allocation & Type',
      accessorKey: (row: ParkingAllocation) => (
        <div>
          <p className="font-bold font-mono text-xs">{row.allocationNumber}</p>
          <Badge variant="outline" className="text-[9px] mt-0.5">{row.allocationType}</Badge>
        </div>
      ),
    },
    {
      header: 'Slot',
      accessorKey: (row: ParkingAllocation) => (
        <div className="text-xs">
          <p className="font-semibold">{row.slot?.slotNumber}</p>
          <p className="text-[10px] text-muted-foreground">{row.slot?.zone?.name} · {row.slot?.zone?.parkingType}</p>
        </div>
      ),
    },
    {
      header: 'Vehicle',
      accessorKey: (row: ParkingAllocation) => (
        <div className="text-xs font-mono">
          <p className="font-bold">{row.vehicle?.vehicleNumber}</p>
          <p className="text-[10px] text-muted-foreground">{row.vehicle?.brand} · {row.vehicle?.color}</p>
        </div>
      ),
    },
    {
      header: 'Resident',
      accessorKey: (row: ParkingAllocation) => (
        <div className="text-xs">
          <p>{row.person ? `${row.person.firstName} ${row.person.lastName}` : '—'}</p>
          <p className="text-[10px] text-muted-foreground">{row.person?.phone}</p>
        </div>
      ),
    },
    {
      header: 'Charges',
      accessorKey: (row: ParkingAllocation) => (
        <div className="text-xs font-mono">
          <p className="font-bold">₹{Number(row.monthlyCharge).toLocaleString()}/mo</p>
          <p className="text-[10px] text-muted-foreground">Dep: ₹{Number(row.depositPaid).toLocaleString()}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: (row: ParkingAllocation) => (
        <Badge variant={allocStatusBadge(row.status)} className="text-[10px]">{row.status}</Badge>
      ),
    },
    {
      header: 'Actions',
      accessorKey: (row: ParkingAllocation) =>
        row.status === 'ACTIVE' ? (
          <Button size="sm" variant="outline" className="h-7 px-2 text-[10px] rounded-lg text-red-500" onClick={() => handleDeactivate(row.id)}>
            <Trash2 className="h-3 w-3 mr-1" /> Release
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-border/40 bg-gradient-to-r from-card via-accent/30 to-background flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <ParkingCircle className="h-6 w-6 text-primary" /> Parking & Vehicle Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            PA-00001 Auto-Allocation · RFID / FASTag / QR / Boom Barrier · EV Charging · Compliance Alerts · Visitor Integration
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="rounded-xl text-xs" onClick={() => setIsZoneModalOpen(true)}>
            <Layers className="h-3.5 w-3.5 mr-1.5" /> Add Zone
          </Button>
          <Button variant="outline" className="rounded-xl text-xs" onClick={() => setIsSlotModalOpen(true)}>
            <MapPin className="h-3.5 w-3.5 mr-1.5" /> Add Slot
          </Button>
          <Button variant="outline" className="rounded-xl text-xs" onClick={() => setIsVehicleModalOpen(true)}>
            <Car className="h-3.5 w-3.5 mr-1.5" /> Register Vehicle
          </Button>
          <Button className="rounded-xl text-xs" onClick={() => setIsAllocModalOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Allocate Slot
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3">
        {[
          { title: 'Total Slots', value: metrics?.totalSlots || 0, icon: ParkingCircle },
          { title: 'Available', value: metrics?.availableSlots || 0, icon: CheckCircle },
          { title: 'Occupied', value: metrics?.occupiedSlots || 0, icon: Car },
          { title: 'Reserved', value: metrics?.reservedSlots || 0, icon: Shield },
          { title: 'EV Slots', value: metrics?.evSlots || 0, icon: Zap },
          { title: 'Vehicles', value: metrics?.totalVehicles || 0, icon: Car },
          { title: 'Active Allocs', value: metrics?.activeAllocations || 0, icon: Layers },
          { title: 'Revenue/Mo', value: `₹${(metrics?.monthlyRevenue || 0).toLocaleString()}`, icon: DollarSign },
          { title: 'Utilization', value: `${metrics?.utilizationRate || 0}%`, icon: Gauge },
        ].map((k) => (
          <StatCard key={k.title} title={k.title} value={k.value} icon={k.icon} description="" />
        ))}
      </div>

      {/* Alert Strip */}
      {metrics && (metrics.alerts.insuranceExpiring + metrics.alerts.pucExpiring + metrics.alerts.fitnessExpiring) > 0 && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex flex-wrap items-center gap-4">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <span className="text-sm font-semibold text-amber-600">Compliance Alerts (30-day window):</span>
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="px-2 py-0.5 rounded-lg bg-red-500/10 text-red-500">🛡️ Insurance Expiring: <strong>{metrics.alerts.insuranceExpiring}</strong></span>
            <span className="px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-500">🌿 PUC Expiring: <strong>{metrics.alerts.pucExpiring}</strong></span>
            <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-500">🔧 Fitness Expiring: <strong>{metrics.alerts.fitnessExpiring}</strong></span>
          </div>
          <Button variant="outline" className="text-xs h-7 rounded-lg ml-auto" onClick={() => setTab('alerts')}>View All Alerts</Button>
        </div>
      )}

      {/* Tab Nav */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border/40 w-fit flex-wrap">
        {[
          { id: 'dashboard', label: '🗺️ Parking Map' },
          { id: 'vehicles', label: '🚗 Vehicle Register' },
          { id: 'allocations', label: '📋 Allocations' },
          { id: 'alerts', label: '⚠️ Compliance Alerts' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === t.id ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB: PARKING MAP */}
      {tab === 'dashboard' && (
        <div className="space-y-4">
          {/* Zone Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.map((zone) => {
              const pt = PARKING_TYPES.find((p) => p.code === zone.parkingType);
              const avail = zone.slots?.filter((s) => s.status === 'AVAILABLE').length || 0;
              const occ = zone.slots?.filter((s) => s.status === 'OCCUPIED').length || 0;
              const total = zone.slots?.length || 0;
              const utilPct = total > 0 ? Math.round((occ / total) * 100) : 0;
              return (
                <div key={zone.id} className="p-5 rounded-2xl border border-border/40 bg-card space-y-3 hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-2xl">{pt?.emoji || '🅿️'}</p>
                      <h3 className="font-bold text-sm mt-1">{zone.name}</h3>
                      <p className="text-[10px] text-muted-foreground">{pt?.label} · {zone.floor && `Floor: ${zone.floor}`}</p>
                    </div>
                    <Badge variant={zone.isActive ? 'success' : 'outline'} className="text-[10px]">
                      {zone.code}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div className="text-center p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="font-bold text-green-500 text-sm">{avail}</p>
                      <p className="text-muted-foreground">Available</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="font-bold text-red-500 text-sm">{occ}</p>
                      <p className="text-muted-foreground">Occupied</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="font-bold text-primary text-sm">{total}</p>
                      <p className="text-muted-foreground">Total</p>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${utilPct}%` }} />
                  </div>
                  <p className="text-[10px] text-right text-muted-foreground">{utilPct}% utilization</p>
                </div>
              );
            })}
            {zones.length === 0 && (
              <div className="col-span-3 text-center py-10 text-muted-foreground text-sm">
                No parking zones configured. Click "Add Zone" to create your first zone.
              </div>
            )}
          </div>

          {/* Slot Visual Grid */}
          {slots.length > 0 && (
            <div className="p-5 rounded-2xl border border-border/40 bg-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold font-display text-sm flex items-center gap-2">
                  <ParkingCircle className="h-4 w-4 text-primary" /> Slot Grid View
                </h3>
                <select value={slotStatusFilter} onChange={(e) => setSlotStatusFilter(e.target.value)} className="h-8 px-2 rounded-lg border border-input bg-background/50 text-xs">
                  <option value="">All Statuses</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="BLOCKED">Blocked</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`p-2 rounded-xl border text-center cursor-default transition-all hover:scale-105 ${slotStatusColor(slot.status)}`}
                    title={`${slot.slotNumber} | ${slot.status} | ${slot.zone?.name}${slot.isEvEnabled ? ' | EV' : ''}`}
                  >
                    <p className="text-[10px] font-bold truncate">{slot.slotNumber}</p>
                    {slot.isEvEnabled && <Zap className="h-2.5 w-2.5 mx-auto mt-0.5" />}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 flex-wrap text-[10px]">
                {[
                  { label: 'Available', color: 'bg-green-500' },
                  { label: 'Occupied', color: 'bg-red-500' },
                  { label: 'Reserved', color: 'bg-amber-500' },
                  { label: 'Blocked', color: 'bg-gray-500' },
                  { label: 'Maintenance', color: 'bg-orange-500' },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded-sm ${l.color}`} />
                    <span className="text-muted-foreground">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: VEHICLE REGISTER */}
      {tab === 'vehicles' && (
        <>
          <div className="p-4 rounded-xl border border-border/40 bg-card flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={vehicleSearch} onChange={(e) => setVehicleSearch(e.target.value)} placeholder="Search by vehicle no., brand, owner, RFID..." className="pl-9 h-10 rounded-xl text-xs" />
            </div>
          </div>
          {isLoading ? <LoadingSpinner message="Loading vehicle register..." /> : (
            <DataTable columns={vehicleColumns} data={vehicles} emptyMessage="No vehicles registered." />
          )}
        </>
      )}

      {/* TAB: ALLOCATIONS */}
      {tab === 'allocations' && (
        <>
          <div className="p-4 rounded-xl border border-border/40 bg-card flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={allocSearch} onChange={(e) => setAllocSearch(e.target.value)} placeholder="Search by allocation no., vehicle, slot, resident..." className="pl-9 h-10 rounded-xl text-xs" />
            </div>
            <select value={allocTypeFilter} onChange={(e) => setAllocTypeFilter(e.target.value)} className="h-10 px-3 rounded-xl border border-input bg-background/50 text-xs w-full sm:w-44">
              <option value="">All Types</option>
              <option value="PERMANENT">Permanent</option>
              <option value="TEMPORARY">Temporary</option>
              <option value="GUEST">Guest</option>
              <option value="RESERVED">Reserved</option>
            </select>
          </div>
          {isLoading ? <LoadingSpinner message="Loading parking allocations..." /> : (
            <DataTable columns={allocationColumns} data={allocations} emptyMessage="No parking allocations found." />
          )}
        </>
      )}

      {/* TAB: COMPLIANCE ALERTS */}
      {tab === 'alerts' && (
        <div className="space-y-3">
          {expiryAlerts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground rounded-xl border border-border/40 bg-card">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p className="font-semibold">All vehicles are compliant!</p>
              <p className="text-sm text-muted-foreground mt-1">No insurance, PUC, or fitness expiry alerts in the next 30 days.</p>
            </div>
          ) : (
            expiryAlerts.map((v: any) => (
              <div key={v.id} className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                  <div>
                    <p className="font-bold text-sm font-mono">{v.vehicleNumber} <span className="font-normal text-xs text-muted-foreground">{v.brand} {v.modelName}</span></p>
                    <p className="text-xs text-muted-foreground">{v.flat?.flatNumber} · {v.person ? `${v.person.firstName} ${v.person.lastName}` : 'Unknown'} · {v.person?.phone}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-[10px]">
                  {v.alerts?.insurance && (
                    <span className="px-2 py-1 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 font-semibold">
                      Insurance Expired
                    </span>
                  )}
                  {!v.alerts?.insurance && v.insuranceExpiry && (
                    <span className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      Insurance: {v.alerts?.insuranceDaysLeft} days left
                    </span>
                  )}
                  {v.alerts?.puc && (
                    <span className="px-2 py-1 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 font-semibold">
                      PUC Expired
                    </span>
                  )}
                  {!v.alerts?.puc && v.pucExpiry && (
                    <span className="px-2 py-1 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20">
                      PUC: {v.alerts?.pucDaysLeft} days left
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── MODAL: Add Zone ── */}
      {isZoneModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-bold font-display">Add Parking Zone</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsZoneModalOpen(false)} className="rounded-xl h-8 w-8"><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleCreateZone} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Zone Code *</label>
                  <Input value={zoneCode} onChange={(e) => setZoneCode(e.target.value)} placeholder="B1, OPEN-A, EV-1" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Zone Name *</label>
                  <Input value={zoneName} onChange={(e) => setZoneName(e.target.value)} placeholder="Basement Level 1" required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Parking Type *</label>
                <select value={zoneType} onChange={(e) => setZoneType(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs">
                  {PARKING_TYPES.map((t) => <option key={t.code} value={t.code}>{t.emoji} {t.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Floor / Level</label>
                <Input value={zoneFloor} onChange={(e) => setZoneFloor(e.target.value)} placeholder="B1, Ground, Level 2" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsZoneModalOpen(false)} className="rounded-xl text-xs">Cancel</Button>
                <Button type="submit" className="rounded-xl text-xs"><Layers className="h-3.5 w-3.5 mr-1.5" /> Create Zone</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Add Slot ── */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-bold font-display">Add Parking Slot</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsSlotModalOpen(false)} className="rounded-xl h-8 w-8"><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleCreateSlot} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Parking Zone *</label>
                <select value={slotZoneId} onChange={(e) => setSlotZoneId(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs" required>
                  <option value="">Select zone...</option>
                  {zones.map((z) => <option key={z.id} value={z.id}>{z.name} ({z.code})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Slot No. *</label>
                  <Input value={slotNumber} onChange={(e) => setSlotNumber(e.target.value)} placeholder="A-001" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Floor</label>
                  <Input value={slotFloor} onChange={(e) => setSlotFloor(e.target.value)} placeholder="B1" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Block</label>
                  <Input value={slotBlock} onChange={(e) => setSlotBlock(e.target.value)} placeholder="A" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Slot Size</label>
                  <select value={slotSize} onChange={(e) => setSlotSize(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs">
                    <option value="TWO_WHEELER">Two Wheeler</option>
                    <option value="CAR">Car</option>
                    <option value="SUV">SUV</option>
                    <option value="TRUCK">Truck</option>
                    <option value="BUS">Bus</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Monthly Rate (₹)</label>
                  <Input type="number" value={slotRate} onChange={(e) => setSlotRate(Number(e.target.value))} min={0} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={slotEv} onChange={(e) => setSlotEv(e.target.checked)} />
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-semibold">EV Charging Enabled</span>
              </label>
              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsSlotModalOpen(false)} className="rounded-xl text-xs">Cancel</Button>
                <Button type="submit" className="rounded-xl text-xs"><MapPin className="h-3.5 w-3.5 mr-1.5" /> Create Slot</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Register Vehicle ── */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-bold font-display">Register Vehicle</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsVehicleModalOpen(false)} className="rounded-xl h-8 w-8"><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleRegisterVehicle} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Vehicle Number *</label>
                  <Input value={vehNumber} onChange={(e) => setVehNumber(e.target.value)} placeholder="MH 01 AB 1234" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Vehicle Type *</label>
                  <select value={vehType} onChange={(e) => setVehType(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs">
                    {VEHICLE_TYPES.map((t) => <option key={t.code} value={t.code}>{t.emoji} {t.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Brand</label>
                  <Input value={vehBrand} onChange={(e) => setVehBrand(e.target.value)} placeholder="Toyota" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Model</label>
                  <Input value={vehModel} onChange={(e) => setVehModel(e.target.value)} placeholder="Fortuner" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Color</label>
                  <Input value={vehColor} onChange={(e) => setVehColor(e.target.value)} placeholder="White" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">RFID Tag</label>
                <Input value={vehRfid} onChange={(e) => setVehRfid(e.target.value)} placeholder="RFID tag number (optional)" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Insurance Expiry</label>
                  <Input type="date" value={vehInsurance} onChange={(e) => setVehInsurance(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">PUC Expiry</label>
                  <Input type="date" value={vehPuc} onChange={(e) => setVehPuc(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsVehicleModalOpen(false)} className="rounded-xl text-xs">Cancel</Button>
                <Button type="submit" className="rounded-xl text-xs"><Car className="h-3.5 w-3.5 mr-1.5" /> Register</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Create Allocation ── */}
      {isAllocModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-bold font-display">Allocate Parking Slot</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsAllocModalOpen(false)} className="rounded-xl h-8 w-8"><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleCreateAllocation} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Available Slot *</label>
                <select value={allocSlotId} onChange={(e) => setAllocSlotId(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs" required>
                  <option value="">Select available slot...</option>
                  {availableSlots.map((s) => (
                    <option key={s.id} value={s.id}>{s.slotNumber} — {s.zone?.name} {s.isEvEnabled ? '⚡' : ''}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Vehicle *</label>
                <select value={allocVehicleId} onChange={(e) => setAllocVehicleId(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs" required>
                  <option value="">Select vehicle...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.vehicleNumber} — {v.brand} {v.modelName} ({v.flat?.flatNumber})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Allocation Type</label>
                  <select value={allocType} onChange={(e) => setAllocType(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs">
                    <option value="PERMANENT">Permanent</option>
                    <option value="TEMPORARY">Temporary</option>
                    <option value="GUEST">Guest</option>
                    <option value="RESERVED">Reserved</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Start Date</label>
                  <Input type="date" value={allocStart} onChange={(e) => setAllocStart(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Monthly Charge (₹)</label>
                  <Input type="number" value={allocCharge} onChange={(e) => setAllocCharge(Number(e.target.value))} min={0} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Security Deposit (₹)</label>
                  <Input type="number" value={allocDeposit} onChange={(e) => setAllocDeposit(Number(e.target.value))} min={0} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsAllocModalOpen(false)} className="rounded-xl text-xs">Cancel</Button>
                <Button type="submit" className="rounded-xl text-xs"><CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Allocate Slot</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

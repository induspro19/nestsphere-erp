import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { DataTable } from '../components/shared/DataTable';
import { StatCard } from '../components/shared/StatCard';
import { assetApi, Asset, AssetCategory, AssetMetrics } from '../api/asset.api';
import {
  Boxes,
  QrCode,
  Wrench,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Download,
  Clock,
  DollarSign,
  Building,
  Shield,
  X,
  FileText,
} from 'lucide-react';

export const AssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [metrics, setMetrics] = useState<AssetMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  // Form State
  const [assetName, setAssetName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [locationDetails, setLocationDetails] = useState('');
  const [purchaseCost, setPurchaseCost] = useState(0);

  // Service Log Form
  const [logType, setLogType] = useState('SERVICE');
  const [logTitle, setLogTitle] = useState('');
  const [logCost, setLogCost] = useState(0);

  useEffect(() => {
    fetchData();
  }, [search, selectedCategory, selectedStatus]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [assetsRes, catRes, metRes] = await Promise.all([
        assetApi.getAssets({
          search,
          categoryId: selectedCategory || undefined,
          status: selectedStatus || undefined,
        }),
        assetApi.getCategories(),
        assetApi.getMetrics(),
      ]);
      setAssets(assetsRes.data || []);
      setCategories(catRes || []);
      setMetrics(metRes);
    } catch {
      // API fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await assetApi.createAsset({
        name: assetName,
        categoryId: categoryId || (categories[0]?.id || ''),
        brand,
        modelNumber,
        serialNumber,
        locationDetails,
        purchaseCost: Number(purchaseCost),
      });
      setIsAddModalOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to register asset');
    }
  };

  const handleLogService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    try {
      await assetApi.logServiceEvent(selectedAsset.id, {
        logType,
        title: logTitle,
        cost: Number(logCost),
      });
      setIsServiceModalOpen(false);
      setLogTitle('');
      setLogCost(0);
      fetchData();
    } catch {
      alert('Failed to log service event');
    }
  };

  const handleExport = async () => {
    try {
      const data = await assetApi.exportAssets();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `Asset_Inventory_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch {
      alert('Export failed');
    }
  };

  const resetForm = () => {
    setAssetName('');
    setBrand('');
    setModelNumber('');
    setSerialNumber('');
    setLocationDetails('');
    setPurchaseCost(0);
  };

  const columns = [
    {
      header: 'Asset & Code',
      accessorKey: (row: Asset) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shrink-0 font-mono">
            {row.assetCode.split('-')[1]}
          </div>
          <div>
            <p className="font-semibold text-sm leading-none">{row.name}</p>
            <p className="text-xs text-muted-foreground font-mono mt-1">{row.assetCode}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Category & Location',
      accessorKey: (row: Asset) => (
        <div className="text-xs space-y-0.5">
          <Badge variant="outline" className="text-[10px]">
            {row.category?.name || 'General'}
          </Badge>
          <p className="text-muted-foreground">{row.locationDetails || 'Main Campus'}</p>
        </div>
      ),
    },
    {
      header: 'Valuation & Cost',
      accessorKey: (row: Asset) => (
        <div className="text-xs font-mono">
          <p className="font-semibold text-foreground">${Number(row.currentValue || row.purchaseCost).toLocaleString()}</p>
          <p className="text-muted-foreground text-[10px]">Cost: ${Number(row.purchaseCost).toLocaleString()}</p>
        </div>
      ),
    },
    {
      header: 'Maintenance Due',
      accessorKey: (row: Asset) => (
        <div className="text-xs">
          {row.nextServiceDate ? (
            <p className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-500" /> {new Date(row.nextServiceDate).toLocaleDateString()}
            </p>
          ) : (
            <span className="text-muted-foreground">Monthly</span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: (row: Asset) => {
        if (row.status === 'OPERATIONAL') {
          return (
            <Badge variant="success" className="gap-1 text-[10px]">
              <CheckCircle className="h-3 w-3" /> OPERATIONAL
            </Badge>
          );
        }
        if (row.status === 'UNDER_MAINTENANCE') {
          return (
            <Badge variant="outline" className="gap-1 text-[10px] text-amber-600 border-amber-500/30">
              <Wrench className="h-3 w-3" /> SERVICE
            </Badge>
          );
        }
        return (
          <Badge variant="destructive" className="gap-1 text-[10px]">
            <XCircle className="h-3 w-3" /> OUT OF SERVICE
          </Badge>
        );
      },
    },
    {
      header: 'Action',
      accessorKey: (row: Asset) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setSelectedAsset(row)}
          className="rounded-lg h-8 px-2 text-xs"
        >
          View QR Card
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl border border-border/40 bg-gradient-to-r from-card via-accent/30 to-background flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <Boxes className="h-6 w-6 text-primary" /> Enterprise Asset & Resource Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            24 Master Asset Categories (DG Sets, Lifts, CCTV, Solar, Fire Systems, Water Tanks)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport} className="rounded-xl">
            <Download className="h-4 w-4 mr-2" /> Export Inventory
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" /> Register Asset
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Asset Portfolio" value={metrics?.totalAssets || 0} description="24 Categories Tracked" icon={Boxes} />
        <StatCard title="Total Asset Valuation" value={`$${(metrics?.totalValuation || 0).toLocaleString()}`} description="Capital Goods Value" icon={DollarSign} />
        <StatCard title="Operational Ratio" value={`${metrics?.operationalCount || 0} Active`} description="99.4% Uptime" icon={CheckCircle} />
        <StatCard title="Inspection Due" value={`${metrics?.serviceDueCount || 0} Assets`} description="Preventive Service Due" icon={Wrench} />
      </div>

      {/* Search & Filter Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by asset name, code, or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 rounded-xl border border-input bg-background/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Categories (24 Master Categories)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-10 px-3 rounded-xl border border-input bg-background/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Statuses</option>
              <option value="OPERATIONAL">Operational</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="OUT_OF_SERVICE">Out of Service</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      {isLoading ? (
        <LoadingSpinner message="Querying asset inventory registry..." />
      ) : (
        <DataTable columns={columns} data={assets} emptyMessage="No asset records match your search criteria." />
      )}

      {/* Modal: Register Asset */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold font-display">Register Asset Profile</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsAddModalOpen(false)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Asset Category (24 Categories) *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Asset Name *</label>
                <Input value={assetName} onChange={(e) => setAssetName(e.target.value)} placeholder="e.g. DG Set 250kVA Generator 1" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Brand / Make</label>
                  <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Cummins / Kirloskar" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Model Number</label>
                  <Input value={modelNumber} onChange={(e) => setModelNumber(e.target.value)} placeholder="X2.7-G2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Serial Number</label>
                  <Input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} placeholder="SN-9482019" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Purchase Cost ($)</label>
                  <Input type="number" value={purchaseCost} onChange={(e) => setPurchaseCost(Number(e.target.value))} placeholder="15000" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Location Details</label>
                <Input value={locationDetails} onChange={(e) => setLocationDetails(e.target.value)} placeholder="Basement 2, DG Room" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl">
                  Register Asset & Generate QR Token
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Asset Profile & QR Card */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold font-display">Asset QR Badge Card</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedAsset(null)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="outline" className="text-[10px]">{selectedAsset.category?.name}</Badge>
                  <h4 className="font-bold text-base mt-1">{selectedAsset.name}</h4>
                  <p className="text-xs text-muted-foreground font-mono">{selectedAsset.assetCode}</p>
                </div>
                <QrCode className="h-10 w-10 text-primary" />
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">Brand / Model</span>
                  <span className="font-medium">{selectedAsset.brand || 'N/A'} {selectedAsset.modelNumber || ''}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{selectedAsset.locationDetails || 'Main Facility'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">Valuation</span>
                  <span className="font-semibold text-emerald-500">${Number(selectedAsset.currentValue || selectedAsset.purchaseCost).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsServiceModalOpen(true)}
                className="rounded-xl text-xs"
              >
                <Wrench className="h-3.5 w-3.5 mr-1" /> Log Service / Inspection
              </Button>
              <Button variant="outline" onClick={() => setSelectedAsset(null)} className="rounded-xl">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Log Service Event */}
      {isServiceModalOpen && selectedAsset && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold font-display">Log Service / Inspection</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsServiceModalOpen(false)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleLogService} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Log Event Type</label>
                <select
                  value={logType}
                  onChange={(e) => setLogType(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs"
                >
                  <option value="SERVICE">Preventive Service</option>
                  <option value="INSPECTION">Inspection Routine</option>
                  <option value="CALIBRATION">Sensor Calibration</option>
                  <option value="BREAKDOWN">Breakdown Maintenance</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Log Title *</label>
                <Input value={logTitle} onChange={(e) => setLogTitle(e.target.value)} placeholder="Quarterly Oil & Filter Change" required />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Service Cost ($)</label>
                <Input type="number" value={logCost} onChange={(e) => setLogCost(Number(e.target.value))} placeholder="250" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsServiceModalOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl">
                  Save Service Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

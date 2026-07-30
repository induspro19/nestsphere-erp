import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { DataTable } from '../components/shared/DataTable';
import { StatCard } from '../components/shared/StatCard';
import {
  maintenanceBillingApi,
  MaintenanceBill,
  BillingMetrics,
  AgingBucket,
  BillConfig,
} from '../api/maintenance-billing.api';
import {
  Receipt,
  Plus,
  Search,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  BadgePercent,
  X,
  Settings,
  Zap,
  CreditCard,
  Clock,
  CheckCircle,
} from 'lucide-react';

const statusColor = (status: string) => {
  switch (status) {
    case 'PAID': return 'success';
    case 'PART_PAID': return 'warning';
    case 'OVERDUE': return 'destructive';
    default: return 'outline';
  }
};

export const MaintenanceBillingPage: React.FC = () => {
  const [bills, setBills] = useState<MaintenanceBill[]>([]);
  const [metrics, setMetrics] = useState<BillingMetrics | null>(null);
  const [aging, setAging] = useState<AgingBucket | null>(null);
  const [config, setConfig] = useState<BillConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [billingMonthFilter, setBillingMonthFilter] = useState('');

  // Modals
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<MaintenanceBill | null>(null);

  // Generate form
  const [genMonth, setGenMonth] = useState('');

  // Payment form
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [gatewayRef, setGatewayRef] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');

  // Config form
  const [flatRate, setFlatRate] = useState('1500');
  const [sinkingFund, setSinkingFund] = useState('300');
  const [corpusFund, setCorpusFund] = useState('200');
  const [gstPct, setGstPct] = useState('18');
  const [lateFee, setLateFee] = useState('5');
  const [dueDays, setDueDays] = useState('15');

  useEffect(() => {
    fetchAll();
  }, [search, statusFilter, billingMonthFilter]);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [billRes, metRes, agingRes, cfgRes] = await Promise.all([
        maintenanceBillingApi.getBills({
          search: search || undefined,
          status: statusFilter || undefined,
          billingMonth: billingMonthFilter || undefined,
        }),
        maintenanceBillingApi.getMetrics(),
        maintenanceBillingApi.getAging(),
        maintenanceBillingApi.getConfig(),
      ]);
      setBills(billRes.data || []);
      setMetrics(metRes);
      setAging(agingRes);
      setConfig(cfgRes);
      if (cfgRes) {
        setFlatRate(String(cfgRes.flatRatePerUnit));
        setSinkingFund(String(cfgRes.sinkingFundAmount));
        setCorpusFund(String(cfgRes.corpusFundAmount));
        setGstPct(String(cfgRes.gstPercentage));
        setLateFee(String(cfgRes.lateFeePercentage));
        setDueDays(String(cfgRes.dueDateDays));
      }
    } catch {
      // API fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await maintenanceBillingApi.generateBulkBills({
        billingMonth: genMonth || undefined,
      });
      alert(`✅ ${result.created} bills generated, ${result.skipped} skipped (already exist).`);
      setIsGenerateModalOpen(false);
      fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate bills');
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;
    try {
      await maintenanceBillingApi.recordPayment({
        billId: selectedBill.id,
        paidAmount: Number(paidAmount),
        paymentMethod,
        gatewayRef: gatewayRef || undefined,
        discountAmount: discountAmount ? Number(discountAmount) : undefined,
      });
      setSelectedBill(null);
      setPaidAmount('');
      setGatewayRef('');
      setDiscountAmount('');
      fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Payment recording failed');
    }
  };

  const handleConfigSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await maintenanceBillingApi.upsertConfig({
        flatRatePerUnit: Number(flatRate),
        sinkingFundAmount: Number(sinkingFund),
        corpusFundAmount: Number(corpusFund),
        gstPercentage: Number(gstPct),
        lateFeePercentage: Number(lateFee),
        dueDateDays: Number(dueDays),
      });
      setIsConfigModalOpen(false);
      fetchAll();
    } catch {
      alert('Failed to save configuration');
    }
  };

  const handleApplyLateFees = async () => {
    if (!confirm('Apply late fee penalties to all overdue bills?')) return;
    try {
      const res = await maintenanceBillingApi.applyLateFees();
      alert(res.message);
      fetchAll();
    } catch {
      alert('Failed to apply late fees');
    }
  };

  const columns = [
    {
      header: 'Bill No. & Period',
      accessorKey: (row: MaintenanceBill) => (
        <div>
          <p className="font-bold font-mono text-xs">{row.billNumber}</p>
          <p className="text-[10px] text-muted-foreground">{row.billingMonth}</p>
        </div>
      ),
    },
    {
      header: 'Unit & Resident',
      accessorKey: (row: MaintenanceBill) => (
        <div className="text-xs">
          <p className="font-semibold">{row.unit?.flatNumber || '—'}</p>
          <p className="text-muted-foreground">
            {row.person ? `${row.person.firstName} ${row.person.lastName}` : '—'}
          </p>
        </div>
      ),
    },
    {
      header: 'Charges Breakdown',
      accessorKey: (row: MaintenanceBill) => (
        <div className="text-[10px] text-muted-foreground space-y-0.5">
          <div className="flex justify-between gap-4">
            <span>Maintenance</span>
            <span className="font-mono">₹{Number(row.maintenanceAmount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>GST ({config?.gstPercentage || 18}%)</span>
            <span className="font-mono">₹{Number(row.gstAmount).toLocaleString()}</span>
          </div>
          {Number(row.lateFee) > 0 && (
            <div className="flex justify-between gap-4 text-red-500">
              <span>Late Fee</span>
              <span className="font-mono">₹{Number(row.lateFee).toLocaleString()}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Total / Paid / Due',
      accessorKey: (row: MaintenanceBill) => (
        <div className="text-xs font-mono">
          <p className="font-bold">₹{Number(row.totalAmount).toLocaleString()}</p>
          <p className="text-green-500 text-[10px]">Paid: ₹{Number(row.paidAmount).toLocaleString()}</p>
          <p className="text-amber-500 text-[10px]">Due: ₹{Number(row.outstandingAmount).toLocaleString()}</p>
        </div>
      ),
    },
    {
      header: 'Due Date',
      accessorKey: (row: MaintenanceBill) => (
        <span className="text-xs font-mono">{new Date(row.dueDate).toLocaleDateString()}</span>
      ),
    },
    {
      header: 'Status',
      accessorKey: (row: MaintenanceBill) => (
        <Badge variant={statusColor(row.status) as any} className="text-[10px]">
          {row.status === 'PAID' && <CheckCircle className="h-3 w-3 mr-1" />}
          {row.status === 'OVERDUE' && <AlertTriangle className="h-3 w-3 mr-1" />}
          {row.status === 'PART_PAID' && <Clock className="h-3 w-3 mr-1" />}
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Action',
      accessorKey: (row: MaintenanceBill) =>
        row.status !== 'PAID' ? (
          <Button
            size="sm"
            variant="outline"
            className="rounded-lg h-8 px-2 text-xs"
            onClick={() => {
              setSelectedBill(row);
              setPaidAmount(String(Number(row.outstandingAmount).toFixed(2)));
            }}
          >
            <CreditCard className="h-3 w-3 mr-1" /> Record Payment
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
            <Receipt className="h-6 w-6 text-primary" /> Maintenance Billing Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bulk Invoice Generation (MB-2026-00001) · GST-Ready · Sinking & Corpus Fund · Online Payments · Aging Analysis
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="rounded-xl text-xs" onClick={handleApplyLateFees}>
            <AlertTriangle className="h-3.5 w-3.5 mr-1.5 text-red-500" /> Apply Late Fees
          </Button>
          <Button variant="outline" className="rounded-xl text-xs" onClick={() => setIsConfigModalOpen(true)}>
            <Settings className="h-3.5 w-3.5 mr-1.5" /> Configure Rates
          </Button>
          <Button className="rounded-xl text-xs" onClick={() => setIsGenerateModalOpen(true)}>
            <Zap className="h-3.5 w-3.5 mr-1.5" /> Generate Bulk Bills
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Billed"
          value={`₹${(metrics?.totalBilled || 0).toLocaleString()}`}
          description="All-time invoiced amount"
          icon={DollarSign}
        />
        <StatCard
          title="Total Collected"
          value={`₹${(metrics?.totalCollected || 0).toLocaleString()}`}
          description={`Collection rate: ${metrics?.collectionRate || 0}%`}
          icon={TrendingUp}
        />
        <StatCard
          title="Total Outstanding"
          value={`₹${(metrics?.totalOutstanding || 0).toLocaleString()}`}
          description={`${metrics?.unpaidCount || 0} unpaid · ${metrics?.overdueCount || 0} overdue`}
          icon={Clock}
        />
        <StatCard
          title="Late Fee Revenue"
          value={`₹${(metrics?.totalLateFees || 0).toLocaleString()}`}
          description="Penalty collections"
          icon={BadgePercent}
        />
      </div>

      {/* Aging Analysis Strip */}
      {aging && (
        <div className="p-4 rounded-xl border border-border/40 bg-card">
          <h3 className="text-sm font-semibold font-display mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Receivables Aging Analysis
            <span className="text-[10px] text-muted-foreground font-normal">({aging.totalDebtors} outstanding debtors)</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: '0–30 Days', value: aging.aging['0_30'], color: 'text-green-500' },
              { label: '31–60 Days', value: aging.aging['31_60'], color: 'text-amber-500' },
              { label: '61–90 Days', value: aging.aging['61_90'], color: 'text-orange-500' },
              { label: '90+ Days', value: aging.aging['90_plus'], color: 'text-red-500' },
            ].map((b) => (
              <div key={b.label} className="p-3 rounded-xl bg-background/50 border border-border/40 text-center">
                <p className={`text-lg font-bold font-mono ${b.color}`}>₹{b.value.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{b.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-xl border border-border/40 bg-card flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by bill no., flat, or resident name..."
            className="pl-9 h-10 rounded-xl text-xs"
          />
        </div>
        <input
          type="month"
          value={billingMonthFilter}
          onChange={(e) => setBillingMonthFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-input bg-background/50 text-xs w-full sm:w-44"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-input bg-background/50 text-xs w-full sm:w-36"
        >
          <option value="">All Statuses</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PART_PAID">Part Paid</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>

      {/* Bills Table */}
      {isLoading ? (
        <LoadingSpinner message="Loading maintenance bills and collection data..." />
      ) : (
        <DataTable columns={columns} data={bills} emptyMessage="No maintenance bills found for the selected period." />
      )}

      {/* ── Modal: Generate Bulk Bills ── */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-bold font-display">Generate Bulk Maintenance Bills</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsGenerateModalOpen(false)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Billing Month</label>
                <input
                  type="month"
                  value={genMonth}
                  onChange={(e) => setGenMonth(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs"
                />
                <p className="text-[10px] text-muted-foreground">Leave blank to default to current month</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs space-y-1">
                <p className="font-semibold text-primary">Current Config (per unit)</p>
                <p>Flat Rate: ₹{config?.flatRatePerUnit} · Sinking Fund: ₹{config?.sinkingFundAmount}</p>
                <p>GST: {config?.gstPercentage}% · Due in {config?.dueDateDays} days</p>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsGenerateModalOpen(false)} className="rounded-xl text-xs">Cancel</Button>
                <Button type="submit" className="rounded-xl text-xs">
                  <Zap className="h-3.5 w-3.5 mr-1.5" /> Generate Bills
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Record Payment ── */}
      {selectedBill && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-bold font-display">Record Payment</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedBill(null)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs font-mono space-y-1">
                <p className="font-bold text-foreground">{selectedBill.billNumber}</p>
                <p>Unit: {selectedBill.unit?.flatNumber} · {selectedBill.billingMonth}</p>
                <p className="text-amber-500">Outstanding: ₹{Number(selectedBill.outstandingAmount).toLocaleString()}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Payment Amount (₹) *</label>
                <Input type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} required min={1} />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs"
                >
                  <option value="UPI">UPI</option>
                  <option value="RAZORPAY">Razorpay</option>
                  <option value="STRIPE">Stripe</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Transaction / Reference ID</label>
                <Input value={gatewayRef} onChange={(e) => setGatewayRef(e.target.value)} placeholder="UPI ref / Razorpay ID / Cheque No." />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Discount / Waiver (₹)</label>
                <Input type="number" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} placeholder="0" min={0} />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setSelectedBill(null)} className="rounded-xl text-xs">Cancel</Button>
                <Button type="submit" className="rounded-xl text-xs">
                  <CreditCard className="h-3.5 w-3.5 mr-1.5" /> Confirm Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Configure Rates ── */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-bold font-display">Billing Rate Configuration</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsConfigModalOpen(false)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleConfigSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Flat Rate / Unit (₹)</label>
                  <Input type="number" value={flatRate} onChange={(e) => setFlatRate(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Sinking Fund (₹)</label>
                  <Input type="number" value={sinkingFund} onChange={(e) => setSinkingFund(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Corpus Fund (₹)</label>
                  <Input type="number" value={corpusFund} onChange={(e) => setCorpusFund(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">GST %</label>
                  <Input type="number" value={gstPct} onChange={(e) => setGstPct(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Late Fee %</label>
                  <Input type="number" value={lateFee} onChange={(e) => setLateFee(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Due Date (Days)</label>
                  <Input type="number" value={dueDays} onChange={(e) => setDueDays(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsConfigModalOpen(false)} className="rounded-xl text-xs">Cancel</Button>
                <Button type="submit" className="rounded-xl text-xs">
                  <Settings className="h-3.5 w-3.5 mr-1.5" /> Save Configuration
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

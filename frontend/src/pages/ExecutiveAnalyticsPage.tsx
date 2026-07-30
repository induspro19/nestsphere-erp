import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Users,
  ShieldCheck,
  CheckCircle,
  Clock,
  Building2,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { StatCard } from '../components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts';
import { toast } from 'sonner';

const FINANCIAL_SURPLUS_DATA = [
  { month: 'Jan', revenue: 12.5, expenses: 5.4, surplus: 7.1 },
  { month: 'Feb', revenue: 13.2, expenses: 5.8, surplus: 7.4 },
  { month: 'Mar', revenue: 14.5, expenses: 6.2, surplus: 8.3 },
  { month: 'Apr', revenue: 13.8, expenses: 5.9, surplus: 7.9 },
  { month: 'May', revenue: 15.2, expenses: 6.4, surplus: 8.8 },
  { month: 'Jun', revenue: 16.8, expenses: 7.1, surplus: 9.7 },
];

const DEFAULTER_DISTRIBUTION = [
  { name: '0-30 Days', value: 45, color: '#10b981' },
  { name: '31-60 Days', value: 25, color: '#f59e0b' },
  { name: '61-90 Days', value: 18, color: '#ef4444' },
  { name: '90+ Days', value: 12, color: '#881337' },
];

const VISITOR_FOOTFALL_DATA = [
  { day: 'Mon', footfall: 420 },
  { day: 'Tue', footfall: 510 },
  { day: 'Wed', footfall: 480 },
  { day: 'Thu', footfall: 590 },
  { day: 'Fri', footfall: 680 },
  { day: 'Sat', footfall: 890 },
  { day: 'Sun', footfall: 820 },
];

export const ExecutiveAnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('6M');

  const handleExport = () => {
    toast.success('Exporting Executive BI Summary Report (PDF)...');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" /> Executive Analytics & Decision BI
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Single source of truth for cross-module financial, operational, and governance intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted/60 p-1 rounded-xl border border-border/50 text-xs">
            {['1M', '3M', '6M', 'YTD', '1Y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  timeRange === range
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <Button onClick={handleExport} className="rounded-xl gap-2 text-xs shadow-sm">
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Collections" value="₹96.0 L" icon={IndianRupee} trend="+14.2% vs last period" />
        <StatCard title="Collection Efficiency" value="94.8%" icon={CheckCircle} trend="+2.1%" />
        <StatCard title="Net Operating Surplus" value="₹50.2 L" icon={TrendingUp} trend="+8.4%" />
        <StatCard title="Outstanding Dues" value="₹5.2 L" icon={TrendingDown} />
      </div>

      {/* Charts Row 1: Financial Surplus & Defaulters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold font-display">Revenue vs Expenses & Net Surplus</CardTitle>
                <CardDescription className="text-xs">Financial performance trend in ₹ Lakhs</CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px]">Monthly Cash Flow</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={FINANCIAL_SURPLUS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33333320" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" name="Revenue (₹L)" />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={0} name="Expenses (₹L)" />
                  <Area type="monotone" dataKey="surplus" stroke="#3b82f6" strokeWidth={2} fillOpacity={0} name="Net Surplus (₹L)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold font-display">Defaulter Ageing Distribution</CardTitle>
            <CardDescription className="text-xs">Outstanding dues broken by age buckets</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={DEFAULTER_DISTRIBUTION} innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                    {DEFAULTER_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs w-full pt-4 border-t">
              {DEFAULTER_DISTRIBUTION.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}:</span>
                  <span className="font-semibold">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Visitor Footfall & Operational Efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold font-display">Weekly Gate Footfall & Traffic</CardTitle>
            <CardDescription className="text-xs">Visitor entry volume across gates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={VISITOR_FOOTFALL_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33333320" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="footfall" fill="#6366f1" radius={[4, 4, 0, 0]} name="Visitors" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold font-display">Operational SLA Scorecard</CardTitle>
            <CardDescription className="text-xs">Cross-module operational turnaround benchmarks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span>Complaint Resolution SLA (&lt; 6 hrs)</span>
                <span className="text-emerald-500 font-bold">4.2 hrs (Pass)</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span>Gatekeeper Check-in Speed</span>
                <span className="text-emerald-500 font-bold">14 sec / visitor</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span>PWA Resident Mobile Adoption</span>
                <span className="text-emerald-500 font-bold">92.4% Active</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

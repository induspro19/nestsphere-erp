import React from 'react';
import {
  Building2,
  CheckCircle,
  Clock,
  Users,
  UserCheck,
  IndianRupee,
  TrendingUp,
  BarChart3,
  RefreshCcw,
  TrendingDown,
  HardDrive,
  Wifi,
  Zap,
  ShieldAlert,
  Server,
  Database,
  Mail,
  Activity,
  Layers,
} from 'lucide-react';
import { StatCard } from '../../components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const SOCIETY_GROWTH_DATA = [
  { name: 'Jan', societies: 12 },
  { name: 'Feb', societies: 18 },
  { name: 'Mar', societies: 24 },
  { name: 'Apr', societies: 32 },
  { name: 'May', societies: 38 },
  { name: 'Jun', societies: 42 },
];

const REVENUE_TREND_DATA = [
  { name: 'Jan', revenue: 4.5 },
  { name: 'Feb', revenue: 5.8 },
  { name: 'Mar', revenue: 7.2 },
  { name: 'Apr', revenue: 9.1 },
  { name: 'May', revenue: 10.8 },
  { name: 'Jun', revenue: 12.45 },
];

const RECENT_SOCIETIES = [
  { id: 1, name: 'Sunshine Residency', code: 'SUN001', plan: 'Enterprise', date: '2026-07-28', status: 'Active' },
  { id: 2, name: 'Green Valley', code: 'GRN002', plan: 'Premium', date: '2026-07-27', status: 'Trial' },
  { id: 3, name: 'Ocean View', code: 'OCN003', plan: 'Basic', date: '2026-07-26', status: 'Active' },
  { id: 4, name: 'Pinnacle Heights', code: 'PIN004', plan: 'Enterprise', date: '2026-07-25', status: 'Active' },
  { id: 5, name: 'Maple Woods', code: 'MAP005', plan: 'Premium', date: '2026-07-24', status: 'Suspended' },
];

const LATEST_PAYMENTS = [
  { id: 1, society: 'Sunshine Residency', amount: '₹1,50,000', date: '2026-07-29', status: 'Paid' },
  { id: 2, society: 'Green Valley', amount: '₹45,000', date: '2026-07-28', status: 'Pending' },
  { id: 3, society: 'Ocean View', amount: '₹25,000', date: '2026-07-28', status: 'Paid' },
  { id: 4, society: 'Maple Woods', amount: '₹75,000', date: '2026-07-20', status: 'Overdue' },
  { id: 5, society: 'Pinnacle Heights', amount: '₹2,50,000', date: '2026-07-15', status: 'Paid' },
];

export default function SuperAdminDashboardPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold font-display tracking-tight">Super Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and key performance metrics.</p>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
        <StatCard title="Total Societies" value="42" icon={Building2} trend="+12% vs last month" />
        <StatCard title="Active Societies" value="38" icon={CheckCircle} />
        <StatCard title="Trial Societies" value="4" icon={Clock} />
        <StatCard title="Total Residents" value="18,240" icon={Users} trend="+8%" />
        <StatCard title="Total Users" value="2,450" icon={UserCheck} />
        <StatCard title="Monthly Revenue" value="₹12,45,000" icon={IndianRupee} trend="+15%" />
        <StatCard title="ARR" value="₹1.49 Cr" icon={TrendingUp} />
        <StatCard title="MRR" value="₹12.45 L" icon={BarChart3} />
        <StatCard title="Renewal Rate" value="94.2%" icon={RefreshCcw} />
        
        {/* Churn Rate with red styling applied via parent class */}
        <div className="[&_.text-2xl]:text-destructive [&_.h-10]:bg-destructive/10 [&_.h-10]:text-destructive">
          <StatCard title="Churn Rate" value="2.1%" icon={TrendingDown} />
        </div>
        
        <StatCard title="Storage Used" value="2.4 TB" icon={HardDrive} />
        <StatCard title="Active Sessions" value="847" icon={Wifi} />
        <StatCard title="API Requests Today" value="124,580" icon={Zap} />
        <StatCard title="Platform Revenue Processing" value="₹4.2 Cr" icon={IndianRupee} trend="+18%" />
        <StatCard title="Gateway Success Rate" value="99.8%" icon={ShieldAlert} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Society Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SOCIETY_GROWTH_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSocieties" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="societies"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSocieties)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend (Lakhs)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={REVENUE_TREND_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                  <Tooltip
                    cursor={{ fill: '#333', opacity: 0.2 }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Society Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {RECENT_SOCIETIES.map((society) => (
                <div key={society.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{society.name}</span>
                    <span className="text-xs text-muted-foreground">{society.code} • {society.plan}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{society.date}</span>
                    <Badge
                      variant={
                        society.status === 'Active' ? 'success' :
                        society.status === 'Trial' ? 'secondary' : 'destructive'
                      }
                    >
                      {society.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {LATEST_PAYMENTS.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{payment.society}</span>
                    <span className="text-xs text-muted-foreground">{payment.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">{payment.amount}</span>
                    <Badge
                      variant={
                        payment.status === 'Paid' ? 'success' :
                        payment.status === 'Pending' ? 'secondary' : 'destructive'
                      }
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-muted/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium">Database</span>
            </div>
            <Badge variant="success">Online</Badge>
          </CardContent>
        </Card>
        
        <Card className="bg-muted/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium">Redis</span>
            </div>
            <Badge variant="success">Online</Badge>
          </CardContent>
        </Card>
        
        <Card className="bg-muted/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium">Email Queue</span>
            </div>
            <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 dark:text-amber-400">12 Pending</Badge>
          </CardContent>
        </Card>
        
        <Card className="bg-muted/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium">Background Jobs</span>
            </div>
            <Badge variant="default" className="bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25">3 Running</Badge>
          </CardContent>
        </Card>
        
        <Card className="bg-muted/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium">Storage</span>
            </div>
            <Badge variant="outline">68% Used</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

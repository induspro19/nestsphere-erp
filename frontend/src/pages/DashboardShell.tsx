import React from 'react';
import { StatCard } from '../components/shared/StatCard';
import { Building2, Users, Home, DollarSign, UserPlus, CreditCard, LifeBuoy, Bell, Radio, Vote, UserCheck, Activity, CheckCircle2, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export const DashboardShell: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const QUICK_ACTIONS = [
    { title: 'New Notice', icon: Bell, path: '/notices' },
    { title: 'Broadcast', icon: Radio, path: '/notifications' },
    { title: 'Add Visitor', icon: UserCheck, path: '/visitors' },
    { title: 'Raise Ticket', icon: LifeBuoy, path: '/complaints' },
    { title: 'Add Resident', icon: UserPlus, path: '/people' },
    { title: 'Payments', icon: CreditCard, path: '/billing' },
    { title: 'New Poll', icon: Vote, path: '/polls' },
    { title: 'Committee', icon: Users, path: '/elections' },
  ];

  const RECENT_ACTIVITIES = [
    { id: 1, title: 'New notice "Water Cut Off On 8-8-2026" published', time: 'Today, 10:30 AM', icon: Bell, color: 'text-blue-600 bg-blue-50' },
    { id: 2, title: 'Helpdesk ticket #TK-109 raised by Rahul Verma', time: 'Today, 09:15 AM', icon: LifeBuoy, color: 'text-amber-600 bg-amber-50' },
    { id: 3, title: 'Payment of ₹5,200 received from Flat A-101', time: 'Today, 08:45 AM', icon: CreditCard, color: 'text-emerald-600 bg-emerald-50' },
  ];

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div data-testid="admin-dashboard" className="space-y-3.5 animate-in fade-in duration-200">
      {/* Sub-Header Bar */}
      <div className="h-[48px] px-4 rounded-[12px] border border-gray-200 bg-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <h1 data-testid="dashboard-title" className="text-[22px] font-semibold text-gray-900 tracking-tight leading-none">
            Dashboard
          </h1>
          <div className="h-4 w-px bg-gray-200 hidden sm:block" />
          <span className="text-[13px] font-medium text-gray-600 truncate hidden sm:inline">
            {user?.societyName || 'Greenfield Heights'} <span className="text-gray-400 font-mono text-[11px]">(SOC-001)</span>
          </span>
          <span className="text-[12px] text-gray-400 font-normal hidden lg:inline">
            • {currentDate}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center gap-1.5 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> System Operational
          </span>
        </div>
      </div>

      {/* Top 4 Optimized Master KPI Cards (Equal 140px Height, Zero Truncation) */}
      <div data-testid="kpi-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          title={user?.societyName || 'Greenfield Heights'}
          value="SOC-001"
          subRows={[
            <span key="st" className="text-emerald-600 font-medium flex items-center gap-1">✓ Active Society</span>,
            <span key="tn" className="text-gray-400">Tenant Data Isolated</span>,
          ]}
          icon={Building2}
        />
        <StatCard
          title="Total Flats"
          value="240"
          subRows={[
            "Occupied: 218",
            "Vacant: 22",
            <span key="occ" className="text-emerald-600 font-medium">91% Occupancy Rate</span>,
          ]}
          icon={Home}
        />
        <StatCard
          title="Total Population"
          value="728"
          subRows={[
            "Families: 221",
            "Owners: 174",
            "Tenants: 67",
          ]}
          icon={Users}
        />
        <StatCard
          title="Financial Health"
          value="₹18.40L"
          subRows={[
            "Collection: ₹18.40L",
            "Pending: ₹1.82L",
            <span key="tr" className="text-emerald-600 font-medium">↑ 14.2% vs last month</span>,
          ]}
          icon={DollarSign}
        />
      </div>

      {/* Middle Row: Compressed Quick Actions (64px Buttons) & Today's Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Quick Actions (7 cols) */}
        <Card data-testid="quick-actions-widget" className="lg:col-span-7 rounded-[14px] border border-gray-200 bg-white p-4">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" /> Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {QUICK_ACTIONS.map((action, i) => {
              const Icon = action.icon;
              return (
                <button
                  key={i}
                  onClick={() => navigate(action.path)}
                  className="h-[64px] p-2.5 rounded-[12px] border border-gray-200/80 bg-gray-50/50 hover:bg-gray-100/80 hover:border-gray-300 transition-all flex flex-col items-center justify-center gap-1 text-center group"
                >
                  <Icon className="h-[18px] w-[18px] text-gray-700 group-hover:text-blue-600 transition-colors" />
                  <span className="text-[12px] font-medium text-gray-800">{action.title}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Today's Overview (5 cols) */}
        <Card data-testid="todays-overview-widget" className="lg:col-span-5 rounded-[14px] border border-gray-200 bg-white p-4 flex flex-col justify-between">
          <CardHeader className="p-0 pb-2.5 flex flex-row items-center justify-between">
            <CardTitle className="text-[15px] font-semibold text-gray-900">
              Today's Overview
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-6 text-[11px] text-blue-600 hover:bg-blue-50 p-1">View All</Button>
          </CardHeader>
          <CardContent className="p-0 space-y-2">
            <div className="flex items-center justify-between p-2 rounded-[10px] bg-gray-50 border border-gray-100/80">
              <span className="text-[12px] font-medium text-gray-600 flex items-center gap-2">
                <span className="h-6 w-6 rounded-[6px] bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[11px]">👥</span> Visitors Checked In
              </span>
              <span className="text-[14px] font-semibold text-gray-900">25</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-[10px] bg-gray-50 border border-gray-100/80">
              <span className="text-[12px] font-medium text-gray-600 flex items-center gap-2">
                <span className="h-6 w-6 rounded-[6px] bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-[11px]">🎫</span> Helpdesk Tickets
              </span>
              <span className="text-[14px] font-semibold text-gray-900">10</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-[10px] bg-gray-50 border border-gray-100/80">
              <span className="text-[12px] font-medium text-gray-600 flex items-center gap-2">
                <span className="h-6 w-6 rounded-[6px] bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[11px]">💳</span> Payments Received
              </span>
              <span className="text-[14px] font-semibold text-gray-900">₹1.25L</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-[10px] bg-gray-50 border border-gray-100/80">
              <span className="text-[12px] font-medium text-gray-600 flex items-center gap-2">
                <span className="h-6 w-6 rounded-[6px] bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-[11px]">📋</span> Notices Published
              </span>
              <span className="text-[14px] font-semibold text-gray-900">03</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid: Collection Overview, Helpdesk, Visitors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Collection Overview */}
        <Card className="rounded-[14px] border border-gray-200 bg-white p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-[14px] font-semibold text-gray-900">Collection Overview</span>
              <span className="text-[11px] text-gray-400 font-medium">This Month</span>
            </div>
            <div className="my-2.5 flex items-center justify-center">
              <div className="h-20 w-20 rounded-full border-[6px] border-emerald-500 flex flex-col items-center justify-center">
                <span className="text-[16px] font-bold text-gray-900">87%</span>
                <span className="text-[9px] text-gray-400 uppercase font-semibold">Collected</span>
              </div>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Collected</span>
                <span className="font-semibold text-gray-900">₹18.40L</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span> Pending</span>
                <span className="font-semibold text-gray-900">₹1.82L</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-red-500"></span> Overdue</span>
                <span className="font-semibold text-gray-900">₹0.78L</span>
              </div>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-3 h-8 rounded-[8px] text-[11px] font-medium border-gray-200 text-blue-600 hover:bg-blue-50">
            View Details
          </Button>
        </Card>

        {/* Helpdesk Summary */}
        <Card className="rounded-[14px] border border-gray-200 bg-white p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-[14px] font-semibold text-gray-900">Helpdesk Summary</span>
              <span className="text-[11px] text-gray-400 font-medium">This Month</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 my-2.5">
              <div className="p-2.5 rounded-[10px] bg-red-50/70 border border-red-100 text-center">
                <span className="text-[10px] font-medium text-red-600 uppercase">Raised</span>
                <p className="text-[18px] font-bold text-red-600 leading-tight">109</p>
              </div>
              <div className="p-2.5 rounded-[10px] bg-emerald-50/70 border border-emerald-100 text-center">
                <span className="text-[10px] font-medium text-emerald-600 uppercase">Resolved</span>
                <p className="text-[18px] font-bold text-emerald-600 leading-tight">98</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-gray-600 font-medium">
                <span>Open Resolution</span>
                <span>61%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '61%' }}></div>
              </div>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-3 h-8 rounded-[8px] text-[11px] font-medium border-gray-200 text-blue-600 hover:bg-blue-50">
            View All Tickets
          </Button>
        </Card>

        {/* Visitor Summary */}
        <Card className="rounded-[14px] border border-gray-200 bg-white p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-[14px] font-semibold text-gray-900">Visitor Summary</span>
              <span className="text-[11px] text-gray-400 font-medium">Today</span>
            </div>
            <div className="space-y-2 my-2.5 text-[11px]">
              <div className="flex justify-between items-center p-2 rounded-[8px] bg-gray-50">
                <span className="font-medium text-gray-600 flex items-center gap-1.5">👤 Total Visitors</span>
                <span className="font-bold text-gray-900 text-xs">25</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-[8px] bg-gray-50">
                <span className="font-medium text-gray-600 flex items-center gap-1.5">🏢 Inside Premises</span>
                <span className="font-bold text-gray-900 text-xs">09</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-[8px] bg-gray-50">
                <span className="font-medium text-gray-600 flex items-center gap-1.5">🚪 Checked Out</span>
                <span className="font-bold text-gray-900 text-xs">16</span>
              </div>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-3 h-8 rounded-[8px] text-[11px] font-medium border-gray-200 text-blue-600 hover:bg-blue-50">
            View All Visitors
          </Button>
        </Card>
      </div>

      {/* Recent Activities & System Health Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        <Card className="lg:col-span-8 rounded-[14px] border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2.5">
            <span className="text-[14px] font-semibold text-gray-900">Recent Activities</span>
          </div>
          <div className="space-y-2">
            {RECENT_ACTIVITIES.map((act) => {
              const Icon = act.icon;
              return (
                <div key={act.id} className="flex items-center justify-between p-2.5 rounded-[10px] bg-gray-50 border border-gray-100/80 hover:bg-gray-100/60 transition-colors gap-2 min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`h-7 w-7 rounded-[6px] ${act.color} flex items-center justify-center shrink-0`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[12px] font-medium text-gray-800 truncate min-w-0">{act.title}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 shrink-0">
                    <span>{act.time}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="lg:col-span-4 rounded-[14px] border border-gray-200 bg-white p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2">
              <span className="text-[14px] font-semibold text-gray-900">System Health</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 mb-3">
              <CheckCircle2 className="h-3.5 w-3.5" /> All Systems Operational
            </div>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between items-center text-gray-600">
                <span>Database</span>
                <span className="text-emerald-600 font-medium flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Operational</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>API Services</span>
                <span className="text-emerald-600 font-medium flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Operational</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>WebSocket</span>
                <span className="text-emerald-600 font-medium flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Operational</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Notifications</span>
                <span className="text-emerald-600 font-medium flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Operational</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

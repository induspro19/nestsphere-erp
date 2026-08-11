import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { StatCard } from '../../components/shared/StatCard';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { residentApi, ResidentSummary } from '../../api/resident.api';
import {
  User,
  Home,
  CreditCard,
  LifeBuoy,
  Bell,
  CalendarCheck,
  UserCheck,
  ParkingCircle,
  ShieldAlert,
  PhoneCall,
  Plus,
  QrCode,
  FileText,
  Flame,
  Ambulance,
  Shield,
  Wrench,
  Building,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// In-memory cache for smooth SPA navigation without reload loops
let cachedDashboardData: ResidentSummary | null = null;

export const ResidentDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(!cachedDashboardData);
  const [data, setData] = useState<ResidentSummary | null>(cachedDashboardData);
  const navigate = useNavigate();

  useEffect(() => {
    residentApi
      .getResidentDashboard()
      .then((res) => {
        cachedDashboardData = res;
        setData(res);
      })
      .catch(() => toast.error('Failed to load resident dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const handleSos = async (type: string) => {
    try {
      await residentApi.triggerSos(type);
      toast.success(`🚨 EMERGENCY SOS ALERT DISPATCHED FOR ${type.toUpperCase()}! Security alerted.`);
    } catch (err: any) {
      toast.error('Failed to trigger Emergency SOS');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading Resident Portal..." />;
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <ShieldAlert className="h-12 w-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-foreground">Dashboard Unavailable</h2>
        <p className="text-muted-foreground mt-2">We could not load your dashboard data.</p>
        <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 pb-12 animate-in fade-in duration-200">
      {/* Professional Enterprise Resident Dashboard Header (80px–90px Height) */}
      <div className="p-4 md:p-5 rounded-[14px] bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-semibold tracking-tight text-gray-900 leading-tight">
              Resident Dashboard
            </h1>
            <span className="h-[22px] px-2 text-[11px] font-mono font-medium rounded-full bg-blue-100/70 text-blue-700 border border-blue-200 flex items-center shrink-0">
              {data.person.digitalId}
            </span>
          </div>
          <p className="text-[13px] text-gray-600 font-normal flex items-center gap-1.5 leading-tight">
            <Home className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span>Flat {data.unit?.flatNumber || 'A-402'} • {data.unit?.buildingName || 'Tower A'} - {data.unit?.wingName || 'Grand Heights'}</span>
          </p>
        </div>

        {/* Compact Enterprise Buttons (40px Height, 14px Font) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={() => navigate('/resident/visitors')}
            className="h-10 px-4 rounded-[10px] text-[14px] font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-xs"
          >
            <QrCode className="h-[18px] w-[18px]" /> Pre-Approve Visitor
          </Button>
          <Button
            onClick={() => navigate('/resident/complaints')}
            variant="outline"
            className="h-10 px-4 rounded-[10px] text-[14px] font-semibold border-gray-200 hover:bg-gray-100 text-gray-800 gap-2"
          >
            <Plus className="h-[18px] w-[18px]" /> Raise Ticket
          </Button>
        </div>
      </div>

      {/* Emergency SOS Quick Bar */}
      <div className="p-3.5 rounded-[12px] bg-rose-50 border border-rose-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[12px] text-rose-700 flex items-center gap-1.5 uppercase tracking-wider">
            <ShieldAlert className="h-4 w-4" /> Emergency SOS Dispatch
          </h3>
          <span className="text-[11px] text-rose-500 font-medium">1-Tap Immediate Security Alert</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          <Button size="sm" variant="destructive" className="h-8 text-xs gap-1 py-1 rounded-[8px]" onClick={() => handleSos('SECURITY')}>
            <Shield className="h-3.5 w-3.5" /> Security
          </Button>
          <Button size="sm" variant="destructive" className="h-8 text-xs gap-1 py-1 rounded-[8px]" onClick={() => handleSos('MAINTENANCE')}>
            <Wrench className="h-3.5 w-3.5" /> Maintenance
          </Button>
          <Button size="sm" variant="destructive" className="h-8 text-xs gap-1 py-1 rounded-[8px]" onClick={() => handleSos('FIRE')}>
            <Flame className="h-3.5 w-3.5" /> Fire
          </Button>
          <Button size="sm" variant="destructive" className="h-8 text-xs gap-1 py-1 rounded-[8px]" onClick={() => handleSos('AMBULANCE')}>
            <Ambulance className="h-3.5 w-3.5" /> Medical
          </Button>
          <Button size="sm" variant="destructive" className="h-8 text-xs gap-1 py-1 rounded-[8px]" onClick={() => handleSos('POLICE')}>
            <PhoneCall className="h-3.5 w-3.5" /> Police
          </Button>
          <Button size="sm" variant="destructive" className="h-8 text-xs gap-1 py-1 rounded-[8px]" onClick={() => handleSos('OFFICE')}>
            <Building className="h-3.5 w-3.5" /> Office
          </Button>
        </div>
      </div>

      {/* 7 KPI StatCards (Equal 140px Height) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        <StatCard
          title="Outstanding Maintenance"
          value={`₹${data.metrics.outstandingDues.toLocaleString()}`}
          subRows={["Due in 5 Days", <span key="st" className="text-amber-600 font-medium">Pending Invoice</span>]}
          icon={CreditCard}
        />
        <StatCard
          title="Active Complaints"
          value={data.metrics.activeComplaints}
          subRows={["In Progress: 2", <span key="st" className="text-blue-600 font-medium">Assigned to Electrician</span>]}
          icon={LifeBuoy}
        />
        <StatCard
          title="Upcoming Meetings"
          value={data.metrics.upcomingMeetings}
          subRows={["AGM Scheduled", "Aug 12 • 06:00 PM"]}
          icon={CalendarCheck}
        />
        <StatCard
          title="New Notices"
          value={data.metrics.newNotices}
          subRows={["Unread Circulars", <span key="st" className="text-blue-600 font-medium">Water Cut Off Circular</span>]}
          icon={Bell}
        />
        <StatCard
          title="Active Bookings"
          value={data.metrics.activeBookings}
          subRows={["Clubhouse Slot", "Tomorrow 07:00 AM"]}
          icon={CalendarCheck}
        />
        <StatCard
          title="Visitors Today"
          value={data.metrics.todayVisitors}
          subRows={["Pre-Approved: 3", "Checked In: 1"]}
          icon={UserCheck}
        />
        <StatCard
          title="Parking & Vehicles"
          value={`${data.metrics.assignedVehicles} Vehicles`}
          subRows={["Assigned Slot: A-402", "Sticker Verified"]}
          icon={ParkingCircle}
        />
      </div>

      {/* Quick Navigation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <div onClick={() => navigate('/resident/bills')} className="p-4 rounded-[14px] bg-white border border-gray-200 hover:border-blue-500 cursor-pointer transition-all space-y-2 group hover:shadow-xs flex flex-col justify-between h-full">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-sm group-hover:text-blue-600 transition-colors flex items-center gap-2 min-w-0">
              <CreditCard className="h-4 w-4 text-blue-600 shrink-0" /> <span className="truncate">My Maintenance Bills</span>
            </h4>
            <Badge variant="outline" className="whitespace-nowrap inline-flex items-center justify-center text-[13px] sm:text-[14px] font-medium border-gray-200 px-3 py-1 h-8 shrink-0 rounded-full text-gray-700 bg-gray-50/50">Pay Online</Badge>
          </div>
          <p className="text-xs text-gray-500">View invoice PDF receipts, late fees, and payment status timeline.</p>
        </div>

        <div onClick={() => navigate('/resident/complaints')} className="p-4 rounded-[14px] bg-white border border-gray-200 hover:border-blue-500 cursor-pointer transition-all space-y-2 group hover:shadow-xs flex flex-col justify-between h-full">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-sm group-hover:text-blue-600 transition-colors flex items-center gap-2 min-w-0">
              <LifeBuoy className="h-4 w-4 text-blue-600 shrink-0" /> <span className="truncate">My Complaints & Tickets</span>
            </h4>
            <Badge variant="outline" className="whitespace-nowrap inline-flex items-center justify-center text-[13px] sm:text-[14px] font-medium border-gray-200 px-3 py-1 h-8 shrink-0 rounded-full text-gray-700 bg-gray-50/50">Track Progress</Badge>
          </div>
          <p className="text-xs text-gray-500">Raise ticket, upload photo, technician details, service ratings.</p>
        </div>

        <div onClick={() => navigate('/resident/notices')} className="p-4 rounded-[14px] bg-white border border-gray-200 hover:border-blue-500 cursor-pointer transition-all space-y-2 group hover:shadow-xs flex flex-col justify-between h-full">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-sm group-hover:text-blue-600 transition-colors flex items-center gap-2 min-w-0">
              <Bell className="h-4 w-4 text-blue-600 shrink-0" /> <span className="truncate">Society Notices & Circulars</span>
            </h4>
            <Badge variant="outline" className="whitespace-nowrap inline-flex items-center justify-center text-[13px] sm:text-[14px] font-medium border-gray-200 px-3 py-1 h-8 shrink-0 rounded-full text-gray-700 bg-gray-50/50">Read Receipts</Badge>
          </div>
          <p className="text-xs text-gray-500">Emergency alerts, water shut-off circulars, read receipt acknowledgements.</p>
        </div>

        <div onClick={() => navigate('/resident/meetings')} className="p-4 rounded-[14px] bg-white border border-gray-200 hover:border-blue-500 cursor-pointer transition-all space-y-2 group hover:shadow-xs flex flex-col justify-between h-full">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-sm group-hover:text-blue-600 transition-colors flex items-center gap-2 min-w-0">
              <CalendarCheck className="h-4 w-4 text-blue-600 shrink-0" /> <span className="truncate">Meetings & AGM</span>
            </h4>
            <Badge variant="outline" className="whitespace-nowrap inline-flex items-center justify-center text-[13px] sm:text-[14px] font-medium border-gray-200 px-3 py-1 h-8 shrink-0 rounded-full text-gray-700 bg-gray-50/50">Join Online</Badge>
          </div>
          <p className="text-xs text-gray-500">Agendas, online Google Meet link, voting results, MoM downloads.</p>
        </div>

        <div onClick={() => navigate('/resident/visitors')} className="p-4 rounded-[14px] bg-white border border-gray-200 hover:border-blue-500 cursor-pointer transition-all space-y-2 group hover:shadow-xs flex flex-col justify-between h-full">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-sm group-hover:text-blue-600 transition-colors flex items-center gap-2 min-w-0">
              <UserCheck className="h-4 w-4 text-blue-600 shrink-0" /> <span className="truncate">Pre-Approve Visitors</span>
            </h4>
            <Badge variant="outline" className="whitespace-nowrap inline-flex items-center justify-center text-[13px] sm:text-[14px] font-medium border-gray-200 px-3 py-1 h-8 shrink-0 rounded-full text-gray-700 bg-gray-50/50">QR Gate Pass</Badge>
          </div>
          <p className="text-xs text-gray-500">Pre-approve guests, generate QR passes, track delivery entries.</p>
        </div>

        <div onClick={() => navigate('/resident/amenities')} className="p-4 rounded-[14px] bg-white border border-gray-200 hover:border-blue-500 cursor-pointer transition-all space-y-2 group hover:shadow-xs flex flex-col justify-between h-full">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-sm group-hover:text-blue-600 transition-colors flex items-center gap-2 min-w-0">
              <CalendarCheck className="h-4 w-4 text-blue-600 shrink-0" /> <span className="truncate">Book Amenities</span>
            </h4>
            <Badge variant="outline" className="whitespace-nowrap inline-flex items-center justify-center text-[13px] sm:text-[14px] font-medium border-gray-200 px-3 py-1 h-8 shrink-0 rounded-full text-gray-700 bg-gray-50/50">Clubhouse</Badge>
          </div>
          <p className="text-xs text-gray-500">Check slot availability for tennis court, swimming pool, clubhouse hall.</p>
        </div>
      </div>
    </div>
  );
};

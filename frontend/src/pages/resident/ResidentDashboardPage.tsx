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

export const ResidentDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ResidentSummary | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    residentApi
      .getResidentDashboard()
      .then(setData)
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

  if (loading || !data) {
    return <LoadingSpinner message="Loading Resident Portal..." />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Header & Unit Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Badge className="bg-primary/20 text-primary border-primary/30 font-mono text-[10px]">
            {data.person.digitalId}
          </Badge>
          <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">
            Welcome Back, {data.person.firstName}! 👋
          </h1>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Home className="h-3.5 w-3.5 text-primary" /> Flat {data.unit?.flatNumber} • {data.unit?.buildingName} ({data.unit?.wingName})
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={() => navigate('/resident/visitors')} size="sm" className="gap-1.5 text-xs shadow-md">
            <QrCode className="h-4 w-4" /> Pre-Approve Visitor
          </Button>
          <Button onClick={() => navigate('/resident/complaints')} size="sm" variant="outline" className="gap-1.5 text-xs">
            <Plus className="h-4 w-4" /> Raise Ticket
          </Button>
        </div>
      </div>

      {/* Emergency SOS Quick Bar */}
      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-rose-500 flex items-center gap-1.5 uppercase tracking-wider">
            <ShieldAlert className="h-4 w-4" /> Emergency SOS Dispatch
          </h3>
          <span className="text-[10px] text-muted-foreground">1-Tap Immediate Security Alert</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          <Button size="sm" variant="destructive" className="text-xs gap-1 py-1.5" onClick={() => handleSos('SECURITY')}>
            <Shield className="h-3.5 w-3.5" /> Security
          </Button>
          <Button size="sm" variant="destructive" className="text-xs gap-1 py-1.5" onClick={() => handleSos('MAINTENANCE')}>
            <Wrench className="h-3.5 w-3.5" /> Maintenance
          </Button>
          <Button size="sm" variant="destructive" className="text-xs gap-1 py-1.5" onClick={() => handleSos('FIRE')}>
            <Flame className="h-3.5 w-3.5" /> Fire
          </Button>
          <Button size="sm" variant="destructive" className="text-xs gap-1 py-1.5" onClick={() => handleSos('AMBULANCE')}>
            <Ambulance className="h-3.5 w-3.5" /> Medical
          </Button>
          <Button size="sm" variant="destructive" className="text-xs gap-1 py-1.5" onClick={() => handleSos('POLICE')}>
            <PhoneCall className="h-3.5 w-3.5" /> Police
          </Button>
          <Button size="sm" variant="destructive" className="text-xs gap-1 py-1.5" onClick={() => handleSos('OFFICE')}>
            <Building className="h-3.5 w-3.5" /> Office
          </Button>
        </div>
      </div>

      {/* 7 KPI StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard title="Outstanding Maintenance" value={`₹${data.metrics.outstandingDues.toLocaleString()}`} icon={CreditCard} description="Due in 5 Days" />
        <StatCard title="Active Complaints" value={data.metrics.activeComplaints} icon={LifeBuoy} description="In Progress" />
        <StatCard title="Upcoming Meetings" value={data.metrics.upcomingMeetings} icon={CalendarCheck} description="AGM Scheduled" />
        <StatCard title="New Notices" value={data.metrics.newNotices} icon={Bell} description="Unread Circulars" />
        <StatCard title="Active Bookings" value={data.metrics.activeBookings} icon={CalendarCheck} description="Clubhouse Slot" />
        <StatCard title="Visitors Today" value={data.metrics.todayVisitors} icon={UserCheck} description="Pre-Approved" />
        <StatCard title="Parking & Vehicles" value={`${data.metrics.assignedVehicles} Vehicles`} icon={ParkingCircle} description="Slot A-402" />
      </div>

      {/* Quick Navigation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div onClick={() => navigate('/resident/bills')} className="p-4 rounded-xl bg-card border border-border/40 hover:border-primary/50 cursor-pointer transition-all space-y-2 group">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm font-display group-hover:text-primary transition-colors flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" /> My Maintenance Bills
            </h4>
            <Badge variant="outline">Pay Online</Badge>
          </div>
          <p className="text-xs text-muted-foreground">View invoice PDF receipts, late fees, and payment status timeline.</p>
        </div>

        <div onClick={() => navigate('/resident/complaints')} className="p-4 rounded-xl bg-card border border-border/40 hover:border-primary/50 cursor-pointer transition-all space-y-2 group">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm font-display group-hover:text-primary transition-colors flex items-center gap-2">
              <LifeBuoy className="h-4 w-4 text-primary" /> My Complaints & Tickets
            </h4>
            <Badge variant="outline">Track Progress</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Raise ticket, upload photo, technician details, service ratings.</p>
        </div>

        <div onClick={() => navigate('/resident/notices')} className="p-4 rounded-xl bg-card border border-border/40 hover:border-primary/50 cursor-pointer transition-all space-y-2 group">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm font-display group-hover:text-primary transition-colors flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Society Notices & Circulars
            </h4>
            <Badge variant="outline">Read Receipts</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Emergency alerts, water shut-off circulars, read receipt acknowledgements.</p>
        </div>

        <div onClick={() => navigate('/resident/meetings')} className="p-4 rounded-xl bg-card border border-border/40 hover:border-primary/50 cursor-pointer transition-all space-y-2 group">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm font-display group-hover:text-primary transition-colors flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-primary" /> Meetings & AGM
            </h4>
            <Badge variant="outline">Join Online</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Agendas, online Google Meet link, voting results, MoM downloads.</p>
        </div>

        <div onClick={() => navigate('/resident/visitors')} className="p-4 rounded-xl bg-card border border-border/40 hover:border-primary/50 cursor-pointer transition-all space-y-2 group">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm font-display group-hover:text-primary transition-colors flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" /> Pre-Approve Visitors
            </h4>
            <Badge variant="outline">QR Gate Pass</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Pre-approve guests, generate QR passes, track delivery entries.</p>
        </div>

        <div onClick={() => navigate('/resident/amenities')} className="p-4 rounded-xl bg-card border border-border/40 hover:border-primary/50 cursor-pointer transition-all space-y-2 group">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm font-display group-hover:text-primary transition-colors flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-primary" /> Book Amenities
            </h4>
            <Badge variant="outline">Clubhouse</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Check slot availability for tennis court, swimming pool, clubhouse hall.</p>
        </div>
      </div>
    </div>
  );
};

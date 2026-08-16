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
  ChevronRight,
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
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Stitch Greeting Heading */}
      <div className="pt-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[#004D34] tracking-tight flex items-center gap-2">
          Hello, {data.person.firstName || 'Alex'}! <span className="animate-bounce inline-block">👋</span>
        </h1>
      </div>

      {/* Stitch Unit & Flat Information Card */}
      <div 
        onClick={() => navigate('/resident/profile')}
        className="p-3.5 rounded-[16px] bg-white border border-gray-200 shadow-xs flex items-center justify-between gap-3 cursor-pointer hover:border-gray-300 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-[14px] bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base text-gray-900 leading-tight">
              Unit {data.unit?.flatNumber || '4B'}, {data.unit?.wingName || 'The Zenith'}
            </h2>
            <p className="text-xs font-mono font-medium text-gray-500 mt-0.5">
              #{data.person.digitalId || 'NS-8924'}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-bold shrink-0">
          Active
        </span>
      </div>

      {/* Stitch Full-Width Emergency SOS Bar */}
      <div 
        onClick={() => navigate('/resident/sos')}
        className="p-3.5 rounded-[14px] bg-[#C81E1E] hover:bg-[#B91C1C] text-white flex items-center justify-between cursor-pointer transition-colors shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
            <Flame className="h-4 w-4" />
          </div>
          <span className="font-bold text-base tracking-wide">Emergency SOS</span>
        </div>
        <ChevronRight className="h-5 w-5 text-white/90" />
      </div>

      {/* Stitch 3x3 Module Action Cards Grid */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
        {/* 1. Dues Card */}
        <div 
          onClick={() => navigate('/resident/bills')} 
          className="p-3.5 sm:p-4 rounded-[16px] bg-[#E6F8F6] border border-[#B2EBF2] hover:bg-[#D7F5F2] cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1.5 shadow-xs"
        >
          <div className="h-9 w-9 rounded-xl bg-teal-100/80 text-[#007A55] flex items-center justify-center shrink-0">
            <CreditCard className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-gray-700">Dues</span>
          <span className="text-xs sm:text-sm font-extrabold text-[#007A55]">
            ₹{data.metrics.outstandingDues > 0 ? (data.metrics.outstandingDues/1000).toFixed(2) + 'k' : '1.25k'}
          </span>
        </div>

        {/* 2. Helpdesk Card */}
        <div 
          onClick={() => navigate('/resident/complaints')} 
          className="p-3.5 sm:p-4 rounded-[16px] bg-[#FFF8EA] border border-[#FFE0B2] hover:bg-[#FFF2D6] cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1.5 shadow-xs"
        >
          <div className="h-9 w-9 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center shrink-0">
            <LifeBuoy className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-gray-700">Helpdesk</span>
          <span className="text-xs sm:text-sm font-extrabold text-amber-700">
            {data.metrics.activeComplaints || 2} Active
          </span>
        </div>

        {/* 3. Notices Card */}
        <div 
          onClick={() => navigate('/resident/notices')} 
          className="p-3.5 sm:p-4 rounded-[16px] bg-[#E8EEFF] border border-[#C5CAE9] hover:bg-[#DBE4FF] cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1.5 shadow-xs"
        >
          <div className="h-9 w-9 rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center shrink-0">
            <Bell className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-gray-700">Notices</span>
          <span className="text-xs sm:text-sm font-extrabold text-indigo-700">
            {data.metrics.newNotices || 3} New
          </span>
        </div>

        {/* 4. Meetings Card */}
        <div 
          onClick={() => navigate('/resident/meetings')} 
          className="p-3.5 sm:p-4 rounded-[16px] bg-[#F0F4F8] border border-[#D9E2EC] hover:bg-[#E2E8F0] cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1.5 shadow-xs"
        >
          <div className="h-9 w-9 rounded-xl bg-slate-200/80 text-blue-700 flex items-center justify-center shrink-0">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-gray-700">Meetings</span>
          <span className="text-xs sm:text-sm font-extrabold text-blue-700">
            {data.metrics.upcomingMeetings || 1} Soon
          </span>
        </div>

        {/* 5. Amenities Card */}
        <div 
          onClick={() => navigate('/resident/amenities')} 
          className="p-3.5 sm:p-4 rounded-[16px] bg-[#E6F8F6] border border-[#B2EBF2] hover:bg-[#D7F5F2] cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1.5 shadow-xs"
        >
          <div className="h-9 w-9 rounded-xl bg-teal-100/80 text-[#007A55] flex items-center justify-center shrink-0">
            <Wrench className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-gray-700">Amenities</span>
          <span className="text-xs sm:text-sm font-extrabold text-[#007A55]">Book</span>
        </div>

        {/* 6. Community Card */}
        <div 
          onClick={() => navigate('/polls')} 
          className="p-3.5 sm:p-4 rounded-[16px] bg-[#FFF3E0] border border-[#FFE0B2] hover:bg-[#FFE8CC] cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1.5 shadow-xs"
        >
          <div className="h-9 w-9 rounded-xl bg-orange-100/80 text-orange-700 flex items-center justify-center shrink-0">
            <User className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-gray-700">Community</span>
          <span className="text-xs sm:text-sm font-extrabold text-orange-700">5 Posts</span>
        </div>

        {/* 7. Visitors Card */}
        <div 
          onClick={() => navigate('/resident/visitors')} 
          className="p-3.5 sm:p-4 rounded-[16px] bg-[#E8F0FE] border border-[#D2E3FC] hover:bg-[#D7E5FC] cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1.5 shadow-xs"
        >
          <div className="h-9 w-9 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
            <UserCheck className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-gray-700">Visitors</span>
          <span className="text-xs sm:text-sm font-extrabold text-blue-700">Log</span>
        </div>

        {/* 8. Parking Card */}
        <div 
          onClick={() => navigate('/resident/parking')} 
          className="p-3.5 sm:p-4 rounded-[16px] bg-[#F5F5F5] border border-[#E0E0E0] hover:bg-[#EAEAEA] cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1.5 shadow-xs"
        >
          <div className="h-9 w-9 rounded-xl bg-gray-200/80 text-gray-700 flex items-center justify-center shrink-0">
            <ParkingCircle className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-gray-700">Parking</span>
          <span className="text-xs sm:text-sm font-extrabold text-gray-600">Pass</span>
        </div>

        {/* 9. More Card */}
        <div 
          onClick={() => navigate('/resident/documents')} 
          className="p-3.5 sm:p-4 rounded-[16px] bg-[#F5F5F5] border border-[#E0E0E0] hover:bg-[#EAEAEA] cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1.5 shadow-xs"
        >
          <div className="h-9 w-9 rounded-xl bg-gray-200/80 text-gray-700 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-gray-700">More</span>
          <span className="text-xs sm:text-sm font-extrabold text-gray-600">View All</span>
        </div>
      </div>
    </div>
  );
};

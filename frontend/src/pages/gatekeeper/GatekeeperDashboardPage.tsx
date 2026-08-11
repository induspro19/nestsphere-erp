import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { StatCard } from '../../components/shared/StatCard';
import { Badge } from '../../components/ui/badge';
import { QrCode, Shield, Users, Truck, AlertTriangle, Car, FileText, DoorOpen, LogOut, Calendar, Briefcase, Camera, UserPlus, Clock, XCircle, CheckCircle2, ShieldAlert, UserCheck, ShieldCheck } from 'lucide-react';
import { gatekeeperApi, GatekeeperCommandSummary } from '../../api/gatekeeper.api';
import { visitorApi, VisitorPass } from '../../api/visitor.api';
import { useNavigate } from 'react-router-dom';
import { GatekeeperLiveTimeline } from '../../components/gatekeeper/GatekeeperLiveTimeline';
import { toast } from 'sonner';

export const GatekeeperDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<GatekeeperCommandSummary | null>(null);
  const [passes, setPasses] = useState<VisitorPass[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'EXPECTED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'EXPIRED' | 'OVERSTAY'>('EXPECTED');
  
  const navigate = useNavigate();

  useEffect(() => {
    gatekeeperApi.getCommandSummary().then(setSummary);
    fetchVisitorPasses();
    const interval = setInterval(fetchVisitorPasses, 15000); // Live poll
    return () => clearInterval(interval);
  }, []);

  const fetchVisitorPasses = async () => {
    try {
      const res = await visitorApi.getVisitorPasses({ limit: 200 } as any);
      const data = (res as any).data || res;
      if (Array.isArray(data)) {
        setPasses(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (passId: string) => {
    try {
      await visitorApi.checkIn({ passId });
      toast.success('Visitor Checked In Successfully');
      fetchVisitorPasses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async (passId: string) => {
    try {
      await visitorApi.checkOut(passId);
      toast.success('Visitor Checked Out');
      fetchVisitorPasses();
    } catch (err: any) {
      toast.error('Check-out failed');
    }
  };

  // Helper to color-code expiry/status
  const getExpiryColor = (pass: VisitorPass) => {
    if (pass.status === 'EXPIRED') return 'bg-red-100 text-red-800 border-red-200';
    if (!pass.expectedExit) return 'bg-gray-100 text-gray-800 border-gray-200';
    
    const exitTime = new Date(pass.expectedExit).getTime();
    const now = new Date().getTime();
    const diffMins = (exitTime - now) / (1000 * 60);

    if (diffMins < 0) return 'bg-red-100 text-red-800 border-red-200'; // Overstay
    if (diffMins < 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // Expiring soon
    return 'bg-green-100 text-green-800 border-green-200'; // Valid
  };

  const getFilteredPasses = () => {
    const now = new Date().getTime();
    return passes.filter(p => {
      if (activeTab === 'EXPECTED') return p.status === 'PRE_APPROVED';
      if (activeTab === 'CHECKED_IN') return p.status === 'CHECKED_IN';
      if (activeTab === 'CHECKED_OUT') return p.status === 'CHECKED_OUT';
      if (activeTab === 'EXPIRED') return ['EXPIRED', 'CANCELLED', 'REJECTED'].includes(p.status);
      if (activeTab === 'OVERSTAY') {
        if (p.status !== 'CHECKED_IN' || !p.expectedExit) return false;
        return new Date(p.expectedExit).getTime() < now;
      }
      return false;
    });
  };

  const filteredPasses = getFilteredPasses();

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* 1. KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Visitors Inside" value={passes.filter(p => p.status === 'CHECKED_IN').length} trend="Live" icon={Users} description="Inside Premises" />
        <StatCard title="Expected" value={passes.filter(p => p.status === 'PRE_APPROVED').length} trend="Pending" icon={Calendar} description="Scheduled" />
        <StatCard title="Today's Exits" value={passes.filter(p => p.status === 'CHECKED_OUT').length} trend="Completed" icon={LogOut} description="Left Premises" />
        <StatCard title="Overstay Alert" value={passes.filter(p => p.status === 'CHECKED_IN' && p.expectedExit && new Date(p.expectedExit).getTime() < Date.now()).length} trend="Warning" icon={AlertTriangle} description="Check Now" />
        <StatCard title="Blacklist Hits" value={summary?.metrics.blacklistAlerts || 0} trend="Blocked" icon={ShieldAlert} description="Secure" />
        <StatCard title="Deliveries" value={summary?.metrics.deliveryWaiting || 0} trend="At Gate" icon={Truck} description="Waiting" />
      </div>

      {/* 2. Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-[20px] p-4 sm:p-6 shadow-sm">
        <h3 className="font-bold text-base sm:text-lg font-display mb-3 text-gray-900">Security Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
           <Button onClick={() => navigate('/gatekeeper/check-in')} variant="outline" className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 font-semibold text-[11px] sm:text-xs border-blue-200 hover:bg-blue-50 text-blue-800 rounded-xl"><ShieldCheck className="h-5 w-5"/>Verify Token</Button>
           <Button onClick={() => navigate('/gatekeeper/check-in')} variant="outline" className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 font-semibold text-[11px] sm:text-xs rounded-xl"><UserPlus className="h-5 w-5 text-gray-600"/>Manual Entry</Button>
           <Button onClick={() => navigate('/gatekeeper/vehicle-verify')} variant="outline" className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 font-semibold text-[11px] sm:text-xs rounded-xl"><Car className="h-5 w-5 text-gray-600"/>Vehicles</Button>
           <Button onClick={() => navigate('/gatekeeper/blacklist')} variant="outline" className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 font-semibold text-[11px] sm:text-xs border-red-200 hover:bg-red-50 text-red-800 rounded-xl"><ShieldAlert className="h-5 w-5"/>Blacklist</Button>
           <Button variant="destructive" className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 font-bold text-[11px] sm:text-xs col-span-2 sm:col-span-4 lg:col-span-4 rounded-xl"><AlertTriangle className="h-5 w-5"/>Emergency / SOS</Button>
        </div>
      </div>

      {/* 3. Live Visitor Queue Management */}
      <div className="bg-white border border-gray-200 rounded-[20px] p-1 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-[19px]">
          <h3 className="font-bold text-lg font-display text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" /> Visitor Queue Management
          </h3>
          <Button variant="outline" size="sm" onClick={fetchVisitorPasses} className="h-8">Refresh</Button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-3 border-b border-gray-100 overflow-x-auto no-scrollbar">
          {(['EXPECTED', 'CHECKED_IN', 'CHECKED_OUT', 'OVERSTAY', 'EXPIRED'] as const).map((tab) => {
            const count = getFilteredPasses().length;
            return (
              <Button
                key={tab}
                variant={activeTab === tab ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 text-xs font-semibold transition-colors ${
                  activeTab === tab 
                    ? tab === 'OVERSTAY' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.replace('_', ' ')}
              </Button>
            );
          })}
        </div>

        {/* List */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50/30">
          {loading ? (
            <div className="col-span-full py-8 text-center text-gray-500">Loading queue...</div>
          ) : filteredPasses.length === 0 ? (
             <div className="col-span-full py-12 text-center">
               <UserCheck className="h-10 w-10 text-gray-300 mx-auto mb-2" />
               <p className="font-semibold text-gray-900">No visitors in this list</p>
             </div>
          ) : (
            filteredPasses.map(pass => (
              <div key={pass.id} className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900 text-[15px]">{pass.visitorName}</h4>
                    <p className="text-xs text-gray-500 font-medium">{pass.visitorType.replace('_', ' ')} • Flat {pass.hostUnit?.flatNumber || 'N/A'}</p>
                  </div>
                  <Badge className={`text-[10px] ${getExpiryColor(pass)}`} variant="outline">
                    {pass.status === 'PRE_APPROVED' ? 'Valid' : pass.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 text-[11px] flex flex-col gap-1 text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    <span>Expected: {new Date(pass.expectedArrival!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(pass.expectedExit!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  {pass.vehicleNumber && (
                    <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
                      <Car className="h-3 w-3" />
                      <span>{pass.vehicleNumber}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100 mt-1 flex gap-2">
                  {pass.status === 'PRE_APPROVED' && (
                    <>
                      <Button onClick={() => handleCheckIn(pass.id)} size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-[10px]">
                        <CheckCircle2 className="h-4 w-4 mr-1.5" /> Check In
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 text-red-600 border-red-200 hover:bg-red-50 rounded-[10px]">
                        Deny
                      </Button>
                    </>
                  )}
                  {pass.status === 'CHECKED_IN' && (
                    <Button onClick={() => handleCheckOut(pass.id)} size="sm" variant="outline" className="w-full text-gray-700 rounded-[10px]">
                      <LogOut className="h-4 w-4 mr-1.5" /> Check Out
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

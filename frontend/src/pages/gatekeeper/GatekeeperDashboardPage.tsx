import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { StatCard } from '../../components/shared/StatCard';
import { DataTable } from '../../components/shared/DataTable';
import { QrCode, Shield, Users, Truck, AlertTriangle, Car, FileText, UserCheck, ShieldAlert, DoorOpen, LogOut, Calendar, Briefcase, Camera, UserPlus } from 'lucide-react';
import { gatekeeperApi, GatekeeperCommandSummary } from '../../api/gatekeeper.api';
import { useNavigate } from 'react-router-dom';
import { GatekeeperLiveTimeline } from '../../components/gatekeeper/GatekeeperLiveTimeline';

export const GatekeeperDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<GatekeeperCommandSummary | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    gatekeeperApi.getCommandSummary().then(setSummary);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. KPI Cards (10) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Visitors Inside" value={summary?.metrics.visitorsInside || 12} trend="+12 Today" icon={Users} description="Live" />
        <StatCard title="Today's Entries" value={summary?.metrics.todayEntries || 48} trend="+15%" icon={DoorOpen} description="Total" />
        <StatCard title="Today's Exits" value={summary?.metrics.todayExits || 36} trend="+5%" icon={LogOut} description="Total" />
        <StatCard title="Expected Visitors" value={summary?.metrics.expectedVisitors || 6} trend="Scheduled" icon={Calendar} description="Pending" />
        <StatCard title="Deliveries Pending" value={summary?.metrics.deliveryWaiting || 3} trend="At Gate" icon={Truck} description="Action Req." />
        <StatCard title="Staff Inside" value={summary?.metrics.staffInside || 8} trend="+2 Today" icon={Briefcase} description="Working" />
        <StatCard title="Vehicles Entered" value={25} trend="Verified" icon={Car} description="Today" />
        <StatCard title="Blacklist Alerts" value={summary?.metrics.blacklistAlerts || 0} trend="No Hits" icon={ShieldAlert} description="Secure" />
        <StatCard title="Overstay Alerts" value={1} trend="Warning" icon={AlertTriangle} description="Check" />
        <StatCard title="Emergency Events" value={summary?.metrics.emergencyAlerts || 0} trend="All Clear" icon={Shield} description="Safe" />
      </div>

      {/* 2. Quick Actions */}
      <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-lg font-display mb-4 text-foreground">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
           <Button onClick={() => navigate('/gatekeeper/check-in')} variant="outline" className="h-20 flex-col gap-2 font-semibold text-xs"><QrCode className="h-5 w-5 text-primary"/>Scan QR</Button>
           <Button onClick={() => navigate('/gatekeeper/check-in')} variant="outline" className="h-20 flex-col gap-2 font-semibold text-xs"><UserPlus className="h-5 w-5 text-primary"/>Manual Entry</Button>
           <Button onClick={() => navigate('/gatekeeper/check-out')} variant="outline" className="h-20 flex-col gap-2 font-semibold text-xs"><LogOut className="h-5 w-5 text-primary"/>Check-Out</Button>
           <Button onClick={() => navigate('/gatekeeper/deliveries')} variant="outline" className="h-20 flex-col gap-2 font-semibold text-xs"><Truck className="h-5 w-5 text-primary"/>Delivery</Button>
           <Button onClick={() => navigate('/gatekeeper/vehicle-verify')} variant="outline" className="h-20 flex-col gap-2 font-semibold text-xs"><Car className="h-5 w-5 text-primary"/>Vehicles</Button>
           <Button onClick={() => navigate('/gatekeeper/blacklist')} variant="outline" className="h-20 flex-col gap-2 font-semibold text-xs"><ShieldAlert className="h-5 w-5 text-primary"/>Blacklist</Button>
           <Button onClick={() => navigate('/gatekeeper/reports')} variant="outline" className="h-20 flex-col gap-2 font-semibold text-xs"><FileText className="h-5 w-5 text-primary"/>Reports</Button>
           <Button variant="destructive" className="h-20 flex-col gap-2 font-bold text-xs"><AlertTriangle className="h-5 w-5"/>Emergency</Button>
        </div>
      </div>

      {/* Camera Placeholders (Preserving feature parity) */}
      <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm">
         <h3 className="font-bold text-lg font-display mb-4 text-foreground flex items-center gap-2"><Camera className="h-5 w-5 text-primary"/> Security Cameras</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-accent/30 border border-border/50 rounded-xl overflow-hidden relative aspect-video flex items-center justify-center">
              <span className="text-muted-foreground font-mono text-xs font-bold">CCTV MAIN FEED</span>
            </div>
            <div className="bg-accent/30 border border-border/50 rounded-xl overflow-hidden relative aspect-video flex items-center justify-center">
              <span className="text-muted-foreground font-mono text-xs font-bold">ANPR CAM (Number Plate)</span>
            </div>
            <div className="bg-accent/30 border border-border/50 rounded-xl overflow-hidden relative aspect-video flex items-center justify-center">
              <span className="text-muted-foreground font-mono text-xs font-bold">FACE AI CAM</span>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Today's Visitors DataTable */}
        <div className="space-y-3 bg-card border border-border/40 p-5 rounded-2xl shadow-sm">
          <h3 className="font-bold text-base font-display text-foreground flex items-center justify-between">Today's Visitors <Button variant="ghost" size="sm" className="h-6 text-xs text-primary">View All</Button></h3>
          <DataTable 
            columns={[{header: 'Visitor', accessorKey: 'name'}, {header: 'Host', accessorKey: 'host'}, {header: 'Status', accessorKey: 'status'}]}
            data={[{id: '1', name: 'Rahul Sharma', host: 'A-402', status: <span className="text-green-600 font-medium">Inside</span>}]}
          />
        </div>

        {/* 4. Visitors Waiting DataTable */}
        <div className="space-y-3 bg-card border border-border/40 p-5 rounded-2xl shadow-sm">
          <h3 className="font-bold text-base font-display text-foreground flex items-center justify-between">Visitors Waiting <Button variant="ghost" size="sm" className="h-6 text-xs text-primary">View All</Button></h3>
          <DataTable 
            columns={[{header: 'Visitor', accessorKey: 'name'}, {header: 'Host', accessorKey: 'host'}, {header: 'Wait Time', accessorKey: 'time'}]}
            data={[{id: '2', name: 'Amazon Delivery', host: 'B-105', time: <span className="text-amber-600 font-medium">4 mins</span>}]}
          />
        </div>

        {/* 5. Expected Visitors DataTable */}
        <div className="space-y-3 bg-card border border-border/40 p-5 rounded-2xl shadow-sm">
          <h3 className="font-bold text-base font-display text-foreground flex items-center justify-between">Expected Visitors <Button variant="ghost" size="sm" className="h-6 text-xs text-primary">View All</Button></h3>
          <DataTable 
            columns={[{header: 'Visitor', accessorKey: 'name'}, {header: 'Host', accessorKey: 'host'}, {header: 'Expected', accessorKey: 'time'}]}
            data={[]}
            emptyMessage="No visitors expected"
          />
        </div>

        {/* 6. Vehicle Entries DataTable */}
        <div className="space-y-3 bg-card border border-border/40 p-5 rounded-2xl shadow-sm">
          <h3 className="font-bold text-base font-display text-foreground flex items-center justify-between">Recent Vehicles <Button variant="ghost" size="sm" className="h-6 text-xs text-primary">View All</Button></h3>
          <DataTable 
            columns={[{header: 'Plate Number', accessorKey: 'plate'}, {header: 'Type', accessorKey: 'type'}, {header: 'Time', accessorKey: 'time'}]}
            data={[{id: '1', plate: 'MH-12-AB-1234', type: 'Resident', time: '10:45 AM'}]}
          />
        </div>
      </div>

      {/* 7. Security Timeline */}
      <div className="space-y-3 bg-card border border-border/40 p-5 rounded-2xl shadow-sm">
        <h3 className="font-bold text-lg font-display text-foreground">Live Security Activity</h3>
        <GatekeeperLiveTimeline />
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { Button } from '../../ui/button';
import { OfflineBanner } from '../../pwa/OfflineBanner';
import { PwaUpdatePrompt } from '../../pwa/PwaUpdatePrompt';
import { PwaInstallPrompt } from '../../pwa/PwaInstallPrompt';
import { UniversalQrScannerModal } from '../../gatekeeper/UniversalQrScannerModal';
import { GatekeeperShiftModal } from '../../gatekeeper/GatekeeperShiftModal';
import {
  Shield,
  QrCode,
  UserPlus,
  LogOut,
  Truck,
  Users,
  ShieldAlert,
  Car,
  FileText,
  Clock,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';

export const GatekeeperKioskLayout: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();
  const [showQrModal, setShowQrModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [selectedGate, setSelectedGate] = useState('Gate 1 - Main Entrance');

  const gates = [
    'Gate 1 - Main Entrance',
    'Gate 2 - Service Gate',
    'Basement Parking Entry',
    'Club House Gate',
    'Emergency Gate North',
  ];

  const handlePanic = async () => {
    toast.error('🚨 GATE PANIC ALARM ACTIVATED! Security Central, Police & Society Office notified!');
  };

  const navItems = [
    { title: 'Gate Dashboard', path: '/gatekeeper/dashboard', icon: Shield },
    { title: 'Check-In Visitor', path: '/gatekeeper/check-in', icon: UserPlus },
    { title: 'Check-Out Visitor', path: '/gatekeeper/check-out', icon: LogOut },
    { title: 'Delivery Entry', path: '/gatekeeper/deliveries', icon: Truck },
    { title: 'Staff Attendance', path: '/gatekeeper/staff-attendance', icon: Users },
    { title: 'Vehicle Verify', path: '/gatekeeper/vehicle-verify', icon: Car },
    { title: 'Blacklist Watch', path: '/gatekeeper/blacklist', icon: ShieldAlert },
    { title: 'Gate Reports', path: '/gatekeeper/reports', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased">
      <OfflineBanner />
      <PwaUpdatePrompt />
      <PwaInstallPrompt />

      {/* Emergency Dashboard Top Banner */}
      <div className="bg-card border-b border-border/40 px-4 py-2 flex items-center justify-between overflow-x-auto scrollbar-none shadow-sm z-50 relative">
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
          <span className="text-muted-foreground">Emergency Status:</span>
          <div className="flex items-center gap-1 text-destructive font-bold"><ShieldAlert className="h-3 w-3" /> Panic Alerts (0)</div>
          <div className="flex items-center gap-1 text-destructive font-bold"><ShieldAlert className="h-3 w-3" /> Fire Alarm (0)</div>
          <div className="flex items-center gap-1 text-destructive font-bold"><ShieldAlert className="h-3 w-3" /> Medical (0)</div>
          <div className="flex items-center gap-1 text-destructive font-bold"><ShieldAlert className="h-3 w-3" /> Lift Rescue (0)</div>
          <div className="flex items-center gap-1 text-destructive font-bold"><ShieldAlert className="h-3 w-3" /> Security (0)</div>
          <div className="flex items-center gap-1 text-destructive font-bold"><ShieldAlert className="h-3 w-3" /> Power (0)</div>
        </div>
      </div>

      {/* Standard Enterprise App Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border/40 px-4 md:px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20 shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm font-display text-foreground">{user?.societyName || 'Grand Heights Society'}</span>
              <select
                value={selectedGate}
                onChange={(e) => setSelectedGate(e.target.value)}
                className="bg-secondary text-secondary-foreground border border-border text-[10px] uppercase font-mono font-bold rounded-md px-2 py-0.5 focus:ring-0 focus:outline-none cursor-pointer"
              >
                {gates.map((g) => (
                  <option key={g} value={g} className="bg-card text-foreground font-sans text-xs">
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">On Duty: {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Security Guard'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowShiftModal(true)}
            className="h-10 gap-1.5 min-h-[44px] font-semibold text-xs"
          >
            <Clock className="h-4 w-4" />
            <span className="hidden lg:inline">Shift Log</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setShowQrModal(true)}
            className="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5 shadow-md min-h-[44px]"
            aria-label="Universal QR Scanner"
          >
            <QrCode className="h-4 w-4" />
            <span className="hidden sm:inline">Scan QR</span>
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={handlePanic}
            className="h-10 px-4 font-bold text-xs gap-1.5 shadow-md animate-pulse min-h-[44px]"
            aria-label="Gate Panic Alarm"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Panic Alarm</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              clearAuth();
              navigate('/login');
            }}
            className="h-10 min-h-[44px] min-w-[44px]"
            aria-label="Logout Guard Shift"
          >
            <LogOut className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>
      </header>

      {/* Kiosk Sub-Navigation Tabs */}
      <div className="bg-card/80 backdrop-blur-md border-b border-border/40 px-4 overflow-x-auto scrollbar-none flex items-center gap-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs shrink-0 min-h-[44px] transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary/50 text-secondary-foreground hover:bg-secondary hover:text-foreground'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Main Kiosk Content Area */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6 pb-12">
        <Outlet />
      </main>

      <UniversalQrScannerModal isOpen={showQrModal} onClose={() => setShowQrModal(false)} />
      
      <GatekeeperShiftModal
        isOpen={showShiftModal}
        onClose={() => setShowShiftModal(false)}
        activeGate={selectedGate}
        currentGuard={user?.firstName ? `${user.firstName} ${user.lastName}` : 'Security Guard'}
      />
    </div>
  );
};

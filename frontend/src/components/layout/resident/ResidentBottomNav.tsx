import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  MessageSquare,
  CreditCard,
  LifeBuoy,
  Bell,
  Grid,
  X,
  User,
  CalendarCheck,
  UserCheck,
  ParkingCircle,
  FileText,
  ShieldAlert,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { toast } from 'sonner';

export const ResidentBottomNav: React.FC = () => {
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  const primaryItems = [
    { title: 'Home', path: '/resident/dashboard', icon: Home },
    { title: 'Services', path: '/resident/amenities', icon: Grid },
    { title: 'Chat', path: '/resident/notices', icon: MessageSquare },
    { title: 'Profile', path: '/resident/profile', icon: User },
  ];

  const moreItems = [
    { title: 'My Profile & Unit', path: '/resident/profile', icon: User, desc: 'Digital ID & emergency contacts' },
    { title: 'Meetings & AGM', path: '/resident/meetings', icon: CalendarCheck, desc: 'Agendas, minutes & Google Meet link' },
    { title: 'Pre-Approve Visitors', path: '/resident/visitors', icon: UserCheck, desc: 'Generate QR entry pass' },
    { title: 'Book Amenities', path: '/resident/amenities', icon: CalendarCheck, desc: 'Clubhouse, tennis court, pool' },
    { title: 'Parking & Vehicles', path: '/resident/parking', icon: ParkingCircle, desc: 'Allocated slot & PUC alerts' },
    { title: 'Documents Vault', path: '/resident/documents', icon: FileText, desc: 'Share certificate & receipts' },
    { title: 'Emergency SOS', path: '/resident/sos', icon: ShieldAlert, desc: '1-Tap Security alert' },
    { title: 'Settings', path: '/settings', icon: Settings, desc: 'App preferences' },
  ];

  const handleLogout = () => {
    clearAuth();
    toast.success('Logged out safely');
    navigate('/login');
  };

  const handleNavMoreItem = (path: string) => {
    setShowBottomSheet(false);
    navigate(path);
  };

  return (
    <>
      {/* Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden pb-[env(safe-area-inset-bottom)] shadow-lg">
        <div className="flex items-center justify-around h-16 px-2">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-full h-full min-h-[44px] text-[11px] font-medium transition-colors relative ${
                    isActive ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="h-5 w-5 mb-0.5 shrink-0" />
                    <span>{item.title}</span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 bg-blue-600 rounded-full mt-0.5" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Native Mobile Bottom Sheet Overlay */}
      {showBottomSheet && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center md:hidden animate-in fade-in duration-200">
          <div className="bg-card border-t border-border/60 rounded-t-3xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Sheet Grab Handle & Header */}
            <div className="flex items-center justify-between pb-2 border-b border-border/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-2" />
                <h3 className="font-bold text-base font-display text-foreground">Resident Portal Options</h3>
              </div>
              <button
                onClick={() => setShowBottomSheet(false)}
                className="h-8 w-8 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-accent text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Grid List of Options */}
            <div className="space-y-1">
              {moreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.path}
                    onClick={() => handleNavMoreItem(item.path)}
                    className="p-3.5 rounded-xl flex items-center justify-between hover:bg-accent/40 cursor-pointer min-h-[44px] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs font-display text-foreground">{item.title}</h4>
                        <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                );
              })}

              {/* Logout Option */}
              <div
                onClick={handleLogout}
                className="p-3.5 rounded-xl flex items-center justify-between bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 cursor-pointer min-h-[44px] transition-colors mt-2"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-rose-500/20 flex items-center justify-center shrink-0">
                    <LogOut className="h-4 w-4 text-rose-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs font-display">Sign Out</h4>
                    <p className="text-[10px] opacity-80">Log out of resident session</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 opacity-70" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

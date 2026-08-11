import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { ResidentBottomNav } from './ResidentBottomNav';
import { OfflineBanner } from '../../pwa/OfflineBanner';
import { PwaInstallPrompt } from '../../pwa/PwaInstallPrompt';
import { PwaUpdatePrompt } from '../../pwa/PwaUpdatePrompt';
import { useAuthStore } from '../../../store/authStore';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { AnimatedPageWrapper } from '../../shared/AnimatedPageWrapper';
import {
  Bell,
  Home,
  Search,
  ShieldAlert,
  User,
  CreditCard,
  LifeBuoy,
  CalendarCheck,
  UserCheck,
  ParkingCircle,
  FileText,
  PieChart,
  X,
  ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';

export const ResidentPortalLayout: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadNotifications] = useState(3);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Security Check: Redirect unauthenticated requests to login
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Session expired. Please log in.');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const desktopNavItems = [
    { title: 'Dashboard', path: '/resident/dashboard', icon: Home },
    { title: 'My Bills', path: '/resident/bills', icon: CreditCard },
    { title: 'Complaints', path: '/resident/complaints', icon: LifeBuoy },
    { title: 'Notices', path: '/resident/notices', icon: Bell },
    { title: 'Meetings', path: '/resident/meetings', icon: CalendarCheck },
    { title: 'Visitors', path: '/resident/visitors', icon: UserCheck },
    { title: 'Amenities', path: '/resident/amenities', icon: CalendarCheck },
    { title: 'Parking', path: '/resident/parking', icon: ParkingCircle },
    { title: 'Documents', path: '/resident/documents', icon: FileText },
    { title: 'Reports', path: '/resident/reports', icon: PieChart },
    { title: 'My Profile', path: '/resident/profile', icon: User },
    { title: 'Emergency SOS', path: '/resident/sos', icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-foreground flex flex-col antialiased">
      <OfflineBanner />
      <PwaUpdatePrompt />
      <PwaInstallPrompt />

      <div className="flex-1 flex">
        {/* Responsive Desktop/Tablet Sidebar Layout (280px vs 72px) */}
        <aside
          aria-label="Resident Portal navigation"
          aria-expanded={!isSidebarCollapsed}
          className={`hidden md:flex fixed top-0 left-0 z-40 h-screen transition-all duration-250 ease-in-out border-r border-gray-200 bg-white flex-col shadow-[0_6px_20px_rgba(0,0,0,0.05)] ${
            isSidebarCollapsed ? 'w-[72px]' : 'w-[280px]'
          }`}
        >
          {/* Header */}
          <div className="h-[60px] flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="h-8 w-8 rounded-[8px] bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0 shadow-xs">
                  NS
                </div>
                <span className="font-bold text-[15px] text-gray-900 truncate tracking-tight">Resident Portal</span>
              </div>
            )}
            {isSidebarCollapsed && (
              <div className="h-8 w-8 rounded-[8px] bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0 mx-auto">
                NS
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              aria-label="Toggle Sidebar"
              className="h-8 w-8 rounded-[8px] hover:bg-gray-100 text-gray-500"
            >
              <ChevronLeft className={`h-4 w-4 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 py-3 px-2 space-y-1.5 overflow-y-auto no-scrollbar overflow-x-hidden">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => {
                    if (isSidebarCollapsed) {
                      return `group relative flex items-center justify-center h-11 w-11 mx-auto rounded-[12px] transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm font-medium'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`;
                    }
                    return `flex items-center gap-3.5 px-3.5 h-[46px] rounded-[14px] font-medium text-[15px] transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm font-medium'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`;
                  }}
                  title={isSidebarCollapsed ? item.title : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate text-[14px]">{item.title}</span>}

                  {isSidebarCollapsed && (
                    <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-[8px] bg-gray-900 text-white text-[12px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
                      {item.title}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </aside>

        {/* Main Content Body */}
        <div className={`flex-1 flex flex-col min-h-screen transition-all duration-250 ease-in-out ${isSidebarCollapsed ? 'md:pl-[72px]' : 'md:pl-[280px]'}`}>
          {/* Mobile-App Style Resident Header (Height: 56px max on mobile, 60px on desktop) */}
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 px-3 sm:px-4 h-[56px] md:h-[60px] flex items-center justify-between shadow-xs shrink-0">
            {/* Left: App Logo & Title */}
            <div className="flex items-center gap-2 md:w-auto w-[60px] shrink-0">
              {window.location.pathname !== '/resident/dashboard' && (
                <Button
                  data-testid="resident-back-button"
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="h-8 w-8 p-0 rounded-[8px] text-gray-700 hover:bg-gray-100 border-gray-200 md:hidden flex items-center justify-center shrink-0"
                  title="Go Back"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-500" />
                </Button>
              )}
              
              <div className="flex items-center gap-2 md:hidden">
                <div className="h-8 w-8 rounded-[8px] bg-blue-600 text-white font-bold flex items-center justify-center text-[12px] shadow-xs shrink-0">
                  NS
                </div>
              </div>
            </div>

            {/* Center: Expandable Global Search */}
            <div className="flex-1 max-w-[500px] px-2 sm:px-4 mx-auto w-full">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSearchModal(true)}
                className="w-full h-9 rounded-[10px] justify-start gap-2 text-[13px] text-gray-500 bg-gray-50 hover:bg-gray-100 border-gray-200/80 shadow-none transition-colors"
                aria-label="Search ERP"
              >
                <Search className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="font-normal truncate">Search...</span>
              </Button>
            </div>

            {/* Right: Notifications, SOS & Profile */}
            <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 md:w-auto w-[120px] shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('/resident/notices')}
                className="h-9 w-9 p-0 rounded-full relative text-gray-600 hover:bg-gray-100 border border-transparent"
                aria-label="Notifications"
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-blue-600 rounded-full ring-2 ring-white" />
                )}
              </Button>

              <Button
                size="sm"
                variant="destructive"
                onClick={() => navigate('/resident/sos')}
                className="h-8 px-2.5 sm:px-3.5 rounded-full gap-1.5 text-[12px] sm:text-[13px] font-bold shadow-xs bg-red-600 hover:bg-red-700"
                aria-label="Emergency SOS"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">SOS</span>
              </Button>

              <div
                onClick={() => navigate('/resident/profile')}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center border border-gray-200 shadow-xs cursor-pointer ml-0.5 shrink-0"
                role="button"
                aria-label="View Resident Profile"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <span>{user?.firstName?.[0] || 'R'}{user?.lastName?.[0] || 'V'}</span>
                )}
              </div>
            </div>
          </header>

          {/* Main View Outlet (Animated 180ms GPU-accelerated page transitions) */}
          <main className="flex-1 p-2 md:p-4 max-w-[1600px] w-full mx-auto pb-24 md:pb-8 pt-2 md:pt-3">
            <AnimatedPageWrapper key={location.pathname}>
              <Outlet />
            </AnimatedPageWrapper>
          </main>
        </div>
      </div>

      {/* Mobile App Bottom Bar */}
      <ResidentBottomNav />

      {/* Universal Search Dialog Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
          <div className="bg-white border border-gray-200 rounded-[18px] w-full max-w-md p-5 space-y-3 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-500">Universal Resident Search</h3>
              <Button size="sm" variant="ghost" onClick={() => setShowSearchModal(false)} className="h-6 w-6 p-0 rounded-[6px]">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Input
              placeholder="Search bills, notices, meetings, documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs min-h-[40px]"
              autoFocus
            />
            <div className="space-y-1 text-xs text-gray-500 pt-2">
              <p className="text-[10px] uppercase tracking-wider font-semibold">Quick Categories:</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Badge onClick={() => navigate('/resident/bills')} className="cursor-pointer">Bills</Badge>
                <Badge onClick={() => navigate('/resident/notices')} className="cursor-pointer">Notices</Badge>
                <Badge onClick={() => navigate('/resident/meetings')} className="cursor-pointer">Meetings</Badge>
                <Badge onClick={() => navigate('/resident/documents')} className="cursor-pointer">Documents</Badge>
                <Badge onClick={() => navigate('/resident/complaints')} className="cursor-pointer">Complaints</Badge>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

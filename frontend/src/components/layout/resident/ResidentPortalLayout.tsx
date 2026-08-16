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
        <div className={`flex-1 flex flex-col min-h-screen min-w-0 w-full max-w-full overflow-x-hidden transition-all duration-250 ease-in-out ${isSidebarCollapsed ? 'md:pl-[72px]' : 'md:pl-[280px]'}`}>
          {/* Stitch Emerald Style Resident Header */}
          <header className="sticky top-0 z-30 bg-[#007A55] text-white border-b border-[#006847] px-4 pt-[calc(0.5rem+env(safe-area-inset-top,0px))] pb-2 min-h-[60px] md:h-[64px] flex items-center justify-between shadow-md shrink-0 gap-2 w-full transition-all">
            {/* Left: Resident Avatar & NestSphere Title */}
            <div className="flex items-center gap-2.5 shrink-0">
              {location.pathname !== '/resident/dashboard' && (
                <Button
                  data-testid="resident-back-button"
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="h-9 w-9 min-h-[44px] min-w-[44px] p-0 rounded-full text-white hover:bg-white/10 md:hidden flex items-center justify-center shrink-0"
                  title="Go Back"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </Button>
              )}
              
              <div
                onClick={() => navigate('/resident/profile')}
                className="h-10 w-10 rounded-full bg-white/20 text-white font-bold text-xs flex items-center justify-center border-2 border-white/80 shadow-sm cursor-pointer shrink-0 overflow-hidden"
                role="button"
                aria-label="View Resident Profile"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" alt="Avatar" className="h-full w-full rounded-full object-cover" />
                )}
              </div>
              <span className="font-bold text-lg text-white tracking-tight font-display">NestSphere</span>
            </div>

            {/* Right: Search Icon, Notifications Bell */}
            <div className="flex items-center justify-end gap-1 sm:gap-2 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSearchModal(true)}
                className="h-10 w-10 min-h-[44px] min-w-[44px] p-0 rounded-full text-white hover:bg-white/10 flex items-center justify-center shrink-0"
                aria-label="Search"
              >
                <Search className="h-5 w-5 text-white" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('/resident/notices')}
                className="h-10 w-10 min-h-[44px] min-w-[44px] p-0 rounded-full relative text-white hover:bg-white/10 border border-transparent flex items-center justify-center shrink-0"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-white" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-emerald-300 rounded-full ring-2 ring-[#007A55]" />
                )}
              </Button>
            </div>
          </header>

          {/* Main View Outlet */}
          <main className="flex-1 p-3 sm:p-4 md:p-5 max-w-[1600px] w-full min-w-0 mx-auto pb-36 md:pb-10 pt-2 md:pt-3 overflow-x-hidden">
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

import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { ResidentBottomNav } from './ResidentBottomNav';
import { OfflineBanner } from '../../pwa/OfflineBanner';
import { PwaInstallPrompt } from '../../pwa/PwaInstallPrompt';
import { PwaUpdatePrompt } from '../../pwa/PwaUpdatePrompt';
import { useAuthStore } from '../../../store/authStore';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
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
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
      <OfflineBanner />
      <PwaUpdatePrompt />
      <PwaInstallPrompt />

      <div className="flex-1 flex">
        {/* Responsive Desktop/Tablet Sidebar Layout */}
        <aside
          className={`hidden md:flex fixed top-0 left-0 z-40 h-screen transition-all duration-300 border-r border-border/40 bg-card/90 backdrop-blur-xl flex-col ${
            isSidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-border/40">
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/20 text-primary font-bold flex items-center justify-center text-sm">
                  NS
                </div>
                <span className="font-bold font-display text-sm truncate">Resident Portal</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="h-8 w-8 rounded-lg"
              aria-label="Toggle Sidebar"
            >
              <ChevronLeft className={`h-4 w-4 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all min-h-[44px] ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                    } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`
                  }
                  title={isSidebarCollapsed ? item.title : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate">{item.title}</span>}
                </NavLink>
              );
            })}
          </div>
        </aside>

        {/* Main Content Body */}
        <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
          {/* Sticky Header */}
          <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-xl border-b border-border/40 px-4 md:px-6 h-16 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div
                onClick={() => navigate('/resident/profile')}
                className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/30 cursor-pointer min-h-[44px] min-w-[44px]"
                role="button"
                aria-label="View Resident Profile"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <span>{user?.firstName?.[0] || 'R'}{user?.lastName?.[0] || ''}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs font-display text-foreground">
                    {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Resident User'}
                  </span>
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] px-1.5 py-0 font-mono">
                    {user?.societyName || 'Grand Heights'}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {user?.email || 'resident@society.com'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSearchModal(true)}
                className="h-9 w-9 md:w-auto md:px-3 p-0 rounded-xl gap-2 text-xs text-muted-foreground min-h-[44px]"
                aria-label="Universal Search"
              >
                <Search className="h-4 w-4" />
                <span className="hidden md:inline">Search...</span>
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('/resident/notices')}
                className="h-9 w-9 p-0 rounded-full relative min-h-[44px] min-w-[44px]"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </Button>

              <Button
                size="sm"
                variant="destructive"
                onClick={() => navigate('/resident/sos')}
                className="h-9 px-2.5 rounded-xl gap-1 text-xs shadow-sm font-semibold min-h-[44px]"
                aria-label="Emergency SOS"
              >
                <ShieldAlert className="h-4 w-4" />
                <span className="hidden sm:inline">SOS</span>
              </Button>
            </div>
          </header>

          {/* Main View Outlet */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-5xl w-full mx-auto pb-24 md:pb-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile App Bottom Bar */}
      <ResidentBottomNav />

      {/* Universal Search Dialog Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
          <div className="bg-card border border-border/60 rounded-2xl w-full max-w-md p-4 space-y-3 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Universal Resident Search</h3>
              <Button size="sm" variant="ghost" onClick={() => setShowSearchModal(false)} className="h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Input
              placeholder="Search bills, notices, meetings, documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs"
              autoFocus
            />
            <div className="space-y-1 text-xs text-muted-foreground pt-2">
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

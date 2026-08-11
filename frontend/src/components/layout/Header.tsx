import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { QuickSearch } from './QuickSearch';
import { NotificationPanel } from './NotificationPanel';
import { UserProfileMenu } from './UserProfileMenu';
import { ThemeSwitcher } from './ThemeSwitcher';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isMainDashboard = location.pathname === '/dashboard' || location.pathname === '/admin/dashboard' || location.pathname === '/super-admin' || location.pathname === '/login' || location.pathname === '/';

  return (
    <header data-testid="header" className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md px-3 sm:px-5 pt-[env(safe-area-inset-top,0px)] pb-1 sm:pb-0 min-h-[56px] sm:h-16 flex items-center justify-between gap-2 sm:gap-4 shrink-0 transition-all">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 max-w-xl">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="lg:hidden rounded-[10px] h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 hover:bg-gray-100" aria-label="Open Navigation Menu">
          <Menu className="h-5 w-5 text-gray-700" />
        </Button>
        {!isMainDashboard && (
          <Button
            data-testid="universal-back-button"
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-10 px-2.5 sm:px-3 rounded-[10px] gap-1 text-xs font-medium text-gray-700 hover:bg-gray-100 border-gray-200 shrink-0 min-h-[44px] sm:min-h-[36px]"
            title="Go Back"
          >
            <ArrowLeft className="h-4 w-4 text-gray-500 shrink-0" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        )}
        <div className="flex-1 min-w-0 max-w-[180px] sm:max-w-md">
          <QuickSearch />
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <ThemeSwitcher />
        <Button
          data-testid="notification-icon"
          variant="ghost"
          size="icon"
          onClick={() => setIsNotificationsOpen(true)}
          className="rounded-[10px] relative hover:bg-gray-100 text-gray-600 h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
          aria-label="View Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </Button>
        <NotificationPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
        <div className="h-5 w-px bg-gray-200 mx-0.5 hidden sm:block" />
        <div data-testid="user-profile-menu" className="shrink-0">
          <UserProfileMenu />
        </div>
      </div>
    </header>
  );
};

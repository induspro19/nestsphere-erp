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
    <header data-testid="header" className="sticky top-0 z-30 h-16 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md px-5 flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="lg:hidden rounded-[8px] h-9 w-9">
          <Menu className="h-5 w-5 text-gray-600" />
        </Button>
        {!isMainDashboard && (
          <Button
            data-testid="universal-back-button"
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-8 px-2.5 rounded-[8px] gap-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 border-gray-200"
            title="Go Back"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-gray-500" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        )}
        <div className="flex-1 max-w-md">
          <QuickSearch />
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <ThemeSwitcher />
        <Button
          data-testid="notification-icon"
          variant="ghost"
          size="icon"
          onClick={() => setIsNotificationsOpen(true)}
          className="rounded-[10px] relative hover:bg-gray-100 text-gray-600 h-9 w-9"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </Button>
        <NotificationPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
        <div className="h-5 w-px bg-gray-200 mx-1 hidden sm:block" />
        <div data-testid="user-profile-menu">
          <UserProfileMenu />
        </div>
      </div>
    </header>
  );
};

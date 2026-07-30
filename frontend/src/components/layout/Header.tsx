import React, { useState } from 'react';
import { Menu, Bell } from 'lucide-react';
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

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="lg:hidden rounded-xl">
          <Menu className="h-5 w-5" />
        </Button>
        <QuickSearch />
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <ThemeSwitcher />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsNotificationsOpen(true)}
          className="rounded-xl relative hover:bg-accent/60"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
        </Button>
        <NotificationPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
        <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block" />
        <UserProfileMenu />
      </div>
    </header>
  );
};

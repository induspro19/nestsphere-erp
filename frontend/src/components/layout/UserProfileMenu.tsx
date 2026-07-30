import React, { useState } from 'react';
import { User, LogOut, Settings, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth.api';
import { Button } from '../ui/button';

export const UserProfileMenu: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Proceed with local logout regardless
    } finally {
      clearAuth();
      window.location.href = '/login';
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-accent/60"
      >
        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm border border-primary/20">
          {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
        </div>
        <div className="hidden md:flex flex-col text-left">
          <span className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</span>
          <span className="text-xs text-muted-foreground mt-0.5">{user.roles[0] || 'User'}</span>
        </div>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-lg p-2 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-3 py-2 border-b border-border/40 mb-1">
            <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-xl hover:bg-accent/60 transition-colors"
          >
            <User className="h-4 w-4" /> Profile Details
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-xl hover:bg-accent/60 transition-colors"
          >
            <Shield className="h-4 w-4" /> Security
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-xl hover:bg-accent/60 transition-colors"
          >
            <Settings className="h-4 w-4" /> Settings
          </button>
          <div className="my-1 border-t border-border/40" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive rounded-xl hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

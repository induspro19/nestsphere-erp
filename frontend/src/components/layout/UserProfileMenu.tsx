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

  const roleLabelMap: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    SOCIETY_ADMIN: 'Society Admin',
    RESIDENT: 'Resident',
    GATEKEEPER: 'Security Officer',
    ACCOUNTANT: 'Accountant',
  };

  const primaryRole = user.roles?.[0] ? (roleLabelMap[user.roles[0]] || user.roles[0]) : 'User';

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-gray-100"
      >
        <div className="h-9 w-9 rounded-full bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center border border-blue-200 shrink-0">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="h-full w-full rounded-full object-cover" />
          ) : (
            <span>{user.firstName ? user.firstName[0].toUpperCase() : 'U'}</span>
          )}
        </div>
        <div className="hidden md:flex flex-col text-left">
          <span className="text-[14px] font-semibold text-gray-900 leading-tight">
            {user.firstName} {user.lastName}
          </span>
          <span className="text-[11px] text-gray-500 font-medium leading-tight mt-0.5">
            {primaryRole}
          </span>
        </div>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-[14px] border border-gray-200 bg-white shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-3 py-2 border-b border-gray-100 mb-1">
            <p className="text-[14px] font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
            <p className="text-[12px] text-gray-500 truncate">{user.email}</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-[10px] text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <User className="h-4 w-4 text-gray-500" /> Profile Details
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-[10px] text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Shield className="h-4 w-4 text-gray-500" /> Security
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-[10px] text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Settings className="h-4 w-4 text-gray-500" /> Settings
          </button>
          <div className="my-1 border-t border-gray-100" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 rounded-[10px] hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

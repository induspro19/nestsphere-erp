import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Shield,
  Settings,
  ChevronLeft,
  Sliders,
  Users,
  DoorOpen,
  Radio,
  GitMerge,
  Boxes,
  UserCheck,
  FileText,
  DollarSign,
  BarChart3,
  LifeBuoy,
  Wrench,
  Landmark,
  CalendarCheck,
  ParkingCircle,
  Briefcase,
  Bell,
  Smartphone,
  Vote,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/button';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const user = useAuthStore((state) => state.user);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen && onCloseMobile) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  const navItems = [
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { title: 'Resident Portal', path: '/resident/dashboard', icon: Smartphone },
    { title: 'Gatekeeper Kiosk', path: '/gatekeeper/dashboard', icon: Shield },
    { title: 'Polls & Voting', path: '/polls', icon: Vote },
    { title: 'Committee Elections', path: '/elections', icon: Vote },
    { title: 'Property Engine', path: '/property-management', icon: Sliders },
    { title: 'People Directory', path: '/people', icon: Users },
    { title: 'Access Control', path: '/access-control', icon: DoorOpen },
    { title: 'Visitors', path: '/visitors', icon: UserCheck },
    { title: 'Helpdesk Tickets', path: '/complaints', icon: LifeBuoy },
    { title: 'Maintenance Engine', path: '/maintenance', icon: Wrench },
    { title: 'Facilities & Amenities', path: '/amenities', icon: CalendarCheck },
    { title: 'Billing & Payments', path: '/billing', icon: Landmark },
    { title: 'Notices', path: '/notices', icon: Bell },
    { title: 'Communication', path: '/notifications', icon: Radio },
    { title: 'Workflow Engine', path: '/workflows', icon: GitMerge },
    { title: 'Asset Engine', path: '/assets', icon: Boxes },
    { title: 'Documents', path: '/documents', icon: FileText },
    { title: 'Financial Engine', path: '/financials', icon: DollarSign },
    { title: 'Reports', path: '/reports', icon: BarChart3 },
    { title: 'Super Admin', path: '/super-admin', icon: Shield, roles: ['SUPER_ADMIN'] },
    { title: 'Settings', path: '/settings', icon: Settings },
  ];

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return user?.roles?.some((role) => item.roles!.includes(role));
  });

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileOpen && (
        <div
          aria-hidden="true"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity duration-200"
        />
      )}

      {/* Main Sidebar Component */}
      <aside
        data-testid="sidebar"
        role="navigation"
        aria-label="Sidebar navigation"
        aria-expanded={!isCollapsed}
        className={`fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-250 ease-in-out flex flex-col shadow-[0_6px_20px_rgba(0,0,0,0.05)] overflow-x-hidden ${
          isMobileOpen
            ? 'translate-x-0 w-[280px]'
            : 'max-lg:-translate-x-full lg:translate-x-0 ' + (isCollapsed ? 'w-[72px]' : 'w-[280px]')
        }`}
      >
        {/* Logo & Header Section */}
        <div className="h-[72px] flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
          <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'w-full justify-center' : ''}`}>
            <div className="h-10 w-10 rounded-[12px] bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
              <Building2 className="h-6 w-6" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-semibold text-[16px] text-gray-900 leading-tight tracking-tight">Society ERP</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">SAAS ENTERPRISE</span>
              </div>
            )}
          </div>

          {/* Desktop Toggle Button */}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              aria-label="Collapse Sidebar"
              className="hidden lg:flex h-8 w-8 rounded-[10px] hover:bg-gray-100 text-gray-500 shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          {/* Mobile Close Button */}
          {isMobileOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCloseMobile}
              aria-label="Close Navigation Menu"
              className="lg:hidden h-8 w-8 rounded-[10px] text-gray-500 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Collapsed Mode Expand Button */}
        {isCollapsed && (
          <div className="py-2 flex justify-center hidden lg:flex border-b border-gray-100/60">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              aria-label="Expand Sidebar"
              className="h-8 w-8 rounded-[10px] hover:bg-gray-100 text-gray-500"
            >
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </Button>
          </div>
        )}

        {/* Navigation Items List */}
        <div className="flex-1 py-3 px-2 space-y-1.5 overflow-y-auto no-scrollbar overflow-x-hidden">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (isMobileOpen && onCloseMobile) onCloseMobile();
                }}
                className={({ isActive }) => {
                  if (isCollapsed) {
                    // Collapsed State: Perfectly centered rounded square behind icon
                    return `group relative flex items-center justify-center h-11 w-11 mx-auto rounded-[12px] transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm font-medium'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`;
                  }
                  // Expanded State: Full width rounded menu item
                  return `flex items-center gap-3.5 px-3.5 h-[46px] rounded-[14px] font-medium text-[15px] transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`;
                }}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className="h-6 w-6 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.title}</span>}

                {/* Collapsed Tooltip on Hover */}
                {isCollapsed && (
                  <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-[8px] bg-gray-900 text-white text-[12px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
                    {item.title}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Tenant Info Footer */}
        {!isCollapsed && (
          <div className="p-3 m-3 border-t border-gray-100 shrink-0">
            <div className="p-3 rounded-[14px] bg-gray-50 border border-gray-200/60 text-xs">
              <p className="text-gray-400 uppercase font-medium text-[10px] tracking-wider">Active Tenant</p>
              <p className="font-semibold text-gray-900 truncate mt-0.5">{user?.societyName || 'Greenfield Heights'}</p>
              <p className="text-[11px] text-gray-500 font-mono mt-0.5">SOC-001</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

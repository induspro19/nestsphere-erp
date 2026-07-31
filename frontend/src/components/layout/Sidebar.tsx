import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, Shield, Settings, ChevronLeft, Sliders, Users, DoorOpen, Radio, GitMerge, Boxes, UserCheck, FileText, DollarSign, BarChart3, LifeBuoy, Wrench, Landmark, CalendarCheck, ParkingCircle, Briefcase, Bell, Smartphone, Vote } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/button';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const user = useAuthStore((state) => state.user);

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
    { title: 'Maintenance Billing', path: '/billing', icon: Landmark },
    { title: 'Amenity Booking', path: '/amenities', icon: CalendarCheck },
    { title: 'Parking & Vehicles', path: '/parking', icon: ParkingCircle },
    { title: 'Vendor & AMC', path: '/vendors', icon: Briefcase },
    { title: 'Meetings Engine', path: '/meetings', icon: CalendarCheck },
    { title: 'Notice Board', path: '/notices', icon: Bell },
    { title: 'Communication', path: '/notifications', icon: Radio },
    { title: 'Workflow Engine', path: '/workflows', icon: GitMerge },
    { title: 'Asset Engine', path: '/assets', icon: Boxes },
    { title: 'Documents Engine', path: '/documents', icon: FileText },
    { title: 'Financial Engine', path: '/financials', icon: DollarSign },
    { title: 'Analytics Engine', path: '/analytics', icon: BarChart3 },
    { title: 'Super Admin', path: '/super-admin', icon: Shield, roles: ['SUPER_ADMIN'] },
    { title: 'Settings', path: '/settings', icon: Settings },
  ];

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return user?.roles?.some((role) => item.roles!.includes(role));
  });

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 border-r border-border/40 bg-card/90 backdrop-blur-xl flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/40">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-md shrink-0 font-display">
            <Building2 className="h-6 w-6" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-base leading-tight font-display tracking-tight">Society ERP</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">SaaS Enterprise</span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="hidden lg:flex h-8 w-8 rounded-lg hover:bg-accent/60"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                } ${isCollapsed ? 'justify-center px-0' : ''}`
              }
              title={isCollapsed ? item.title : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.title}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* Tenant Indicator Footer */}
      {!isCollapsed && user?.societyName && (
        <div className="p-3 m-3 rounded-xl bg-accent/40 border border-border/40 text-xs">
          <p className="text-muted-foreground uppercase font-semibold text-[10px]">Active Tenant</p>
          <p className="font-semibold text-foreground truncate mt-0.5">{user.societyName}</p>
        </div>
      )}
    </aside>
  );
};

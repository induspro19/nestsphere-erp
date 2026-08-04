import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  Building2, 
  CreditCard, 
  LayoutDashboard, 
  ShieldCheck, 
  Users, 
  Settings, 
  Menu, 
  X,
  Bell,
  Activity,
  Headset,
  FileKey
} from 'lucide-react';
import { Button } from '../../ui/button';
import { AnimatedPageWrapper } from '../../shared/AnimatedPageWrapper';

export const SuperAdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'SaaS Dashboard', href: '/super-admin', icon: LayoutDashboard },
    { name: 'Societies', href: '/super-admin/societies', icon: Building2 },
    { name: 'Subscriptions', href: '/super-admin/subscriptions', icon: CreditCard },
    { name: 'Licenses', href: '/super-admin/licenses', icon: FileKey },
    { name: 'Billing & Revenue', href: '/super-admin/billing', icon: CreditCard },
    { name: 'Platform Users', href: '/super-admin/users', icon: Users },
    { name: 'Customer Support', href: '/super-admin/support', icon: Headset },
    { name: 'System Monitoring', href: '/super-admin/monitoring', icon: Activity },
    { name: 'Audit Center', href: '/super-admin/audit', icon: ShieldCheck },
    { name: 'Platform Settings', href: '/super-admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted/40 font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 text-white transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 shrink-0 items-center justify-between px-6 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2 text-primary font-display font-bold text-lg tracking-wide">
             <ShieldCheck className="h-6 w-6" />
             NestSphere SaaS
          </div>
          <button className="lg:hidden text-slate-400" onClick={() => setSidebarOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col overflow-y-auto px-4 py-6 space-y-1 no-scrollbar">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary/20 text-primary font-semibold' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content wrapper */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-border/40 bg-card px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button type="button" className="-m-2.5 p-2.5 text-muted-foreground lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex flex-1 items-center justify-end gap-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 border-l border-border/40 pl-4">
               <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                 SA
               </div>
               <div className="hidden md:block text-sm">
                 <p className="font-bold text-foreground">Super Admin</p>
                 <p className="text-xs text-muted-foreground">Platform Manager</p>
               </div>
            </div>
          </div>
        </header>

        {/* Page Content with Zero-Flicker Transition */}
        <main className="flex-1">
          <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
            <AnimatedPageWrapper key={location.pathname}>
              <Outlet />
            </AnimatedPageWrapper>
          </div>
        </main>
      </div>
    </div>
  );
};

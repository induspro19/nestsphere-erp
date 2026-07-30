import React from 'react';
import { StatCard } from '../components/shared/StatCard';
import { Building2, Users, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

export const DashboardShell: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-accent/30 to-background backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">
            Welcome back, {user?.firstName || 'User'}! 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Society Management ERP SaaS Foundation Layer (Phase 1)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            System Operational
          </span>
        </div>
      </div>

      {/* Foundation Metrics Overview (Shell Only) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Society"
          value={user?.societyName || 'Multi-Tenant'}
          description="Tenant Data Isolated"
          icon={Building2}
        />
        <StatCard
          title="Your Role"
          value={user?.roles?.[0] || 'Member'}
          description="RBAC Protected"
          icon={ShieldCheck}
        />
        <StatCard
          title="Security Status"
          value="Protected"
          description="JWT Dual-Token Auth"
          icon={Users}
        />
        <StatCard
          title="API Version"
          value="/api/v1"
          description="REST Endpoint Ready"
          icon={AlertCircle}
        />
      </div>

      {/* Empty Dashboard Shell Container */}
      <Card>
        <CardHeader>
          <CardTitle>Enterprise ERP Modules Workspace</CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center text-muted-foreground text-sm">
          <p className="font-semibold text-foreground text-base">Phase 1 Foundation Setup Complete</p>
          <p className="mt-1 max-w-md mx-auto">
            Future business modules (Societies, Buildings, Residents, Visitors, Maintenance Billing) will extend this architecture shell cleanly in upcoming phases.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { StatCard } from '../components/shared/StatCard';
import { analyticsApi, ExecutiveDashboard, ReportConfig } from '../api/analytics.api';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Calendar,
  Download,
  Plus,
  Users,
  DoorOpen,
  DollarSign,
  Boxes,
  FileText,
  GitMerge,
  UserCheck,
  X,
  Printer,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<ExecutiveDashboard | null>(null);
  const [reports, setReports] = useState<ReportConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'REPORTS' | 'SCHEDULED'>('DASHBOARD');

  // Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [domain, setDomain] = useState('FINANCIAL');
  const [chartType, setChartType] = useState('BAR');
  const [isScheduled, setIsScheduled] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, rptRes] = await Promise.all([
        analyticsApi.getDashboard(),
        analyticsApi.getReports(),
      ]);
      setDashboard(dashRes);
      setReports(rptRes || []);
    } catch {
      // API fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await analyticsApi.createReport({
        title: reportTitle,
        domain,
        chartType,
        isScheduled,
        cronSchedule: isScheduled ? '0 8 * * *' : undefined,
      });
      setIsReportModalOpen(false);
      setReportTitle('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save report configuration');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl border border-border/40 bg-gradient-to-r from-card via-accent/30 to-background flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" /> Enterprise Analytics & Reporting Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time cross-domain BI dashboard, saved reports, PDF export & automated cron scheduling
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handlePrint} className="rounded-xl">
            <Printer className="h-4 w-4 mr-2" /> Print / Export PDF
          </Button>
          <Button onClick={() => setIsReportModalOpen(true)} className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" /> Build Custom Report
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-2">
        <button
          onClick={() => setActiveTab('DASHBOARD')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'DASHBOARD' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-accent/60'
          }`}
        >
          Executive Cross-Domain BI Dashboard
        </button>
        <button
          onClick={() => setActiveTab('REPORTS')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'REPORTS' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-accent/60'
          }`}
        >
          Saved Reports Suite ({reports.length})
        </button>
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <LoadingSpinner message="Aggregating enterprise business intelligence metrics..." />
      ) : activeTab === 'DASHBOARD' ? (
        <div className="space-y-6">
          {/* Top KPI Grid Across All 10 Modules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Financial Collections" value={`$${(dashboard?.kpi.totalCollected || 0).toLocaleString()}`} description="Net Realized Revenue" icon={DollarSign} />
            <StatCard title="Asset Valuation" value={`$${(dashboard?.kpi.assetValuation || 0).toLocaleString()}`} description="Capital Infrastructure" icon={Boxes} />
            <StatCard title="Gate Footfall & Overstay" value={`${dashboard?.kpi.totalVisitors || 0} Visitors`} description={`${dashboard?.kpi.overstayAlerts || 0} Overstay Alerts`} icon={DoorOpen} />
            <StatCard title="Pending SLA Approvals" value={`${dashboard?.kpi.pendingApprovals || 0} Steps`} description="Workflow Engine Pipeline" icon={GitMerge} />
          </div>

          {/* Chart Visualizations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-500" /> Monthly Revenue & Collection Growth ($)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-52 flex items-end justify-between gap-4 pt-6 px-4 border-b border-border/40">
                  {dashboard?.trends.monthlyCollections.map((m) => (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-mono font-bold">${m.amount}</span>
                      <div
                        style={{ height: `${Math.min(160, m.amount / 10)}px` }}
                        className="w-full max-w-[48px] bg-gradient-to-t from-primary to-primary/60 rounded-t-xl transition-all hover:brightness-110"
                      />
                      <span className="text-xs text-muted-foreground font-semibold">{m.month}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-sky-500" /> Weekly Visitor Gate Entry Footfall
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-52 flex items-end justify-between gap-3 pt-6 px-4 border-b border-border/40">
                  {dashboard?.trends.visitorTrends.map((v) => (
                    <div key={v.day} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-mono font-bold">{v.count}</span>
                      <div
                        style={{ height: `${v.count * 1.3}px` }}
                        className="w-full max-w-[40px] bg-gradient-to-t from-sky-500 to-sky-400/60 rounded-t-xl transition-all hover:brightness-110"
                      />
                      <span className="text-xs text-muted-foreground font-semibold">{v.day}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((rpt) => (
            <Card key={rpt.id} className="p-4 space-y-3 border-border/40 bg-card hover:bg-accent/30 transition-all">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px] font-mono">{rpt.reportCode}</Badge>
                <Badge variant="secondary" className="text-[10px] uppercase">{rpt.chartType}</Badge>
              </div>
              <h4 className="font-bold text-base">{rpt.title}</h4>
              <div className="flex justify-between items-center text-xs border-t border-border/30 pt-2">
                <span className="text-muted-foreground">Domain: {rpt.domain}</span>
                {rpt.isScheduled && (
                  <span className="text-emerald-500 flex items-center gap-1 font-medium">
                    <Calendar className="h-3 w-3" /> Scheduled 08:00 AM
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Build Custom Report */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold font-display">Build Custom Report Config</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsReportModalOpen(false)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Report Title *</label>
                <Input value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} placeholder="e.g. Asset Maintenance Cost vs Depreciation" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Target Domain</label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs"
                  >
                    <option value="FINANCIAL">Financials</option>
                    <option value="VISITOR">Visitors</option>
                    <option value="ASSET">Assets</option>
                    <option value="PEOPLE">People</option>
                    <option value="WORKFLOW">Workflows</option>
                    <option value="ACCESS">Access Control</option>
                    <option value="DOCUMENT">Documents</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Visualization</label>
                  <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs"
                  >
                    <option value="BAR">Bar Chart</option>
                    <option value="LINE">Line Chart</option>
                    <option value="PIE">Pie Chart</option>
                    <option value="KPI">KPI Card</option>
                    <option value="TABLE">Data Table</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sched"
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  className="rounded border-input"
                />
                <label htmlFor="sched" className="text-xs font-semibold">Enable Automated Daily Email Schedule (08:00 AM Cron)</label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsReportModalOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl">
                  Save Report Specification
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

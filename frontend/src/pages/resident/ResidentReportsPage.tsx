import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Printer, 
  TrendingUp,
  CreditCard,
  LifeBuoy,
  Users,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';

export const ResidentReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Simulate API fetch with mock data
    const fetchReports = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        setData({
          maintenance: {
            totalPaid: 24500,
            outstanding: 4500,
            monthsPaid: 6
          },
          payments: [
            { id: '1', date: '2026-06-25', amount: 4500, status: 'Completed', ref: 'TXN-001' },
            { id: '2', date: '2026-05-28', amount: 4500, status: 'Completed', ref: 'TXN-002' },
            { id: '3', date: '2026-04-26', amount: 4500, status: 'Completed', ref: 'TXN-003' }
          ],
          complaints: {
            resolved: 12,
            pending: 1,
            inProgress: 2
          },
          visitors: {
            thisMonth: 28,
            frequent: 4,
            deliveries: 15
          }
        });
      } catch (err) {
        setError('Failed to load reports data.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Generating Reports & Analytics..." timeoutMs={8000} />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center" data-testid="error-state">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-foreground">Error Loading Reports</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center" data-testid="empty-state">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold text-foreground">No Reports Found</h2>
        <p className="text-muted-foreground mt-2">There is no analytics data available for your unit yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300" data-testid="reports-page">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" /> Resident Reports & Analytics
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            View, download, and track your unit's statistics and history.
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <Button variant="outline" size="sm" className="gap-2 whitespace-nowrap text-xs" data-testid="download-pdf">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-2 whitespace-nowrap text-xs" data-testid="export-excel">
            <FileSpreadsheet className="h-4 w-4" /> Export Excel
          </Button>
          <Button variant="outline" size="sm" className="gap-2 whitespace-nowrap text-xs" data-testid="print-report">
            <Printer className="h-4 w-4" /> Print Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Monthly Maintenance Summary */}
        <Card data-testid="maintenance-summary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Monthly Maintenance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-xs text-muted-foreground mb-1">Total Paid (YTD)</p>
                <p className="text-lg font-bold font-mono text-primary">₹{data.maintenance.totalPaid.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-destructive/5 rounded-xl border border-destructive/10">
                <p className="text-xs text-muted-foreground mb-1">Outstanding</p>
                <p className="text-lg font-bold font-mono text-destructive">₹{data.maintenance.outstanding.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complaint Statistics */}
        <Card data-testid="complaint-stats">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <LifeBuoy className="h-4 w-4 text-primary" /> Complaint Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center px-4 py-2 bg-accent/30 rounded-xl">
              <div className="text-center">
                <p className="text-xl font-bold text-emerald-500">{data.complaints.resolved}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Resolved</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-amber-500">{data.complaints.inProgress}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-rose-500">{data.complaints.pending}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visitor Statistics */}
        <Card data-testid="visitor-stats">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Visitor Statistics (This Month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Visitors</span>
                <span className="font-bold">{data.visitors.thisMonth}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Deliveries</span>
                <span className="font-bold">{data.visitors.deliveries}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Frequent Guests</span>
                <span className="font-bold">{data.visitors.frequent}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card data-testid="payment-history">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" /> Recent Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.payments.map((payment: any) => (
                <div key={payment.id} className="flex justify-between items-center p-3 rounded-lg border border-border/40 bg-card">
                  <div>
                    <p className="text-sm font-bold font-mono">₹{payment.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">{payment.ref}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-emerald-500">{payment.status}</p>
                    <p className="text-[10px] text-muted-foreground">{payment.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

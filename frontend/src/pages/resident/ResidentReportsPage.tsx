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
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { useAuthStore } from '../../store/authStore';
import { 
  generateResidentPDF, 
  generateResidentExcel, 
  printResidentReport, 
  getDefaultReportData,
  ResidentReportData 
} from '../../utils/reportExport';

export const ResidentReportsPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [exportingType, setExportingType] = useState<'pdf' | 'excel' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ResidentReportData | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // Load report data or use robust default sample data
        const sampleData = getDefaultReportData(user);
        setData(sampleData);
      } catch (err) {
        setError('Failed to load reports data.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  const handleDownloadPDF = async () => {
    try {
      setExportingType('pdf');
      await generateResidentPDF(data || undefined, user);
    } finally {
      setExportingType(null);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExportingType('excel');
      await generateResidentExcel(data || undefined, user);
    } finally {
      setExportingType(null);
    }
  };

  const handlePrint = () => {
    printResidentReport();
  };

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

  const reportData = data || getDefaultReportData(user);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 print:space-y-4 print:p-0 print:m-0" data-testid="reports-page">
      
      {/* Printable CSS Rules */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report-area, #printable-report-area * {
            visibility: visible;
          }
          #printable-report-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" /> Resident Reports & Analytics
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            View, download, and track your unit's statistics and history.
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadPDF} 
            disabled={exportingType === 'pdf'} 
            className="gap-2 whitespace-nowrap text-xs border-blue-200 text-blue-800 hover:bg-blue-50" 
            data-testid="download-pdf"
          >
            {exportingType === 'pdf' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Preparing Report...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" /> Download PDF
              </>
            )}
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportExcel} 
            disabled={exportingType === 'excel'} 
            className="gap-2 whitespace-nowrap text-xs border-emerald-200 text-emerald-800 hover:bg-emerald-50" 
            data-testid="export-excel"
          >
            {exportingType === 'excel' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Preparing Report...
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-4 w-4" /> Export Excel
              </>
            )}
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrint} 
            className="gap-2 whitespace-nowrap text-xs border-gray-300" 
            data-testid="print-report"
          >
            <Printer className="h-4 w-4" /> Print Report
          </Button>
        </div>
      </div>

      {/* Report Container */}
      <div id="printable-report-area" className="space-y-6">
        
        {/* Print Header */}
        <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-4">
          <h1 className="text-2xl font-bold text-slate-900">NestSphere Society ERP - Resident Report</h1>
          <p className="text-sm text-slate-600">Resident: {user?.firstName} {user?.lastName} | Unit: {(user as any)?.flatNumber || 'Flat A-402'}</p>
          <p className="text-xs text-slate-500 mt-1">Printed On: {new Date().toLocaleString()}</p>
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
                  <p className="text-lg font-bold font-mono text-primary">₹{reportData.maintenance?.totalPaid.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-destructive/5 rounded-xl border border-destructive/10">
                  <p className="text-xs text-muted-foreground mb-1">Outstanding Balance</p>
                  <p className="text-lg font-bold font-mono text-destructive">₹{reportData.maintenance?.outstanding.toLocaleString()}</p>
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
                  <p className="text-xl font-bold text-emerald-500">{reportData.complaints?.resolved}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Resolved</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-amber-500">{reportData.complaints?.inProgress}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">In Progress</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-rose-500">{reportData.complaints?.pending}</p>
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
                  <span className="font-bold">{reportData.visitors?.thisMonth}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Deliveries</span>
                  <span className="font-bold">{reportData.visitors?.deliveries}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Frequent Guests</span>
                  <span className="font-bold">{reportData.visitors?.frequent}</span>
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
                {reportData.payments?.map((payment: any) => (
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
    </div>
  );
};

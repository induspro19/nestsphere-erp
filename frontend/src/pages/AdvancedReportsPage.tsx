import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, FileSpreadsheet, CheckCircle2, TrendingUp, DollarSign, BookOpen, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { DataTable } from '../components/shared/DataTable';
import { toast } from 'sonner';

export const AdvancedReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DEFAULTERS' | 'BALANCE_SHEET' | 'P_AND_L' | 'BUDGET' | 'BANK_BOOK' | 'COMPLIANCE'>('DEFAULTERS');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const endpoints: Record<string, string> = {
      DEFAULTERS: '/api/analytics/defaulters-aging',
      BALANCE_SHEET: '/api/analytics/balance-sheet',
      P_AND_L: '/api/analytics/income-statement',
      BUDGET: '/api/analytics/budget-vs-actual',
      BANK_BOOK: '/api/analytics/bank-book',
      COMPLIANCE: '/api/analytics/compliance-audit',
    };

    fetch(endpoints[activeTab], {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((d) => {
        setData(d);
      })
      .catch(() => {});
  }, [activeTab]);

  const handleExportCsv = () => {
    window.open('/api/analytics/export/defaulters-csv', '_blank');
    toast.success('Downloading Report CSV...');
  };

  const handlePrint = () => {
    window.print();
  };

  const defaulterData = (data?.records || []).map((r: any, idx: number) => ({ id: r.billNumber || `def-${idx}`, ...r }));
  const budgetData = (data?.rows || []).map((r: any, idx: number) => ({ id: r.accountCode || `bgt-${idx}`, ...r }));
  const bankBookData = (data?.transactions || []).map((r: any, idx: number) => ({ id: r.entryNumber || `bb-${idx}`, ...r }));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" /> Advanced Financial & BI Report Center
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit-ready Balance Sheets, Profit & Loss, Bank Books, Budget Variances, Defaulters, and Statutory Compliance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint} className="rounded-xl gap-1.5 text-xs">
            <Printer className="h-4 w-4" /> Print Statement
          </Button>
          <Button onClick={handleExportCsv} className="rounded-xl gap-1.5 text-xs shadow-sm">
            <FileSpreadsheet className="h-4 w-4" /> Export Excel / CSV
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-2 text-xs">
        {[
          { key: 'DEFAULTERS', label: 'Defaulter Ageing' },
          { key: 'BALANCE_SHEET', label: 'Balance Sheet' },
          { key: 'P_AND_L', label: 'Profit & Loss Statement' },
          { key: 'BUDGET', label: 'Budget vs Actual' },
          { key: 'BANK_BOOK', label: 'Bank Book Ledger' },
          { key: 'COMPLIANCE', label: 'GST & Statutory Compliance' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === tab.key ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* DEFAULTERS TAB */}
      {activeTab === 'DEFAULTERS' && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold font-display">Defaulter Ageing Breakdown</CardTitle>
                <CardDescription className="text-xs">Summary of unpaid maintenance invoices</CardDescription>
              </div>
              <Badge variant="destructive" className="text-[10px]">
                Total Defaulters: {data?.totalDefaulters || 0}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={[
                { header: 'Bill #', accessorKey: (row: any) => row.billNumber },
                { header: 'Unit #', accessorKey: (row: any) => row.unit },
                { header: 'Resident', accessorKey: (row: any) => row.residentName },
                { header: 'Month', accessorKey: (row: any) => row.billingMonth },
                { header: 'Due Date', accessorKey: (row: any) => row.dueDate },
                { header: 'Days Overdue', accessorKey: (row: any) => row.daysPastDue },
                { header: 'Aging Bucket', accessorKey: (row: any) => <Badge variant="outline">{row.agingBucket}</Badge> },
                { header: 'Outstanding', accessorKey: (row: any) => <span className="font-bold text-destructive">₹{row.outstanding}</span> },
              ]}
              data={defaulterData}
              emptyMessage="No overdue defaulters found."
            />
          </CardContent>
        </Card>
      )}

      {/* BALANCE SHEET TAB */}
      {activeTab === 'BALANCE_SHEET' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold font-display text-emerald-600">Assets</CardTitle>
              <CardDescription className="text-xs">Total Assets: ₹{data?.totalAssets || 0}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {data?.assets?.map((a: any, idx: number) => (
                <div key={idx} className="flex justify-between p-2.5 bg-muted/40 rounded-lg border">
                  <span>{a.code} - {a.name}</span>
                  <span className="font-bold">₹{a.amount}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold font-display text-indigo-600">Liabilities & Equity</CardTitle>
              <CardDescription className="text-xs">Total Liabilities & Equity: ₹{data?.totalLiabilitiesAndEquity || 0}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {data?.liabilities?.map((l: any, idx: number) => (
                <div key={idx} className="flex justify-between p-2.5 bg-muted/40 rounded-lg border">
                  <span>{l.code} - {l.name}</span>
                  <span className="font-bold text-destructive">₹{l.amount}</span>
                </div>
              ))}
              {data?.equity?.map((e: any, idx: number) => (
                <div key={idx} className="flex justify-between p-2.5 bg-primary/5 rounded-lg border border-primary/20">
                  <span>{e.code} - {e.name}</span>
                  <span className="font-bold text-primary">₹{e.amount}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* PROFIT & LOSS TAB */}
      {activeTab === 'P_AND_L' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold font-display">Income & Expense Statement</CardTitle>
                <CardDescription className="text-xs">Net Operating Surplus: ₹{data?.netSurplus || 0}</CardDescription>
              </div>
              <Badge variant="success" className="text-[10px]">Surplus: ₹{data?.netSurplus}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2">
                <h4 className="font-bold text-emerald-700">Total Income: ₹{data?.totalIncome || 0}</h4>
                {data?.incomeBreakdown?.map((i: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-muted-foreground">
                    <span>{i.name}</span>
                    <span className="font-mono text-foreground font-semibold">₹{i.amount}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl space-y-2">
                <h4 className="font-bold text-red-700">Total Expenses: ₹{data?.totalExpenses || 0}</h4>
                {data?.expenseBreakdown?.map((e: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-muted-foreground">
                    <span>{e.name}</span>
                    <span className="font-mono text-foreground font-semibold">₹{e.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* BUDGET VS ACTUAL TAB */}
      {activeTab === 'BUDGET' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold font-display">Budget vs Actual Expense Variance</CardTitle>
            <CardDescription className="text-xs">Comparison against approved annual society budget</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={[
                { header: 'Account', accessorKey: (row: any) => `${row.accountCode} - ${row.accountName}` },
                { header: 'Budgeted (₹)', accessorKey: (row: any) => `₹${row.budgeted}` },
                { header: 'Actual Spent (₹)', accessorKey: (row: any) => `₹${row.actual}` },
                { header: 'Variance (₹)', accessorKey: (row: any) => <span className={row.variance >= 0 ? 'text-emerald-500 font-bold' : 'text-destructive font-bold'}>₹{row.variance}</span> },
                { header: 'Status', accessorKey: (row: any) => <Badge variant={row.status === 'WITHIN_BUDGET' ? 'success' : 'destructive'}>{row.status}</Badge> },
              ]}
              data={budgetData}
              emptyMessage="No budget categories defined."
            />
          </CardContent>
        </Card>

      {/* BANK BOOK TAB */}
      {activeTab === 'BANK_BOOK' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold font-display">Bank Book Journal Ledger</CardTitle>
            <CardDescription className="text-xs">Account #1020 - Main Society Bank Account</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={[
                { header: 'Entry #', accessorKey: (row: any) => row.entryNumber },
                { header: 'Date', accessorKey: (row: any) => row.date },
                { header: 'Narration / Particulars', accessorKey: (row: any) => row.narration },
                { header: 'Debit (₹)', accessorKey: (row: any) => row.debit > 0 ? `₹${row.debit}` : '-' },
                { header: 'Credit (₹)', accessorKey: (row: any) => row.credit > 0 ? `₹${row.credit}` : '-' },
              ]}
              data={bankBookData}
              emptyMessage="No bank transactions recorded."
            />
          </CardContent>
        </Card>
      )}

      {/* COMPLIANCE TAB */}
      {activeTab === 'COMPLIANCE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold font-display">Statutory Audit Checklist</CardTitle>
              <CardDescription className="text-xs">Societies Registration Act compliance checklist</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {data?.auditChecklist?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border/30">
                  <div>
                    <p className="font-semibold">{item.item}</p>
                    <p className="text-[10px] text-muted-foreground">Last Inspected: {item.date}</p>
                  </div>
                  <Badge variant="success" className="text-[10px]">{item.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold font-display">GST Return Helper</CardTitle>
              <CardDescription className="text-xs">GSTIN: {data?.statutoryCompliance?.gstFilingSummary?.gstin}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Filing Period:</span>
                  <span className="font-bold">{data?.statutoryCompliance?.gstFilingSummary?.filingPeriod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Output GST Collected:</span>
                  <span className="font-bold text-emerald-600">₹{data?.statutoryCompliance?.gstFilingSummary?.totalGstCollected}</span>
                </div>
              </div>
              <Button className="w-full rounded-xl text-xs shadow-sm gap-2">
                <Download className="h-4 w-4" /> Download GSTR-3B Helper Summary
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

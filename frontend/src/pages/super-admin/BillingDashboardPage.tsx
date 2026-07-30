import React from 'react';
import { StatCard } from '../../components/shared/StatCard';
import { DataTable } from '../../components/shared/DataTable';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { toast } from 'sonner';
import { CreditCard, TriangleAlert, AlertCircle, Eye, Download, FileText, IndianRupee, TrendingUp, Receipt } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { name: 'Jan', revenue: 9.8 },
  { name: 'Feb', revenue: 10.5 },
  { name: 'Mar', revenue: 11.2 },
  { name: 'Apr', revenue: 10.8 },
  { name: 'May', revenue: 11.9 },
  { name: 'Jun', revenue: 12.45 },
];

const mockInvoices = [
  { id: '1', invoiceNo: 'INV-2026-001', society: 'Grand Omaxe', amount: '₹1,50,000', status: 'Paid', dueDate: '15 Jul 2026', paidDate: '10 Jul 2026' },
  { id: '2', invoiceNo: 'INV-2026-002', society: 'DLF Camellias', amount: '₹4,50,000', status: 'Paid', dueDate: '15 Jul 2026', paidDate: '12 Jul 2026' },
  { id: '3', invoiceNo: 'INV-2026-003', society: 'Supertech Emerald', amount: '₹85,000', status: 'Pending', dueDate: '30 Jul 2026', paidDate: '-' },
  { id: '4', invoiceNo: 'INV-2026-004', society: 'Jaypee Greens', amount: '₹1,20,000', status: 'Overdue', dueDate: '10 Jul 2026', paidDate: '-' },
  { id: '5', invoiceNo: 'INV-2026-005', society: 'Gaur City 2', amount: '₹2,10,000', status: 'Paid', dueDate: '15 Jul 2026', paidDate: '14 Jul 2026' },
  { id: '6', invoiceNo: 'INV-2026-006', society: 'Mahagun Moderne', amount: '₹95,000', status: 'Pending', dueDate: '05 Aug 2026', paidDate: '-' },
  { id: '7', invoiceNo: 'INV-2026-007', society: 'ATS Village', amount: '₹1,80,000', status: 'Overdue', dueDate: '20 Jun 2026', paidDate: '-' },
  { id: '8', invoiceNo: 'INV-2026-008', society: 'Prateek Wisteria', amount: '₹1,30,000', status: 'Paid', dueDate: '15 Jul 2026', paidDate: '15 Jul 2026' },
];

const recentPayments = [
  { id: '1', society: 'Grand Omaxe', amount: '₹1,50,000', date: '10 Jul 2026', method: 'Bank Transfer' },
  { id: '2', society: 'DLF Camellias', amount: '₹4,50,000', date: '12 Jul 2026', method: 'UPI' },
  { id: '3', society: 'Gaur City 2', amount: '₹2,10,000', date: '14 Jul 2026', method: 'Card' },
  { id: '4', society: 'Prateek Wisteria', amount: '₹1,30,000', date: '15 Jul 2026', method: 'Bank Transfer' },
  { id: '5', society: 'Omaxe Heights', amount: '₹90,000', date: '16 Jul 2026', method: 'UPI' },
];

import { Input } from '../../components/ui/input';
import { useState } from 'react';

export default function BillingDashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const columns: { header: string; accessorKey: any }[] = [
    { header: 'Invoice #', accessorKey: 'invoiceNo' },
    { header: 'Society', accessorKey: 'society' },
    { header: 'Amount', accessorKey: 'amount' },
    { 
      header: 'Status', 
      accessorKey: (row: any) => (
        <Badge variant={row.status === 'Paid' ? 'success' : row.status === 'Overdue' ? 'destructive' : 'outline'}>
          {row.status}
        </Badge>
      )
    },
    { header: 'Due Date', accessorKey: 'dueDate' },
    { header: 'Paid Date', accessorKey: 'paidDate' },
    {
      header: 'Actions',
      accessorKey: (row: any) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" aria-label="View Invoice" onClick={() => toast.info(`Viewing invoice ${row.invoiceNo}`)}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Download Invoice" onClick={() => toast.success(`Downloading invoice ${row.invoiceNo}`)}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold font-display tracking-tight">Billing & Revenue</h1>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => toast.success('Report generation started')}>
            <FileText className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={() => toast.info('New Invoice draft created')}>
            <CreditCard className="w-4 h-4 mr-2" />
            Generate Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Total Revenue" value="₹1.49 Cr" trend="+18% YoY" icon={IndianRupee} />
        <StatCard title="Monthly Revenue" value="₹12.45 L" trend="+15%" icon={TrendingUp} />
        <StatCard title="Pending Invoices" value="7" icon={TriangleAlert} />
        <StatCard title="Overdue" value="2" icon={AlertCircle} />
        <StatCard title="Credits Issued" value="₹45,000" icon={Receipt} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Breakdown (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value} L`, 'Revenue']} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{payment.society}</p>
                    <p className="text-xs text-muted-foreground">{payment.date} &bull; {payment.method}</p>
                  </div>
                  <div className="font-semibold text-sm">{payment.amount}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Invoices</CardTitle>
            <Input 
              placeholder="Search invoices..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={mockInvoices.filter(i => i.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) || i.society.toLowerCase().includes(searchTerm.toLowerCase()))} 
            emptyMessage="No invoices found." 
          />
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { CreditCard, Download, Clock, IndianRupee, FileText, History } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentCheckoutModal } from '../../components/shared/PaymentCheckoutModal';
import { generateSingleBillPDF } from '../../utils/reportExport';
import { useAuthStore } from '../../store/authStore';

export const ResidentBillsPage: React.FC = () => {
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [bills, setBills] = useState([
    {
      id: 'b1',
      billNumber: 'INV-2026-07',
      month: 'July 2026',
      amount: 4500,
      lateFee: 0,
      dueDate: '2026-07-31',
      status: 'UNPAID',
    },
    {
      id: 'b2',
      billNumber: 'INV-2026-06',
      month: 'June 2026',
      amount: 4500,
      lateFee: 0,
      dueDate: '2026-06-30',
      status: 'PAID',
      paidOn: '2026-06-25',
    },
  ]);

  const outstandingBalance = bills.filter(b => b.status === 'UNPAID').reduce((acc, b) => acc + b.amount, 0);
  const unpaidBills = bills.filter(b => b.status === 'UNPAID');
  const paidBills = bills.filter(b => b.status === 'PAID');

  const handlePay = (bill: any) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  const user = useAuthStore((state) => state.user);

  const handleDownloadInvoice = (billNumber: string) => {
    const found = bills.find((b) => b.billNumber === billNumber);
    if (found) {
      generateSingleBillPDF(found, user);
    } else {
      generateSingleBillPDF(
        {
          billNumber,
          month: 'Current Month',
          amount: 4500,
          dueDate: '2026-08-31',
          status: 'UNPAID',
        },
        user,
      );
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300" data-testid="billing-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" /> My Maintenance Bills
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Maintenance billing statements, online payment gateway, and downloadable PDF receipts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="billing-summary">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-destructive" /> Outstanding Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold font-mono text-destructive" data-testid="outstanding-balance">
              ₹{outstandingBalance.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Please pay before due date to avoid late fees.</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold font-display flex items-center gap-2">
          <FileText className="h-5 w-5" /> Current Invoices
        </h2>
        <div className="space-y-4" data-testid="invoice-table">
          {unpaidBills.length > 0 ? unpaidBills.map((bill) => (
            <div key={bill.id} className="p-5 rounded-2xl bg-card border border-destructive/20 shadow-sm space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-destructive/80"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-foreground">{bill.billNumber}</span>
                  <Badge variant="destructive" className="text-[10px] uppercase">{bill.status}</Badge>
                </div>
                <span className="text-xl font-bold font-mono">₹{bill.amount.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <p>Billing Month: <strong className="text-foreground">{bill.month}</strong></p>
                <p>Due Date: <strong className="text-foreground">{bill.dueDate}</strong></p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/20">
                <Button size="sm" variant="outline" onClick={() => handleDownloadInvoice(bill.billNumber)} className="gap-1.5 text-xs" data-testid="download-invoice">
                  <Download className="h-3.5 w-3.5" /> Download
                </Button>
                <Button size="sm" onClick={() => handlePay(bill)} className="gap-1.5 text-xs shadow-md" data-testid="pay-now">
                  <CreditCard className="h-3.5 w-3.5" /> Pay Now
                </Button>
              </div>
            </div>
          )) : (
             <div className="p-8 text-center text-muted-foreground border rounded-2xl border-dashed">No outstanding invoices.</div>
          )}
        </div>
      </div>

      <div className="space-y-4 pt-6">
        <h2 className="text-lg font-semibold font-display flex items-center gap-2">
          <History className="h-5 w-5" /> Payment History
        </h2>
        <div className="space-y-3" data-testid="payment-history">
          <div data-testid="recent-payments">
          {paidBills.map((bill) => (
            <div key={bill.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/40 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-sm">{bill.billNumber}</span>
                  <Badge variant="default" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">{bill.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{bill.month} • Paid on {bill.paidOn}</p>
              </div>
              <div className="flex items-center gap-4 sm:justify-end">
                <span className="text-lg font-bold font-mono">₹{bill.amount.toLocaleString()}</span>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleDownloadInvoice(bill.billNumber)} data-testid="download-invoice">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>

      {selectedBill && (
        <PaymentCheckoutModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          billId={selectedBill.id}
          amount={selectedBill.amount}
          billTitle={`${selectedBill.month} Maintenance - ${selectedBill.billNumber}`}
          onSuccess={() => {
            setBills(prev => prev.map(b => b.id === selectedBill.id ? { ...b, status: 'PAID', paidOn: new Date().toISOString().split('T')[0] } : b));
          }}
        />
      )}
    </div>
  );
};

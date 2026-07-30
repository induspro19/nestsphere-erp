import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CreditCard, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentCheckoutModal } from '../../components/shared/PaymentCheckoutModal';
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

  const handlePay = (bill: any) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  const handleDownloadInvoice = (billNumber: string) => {
    toast.success(`Downloading PDF Invoice for ${billNumber}...`);
  };

  return (
    <div className="space-y-6 pb-12">
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

      <div className="space-y-4">
        {bills.map((bill) => (
          <div key={bill.id} className="p-5 rounded-2xl bg-card border border-border/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-primary">{bill.billNumber}</span>
                <Badge variant={bill.status === 'PAID' ? 'default' : 'destructive'} className="text-[10px]">
                  {bill.status}
                </Badge>
              </div>
              <span className="text-lg font-bold font-mono">₹{bill.amount.toLocaleString()}</span>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Billing Month: <strong>{bill.month}</strong></p>
              <p>Due Date: <strong>{bill.dueDate}</strong></p>
              {bill.paidOn && <p className="text-emerald-500">Paid on: <strong>{bill.paidOn}</strong></p>}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/20">
              <Button size="sm" variant="outline" onClick={() => handleDownloadInvoice(bill.billNumber)} className="gap-1.5 text-xs">
                <Download className="h-3.5 w-3.5" /> Download Invoice
              </Button>
              {bill.status === 'UNPAID' && (
                <Button size="sm" onClick={() => handlePay(bill)} className="gap-1.5 text-xs shadow-md">
                  <CreditCard className="h-3.5 w-3.5" /> Pay Online
                </Button>
              )}
            </div>
          </div>
        ))}
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

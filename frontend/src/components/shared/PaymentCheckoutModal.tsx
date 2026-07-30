import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CreditCard, Smartphone, Banknote, Loader2, CheckCircle2, X } from 'lucide-react';
import { useRazorpay } from 'react-razorpay';
import { toast } from 'sonner';

interface PaymentCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billId: string;
  amount: number;
  billTitle: string;
  onSuccess: () => void;
}

export function PaymentCheckoutModal({ open, onOpenChange, billId, amount, billTitle, onSuccess }: PaymentCheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { Razorpay } = useRazorpay();

  if (!open) return null;

  const handlePay = async () => {
    if (!navigator.onLine) {
      toast.error('You are offline. Payment will start once internet is available.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/maintenance-billing/${billId}/initiate-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to initiate payment');
      }

      const orderData = await res.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_dummy', 
        amount: Math.round(orderData.amount * 100),
        currency: orderData.currency,
        name: 'NestSphere ERP',
        description: `Payment for ${billTitle}`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch(`/api/maintenance-billing/${billId}/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                amount: orderData.amount,
              })
            });

            if (!verifyRes.ok) throw new Error('Payment verification failed');

            setSuccess(true);
            setTimeout(() => {
              onSuccess();
              onOpenChange(false);
              setSuccess(false);
              toast.success('Payment successful! Receipt generated.');
            }, 2000);
          } catch (err: any) {
            toast.error(err.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: 'Resident',
          email: 'resident@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#0f172a',
        },
      };

      const rzp = new Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        toast.error(`Payment Failed: ${response.error.description}`);
      });

      rzp.open();
    } catch (error: any) {
      toast.error(error.message || 'Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Complete Payment</h2>
            <p className="text-sm text-muted-foreground">You are paying for {billTitle}.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-xl h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 animate-in zoom-in duration-300" />
            <h3 className="text-xl font-bold">Payment Successful</h3>
            <p className="text-muted-foreground text-sm">Processing receipt...</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg border">
              <div>
                <p className="text-sm text-muted-foreground">Amount to Pay</p>
                <h2 className="text-3xl font-bold font-display tracking-tight">₹{amount.toFixed(2)}</h2>
              </div>
              <Badge variant="outline" className="h-8">Due Now</Badge>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="flex flex-col h-24 gap-2 items-center justify-center rounded-xl">
                <Smartphone className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium">UPI</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-24 gap-2 items-center justify-center rounded-xl">
                <CreditCard className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium">Card</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-24 gap-2 items-center justify-center rounded-xl">
                <Banknote className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium">Net Banking</span>
              </Button>
            </div>

            <Button 
              className="w-full h-12 text-lg rounded-xl" 
              onClick={handlePay} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ₹${amount.toFixed(2)} securely`
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Secured by Enterprise Payment Gateway
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

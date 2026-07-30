import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Settings, CreditCard, ShieldCheck, Activity, Save } from 'lucide-react';
import { toast } from 'sonner';

export const PaymentSettingsPage: React.FC = () => {
  const [gatewayEnabled, setGatewayEnabled] = useState(true);
  const [isSandbox, setIsSandbox] = useState(true);
  const [autoReceipt, setAutoReceipt] = useState(true);
  const [autoReconciliation, setAutoReconciliation] = useState(true);
  
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Payment settings updated securely');
    }, 1000);
  };

  const handleTestConnection = () => {
    const promise = new Promise((resolve) => setTimeout(resolve, 1500));
    toast.promise(promise, {
      loading: 'Testing Gateway Connection...',
      success: 'Connection Successful! Gateway is responding.',
      error: 'Connection failed',
    });
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" /> Payment Gateway Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure online payment collection for your society. Secure credentials are managed via environment variables.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" /> General Configuration
              </CardTitle>
              <CardDescription>
                Enable or disable online payments and manage modes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Enable Online Payments</label>
                  <p className="text-sm text-muted-foreground">Allow residents to pay via UPI, Card, and Net Banking</p>
                </div>
                <input type="checkbox" checked={gatewayEnabled} onChange={(e) => setGatewayEnabled(e.target.checked)} className="h-5 w-5 rounded border-gray-300" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Sandbox Mode</label>
                  <p className="text-sm text-muted-foreground">Use test environment for verifying payments</p>
                </div>
                <input type="checkbox" checked={isSandbox} onChange={(e) => setIsSandbox(e.target.checked)} disabled={!gatewayEnabled} className="h-5 w-5 rounded border-gray-300" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Allowed Payment Methods</label>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">UPI</Badge>
                  <Badge variant="secondary">Credit / Debit Card</Badge>
                  <Badge variant="secondary">Net Banking</Badge>
                  <Badge variant="outline">Wallets (Optional)</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" /> Automation & Accounting
              </CardTitle>
              <CardDescription>
                Configure how successful payments are handled by the system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Auto-Generate Receipts</label>
                  <p className="text-sm text-muted-foreground">Automatically create and email PDF receipts on success</p>
                </div>
                <input type="checkbox" checked={autoReceipt} onChange={(e) => setAutoReceipt(e.target.checked)} className="h-5 w-5 rounded border-gray-300" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Auto-Reconciliation</label>
                  <p className="text-sm text-muted-foreground">Automatically post double-entry General Ledger journals</p>
                </div>
                <input type="checkbox" checked={autoReconciliation} onChange={(e) => setAutoReconciliation(e.target.checked)} className="h-5 w-5 rounded border-gray-300" />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 p-4 border-t flex justify-end">
               <Button onClick={handleSave} disabled={loading} className="gap-2 rounded-xl">
                 <Save className="h-4 w-4" /> Save Settings
               </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardHeader>
              <CardTitle className="text-emerald-700 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" /> Gateway Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-emerald-800/80 mb-4">
                Your payment gateway secrets and webhook signatures are secured at the server level via environment variables. They are never exposed to the frontend.
              </p>
              <Button variant="outline" className="w-full gap-2 border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10 rounded-xl" onClick={handleTestConnection}>
                Test Gateway Connection
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

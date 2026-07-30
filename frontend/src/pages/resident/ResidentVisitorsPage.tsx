import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { UserCheck, QrCode, Plus } from 'lucide-react';
import { toast } from 'sonner';

export const ResidentVisitorsPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');

  const handlePreApprove = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Visitor Pass generated for ${visitorName}! Universal QR Code created.`);
    setShowModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-primary" /> Pre-Approve Visitors & QR Pass
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Pre-approve guests, delivery personnel, and domestic staff entries</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2 text-xs shadow-md">
          <Plus className="h-4 w-4" /> Pre-Approve Guest
        </Button>
      </div>

      <div className="p-6 bg-card rounded-2xl border border-border/40 space-y-4">
        <h3 className="font-bold text-sm font-display flex items-center gap-2">
          <QrCode className="h-4 w-4 text-primary" /> Active Visitor Gate Pass
        </h3>
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col items-center justify-center text-center space-y-2">
          <div className="h-32 w-32 bg-foreground/10 rounded-xl flex items-center justify-center border border-border">
            <QrCode className="h-20 w-20 text-primary" />
          </div>
          <span className="font-mono text-xs font-bold text-primary">PASS-QR-99201</span>
          <p className="text-xs text-muted-foreground">Valid for Guest: <strong>Sunil Verma</strong> (Expected 5:00 PM)</p>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/60 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-lg font-display">Pre-Approve Visitor Pass</h3>
            <form onSubmit={handlePreApprove} className="space-y-3">
              <div>
                <label className="text-xs font-semibold">Guest Name *</label>
                <Input value={visitorName} onChange={(e) => setVisitorName(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-semibold">Phone Number *</label>
                <Input value={visitorPhone} onChange={(e) => setVisitorPhone(e.target.value)} required />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Generate Pass</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

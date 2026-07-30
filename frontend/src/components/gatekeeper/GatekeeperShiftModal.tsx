import React, { useState } from 'react';
import { Button } from '../ui/button';
import { X, Clock, ShieldCheck } from 'lucide-react';
import { gatekeeperApi } from '../../api/gatekeeper.api';
import { toast } from 'sonner';

interface GatekeeperShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeGate: string;
  currentGuard: string;
}

export const GatekeeperShiftModal: React.FC<GatekeeperShiftModalProps> = ({
  isOpen,
  onClose,
  activeGate,
  currentGuard,
}) => {
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleEndShift = async () => {
    await gatekeeperApi.endShift('SHIFT-CURRENT', notes);
    toast.success('Guard Shift ended safely. Handover notes logged in Activity Timeline.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border/40 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 text-foreground">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-base font-display text-foreground">Guard Shift Handover</h3>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 text-xs bg-muted/50 p-4 rounded-2xl border border-border/40">
          <p className="text-muted-foreground">Gate Location: <strong className="text-primary">{activeGate}</strong></p>
          <p className="text-muted-foreground">On Duty Guard: <strong className="text-foreground">{currentGuard}</strong></p>
          <p className="text-muted-foreground">Previous Guard: <strong className="text-foreground">Vikram Singh (SEC-712)</strong></p>
          <p className="text-muted-foreground">Shift Started At: <strong className="text-green-600">07:00 AM (5 hrs 12 mins active)</strong></p>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">Handover Notes / Key Log *</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 text-xs rounded-xl bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Log barrier status, key handovers, CCTV condition..."
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
          <Button variant="outline" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button onClick={handleEndShift} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs">
            <ShieldCheck className="h-4 w-4 mr-1" /> Complete Shift & Handover
          </Button>
        </div>
      </div>
    </div>
  );
};

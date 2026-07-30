import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { QrCode, X, CheckCircle, XCircle, AlertTriangle, User } from 'lucide-react';
import { gatekeeperApi, QrScanDetails } from '../../api/gatekeeper.api';
import { toast } from 'sonner';

interface UniversalQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UniversalQrScannerModal: React.FC<UniversalQrScannerModalProps> = ({ isOpen, onClose }) => {
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [scannedData, setScannedData] = useState<QrScanDetails | null>(null);

  if (!isOpen) return null;

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCodeInput) return;
    const res = await gatekeeperApi.scanUniversalQr(qrCodeInput);
    setScannedData(res);
  };

  const handleAction = (action: 'ALLOW' | 'REJECT' | 'HOLD') => {
    if (!scannedData) return;
    toast.success(`Action [${action}] recorded for ${scannedData.name} (${scannedData.type})`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border/40 rounded-3xl w-full max-w-xl p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 text-foreground">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-primary" />
            <h3 className="font-bold text-xl font-display text-foreground">Universal Security Scanner</h3>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Large Camera View Placeholder */}
        {!scannedData && (
          <div className="relative w-full aspect-video bg-muted rounded-2xl overflow-hidden border-2 border-dashed border-primary/40 flex items-center justify-center shadow-inner group">
             {/* Animated Scan Border Simulator */}
             <div className="absolute top-0 left-0 w-full h-1 bg-primary/80 shadow-[0_0_15px_rgba(37,99,235,0.8)] animate-[pulse_2s_ease-in-out_infinite] group-hover:animate-[bounce_2s_infinite]"></div>
             
             <div className="text-center space-y-2 opacity-50">
               <QrCode className="h-12 w-12 mx-auto text-primary" />
               <p className="font-mono text-sm font-bold tracking-widest text-muted-foreground">SCANNING QR / BARCODE</p>
             </div>
          </div>
        )}

        <form onSubmit={handleScan} className="flex gap-2">
          <Input
            placeholder="Or enter pass code manually (Visitor, Resident, Staff)..."
            value={qrCodeInput}
            onChange={(e) => setQrCodeInput(e.target.value)}
            className="bg-background border-input text-foreground font-mono text-sm h-12"
            autoFocus
          />
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm h-12 px-6 shadow-md">
            Verify
          </Button>
        </form>

        {scannedData && (
          <div className="p-6 rounded-2xl bg-secondary/30 border border-border/40 space-y-5 animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-mono text-xs px-3 py-1 uppercase font-bold tracking-wider">
                {scannedData.type}
              </Badge>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border border-green-200 text-xs px-3 py-1 font-bold">
                {scannedData.approvalStatus}
              </Badge>
            </div>

            <div className="flex gap-4 items-center bg-card p-4 rounded-xl border border-border/40 shadow-sm">
               <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center border-2 border-border shrink-0 overflow-hidden">
                 <User className="h-8 w-8 text-muted-foreground" />
               </div>
               <div>
                  <h4 className="font-bold text-xl text-foreground mb-1">{scannedData.name}</h4>
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    <p>Visiting Flat: <strong className="text-foreground">{scannedData.flat}</strong></p>
                    <p>Host: <strong className="text-foreground">{scannedData.hostName}</strong></p>
                  </div>
               </div>
            </div>

            <div className="text-sm text-muted-foreground bg-card p-3 rounded-xl border border-border/40 flex justify-between px-4">
               <span>Valid Until: <strong className="text-foreground">{scannedData.validUntil}</strong></span>
               <span>Vehicle: <strong className="text-foreground">MH-12-AB-1234</strong></span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <Button onClick={() => handleAction('ALLOW')} className="bg-green-600 hover:bg-green-700 text-white font-bold text-sm h-14 rounded-xl shadow-md">
                <CheckCircle className="h-5 w-5 mr-2" /> Allow Entry
              </Button>
              <Button onClick={() => handleAction('HOLD')} className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm h-14 rounded-xl shadow-md">
                <AlertTriangle className="h-5 w-5 mr-2" /> Hold
              </Button>
              <Button onClick={() => handleAction('REJECT')} className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm h-14 rounded-xl shadow-md">
                <XCircle className="h-5 w-5 mr-2" /> Reject
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

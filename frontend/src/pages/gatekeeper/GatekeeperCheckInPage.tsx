import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { ShieldCheck, UserPlus, Check, Search, AlertTriangle, Clock, User, Phone, Home } from 'lucide-react';
import { toast } from 'sonner';
import { visitorApi, VisitorPass } from '../../api/visitor.api';

export const GatekeeperCheckInPage: React.FC = () => {
  // Token verification state
  const [tokenInput, setTokenInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedPass, setVerifiedPass] = useState<VisitorPass | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Manual Walk-in form state
  const [form, setForm] = useState({
    name: '',
    phone: '',
    flatNumber: 'A-402',
    purpose: 'GUEST',
    vehicleNumber: '',
  });

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setVerifying(true);
    setVerificationError(null);
    setVerifiedPass(null);

    try {
      // Query passes by token
      const res = await visitorApi.getVisitorPasses({ search: tokenInput.trim() } as any);
      const passes = (res as any).data || res;

      if (Array.isArray(passes) && passes.length > 0) {
        // Find matching pass by otpCode or qrToken
        const match = passes.find(
          (p: VisitorPass) => p.otpCode === tokenInput.trim() || p.qrToken === tokenInput.trim()
        ) || passes[0];

        if (match.status === 'CHECKED_IN') {
          setVerificationError('Already Checked In');
          setVerifiedPass(match);
        } else if (match.status === 'EXPIRED') {
          setVerificationError('Expired Token');
          setVerifiedPass(match);
        } else {
          setVerifiedPass(match);
        }
      } else {
        setVerificationError('Invalid Token');
      }
    } catch (err) {
      setVerificationError('Invalid Token');
    } finally {
      setVerifying(false);
    }
  };

  const handleConfirmCheckIn = async () => {
    if (!verifiedPass) return;
    try {
      await visitorApi.checkIn({ otpCode: verifiedPass.otpCode || tokenInput });
      toast.success(`Visitor ${verifiedPass.visitorName} Checked In Successfully!`);
      setVerifiedPass(null);
      setTokenInput('');
      setVerificationError(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Walk-in visitor ${form.name} checked in for Flat ${form.flatNumber}! Resident notified.`);
    setForm({ name: '', phone: '', flatNumber: 'A-402', purpose: 'GUEST', vehicleNumber: '' });
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-12">
      
      {/* 1. VISITOR TOKEN VERIFICATION SECTION */}
      <div className="bg-white border-2 border-blue-500/30 rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <ShieldCheck className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold font-display text-gray-900">4-Digit Visitor Token Verification</h2>
        </div>

        <form onSubmit={handleVerifyToken} className="flex gap-3">
          <div className="relative flex-1">
            <Input
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Enter 4-Digit Token (e.g. 4831)"
              className="h-14 text-2xl font-mono tracking-widest font-black text-blue-900 pl-4 border-gray-300 rounded-xl uppercase"
              maxLength={4}
              required
            />
          </div>
          <Button type="submit" disabled={verifying} className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-base shadow-sm">
            <Search className="h-5 w-5 mr-2" /> {verifying ? 'Verifying...' : 'Verify Token'}
          </Button>
        </form>

        {/* VERIFICATION ERROR ALERTS */}
        {verificationError && !verifiedPass && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800 font-medium">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-bold">{verificationError}</p>
              <p className="text-xs text-red-600 mt-0.5">No active pass found matching token "{tokenInput}". Please check token or verify guest details.</p>
            </div>
          </div>
        )}

        {/* VERIFIED VISITOR PASS CARD */}
        {verifiedPass && (
          <div className={`p-5 rounded-2xl border-2 space-y-4 transition-all ${
            verificationError === 'Already Checked In' 
              ? 'bg-amber-50 border-amber-300' 
              : verificationError === 'Expired Token' 
              ? 'bg-red-50 border-red-300' 
              : 'bg-blue-50/50 border-blue-400 shadow-sm'
          }`}>
            <div className="flex justify-between items-start border-b border-gray-200/60 pb-3">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Visitor ID: {verifiedPass.passNumber}</span>
                <h3 className="text-xl font-bold text-gray-900">{verifiedPass.visitorName}</h3>
                <p className="text-xs text-gray-600 mt-0.5">{verifiedPass.visitorType.replace('_', ' ')} • {verifiedPass.visitorPhone}</p>
              </div>
              <Badge className={`text-xs font-semibold px-3 py-1 ${
                verificationError === 'Already Checked In'
                  ? 'bg-amber-500 text-white'
                  : verificationError === 'Expired Token'
                  ? 'bg-red-500 text-white'
                  : 'bg-green-600 text-white'
              }`}>
                {verificationError || verifiedPass.status.replace('_', ' ')}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-200">
                <Home className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Destination</p>
                  <p className="font-semibold text-gray-900">Flat {verifiedPass.hostUnit?.flatNumber || 'A-402'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-200">
                <Clock className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Valid Until</p>
                  <p className="font-semibold text-gray-900">{new Date(verifiedPass.expectedExit || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-200 col-span-2 sm:col-span-1">
                <Phone className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Vehicle</p>
                  <p className="font-semibold text-gray-900 uppercase">{verifiedPass.vehicleNumber || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Verification Actions */}
            <div className="flex gap-3 pt-2">
              {verifiedPass.status === 'PRE_APPROVED' && !verificationError && (
                <Button onClick={handleConfirmCheckIn} className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm shadow-sm">
                  <Check className="h-5 w-5 mr-2" /> Allow Entry & Check In
                </Button>
              )}
              <Button onClick={() => setVerifiedPass(null)} variant="outline" className="h-12 px-6 rounded-xl font-semibold border-gray-300">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 2. MANUAL WALK-IN ENTRY FORM */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-5 shadow-xs">
        <h2 className="text-lg font-bold font-display text-gray-900 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-gray-700" /> Manual Walk-In Entry (No Token)
        </h2>

        <form onSubmit={handleManualSubmit} className="space-y-4 text-sm">
          <div>
            <label className="text-gray-700 font-bold block mb-1 text-xs">Visitor Name *</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-gray-50 border-gray-200 text-gray-900 h-10 rounded-xl"
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-700 font-bold block mb-1 text-xs">Phone Number *</label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="bg-gray-50 border-gray-200 text-gray-900 h-10 rounded-xl"
                placeholder="10-digit mobile"
                required
              />
            </div>
            <div>
              <label className="text-gray-700 font-bold block mb-1 text-xs">Destination Flat / Unit *</label>
              <Input
                value={form.flatNumber}
                onChange={(e) => setForm({ ...form, flatNumber: e.target.value })}
                className="bg-gray-50 border-gray-200 text-gray-900 h-10 rounded-xl"
                placeholder="e.g. A-402"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-gray-700 font-bold block mb-1 text-xs">Vehicle Number (Optional)</label>
            <Input
              value={form.vehicleNumber}
              onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
              className="bg-gray-50 border-gray-200 text-gray-900 h-10 rounded-xl uppercase"
              placeholder="e.g. MH-04-AB-1234"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="submit" className="bg-gray-900 hover:bg-black text-white font-bold text-sm h-11 px-6 rounded-xl shadow-xs">
              <Check className="h-4 w-4 mr-2" /> Log Walk-In Entry
            </Button>
          </div>
        </form>
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { UserPlus, Camera, Car, Check } from 'lucide-react';
import { toast } from 'sonner';

export const GatekeeperCheckInPage: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    flatNumber: 'A-402',
    purpose: 'GUEST',
    vehicleNumber: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Walk-in visitor ${form.name} checked in for Flat ${form.flatNumber}! Resident notified.`);
    setForm({ name: '', phone: '', flatNumber: 'A-402', purpose: 'GUEST', vehicleNumber: '' });
  };

  return (
    <div className="p-6 md:p-8 rounded-2xl bg-card border border-border/40 space-y-6 shadow-sm max-w-2xl mx-auto">
      <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
        <UserPlus className="h-6 w-6 text-primary" /> Walk-In Visitor Entry Check-In
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        <div>
          <label className="text-foreground font-bold block mb-1.5">Visitor Name *</label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-background border-input text-foreground h-12"
            placeholder="Enter full name"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-foreground font-bold block mb-1.5">Phone Number *</label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="bg-background border-input text-foreground h-12"
              placeholder="+91 98765 00000"
              required
            />
          </div>
          <div>
            <label className="text-foreground font-bold block mb-1.5">Destination Flat / Unit *</label>
            <Input
              value={form.flatNumber}
              onChange={(e) => setForm({ ...form, flatNumber: e.target.value })}
              className="bg-background border-input text-foreground h-12"
              placeholder="e.g. A-402"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-foreground font-bold block mb-1.5">Vehicle Number (Optional)</label>
          <Input
            value={form.vehicleNumber}
            onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
            className="bg-background border-input text-foreground h-12"
            placeholder="e.g. MH-02-AB-1234"
          />
        </div>

        <div className="pt-6 border-t border-border/40 flex justify-end gap-3 mt-4">
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm h-12 px-8 shadow-sm">
            <Check className="h-5 w-5 mr-2" /> Approve Visitor & Log Entry
          </Button>
        </div>
      </form>
    </div>
  );
};

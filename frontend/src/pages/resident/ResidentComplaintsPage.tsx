import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { LifeBuoy, Plus, Wrench, Star, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export const ResidentComplaintsPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [complaints] = useState([
    {
      id: 'c1',
      ticketNumber: 'TKT-10042',
      title: 'Plumbing Leakage in Master Bathroom',
      category: 'PLUMBING',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      technician: 'Ramesh Kumar (Plumber)',
      createdAt: '2026-07-22',
    },
  ]);

  const [form, setForm] = useState({ title: '', category: 'PLUMBING', priority: 'MEDIUM', description: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Helpdesk ticket raised! Technician will be assigned.');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <LifeBuoy className="h-6 w-6 text-primary" /> My Helpdesk Complaints
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Track ticket progress, assigned technicians, and service ratings</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2 text-xs shadow-md">
          <Plus className="h-4 w-4" /> Raise Complaint
        </Button>
      </div>

      <div className="space-y-4">
        {complaints.map((c) => (
          <div key={c.id} className="p-5 rounded-2xl bg-card border border-border/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-primary">{c.ticketNumber}</span>
                <Badge variant="outline">{c.category}</Badge>
              </div>
              <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">{c.status}</Badge>
            </div>
            <h3 className="font-bold text-sm">{c.title}</h3>
            <p className="text-xs text-muted-foreground">Assigned Technician: <strong>{c.technician}</strong></p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-card border-t sm:border border-border/60 rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[90dvh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between pb-2 border-b border-border/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-muted-foreground/30 rounded-full mx-auto sm:hidden mb-1" />
                <h3 className="font-bold text-base font-display">Raise Helpdesk Ticket</h3>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setShowModal(false)} className="h-8 w-8 p-0 rounded-full">
                ✕
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title *</label>
                <Input
                  placeholder="e.g. Plumbing Leakage in Master Bathroom"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1 min-h-[44px]"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full min-h-[44px] text-xs px-3 mt-1 rounded-xl border border-input bg-background font-medium focus:ring-2 focus:ring-primary"
                >
                  <option value="PLUMBING">Plumbing</option>
                  <option value="ELECTRICITY">Electricity</option>
                  <option value="HOUSEKEEPING">Housekeeping</option>
                  <option value="CARPENTRY">Carpentry</option>
                  <option value="SECURITY">Security</option>
                  <option value="LIFT">Lift & Elevator</option>
                  <option value="OTHER">Other Common Area</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description *</label>
                <textarea
                  rows={4}
                  placeholder="Provide details about the issue..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3 text-xs mt-1 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1 min-h-[44px] rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 min-h-[44px] rounded-xl bg-primary text-primary-foreground font-semibold">
                  Submit Ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

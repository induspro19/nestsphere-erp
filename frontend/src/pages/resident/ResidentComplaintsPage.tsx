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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/60 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-lg font-display">Raise Helpdesk Ticket</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold">Title *</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs font-semibold">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full h-9 text-xs px-3 rounded-lg border border-input bg-background"
                >
                  <option value="PLUMBING">Plumbing</option>
                  <option value="ELECTRICITY">Electricity</option>
                  <option value="HOUSEKEEPING">Housekeeping</option>
                  <option value="CARPENTRY">Carpentry</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3 text-xs rounded-lg border border-input bg-background"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Ticket</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
